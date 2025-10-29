"""
Pydantic data models for the multi-platform product converter.
"""
from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator
from typing import List, Optional, Dict, Any, Union
from enum import Enum


class Variant(BaseModel):
    """Product variant/option model"""
    base_sku: str
    variant_sku: Optional[str] = None
    opt_name1: Optional[str] = ""
    opt_value1: Optional[str] = ""
    opt_name2: Optional[str] = ""
    opt_value2: Optional[str] = ""
    price: Optional[float] = None
    qty: Optional[int] = None
    barcode: Optional[str] = None
    mpn: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Price cannot be negative')
        return v

    @field_validator('qty')
    @classmethod
    def validate_qty(cls, v):
        if v is not None and v < 0:
            raise ValueError('Quantity cannot be negative')
        return v


class MasterRow(BaseModel):
    """Master product data model"""
    sku: str
    title: str
    price: float
    currency: str
    quantity: int
    description_html: str
    image_urls: List[str]  # Changed from HttpUrl to str for flexibility

    brand: Optional[str] = None
    model: Optional[str] = None
    category_path: Optional[str] = None
    weight_g: Optional[float] = None
    dim_cm_l: Optional[float] = None
    dim_cm_w: Optional[float] = None
    dim_cm_h: Optional[float] = None
    condition: Optional[str] = None
    origin_country: Optional[str] = None
    hs_code: Optional[str] = None
    barcode: Optional[str] = None
    mpn: Optional[str] = None
    shipping_template: Optional[str] = None
    handling_time_days: Optional[float] = None

    # Alibaba/B2B specific fields
    moq: Optional[int] = None
    lead_time_days: Optional[int] = None
    port_name: Optional[str] = None
    packaging_info: Optional[str] = None

    # Variants and specifics
    has_variants: Optional[bool] = False
    item_specifics_json: Optional[Dict[str, Any]] = None

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v < 0:
            raise ValueError('Quantity cannot be negative')
        return v

    @field_validator('image_urls')
    @classmethod
    def validate_images(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one image URL is required')
        return v

    @field_validator('weight_g', 'dim_cm_l', 'dim_cm_w', 'dim_cm_h', 'handling_time_days')
    @classmethod
    def validate_positive_numbers(cls, v):
        if v is not None and v < 0:
            raise ValueError('Value cannot be negative')
        return v

    @field_validator('moq', 'lead_time_days')
    @classmethod
    def validate_positive_ints(cls, v):
        if v is not None and v < 0:
            raise ValueError('Value cannot be negative')
        return v


class IngestPayload(BaseModel):
    """Complete ingestion payload from uploaded Excel"""
    master: List[MasterRow]
    variants: List[Variant] = []
    specifics: List[Dict[str, str]] = []  # [{sku, key, value}]
    fx: Dict[str, Dict[str, float]] = {}  # {"USD": {"rate_to_USD": 1.0, ...}}
    shopee_logistics: List[Dict[str, Any]] = []


class ValidationError(BaseModel):
    """Validation error model"""
    row_index: int
    sku: str
    field: str
    error_type: str  # 'hard' or 'soft'
    message: str


class ValidationResult(BaseModel):
    """Validation result model"""
    valid: bool
    errors: List[ValidationError] = []
    warnings: List[ValidationError] = []
    total_rows: int
    valid_rows: int


class Platform(str, Enum):
    """Supported platforms"""
    EBAY = "ebay"
    COUPANG = "coupang"
    NAVER = "naver"
    SHOPIFY = "shopify"
    SHOPEE = "shopee"
    QOO10 = "qoo10"
    ALIBABA = "alibaba"


class ConvertOptions(BaseModel):
    """Conversion options"""
    locale: str = "KR"  # For Shopee and other locale-specific platforms
    fail_policy: str = "skip"  # 'skip' or 'fail'
    max_workers: int = 8
    dry_run: bool = False
    preview_rows: int = 3


class ConvertRequest(BaseModel):
    """Conversion request model"""
    targets: List[Platform]
    options: ConvertOptions = ConvertOptions()


class ConvertResult(BaseModel):
    """Conversion result for a single platform"""
    platform: Platform
    success: bool
    output_file: Optional[str] = None
    rows_processed: int = 0
    rows_skipped: int = 0
    errors: List[str] = []
    warnings: List[str] = []


class ConvertResponse(BaseModel):
    """Complete conversion response"""
    results: List[ConvertResult]
    total_time_seconds: float
    log_file: Optional[str] = None
