#!/bin/bash

# Quick CLI Test Script for Multi-Platform Product Converter

echo "======================================"
echo "Testing Product Converter (CLI Mode)"
echo "======================================"
echo ""

cd server

# Setup if needed
if [ ! -d "venv" ]; then
    echo "📦 First-time setup..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -q -r requirements.txt
    mkdir -p out temp logs
    echo "✅ Setup complete!"
    echo ""
fi

# Activate virtual environment
source venv/bin/activate

# Generate sample data if not exists
if [ ! -f "sample_master.xlsx" ]; then
    echo "📊 Generating sample data..."
    python sample_data_generator.py
    echo ""
fi

# Run conversion
echo "🔄 Converting sample data to all platforms..."
echo ""

python convert.py \
  --input sample_master.xlsx \
  --targets ebay,shopify,coupang,naver,shopee,qoo10,alibaba \
  --out out/

echo ""
echo "======================================"
echo "✅ Conversion Complete!"
echo "======================================"
echo ""
echo "📁 Output files are in: server/out/"
echo ""
ls -lh out/
echo ""
echo "💡 To view API docs, run: ./run.sh"
