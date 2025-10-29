"""
Validation engine for checking master data quality.
"""
from typing import List, Dict, Any
from .schema import IngestPayload, ValidationError, ValidationResult, MasterRow
from pathlib import Path


class Validator:
    """Validates ingested data against business rules"""

    def __init__(self, lookups_dir: Path = None):
        self.lookups_dir = lookups_dir
        self.category_lookups: Dict[str, set] = {}

    def load_category_lookup(self, platform: str) -> set:
        """Load valid categories for a platform"""
        if platform in self.category_lookups:
            return self.category_lookups[platform]

        if not self.lookups_dir:
            return set()

        lookup_file = self.lookups_dir / f"category_map_{platform}.csv"
        if not lookup_file.exists():
            return set()

        import csv
        categories = set()
        with open(lookup_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'category_path' in row:
                    categories.add(row['category_path'])

        self.category_lookups[platform] = categories
        return categories

    def validate(self, payload: IngestPayload, target_platforms: List[str] = None) -> ValidationResult:
        """
        Validate ingested payload.

        Args:
            payload: IngestPayload to validate
            target_platforms: List of target platforms for category validation

        Returns:
            ValidationResult with errors and warnings
        """
        errors = []
        warnings = []

        # Validate each master row
        for idx, row in enumerate(payload.master):
            row_errors, row_warnings = self._validate_master_row(row, idx, target_platforms)
            errors.extend(row_errors)
            warnings.extend(row_warnings)

        # Validate variants
        variant_errors = self._validate_variants(payload.variants, payload.master)
        errors.extend(variant_errors)

        # Count valid rows
        error_skus = set(e.sku for e in errors if e.error_type == 'hard')
        valid_rows = len(payload.master) - len(error_skus)

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            total_rows=len(payload.master),
            valid_rows=valid_rows
        )

    def _validate_master_row(
        self,
        row: MasterRow,
        idx: int,
        target_platforms: List[str] = None
    ) -> tuple[List[ValidationError], List[ValidationError]]:
        """Validate a single master row"""
        errors = []
        warnings = []

        # Hard errors (will skip row)

        # Check required fields (already validated by Pydantic, but double-check)
        if not row.sku:
            errors.append(ValidationError(
                row_index=idx,
                sku=row.sku or f"row_{idx}",
                field="sku",
                error_type="hard",
                message="SKU is required"
            ))

        if not row.title:
            errors.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="title",
                error_type="hard",
                message="Title is required"
            ))

        if row.price <= 0:
            errors.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="price",
                error_type="hard",
                message="Price must be greater than 0"
            ))

        if not row.image_urls or len(row.image_urls) == 0:
            errors.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="image_urls",
                error_type="hard",
                message="At least one image URL is required"
            ))

        if not row.description_html:
            errors.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="description_html",
                error_type="hard",
                message="Description is required"
            ))

        # Soft warnings (will auto-fix or log warning)

        # Title length warnings
        if len(row.title) > 200:
            warnings.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="title",
                error_type="soft",
                message=f"Title is too long ({len(row.title)} chars, max recommended: 200). Will be truncated."
            ))

        # Description length warnings
        desc_bytes = len(row.description_html.encode('utf-8'))
        if desc_bytes > 100000:
            warnings.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="description_html",
                error_type="soft",
                message=f"Description is too large ({desc_bytes} bytes, max: 100KB). Will be truncated."
            ))

        # Image count warnings
        if len(row.image_urls) > 20:
            warnings.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="image_urls",
                error_type="soft",
                message=f"Too many images ({len(row.image_urls)}, max: 20). Excess images will be dropped."
            ))

        # Category validation for specific platforms
        if target_platforms and row.category_path:
            for platform in target_platforms:
                valid_categories = self.load_category_lookup(platform)
                if valid_categories and row.category_path not in valid_categories:
                    errors.append(ValidationError(
                        row_index=idx,
                        sku=row.sku,
                        field="category_path",
                        error_type="hard",
                        message=f"Invalid category_path for {platform}: {row.category_path}"
                    ))

        # Currency validation
        valid_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'SGD', 'THB', 'MYR', 'PHP', 'IDR']
        if row.currency not in valid_currencies:
            warnings.append(ValidationError(
                row_index=idx,
                sku=row.sku,
                field="currency",
                error_type="soft",
                message=f"Unknown currency: {row.currency}. Will use default conversion rate."
            ))

        # Weight and dimensions warnings for platforms that need them
        if target_platforms and any(p in ['shopee', 'alibaba'] for p in target_platforms):
            if not row.weight_g:
                warnings.append(ValidationError(
                    row_index=idx,
                    sku=row.sku,
                    field="weight_g",
                    error_type="soft",
                    message="Weight is recommended for Shopee/Alibaba listings"
                ))

            if not all([row.dim_cm_l, row.dim_cm_w, row.dim_cm_h]):
                warnings.append(ValidationError(
                    row_index=idx,
                    sku=row.sku,
                    field="dimensions",
                    error_type="soft",
                    message="Dimensions are recommended for Shopee/Alibaba listings"
                ))

        return errors, warnings

    def _validate_variants(
        self,
        variants: List[Any],
        master_rows: List[MasterRow]
    ) -> List[ValidationError]:
        """Validate variants against master rows"""
        errors = []

        if not variants:
            return errors

        # Build SKU set from master
        master_skus = {row.sku for row in master_rows}

        # Check each variant references valid base_sku
        for idx, variant in enumerate(variants):
            if not hasattr(variant, 'base_sku') or not variant.base_sku:
                errors.append(ValidationError(
                    row_index=idx,
                    sku=f"variant_{idx}",
                    field="base_sku",
                    error_type="hard",
                    message="Variant missing base_sku"
                ))
                continue

            if variant.base_sku not in master_skus:
                errors.append(ValidationError(
                    row_index=idx,
                    sku=variant.base_sku,
                    field="base_sku",
                    error_type="hard",
                    message=f"Variant references unknown base_sku: {variant.base_sku}"
                ))

        return errors

    def get_category_distribution(self, payload: IngestPayload) -> Dict[str, int]:
        """Get distribution of products by category"""
        distribution = {}

        for row in payload.master:
            category = row.category_path or "Uncategorized"
            distribution[category] = distribution.get(category, 0) + 1

        return distribution

    def get_validation_summary(self, result: ValidationResult) -> Dict[str, Any]:
        """Get summary statistics from validation result"""
        return {
            "total_rows": result.total_rows,
            "valid_rows": result.valid_rows,
            "invalid_rows": result.total_rows - result.valid_rows,
            "hard_errors": len([e for e in result.errors if e.error_type == 'hard']),
            "soft_warnings": len([e for e in result.warnings if e.error_type == 'soft']),
            "error_fields": self._count_error_fields(result.errors),
            "warning_fields": self._count_error_fields(result.warnings)
        }

    def _count_error_fields(self, errors: List[ValidationError]) -> Dict[str, int]:
        """Count errors by field"""
        counts = {}
        for error in errors:
            counts[error.field] = counts.get(error.field, 0) + 1
        return counts
