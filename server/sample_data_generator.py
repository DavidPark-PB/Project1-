#!/usr/bin/env python3
"""
Generate a sample Master.xlsx file for testing the converter.
"""
import pandas as pd
from pathlib import Path


def generate_sample_master():
    """Generate sample Master Excel file"""

    # Master data
    master_data = [
        {
            "sku": "PROD-001",
            "title": "Wireless Bluetooth Headphones - Premium Sound Quality",
            "price": 79.99,
            "currency": "USD",
            "quantity": 100,
            "description_html": "<p>Premium wireless headphones with active noise cancellation.</p><ul><li>40-hour battery life</li><li>Fast charging</li><li>Comfortable ear cushions</li></ul>",
            "image_urls": "https://example.com/img1.jpg|https://example.com/img2.jpg|https://example.com/img3.jpg",
            "brand": "TechSound",
            "model": "TS-WH1000",
            "category_path": "Electronics/Phones/Smartphones",
            "weight_g": 250,
            "dim_cm_l": 20,
            "dim_cm_w": 18,
            "dim_cm_h": 8,
            "condition": "new",
            "origin_country": "China",
            "hs_code": "8518.30",
            "barcode": "1234567890123",
            "mpn": "TS-WH1000-BLK",
            "shipping_template": "Standard",
            "handling_time_days": 2,
            "moq": 1,
            "lead_time_days": 7,
            "port_name": "Shanghai",
            "packaging_info": "Gift box with accessories",
            "has_variants": True
        },
        {
            "sku": "PROD-002",
            "title": "Smart Watch Pro - Fitness Tracker with Heart Rate Monitor",
            "price": 129.99,
            "currency": "USD",
            "quantity": 75,
            "description_html": "<p>Advanced smartwatch with fitness tracking capabilities.</p><ul><li>GPS tracking</li><li>Heart rate monitor</li><li>Water resistant IP68</li><li>7-day battery life</li></ul>",
            "image_urls": "https://example.com/watch1.jpg|https://example.com/watch2.jpg",
            "brand": "FitTech",
            "model": "FT-SW200",
            "category_path": "Electronics/Phones/Smartphones",
            "weight_g": 45,
            "dim_cm_l": 5,
            "dim_cm_w": 4,
            "dim_cm_h": 1.2,
            "condition": "new",
            "origin_country": "Taiwan",
            "hs_code": "9102.11",
            "barcode": "2345678901234",
            "mpn": "FT-SW200-SLV",
            "shipping_template": "Express",
            "handling_time_days": 1,
            "moq": 1,
            "lead_time_days": 5,
            "port_name": "Kaohsiung",
            "packaging_info": "Retail box with charging cable",
            "has_variants": True
        },
        {
            "sku": "PROD-003",
            "title": "USB-C Fast Charging Cable - 6ft Braided",
            "price": 14.99,
            "currency": "USD",
            "quantity": 500,
            "description_html": "<p>Durable braided USB-C cable for fast charging.</p><ul><li>USB-C to USB-C</li><li>100W power delivery</li><li>Tangle-free design</li></ul>",
            "image_urls": "https://example.com/cable1.jpg",
            "brand": "ChargeFast",
            "model": "CF-USBC-6FT",
            "category_path": "Electronics/Computers/Laptops",
            "weight_g": 50,
            "dim_cm_l": 10,
            "dim_cm_w": 8,
            "dim_cm_h": 2,
            "condition": "new",
            "origin_country": "China",
            "hs_code": "8544.42",
            "barcode": "3456789012345",
            "mpn": "CF-USBC-6FT-BLK",
            "shipping_template": "Economy",
            "handling_time_days": 3,
            "moq": 10,
            "lead_time_days": 10,
            "port_name": "Shenzhen",
            "packaging_info": "Poly bag",
            "has_variants": False
        }
    ]

    # Variants data
    variants_data = [
        {
            "base_sku": "PROD-001",
            "variant_sku": "PROD-001-BLK",
            "opt_name1": "Color",
            "opt_value1": "Black",
            "opt_name2": "",
            "opt_value2": "",
            "price": 79.99,
            "qty": 50,
            "barcode": "1234567890124",
            "mpn": "TS-WH1000-BLK",
            "image_url": "https://example.com/hp-black.jpg"
        },
        {
            "base_sku": "PROD-001",
            "variant_sku": "PROD-001-WHT",
            "opt_name1": "Color",
            "opt_value1": "White",
            "opt_name2": "",
            "opt_value2": "",
            "price": 79.99,
            "qty": 30,
            "barcode": "1234567890125",
            "mpn": "TS-WH1000-WHT",
            "image_url": "https://example.com/hp-white.jpg"
        },
        {
            "base_sku": "PROD-001",
            "variant_sku": "PROD-001-BLU",
            "opt_name1": "Color",
            "opt_value1": "Blue",
            "opt_name2": "",
            "opt_value2": "",
            "price": 84.99,
            "qty": 20,
            "barcode": "1234567890126",
            "mpn": "TS-WH1000-BLU",
            "image_url": "https://example.com/hp-blue.jpg"
        },
        {
            "base_sku": "PROD-002",
            "variant_sku": "PROD-002-S-SLV",
            "opt_name1": "Size",
            "opt_value1": "Small",
            "opt_name2": "Color",
            "opt_value2": "Silver",
            "price": 129.99,
            "qty": 20,
            "barcode": "2345678901235",
            "mpn": "FT-SW200-S-SLV",
            "image_url": "https://example.com/watch-s-slv.jpg"
        },
        {
            "base_sku": "PROD-002",
            "variant_sku": "PROD-002-M-SLV",
            "opt_name1": "Size",
            "opt_value1": "Medium",
            "opt_name2": "Color",
            "opt_value2": "Silver",
            "price": 129.99,
            "qty": 30,
            "barcode": "2345678901236",
            "mpn": "FT-SW200-M-SLV",
            "image_url": "https://example.com/watch-m-slv.jpg"
        },
        {
            "base_sku": "PROD-002",
            "variant_sku": "PROD-002-M-BLK",
            "opt_name1": "Size",
            "opt_value1": "Medium",
            "opt_name2": "Color",
            "opt_value2": "Black",
            "price": 129.99,
            "qty": 25,
            "barcode": "2345678901237",
            "mpn": "FT-SW200-M-BLK",
            "image_url": "https://example.com/watch-m-blk.jpg"
        }
    ]

    # Item specifics data
    specifics_data = [
        {"sku": "PROD-001", "key": "Connectivity", "value": "Bluetooth 5.0"},
        {"sku": "PROD-001", "key": "Battery Life", "value": "40 hours"},
        {"sku": "PROD-001", "key": "Noise Cancellation", "value": "Active"},
        {"sku": "PROD-002", "key": "Display", "value": "AMOLED"},
        {"sku": "PROD-002", "key": "Water Resistance", "value": "IP68"},
        {"sku": "PROD-002", "key": "Sensors", "value": "Heart Rate, GPS, Accelerometer"},
        {"sku": "PROD-003", "key": "Cable Type", "value": "USB-C to USB-C"},
        {"sku": "PROD-003", "key": "Power", "value": "100W"},
        {"sku": "PROD-003", "key": "Length", "value": "6 feet"}
    ]

    # Create Excel writer
    output_path = Path(__file__).parent / "sample_master.xlsx"

    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Write Master sheet
        pd.DataFrame(master_data).to_excel(writer, sheet_name='Master', index=False)

        # Write Variants sheet
        pd.DataFrame(variants_data).to_excel(writer, sheet_name='Variants', index=False)

        # Write ItemSpecifics sheet
        pd.DataFrame(specifics_data).to_excel(writer, sheet_name='ItemSpecifics', index=False)

        # Write FX sheet (optional)
        fx_data = [
            {"currency": "USD", "rate_to_USD": 1.0, "rate_from_USD": 1.0},
            {"currency": "KRW", "rate_to_USD": 0.00075, "rate_from_USD": 1330.0},
            {"currency": "EUR", "rate_to_USD": 1.08, "rate_from_USD": 0.93},
            {"currency": "GBP", "rate_to_USD": 1.27, "rate_from_USD": 0.79},
            {"currency": "JPY", "rate_to_USD": 0.0067, "rate_from_USD": 149.0},
        ]
        pd.DataFrame(fx_data).to_excel(writer, sheet_name='FX', index=False)

        # Write ShopeeLogisticsTemplate sheet (optional)
        shopee_data = [
            {"locale": "KR", "size_id": 0, "max_weight_g": 500, "max_dimension_cm": 30, "name": "Small Parcel"},
            {"locale": "KR", "size_id": 1, "max_weight_g": 2000, "max_dimension_cm": 60, "name": "Medium Parcel"},
            {"locale": "SG", "size_id": 0, "max_weight_g": 500, "max_dimension_cm": 30, "name": "Small Parcel"},
            {"locale": "SG", "size_id": 1, "max_weight_g": 2000, "max_dimension_cm": 60, "name": "Medium Parcel"},
        ]
        pd.DataFrame(shopee_data).to_excel(writer, sheet_name='ShopeeLogisticsTemplate', index=False)

    print(f"✓ Sample Master Excel file created: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_sample_master()
