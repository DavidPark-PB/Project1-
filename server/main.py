"""
FastAPI server for multi-platform product converter.
"""
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.schema import (
    IngestPayload, ValidationResult, ConvertRequest, ConvertResponse,
    ConvertResult, Platform, ConvertOptions
)
from core.ingest import parse_file
from core.validate import Validator
from core.dsl import load_mapping, DSLMapper
from core.exporters import export_data


# Initialize FastAPI app
app = FastAPI(title="Multi-Platform Product Converter", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = Path(__file__).parent
MAPPINGS_DIR = BASE_DIR / "mappings"
LOOKUPS_DIR = BASE_DIR / "lookups"
OUT_DIR = BASE_DIR / "out"
LOGS_DIR = BASE_DIR / "logs"
TEMP_DIR = BASE_DIR / "temp"

# Ensure directories exist
OUT_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Global state (in production, use Redis or database)
session_data: Dict[str, Any] = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Multi-Platform Product Converter API"}


@app.post("/api/ingest", response_model=dict)
async def ingest_file(file: UploadFile = File(...)):
    """
    Parse uploaded Excel/CSV file and return structured data.
    """
    try:
        # Save uploaded file temporarily
        temp_file = TEMP_DIR / f"upload_{int(time.time())}_{file.filename}"
        with open(temp_file, "wb") as f:
            content = await file.read()
            f.write(content)

        # Parse file
        payload = parse_file(temp_file)

        # Store in session
        session_id = f"session_{int(time.time())}"
        session_data[session_id] = {
            "payload": payload,
            "uploaded_at": datetime.now().isoformat(),
            "filename": file.filename
        }

        # Convert to dict for response
        result = {
            "session_id": session_id,
            "filename": file.filename,
            "master_count": len(payload.master),
            "variants_count": len(payload.variants),
            "specifics_count": len(payload.specifics),
            "master": [row.model_dump() for row in payload.master],
            "variants": [var.model_dump() for var in payload.variants],
            "specifics": payload.specifics,
            "fx": payload.fx,
            "shopee_logistics": payload.shopee_logistics
        }

        # Clean up temp file
        temp_file.unlink()

        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")


@app.post("/api/validate", response_model=ValidationResult)
async def validate_data(
    session_id: str,
    target_platforms: List[str] = None
):
    """
    Validate ingested data.
    """
    if session_id not in session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        payload = session_data[session_id]["payload"]

        # Create validator
        validator = Validator(lookups_dir=LOOKUPS_DIR)

        # Validate
        result = validator.validate(payload, target_platforms)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@app.post("/api/convert", response_model=ConvertResponse)
async def convert_data(
    session_id: str,
    request: ConvertRequest
):
    """
    Convert master data to platform-specific formats.
    """
    if session_id not in session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        start_time = time.time()
        payload = session_data[session_id]["payload"]
        results = []

        # Create log file
        log_file = LOGS_DIR / f"convert_{int(time.time())}.jsonl"
        log_entries = []

        # Convert for each target platform
        for platform in request.targets:
            platform_result = convert_platform(
                platform,
                payload,
                request.options,
                log_entries
            )
            results.append(platform_result)

        # Write log file
        with open(log_file, 'w', encoding='utf-8') as f:
            for entry in log_entries:
                f.write(json.dumps(entry, ensure_ascii=False) + '\n')

        total_time = time.time() - start_time

        return ConvertResponse(
            results=results,
            total_time_seconds=round(total_time, 2),
            log_file=str(log_file)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


def convert_platform(
    platform: Platform,
    payload: IngestPayload,
    options: ConvertOptions,
    log_entries: List[Dict]
) -> ConvertResult:
    """
    Convert data for a single platform.
    """
    try:
        # Load mapping spec
        mapping_spec = load_mapping(platform.value, MAPPINGS_DIR, LOOKUPS_DIR)

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
        if options.dry_run:
            # Only process first N rows for preview
            master_dicts = master_dicts[:options.preview_rows]

        mapped_rows = mapper.map_rows(master_dicts, context)

        # Handle variants if needed
        if payload.variants and mapping_spec.variant_mode != 'none':
            variant_dicts = [var.model_dump() for var in payload.variants]
            mapped_rows = mapper.handle_variants(mapped_rows, variant_dicts, context)

        # Limit images if needed
        max_images = mapping_spec.get_max_images()
        if max_images:
            for row in mapped_rows:
                # Count image columns
                image_cols = [k for k in row.keys() if 'image' in k.lower() or 'picture' in k.lower()]
                if len(image_cols) > max_images:
                    # Remove excess image columns
                    for col in image_cols[max_images:]:
                        row.pop(col, None)

        # Determine output format and path
        output_format = mapping_spec.get_output_format()
        output_filename = f"{platform.value}.{output_format}"

        if not options.dry_run:
            output_path = OUT_DIR / output_filename

            # Export
            export_data(
                rows=mapped_rows,
                output_path=output_path,
                format=output_format,
                encoding=mapping_spec.get_encoding(),
                sheet_name=mapping_spec.get_sheet_name()
            )
        else:
            output_path = None

        # Log result
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform.value,
            'success': True,
            'rows_processed': len(mapped_rows),
            'rows_skipped': len(context.get('skipped_rows', [])),
            'errors': context.get('errors', []),
            'warnings': context.get('warnings', [])
        }
        log_entries.append(log_entry)

        return ConvertResult(
            platform=platform,
            success=True,
            output_file=str(output_path) if output_path else None,
            rows_processed=len(mapped_rows),
            rows_skipped=len(context.get('skipped_rows', [])),
            errors=context.get('errors', []),
            warnings=context.get('warnings', [])
        )

    except Exception as e:
        # Log error
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform.value,
            'success': False,
            'error': str(e)
        }
        log_entries.append(log_entry)

        return ConvertResult(
            platform=platform,
            success=False,
            rows_processed=0,
            rows_skipped=0,
            errors=[str(e)]
        )


