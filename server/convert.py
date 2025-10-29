#!/usr/bin/env python3
"""
CLI tool for multi-platform product conversion.

Usage:
    python convert.py --input Master.xlsx --targets ebay,shopify --out output/
"""
import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

from core.schema import Platform, ConvertOptions
from core.ingest import parse_file
from core.validate import Validator
from core.dsl import load_mapping, DSLMapper
from core.exporters import export_data


# Paths
BASE_DIR = Path(__file__).parent
MAPPINGS_DIR = BASE_DIR / "mappings"
LOOKUPS_DIR = BASE_DIR / "lookups"
LOGS_DIR = BASE_DIR / "logs"


def convert_platform(
    platform_name: str,
    payload,
    output_dir: Path,
    options: ConvertOptions,
    log_entries: List
) -> dict:
    """Convert data for a single platform"""
    try:
        print(f"Converting for {platform_name}...")

        # Load mapping spec
        mapping_spec = load_mapping(platform_name, MAPPINGS_DIR, LOOKUPS_DIR)

        # Create mapper
        mapper = DSLMapper(mapping_spec)

        # Prepare context
        context = {
            'fx_rates': payload.fx if payload.fx else {},
            'default_currency': 'USD',
            'locale': options.locale,
            'fail_policy': options.fail_policy,
            'errors': [],
            'warnings': [],
            'skipped_rows': []
        }

        # Convert master rows to dicts
        master_dicts = [row.model_dump() for row in payload.master]

        # Map rows
        mapped_rows = mapper.map_rows(master_dicts, context)

        # Handle variants if needed
        if payload.variants and mapping_spec.variant_mode != 'none':
            variant_dicts = [var.model_dump() for var in payload.variants]
            mapped_rows = mapper.handle_variants(mapped_rows, variant_dicts, context)

        # Determine output format and path
        output_format = mapping_spec.get_output_format()
        output_filename = f"{platform_name}.{output_format}"
        output_path = output_dir / output_filename

        # Export
        export_data(
            rows=mapped_rows,
            output_path=output_path,
            format=output_format,
            encoding=mapping_spec.get_encoding(),
            sheet_name=mapping_spec.get_sheet_name()
        )

        # Log result
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform_name,
            'success': True,
            'output_file': str(output_path),
            'rows_processed': len(mapped_rows),
            'rows_skipped': len(context.get('skipped_rows', [])),
            'errors': context.get('errors', []),
            'warnings': context.get('warnings', [])
        }
        log_entries.append(log_entry)

        print(f"✓ {platform_name}: {len(mapped_rows)} rows -> {output_path}")

        return log_entry

    except Exception as e:
        # Log error
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform_name,
            'success': False,
            'error': str(e)
        }
        log_entries.append(log_entry)

        print(f"✗ {platform_name}: Failed - {str(e)}")

        return log_entry


def main():
    parser = argparse.ArgumentParser(
        description="Convert master product data to multiple platform formats"
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Input Excel/CSV file path"
    )
    parser.add_argument(
        "--targets",
        required=True,
        help="Comma-separated list of target platforms (ebay,coupang,naver,shopify,shopee,qoo10,alibaba)"
    )
    parser.add_argument(
        "--out",
        default="out",
        help="Output directory (default: out)"
    )
    parser.add_argument(
        "--locale",
        default="KR",
        help="Locale for locale-specific platforms (default: KR)"
    )
    parser.add_argument(
        "--fail-policy",
        choices=["skip", "fail"],
        default="skip",
        help="How to handle errors: skip invalid rows or fail immediately (default: skip)"
    )
    parser.add_argument(
        "--max-workers",
        type=int,
        default=8,
        help="Maximum parallel workers for conversion (default: 8)"
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Only validate input, don't convert"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Dry run mode (no output files)"
    )

    args = parser.parse_args()

    # Parse targets
    targets = [t.strip() for t in args.targets.split(",")]

    # Validate targets
    valid_platforms = {p.value for p in Platform}
    invalid = [t for t in targets if t not in valid_platforms]
    if invalid:
        print(f"Error: Invalid platforms: {', '.join(invalid)}")
        print(f"Valid platforms: {', '.join(valid_platforms)}")
        sys.exit(1)

    # Parse input file
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    print(f"Parsing input file: {input_path}")
    try:
        payload = parse_file(input_path)
        print(f"✓ Parsed {len(payload.master)} products, {len(payload.variants)} variants")
    except Exception as e:
        print(f"✗ Failed to parse input file: {e}")
        sys.exit(1)

    # Validate
    print("\nValidating data...")
    validator = Validator(lookups_dir=LOOKUPS_DIR)
    validation_result = validator.validate(payload, targets)

    print(f"Total rows: {validation_result.total_rows}")
    print(f"Valid rows: {validation_result.valid_rows}")
    print(f"Hard errors: {len([e for e in validation_result.errors if e.error_type == 'hard'])}")
    print(f"Soft warnings: {len([e for e in validation_result.warnings if e.error_type == 'soft'])}")

    # Print errors
    if validation_result.errors:
        print("\nErrors:")
        for error in validation_result.errors[:10]:  # Show first 10
            print(f"  - Row {error.row_index} ({error.sku}): {error.message}")
        if len(validation_result.errors) > 10:
            print(f"  ... and {len(validation_result.errors) - 10} more errors")

    if args.validate_only:
        sys.exit(0 if validation_result.valid else 1)

    # Create output directory
    output_dir = Path(args.out)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Convert options
    options = ConvertOptions(
        locale=args.locale,
        fail_policy=args.fail_policy,
        max_workers=args.max_workers,
        dry_run=args.dry_run
    )

    # Convert for each platform
    print(f"\nConverting to {len(targets)} platforms...")
    start_time = time.time()

    log_entries = []

    if args.max_workers == 1:
        # Sequential processing
        for platform_name in targets:
            convert_platform(platform_name, payload, output_dir, options, log_entries)
    else:
        # Parallel processing
        with ThreadPoolExecutor(max_workers=args.max_workers) as executor:
            futures = {
                executor.submit(convert_platform, platform_name, payload, output_dir, options, log_entries): platform_name
                for platform_name in targets
            }

            for future in as_completed(futures):
                platform_name = futures[future]
                try:
                    future.result()
                except Exception as e:
                    print(f"✗ {platform_name}: Unexpected error - {e}")

    total_time = time.time() - start_time

    # Write log file
    LOGS_DIR.mkdir(exist_ok=True)
    log_file = LOGS_DIR / f"convert_{int(time.time())}.jsonl"
    with open(log_file, 'w', encoding='utf-8') as f:
        for entry in log_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    # Summary
    print(f"\n{'='*60}")
    print(f"Conversion completed in {total_time:.2f}s")
    print(f"Log file: {log_file}")

    successful = len([e for e in log_entries if e.get('success')])
    print(f"Successful: {successful}/{len(targets)}")

    if successful < len(targets):
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
