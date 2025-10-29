# Multi-Platform Product Converter

Convert your Master product data into templates for 7 major e-commerce platforms with one click.

## Supported Platforms

- **eBay** - Global marketplace
- **Shopify** - E-commerce platform
- **Coupang** - Korean marketplace
- **Naver SmartStore** - Korean marketplace
- **Shopee** - Southeast Asian marketplace
- **Qoo10** - Asian marketplace
- **Alibaba** - B2B platform

## Features

- 📊 **Single Source of Truth**: Maintain one Master Excel/CSV file
- 🔄 **Batch Conversion**: Convert to all 7 platforms simultaneously
- ✅ **Smart Validation**: Hard errors (skip) and soft warnings (auto-fix)
- 🎨 **Visual Dashboard**: Upload, preview, map, export - all in one UI
- 🌍 **Multi-Currency**: Automatic currency conversion with FX rates
- 🏷️ **Variant Support**: Handle product options/variations per platform
- 🔍 **Category Mapping**: Automatic category lookup for each platform
- 📝 **Detailed Logging**: JSONL logs for every conversion run
- 🚀 **CLI Support**: Command-line tool for automation

## Architecture

```
Project/
├── server/                     # Python FastAPI backend
│   ├── core/
│   │   ├── schema.py          # Pydantic data models
│   │   ├── ingest.py          # Excel/CSV parser
│   │   ├── validate.py        # Validation engine
│   │   ├── dsl.py             # YAML mapping parser
│   │   ├── transforms.py      # Transform functions
│   │   └── exporters.py       # CSV/XLSX exporters
│   ├── mappings/              # Platform-specific YAML mappings
│   │   ├── ebay.yaml
│   │   ├── shopify.yaml
│   │   ├── coupang.yaml
│   │   ├── naver.yaml
│   │   ├── shopee.yaml
│   │   ├── qoo10.yaml
│   │   └── alibaba.yaml
│   ├── lookups/               # Lookup tables (CSV)
│   │   ├── category_map_*.csv
│   │   ├── fx.csv
│   │   └── shopee_logistics_template.csv
│   ├── main.py                # FastAPI server
│   ├── convert.py             # CLI tool
│   └── requirements.txt
├── app/                       # Next.js frontend
└── README.md
```

## Quick Start

### 1. Install Dependencies

#### Backend (Python)
```bash
cd server
pip install -r requirements.txt
```

#### Frontend (Node.js)
```bash
npm install
# or
pnpm install
```

### 2. Start the Backend Server

```bash
cd server
python main.py
```

Server will run on http://localhost:8000

### 3. Start the Frontend

```bash
npm run dev
# or
pnpm dev
```

Frontend will run on http://localhost:3000

### 4. Open the Web App

Navigate to http://localhost:3000/converter/upload

## Master Excel Format

Your Master Excel file should contain the following sheets:

### Master Sheet (Required)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| sku | string | ✅ | Unique product identifier |
| title | string | ✅ | Product title |
| price | float | ✅ | Price (must be > 0) |
| currency | string | ✅ | Currency code (USD, KRW, etc.) |
| quantity | integer | ✅ | Stock quantity |
| description_html | string | ✅ | HTML description |
| image_urls | string | ✅ | Pipe-separated URLs (url1\|url2\|url3) |
| brand | string | | Brand name |
| model | string | | Model number |
| category_path | string | | Category (e.g., Electronics/Phones/Smartphones) |
| weight_g | float | | Weight in grams |
| dim_cm_l | float | | Length in cm |
| dim_cm_w | float | | Width in cm |
| dim_cm_h | float | | Height in cm |
| condition | string | | new/used/refurbished |
| origin_country | string | | Country of origin |
| hs_code | string | | HS/tariff code |
| barcode | string | | UPC/EAN barcode |
| mpn | string | | Manufacturer Part Number |
| moq | integer | | Minimum Order Quantity (Alibaba) |
| lead_time_days | integer | | Lead time (Alibaba) |
| port_name | string | | Shipping port (Alibaba) |
| packaging_info | string | | Packaging details (Alibaba) |

### Variants Sheet (Optional)

| Column | Type | Description |
|--------|------|-------------|
| base_sku | string | References Master SKU |
| variant_sku | string | Unique variant SKU |
| opt_name1 | string | Option name (e.g., "Color") |
| opt_value1 | string | Option value (e.g., "Red") |
| opt_name2 | string | Second option name |
| opt_value2 | string | Second option value |
| price | float | Variant price (overrides master) |
| qty | integer | Variant quantity |
| barcode | string | Variant barcode |
| image_url | string | Variant image |

### ItemSpecifics Sheet (Optional)

| Column | Type | Description |
|--------|------|-------------|
| sku | string | References Master SKU |
| key | string | Attribute name |
| value | string | Attribute value |

### FX Sheet (Optional)

