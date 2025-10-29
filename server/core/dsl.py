"""
DSL (Domain Specific Language) parser for YAML mapping configurations.
"""
import yaml
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from .transforms import apply_transforms


class LookupTable:
    """Manages lookup tables from CSV files"""

    def __init__(self, lookups_dir: Path):
        self.lookups_dir = lookups_dir
        self.tables: Dict[str, Dict[str, Any]] = {}

    def load_table(self, table_name: str, key_column: str) -> Dict[str, Any]:
        """Load a lookup table from CSV"""
        if table_name in self.tables:
            return self.tables[table_name]

        table_path = self.lookups_dir / table_name
        if not table_path.exists():
            raise FileNotFoundError(f"Lookup table not found: {table_name}")

        table_data = {}
        with open(table_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row.get(key_column)
                if key:
                    table_data[key] = row

        self.tables[table_name] = table_data
        return table_data

    def lookup(self, table_name: str, key_column: str, key_value: str, return_column: str = None) -> Any:
        """Lookup a value in a table"""
        table = self.load_table(table_name, key_column)

        if key_value not in table:
            return None

        row = table[key_value]
        if return_column:
            return row.get(return_column)
        return row


class MappingSpec:
    """Represents a complete mapping specification from YAML"""

    def __init__(self, yaml_path: Path, lookups_dir: Path):
        self.yaml_path = yaml_path
        self.lookup_table = LookupTable(lookups_dir)

        with open(yaml_path, 'r', encoding='utf-8') as f:
            self.spec = yaml.safe_load(f)

        self.meta = self.spec.get('meta', {})
        self.columns = self.spec.get('columns', {})
        self.variant_mode = self.spec.get('variant_mode', 'rows')
        self.policies = self.spec.get('policies', {})
        self.specifics = self.spec.get('specifics', {})
        self.variants = self.spec.get('variants', {})

    def get_output_format(self) -> str:
        """Get output format (csv or xlsx)"""
        return self.meta.get('output_format', 'csv')

    def get_encoding(self) -> str:
        """Get output encoding"""
        return self.meta.get('encoding', 'utf-8')

    def get_sheet_name(self) -> str:
        """Get sheet name for XLSX output"""
        return self.meta.get('sheet_name', 'Sheet1')

    def get_required_fields(self) -> List[str]:
        """Get list of required output fields"""
        return self.policies.get('required', [])

    def get_max_images(self) -> Optional[int]:
        """Get maximum number of images allowed"""
        return self.policies.get('images_max')


class FieldMapper:
    """Maps a single field from source to target"""

    def __init__(self, target_field: str, field_spec: Union[Dict, str], lookup_table: LookupTable):
        self.target_field = target_field
        self.lookup_table = lookup_table

        # Normalize spec to dict
        if isinstance(field_spec, str):
            field_spec = {'from': field_spec}

        self.spec = field_spec
        self.source_field = field_spec.get('from')
        self.fallback = field_spec.get('fallback')
        self.default = field_spec.get('default')
        self.join = field_spec.get('join')
        self.explode = field_spec.get('explode')
        self.transforms = field_spec.get('transforms', [])
        self.lookup_spec = field_spec.get('lookup')
        self.map_enum = field_spec.get('map_enum')
        self.render = field_spec.get('render')
        self.if_exists = field_spec.get('if_exists', False)

    def get_source_value(self, row_data: Dict[str, Any]) -> Any:
        """Get the source value from row data"""
        if not self.source_field:
            return None

        # Handle array indexing: field[0], field[1], etc.
        if '[' in self.source_field and ']' in self.source_field:
            field_name = self.source_field.split('[')[0]
            index_str = self.source_field.split('[')[1].split(']')[0]
            try:
                index = int(index_str)
                value = row_data.get(field_name)
                if isinstance(value, list) and len(value) > index:
                    return value[index]
                return None
            except (ValueError, TypeError):
                return None

        # Handle nested field access: field.subfield
        if '.' in self.source_field:
            parts = self.source_field.split('.')
            value = row_data
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part)
                else:
                    return None
            return value

        return row_data.get(self.source_field)

    def apply_lookup(self, value: Any) -> Any:
        """Apply lookup transformation"""
        if not self.lookup_spec or not value:
            return value

        table = self.lookup_spec.get('table')
        key_column = self.lookup_spec.get('key')
        return_column = self.lookup_spec.get('return')

        if not table or not key_column:
            return value

        result = self.lookup_table.lookup(table, key_column, str(value), return_column)
        return result if result is not None else value

    def apply_map_enum(self, value: Any) -> Any:
        """Apply enum mapping"""
        if not self.map_enum or not value:
            return value

        return self.map_enum.get(str(value), value)

    def apply_join(self, value: Any) -> str:
        """Apply join transformation for lists"""
        if not self.join or not isinstance(value, list):
            return value

        return self.join.join(str(v) for v in value if v)

    def map_value(self, row_data: Dict[str, Any], context: Dict[str, Any] = None) -> Any:
        """
        Map a value from source row to target format.

        Args:
            row_data: Source row data
            context: Additional context (fx_rates, variants, etc.)

        Returns:
            Mapped value
        """
        context = context or {}

        # Get source value
        value = self.get_source_value(row_data)

        # Try fallback if primary value is None/empty
        if value is None or (isinstance(value, str) and not value.strip()):
            if self.fallback:
                value = self.get_source_value({'from': self.fallback})

        # Use default if still None/empty
        if value is None or (isinstance(value, str) and not value.strip()):
            if self.default is not None:
                value = self.default
            elif self.if_exists:
                return None

        # If still None and if_exists, skip this field
        if value is None and self.if_exists:
            return None

        # Apply lookup
        value = self.apply_lookup(value)

        # Apply enum mapping
        value = self.apply_map_enum(value)

        # Apply transforms
        if self.transforms and value is not None:
            try:
                value = apply_transforms(value, self.transforms, context)
            except Exception as e:
                # Log warning but continue
                context.setdefault('warnings', []).append(
                    f"Transform failed for {self.target_field}: {str(e)}"
                )

        # Apply join
        value = self.apply_join(value)

        # Apply custom render (if specified)
        if self.render and value is not None:
            render_func = context.get('renders', {}).get(self.render)
            if render_func:
                value = render_func(value, row_data, context)

        return value


