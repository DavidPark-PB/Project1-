"""
Excel/CSV ingestion module for parsing Master product files.
"""
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Union, BinaryIO
from io import BytesIO
from .schema import MasterRow, Variant, IngestPayload


class ExcelIngestor:
    """Handles parsing of Excel files into IngestPayload"""

    def __init__(self):
        self.required_sheets = ['Master']
        self.optional_sheets = ['Variants', 'ItemSpecifics', 'FX', 'ShopeeLogisticsTemplate']

    def parse_file(self, file_path: Union[str, Path, BinaryIO]) -> IngestPayload:
        """
        Parse Excel file into IngestPayload.

        Args:
            file_path: Path to Excel file or file-like object

        Returns:
            IngestPayload instance
        """
        # Read all sheets
        if isinstance(file_path, (str, Path)):
            sheets = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')
        else:
            sheets = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')

        # Validate required sheets
        if 'Master' not in sheets:
            raise ValueError("Master sheet is required")

        # Parse Master sheet
        master = self._parse_master_sheet(sheets['Master'])

        # Parse optional sheets
        variants = self._parse_variants_sheet(sheets.get('Variants'))
        specifics = self._parse_specifics_sheet(sheets.get('ItemSpecifics'))
        fx = self._parse_fx_sheet(sheets.get('FX'))
        shopee_logistics = self._parse_shopee_logistics_sheet(sheets.get('ShopeeLogisticsTemplate'))

        return IngestPayload(
            master=master,
            variants=variants,
            specifics=specifics,
            fx=fx,
            shopee_logistics=shopee_logistics
        )

    def _parse_master_sheet(self, df: pd.DataFrame) -> List[MasterRow]:
        """Parse Master sheet into MasterRow objects"""
        if df is None or df.empty:
            raise ValueError("Master sheet is empty")

        # Clean column names
        df.columns = df.columns.str.strip()

        # Required columns
        required_cols = ['sku', 'title', 'price', 'currency', 'quantity', 'description_html', 'image_urls']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns in Master sheet: {', '.join(missing)}")

        # Convert DataFrame to list of dicts
        rows = []
        for idx, row in df.iterrows():
            try:
                # Parse image URLs (pipe-separated)
                image_urls_str = str(row.get('image_urls', ''))
                image_urls = [url.strip() for url in image_urls_str.split('|') if url.strip()]

                # Parse item specifics JSON (if present)
                item_specifics = None
                if 'item_specifics_json' in row and pd.notna(row['item_specifics_json']):
                    import json
                    try:
                        item_specifics = json.loads(row['item_specifics_json'])
                    except json.JSONDecodeError:
                        pass

                # Build MasterRow
                master_row = MasterRow(
                    sku=str(row['sku']),
                    title=str(row['title']),
                    price=float(row['price']),
                    currency=str(row['currency']),
                    quantity=int(row['quantity']),
                    description_html=str(row.get('description_html', '')),
                    image_urls=image_urls,
                    brand=self._get_optional_str(row, 'brand'),
                    model=self._get_optional_str(row, 'model'),
                    category_path=self._get_optional_str(row, 'category_path'),
                    weight_g=self._get_optional_float(row, 'weight_g'),
                    dim_cm_l=self._get_optional_float(row, 'dim_cm_l'),
                    dim_cm_w=self._get_optional_float(row, 'dim_cm_w'),
                    dim_cm_h=self._get_optional_float(row, 'dim_cm_h'),
                    condition=self._get_optional_str(row, 'condition'),
                    origin_country=self._get_optional_str(row, 'origin_country'),
                    hs_code=self._get_optional_str(row, 'hs_code'),
                    barcode=self._get_optional_str(row, 'barcode'),
                    mpn=self._get_optional_str(row, 'mpn'),
                    shipping_template=self._get_optional_str(row, 'shipping_template'),
                    handling_time_days=self._get_optional_float(row, 'handling_time_days'),
                    moq=self._get_optional_int(row, 'moq'),
                    lead_time_days=self._get_optional_int(row, 'lead_time_days'),
                    port_name=self._get_optional_str(row, 'port_name'),
                    packaging_info=self._get_optional_str(row, 'packaging_info'),
                    has_variants=self._get_optional_bool(row, 'has_variants'),
                    item_specifics_json=item_specifics
                )

                rows.append(master_row)

            except Exception as e:
                raise ValueError(f"Error parsing Master row {idx}: {str(e)}")

        return rows

    def _parse_variants_sheet(self, df: pd.DataFrame) -> List[Variant]:
        """Parse Variants sheet into Variant objects"""
        if df is None or df.empty:
            return []

        # Clean column names
        df.columns = df.columns.str.strip()

        variants = []
        for idx, row in df.iterrows():
            try:
                variant = Variant(
                    base_sku=str(row.get('base_sku', '')),
                    variant_sku=self._get_optional_str(row, 'variant_sku'),
                    opt_name1=self._get_optional_str(row, 'opt_name1'),
                    opt_value1=self._get_optional_str(row, 'opt_value1'),
                    opt_name2=self._get_optional_str(row, 'opt_name2'),
                    opt_value2=self._get_optional_str(row, 'opt_value2'),
                    price=self._get_optional_float(row, 'price'),
                    qty=self._get_optional_int(row, 'qty'),
                    barcode=self._get_optional_str(row, 'barcode'),
                    mpn=self._get_optional_str(row, 'mpn'),
                    image_url=self._get_optional_str(row, 'image_url')
                )
                variants.append(variant)
            except Exception as e:
                # Skip invalid variants with warning
                print(f"Warning: Skipping variant row {idx}: {str(e)}")
                continue

        return variants

    def _parse_specifics_sheet(self, df: pd.DataFrame) -> List[Dict[str, str]]:
        """Parse ItemSpecifics sheet into list of dicts"""
        if df is None or df.empty:
            return []

        # Clean column names
        df.columns = df.columns.str.strip()

        # Expected columns: sku, key, value
        if 'sku' not in df.columns or 'key' not in df.columns or 'value' not in df.columns:
            return []

        specifics = []
        for _, row in df.iterrows():
            if pd.notna(row.get('sku')) and pd.notna(row.get('key')) and pd.notna(row.get('value')):
                specifics.append({
                    'sku': str(row['sku']),
                    'key': str(row['key']),
                    'value': str(row['value'])
                })

        return specifics

    def _parse_fx_sheet(self, df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """Parse FX sheet into currency rates dict"""
        if df is None or df.empty:
            # Return default FX rates
            return {
                'USD': {'rate_to_USD': 1.0, 'rate_from_USD': 1.0},
                'KRW': {'rate_to_USD': 0.00075, 'rate_from_USD': 1330.0},
                'EUR': {'rate_to_USD': 1.08, 'rate_from_USD': 0.93},
                'GBP': {'rate_to_USD': 1.27, 'rate_from_USD': 0.79},
                'JPY': {'rate_to_USD': 0.0067, 'rate_from_USD': 149.0},
                'CNY': {'rate_to_USD': 0.14, 'rate_from_USD': 7.24},
                'SGD': {'rate_to_USD': 0.74, 'rate_from_USD': 1.35},
                'THB': {'rate_to_USD': 0.029, 'rate_from_USD': 34.5},
            }

        # Clean column names
        df.columns = df.columns.str.strip()

        # Expected columns: currency, rate_to_USD, rate_from_USD
        fx_rates = {}
        for _, row in df.iterrows():
            if pd.notna(row.get('currency')):
                currency = str(row['currency']).upper()
                fx_rates[currency] = {
                    'rate_to_USD': float(row.get('rate_to_USD', 1.0)),
                    'rate_from_USD': float(row.get('rate_from_USD', 1.0))
                }

        return fx_rates

    def _parse_shopee_logistics_sheet(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parse ShopeeLogisticsTemplate sheet"""
        if df is None or df.empty:
            return []

        # Clean column names
        df.columns = df.columns.str.strip()

        logistics = []
        for _, row in df.iterrows():
            logistics.append({
                'locale': self._get_optional_str(row, 'locale'),
                'size_id': self._get_optional_int(row, 'size_id'),
                'max_weight_g': self._get_optional_float(row, 'max_weight_g'),
                'max_dimension_cm': self._get_optional_float(row, 'max_dimension_cm'),
                'name': self._get_optional_str(row, 'name')
            })

        return logistics

    def _get_optional_str(self, row: pd.Series, col: str) -> Optional[str]:
        """Get optional string value from row"""
        if col in row and pd.notna(row[col]):
            return str(row[col])
        return None

    def _get_optional_int(self, row: pd.Series, col: str) -> Optional[int]:
        """Get optional int value from row"""
        if col in row and pd.notna(row[col]):
            try:
                return int(row[col])
            except (ValueError, TypeError):
                return None
        return None

    def _get_optional_float(self, row: pd.Series, col: str) -> Optional[float]:
        """Get optional float value from row"""
        if col in row and pd.notna(row[col]):
            try:
                return float(row[col])
            except (ValueError, TypeError):
                return None
        return None

    def _get_optional_bool(self, row: pd.Series, col: str) -> Optional[bool]:
        """Get optional bool value from row"""
        if col in row and pd.notna(row[col]):
            value = str(row[col]).lower()
            return value in ('true', 'yes', '1', 'y')
        return False


def parse_csv(file_path: Union[str, Path, BinaryIO]) -> IngestPayload:
    """
    Parse a CSV file (Master data only, no variants/specifics).

    Args:
        file_path: Path to CSV file or file-like object

    Returns:
        IngestPayload instance with only master data
    """
    if isinstance(file_path, (str, Path)):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_csv(file_path)

    ingestor = ExcelIngestor()
    master = ingestor._parse_master_sheet(df)

    return IngestPayload(master=master)


def parse_file(file_path: Union[str, Path, BinaryIO]) -> IngestPayload:
    """
    Auto-detect and parse Excel or CSV file.

    Args:
        file_path: Path to file or file-like object

    Returns:
        IngestPayload instance
    """
    # Determine file type
    if isinstance(file_path, (str, Path)):
        file_path = Path(file_path)
        if file_path.suffix.lower() in ['.xlsx', '.xls']:
            ingestor = ExcelIngestor()
            return ingestor.parse_file(file_path)
        elif file_path.suffix.lower() == '.csv':
            return parse_csv(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
    else:
        # Try Excel first, fall back to CSV
        try:
            ingestor = ExcelIngestor()
            return ingestor.parse_file(file_path)
        except Exception:
            file_path.seek(0)  # Reset stream
            return parse_csv(file_path)
