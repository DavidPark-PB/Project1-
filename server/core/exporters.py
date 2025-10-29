"""
Export module for writing mapped data to CSV/XLSX files.
"""
import csv
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows


class CSVExporter:
    """Export data to CSV format"""

    def __init__(self, encoding: str = 'utf-8'):
        self.encoding = encoding

    def export(self, rows: List[Dict[str, Any]], output_path: Path) -> None:
        """
        Export rows to CSV file.

        Args:
            rows: List of row dictionaries
            output_path: Output file path
        """
        if not rows:
            raise ValueError("No rows to export")

        # Get all unique column names
        columns = []
        seen = set()
        for row in rows:
            for key in row.keys():
                if key not in seen:
                    columns.append(key)
                    seen.add(key)

        # Write CSV
        with open(output_path, 'w', encoding=self.encoding, newline='') as f:
            writer = csv.DictWriter(f, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)


class XLSXExporter:
    """Export data to XLSX format"""

    def __init__(self):
        pass

    def export(
        self,
        rows: List[Dict[str, Any]],
        output_path: Path,
        sheet_name: str = 'Sheet1',
        variant_rows: List[Dict[str, Any]] = None
    ) -> None:
        """
        Export rows to XLSX file.

        Args:
            rows: List of row dictionaries for main sheet
            output_path: Output file path
            sheet_name: Name of the main sheet
            variant_rows: Optional variant rows for separate sheet
        """
        if not rows:
            raise ValueError("No rows to export")

        # Convert to DataFrame
        df = pd.DataFrame(rows)

        # Create Excel writer
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # Write main sheet
            df.to_excel(writer, sheet_name=sheet_name, index=False)

            # Write variants sheet if provided
            if variant_rows:
                variants_df = pd.DataFrame(variant_rows)
                variants_df.to_excel(writer, sheet_name='Variants', index=False)

    def export_workbook(
        self,
        sheets: Dict[str, List[Dict[str, Any]]],
        output_path: Path
    ) -> None:
        """
        Export multiple sheets to XLSX file.

        Args:
            sheets: Dict mapping sheet names to row lists
            output_path: Output file path
        """
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for sheet_name, rows in sheets.items():
                if rows:
                    df = pd.DataFrame(rows)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)


class StreamingCSVExporter:
    """Streaming CSV exporter for large datasets"""

    def __init__(self, output_path: Path, columns: List[str], encoding: str = 'utf-8'):
        self.output_path = output_path
        self.columns = columns
        self.encoding = encoding
        self.file = None
        self.writer = None

    def __enter__(self):
        self.file = open(self.output_path, 'w', encoding=self.encoding, newline='')
        self.writer = csv.DictWriter(self.file, fieldnames=self.columns)
        self.writer.writeheader()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()

    def write_row(self, row: Dict[str, Any]) -> None:
        """Write a single row"""
        if not self.writer:
            raise RuntimeError("Exporter not initialized. Use as context manager.")
        self.writer.writerow(row)

    def write_rows(self, rows: List[Dict[str, Any]]) -> None:
        """Write multiple rows"""
        if not self.writer:
            raise RuntimeError("Exporter not initialized. Use as context manager.")
        self.writer.writerows(rows)


def export_data(
    rows: List[Dict[str, Any]],
    output_path: Path,
    format: str = 'csv',
    encoding: str = 'utf-8',
    sheet_name: str = 'Sheet1',
    variant_rows: List[Dict[str, Any]] = None
) -> None:
    """
    Export data to file.

    Args:
        rows: List of row dictionaries
        output_path: Output file path
        format: Output format ('csv' or 'xlsx')
        encoding: Text encoding for CSV
        sheet_name: Sheet name for XLSX
        variant_rows: Optional variant rows for XLSX
    """
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if format.lower() == 'csv':
        exporter = CSVExporter(encoding=encoding)
        exporter.export(rows, output_path)
    elif format.lower() in ['xlsx', 'xls']:
        exporter = XLSXExporter()
        exporter.export(rows, output_path, sheet_name=sheet_name, variant_rows=variant_rows)
    else:
        raise ValueError(f"Unsupported format: {format}")


def sanitize_for_export(value: Any) -> Any:
    """
    Sanitize a value for Excel/CSV export.
    Handles special cases like formulas, large numbers, etc.
    """
    if value is None:
        return ""

    # Convert to string first
    s = str(value)

    # Prevent formula injection
    if s.startswith(('=', '+', '-', '@')):
        s = "'" + s

    # Handle large numbers that Excel might convert to scientific notation
    if isinstance(value, (int, float)) and abs(value) > 1e10:
        return f"'{value}"

    return value


def sanitize_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sanitize all rows for export"""
    return [
        {key: sanitize_for_export(val) for key, val in row.items()}
        for row in rows
    ]