class DSLMapper:
    """Main DSL mapping engine"""

    def __init__(self, mapping_spec: MappingSpec):
        self.spec = mapping_spec
        self.field_mappers: Dict[str, FieldMapper] = {}

        # Initialize field mappers
        for target_field, field_spec in self.spec.columns.items():
            self.field_mappers[target_field] = FieldMapper(
                target_field,
                field_spec,
                self.spec.lookup_table
            )

    def map_row(self, row_data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Map a single row from source format to target format.

        Args:
            row_data: Source row data
            context: Additional context (fx_rates, variants, specifics, etc.)

        Returns:
            Mapped row data
        """
        context = context or {}
        result = {}

        for target_field, mapper in self.field_mappers.items():
            try:
                value = mapper.map_value(row_data, context)

                # Only include if not None (unless default was specified)
                if value is not None:
                    result[target_field] = value

            except Exception as e:
                context.setdefault('errors', []).append(
                    f"Error mapping {target_field}: {str(e)}"
                )

        return result

    def map_rows(self, rows: List[Dict[str, Any]], context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Map multiple rows.

        Args:
            rows: List of source rows
            context: Additional context

        Returns:
            List of mapped rows
        """
        context = context or {}
        results = []

        for idx, row in enumerate(rows):
            try:
                # Add row index to context for error reporting
                row_context = {**context, 'row_index': idx}
                mapped = self.map_row(row, row_context)

                # Check required fields
                required_fields = self.spec.get_required_fields()
                missing = [f for f in required_fields if f not in mapped or not mapped[f]]

                if missing:
                    error_msg = f"Row {idx} missing required fields: {', '.join(missing)}"
                    context.setdefault('errors', []).append(error_msg)

                    # Skip row if fail_policy is 'skip'
                    if context.get('fail_policy', 'skip') == 'skip':
                        context.setdefault('skipped_rows', []).append(idx)
                        continue
                    else:
                        raise ValueError(error_msg)

                results.append(mapped)

            except Exception as e:
                error_msg = f"Error mapping row {idx}: {str(e)}"
                context.setdefault('errors', []).append(error_msg)

                if context.get('fail_policy', 'skip') == 'skip':
                    context.setdefault('skipped_rows', []).append(idx)
                    continue
                else:
                    raise

        return results

    def handle_variants(
        self,
        master_rows: List[Dict[str, Any]],
        variants: List[Dict[str, Any]],
        context: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Handle variant expansion based on variant_mode.

        Args:
            master_rows: Mapped master rows
            variants: Variant data
            context: Additional context

        Returns:
            Rows with variants handled according to variant_mode
        """
        if not variants or self.spec.variant_mode == 'none':
            return master_rows

        # Group variants by base_sku
        variants_by_sku = {}
        for variant in variants:
            base_sku = variant.get('base_sku')
            if base_sku:
                variants_by_sku.setdefault(base_sku, []).append(variant)

        if self.spec.variant_mode == 'rows':
            # Expand each master row into multiple rows (one per variant)
            expanded = []
            for master_row in master_rows:
                sku = master_row.get('sku') or master_row.get('SKU')
                row_variants = variants_by_sku.get(sku, [])

                if row_variants:
                    for variant in row_variants:
                        variant_row = {**master_row}
                        # Override with variant-specific values
                        if 'variant_sku' in variant and variant['variant_sku']:
                            variant_row['sku'] = variant['variant_sku']
                        if 'price' in variant and variant['price']:
                            variant_row['price'] = variant['price']
                        if 'qty' in variant:
                            variant_row['quantity'] = variant['qty']

                        expanded.append(variant_row)
                else:
                    expanded.append(master_row)

            return expanded

        elif self.spec.variant_mode == 'matrix':
            # Add variant data as additional columns
            for master_row in master_rows:
                sku = master_row.get('sku') or master_row.get('SKU')
                row_variants = variants_by_sku.get(sku, [])

                if row_variants:
                    master_row['has_variants'] = True
                    master_row['variants'] = row_variants

            return master_rows

        elif self.spec.variant_mode == 'sheet':
            # Variants will be exported to separate sheet (handled in exporter)
            return master_rows

        return master_rows


def load_mapping(platform: str, mappings_dir: Path, lookups_dir: Path) -> MappingSpec:
    """
    Load a mapping specification for a platform.

    Args:
        platform: Platform name (ebay, shopify, etc.)
        mappings_dir: Directory containing mapping YAML files
        lookups_dir: Directory containing lookup CSV files

    Returns:
        MappingSpec instance
    """
    yaml_path = mappings_dir / f"{platform}.yaml"
    if not yaml_path.exists():
        raise FileNotFoundError(f"Mapping file not found: {yaml_path}")

    return MappingSpec(yaml_path, lookups_dir)