| Column | Type | Description |
|--------|------|-------------|
| currency | string | Currency code |
| rate_to_USD | float | Conversion rate to USD |
| rate_from_USD | float | Conversion rate from USD |

### ShopeeLogisticsTemplate Sheet (Optional)

| Column | Type | Description |
|--------|------|-------------|
| locale | string | Shopee locale (KR, SG, TH, etc.) |
| size_id | integer | Size category ID |
| max_weight_g | float | Max weight for this size |
| max_dimension_cm | float | Max dimension for this size |
| name | string | Template name |

## CLI Usage

Convert products from command line:

```bash
cd server

# Convert to all platforms
python convert.py \
  --input path/to/Master.xlsx \
  --targets ebay,coupang,naver,shopify,shopee,qoo10,alibaba \
  --out output/

# Convert to specific platforms only
python convert.py \
  --input Master.xlsx \
  --targets ebay,shopify \
  --out output/

# Validate only (no conversion)
python convert.py \
  --input Master.xlsx \
  --targets ebay,shopify \
  --validate-only

# Dry run (no output files)
python convert.py \
  --input Master.xlsx \
  --targets ebay,shopify \
  --dry-run

# Parallel processing with 4 workers
python convert.py \
  --input Master.xlsx \
  --targets ebay,coupang,naver,shopify,shopee,qoo10,alibaba \
  --out output/ \
  --max-workers 4

# Fail immediately on errors
python convert.py \
  --input Master.xlsx \
  --targets ebay \
  --fail-policy fail
```

## API Endpoints

### POST /api/ingest
Upload and parse Excel/CSV file.

**Request**: `multipart/form-data` with file

**Response**:
```json
{
  "session_id": "session_1234567890",
  "filename": "Master.xlsx",
  "master_count": 100,
  "variants_count": 50,
  "master": [...],
  "variants": [...],
  "specifics": [...]
}
```

### POST /api/validate
Validate uploaded data.

**Request**:
```json
{
  "session_id": "session_1234567890",
  "target_platforms": ["ebay", "shopify"]
}
```

**Response**:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "total_rows": 100,
  "valid_rows": 98
}
```

### POST /api/convert
Convert data to platform formats.

**Request**:
```json
{
  "session_id": "session_1234567890",
  "targets": ["ebay", "shopify", "coupang"],
  "options": {
    "locale": "KR",
    "fail_policy": "skip",
    "dry_run": false
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "platform": "ebay",
      "success": true,
      "output_file": "/path/to/ebay.csv",
      "rows_processed": 98,
      "rows_skipped": 2,
      "errors": [],
      "warnings": []
    }
  ],
  "total_time_seconds": 2.5,
  "log_file": "/path/to/log.jsonl"
}
```

### GET /api/download/{platform}
Download converted file for a platform.

### GET /api/report/latest
Get the latest conversion report.

## Customization

### Adding a New Platform

1. Create a new YAML mapping file in `server/mappings/{platform}.yaml`
2. Create category lookup CSV in `server/lookups/category_map_{platform}.csv`
3. Add the platform to the `Platform` enum in `server/core/schema.py`
4. Test with sample data

### Customizing Transforms

Edit `server/core/transforms.py` to add new transform functions.

Example:
```python
def my_custom_transform(value: Any, param: str) -> Any:
    # Your transform logic
    return transformed_value
```

Then use in YAML:
```yaml
columns:
  MyField:
    from: source_field
    transforms:
      - my_custom_transform: {param: "value"}
```

## Validation Rules

### Hard Errors (Row Skipped)
- Missing required fields: sku, title, price, currency, quantity, description_html, image_urls
- Price ≤ 0
- No images
- Invalid category_path (if category lookup enabled for platform)

### Soft Warnings (Auto-Fixed)
- Title too long → Truncated
- Description too large → Truncated
- Too many images → Excess dropped
- Unknown currency → Default conversion rate used
- Missing weight/dimensions → Default values used

## Logging

All conversions are logged to `server/logs/convert_{timestamp}.jsonl`.

Each log entry contains:
```json
{
  "timestamp": "2025-10-29T10:30:00",
  "platform": "ebay",
  "success": true,
  "rows_processed": 98,
  "rows_skipped": 2,
  "errors": [],
  "warnings": []
}
```

## Troubleshooting

### Excel file fails to parse
- Ensure all required sheets exist (at minimum: Master)
- Check column names match exactly (case-sensitive)
- Verify data types (price should be number, not text)

### Category lookup fails
- Check that category_path values exist in `category_map_{platform}.csv`
- Verify the category path format matches (e.g., "Electronics/Phones/Smartphones")

### Currency conversion errors
- Ensure FX sheet contains the currency code
- Verify rate_to_USD and rate_from_USD are present

### Image URLs not working
- Use pipe separator: `url1|url2|url3`
- Ensure URLs are valid and accessible

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
