#!/bin/bash

# Setup script for Multi-Platform Product Converter backend

echo "Setting up Multi-Platform Product Converter backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p out temp logs

# Generate sample Master.xlsx
echo "Generating sample Master.xlsx file..."
python sample_data_generator.py

echo ""
echo "✓ Setup complete!"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "To use the CLI:"
echo "  source venv/bin/activate"
echo "  python convert.py --help"