@app.get("/api/download/{platform}")
async def download_file(platform: str):
    """
    Download converted file for a platform.
    """
    # Check CSV first
    csv_file = OUT_DIR / f"{platform}.csv"
    if csv_file.exists():
        return FileResponse(
            csv_file,
            media_type="text/csv",
            filename=f"{platform}.csv"
        )

    # Check XLSX
    xlsx_file = OUT_DIR / f"{platform}.xlsx"
    if xlsx_file.exists():
        return FileResponse(
            xlsx_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"{platform}.xlsx"
        )

    raise HTTPException(status_code=404, detail="File not found")


@app.get("/api/report/latest")
async def get_latest_report():
    """
    Get the latest conversion report.
    """
    # Find most recent log file
    log_files = sorted(LOGS_DIR.glob("convert_*.jsonl"), reverse=True)

    if not log_files:
        return {"message": "No reports found"}

    latest_log = log_files[0]

    # Parse log file
    entries = []
    with open(latest_log, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                entries.append(json.loads(line))

    return {
        "log_file": str(latest_log),
        "timestamp": latest_log.stem.split('_')[1],
        "entries": entries
    }


@app.get("/api/session/{session_id}/summary")
async def get_session_summary(session_id: str):
    """
    Get summary of uploaded data.
    """
    if session_id not in session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_data[session_id]
    payload = session["payload"]

    # Get category distribution
    validator = Validator(lookups_dir=LOOKUPS_DIR)
    category_dist = validator.get_category_distribution(payload)

    return {
        "session_id": session_id,
        "filename": session["filename"],
        "uploaded_at": session["uploaded_at"],
        "total_products": len(payload.master),
        "total_variants": len(payload.variants),
        "total_specifics": len(payload.specifics),
        "category_distribution": category_dist,
        "currencies": list(set(row.currency for row in payload.master)),
        "avg_price": sum(row.price for row in payload.master) / len(payload.master) if payload.master else 0,
        "avg_images_per_product": sum(len(row.image_urls) for row in payload.master) / len(payload.master) if payload.master else 0
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
