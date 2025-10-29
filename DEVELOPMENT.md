# Development Guide

## Project Structure

```
Project1-/
├── server/                      # Python FastAPI backend
│   ├── core/                   # Core conversion logic
│   │   ├── schema.py          # Pydantic models
│   │   ├── ingest.py          # Excel/CSV parser
│   │   ├── validate.py        # Validation engine
│   │   ├── dsl.py             # YAML DSL parser
│   │   ├── transforms.py      # Transform functions
│   │   └── exporters.py       # Output writers
│   ├── mappings/              # Platform YAML configs
│   │   ├── ebay.yaml
│   │   ├── shopify.yaml
│   │   ├── coupang.yaml
│   │   ├── naver.yaml
│   │   ├── shopee.yaml
│   │   ├── qoo10.yaml
│   │   └── alibaba.yaml
│   ├── lookups/               # Lookup tables
│   │   ├── category_map_*.csv
│   │   ├── fx.csv
│   │   └── shopee_logistics_template.csv
│   ├── main.py                # FastAPI app
│   ├── convert.py             # CLI tool
│   ├── sample_data_generator.py
│   ├── requirements.txt
│   └── setup.sh
├── app/                       # Next.js frontend
│   ├── converter/            # Converter pages
│   │   └── page.tsx         # Upload page
│   └── ...
├── README.md
└── DEVELOPMENT.md (this file)
```

## Setup for Development

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Run setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   This will:
   - Create a Python virtual environment
   - Install all dependencies
   - Create necessary directories
   - Generate sample Master.xlsx file

3. **Manual setup (alternative):**
   ```bash
   # Create virtual environment
   python3 -m venv venv

   # Activate it
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows

   # Install dependencies
   pip install -r requirements.txt

   # Create directories
   mkdir -p out temp logs

   # Generate sample data
   python sample_data_generator.py
   ```

4. **Start the FastAPI server:**
   ```bash
   source venv/bin/activate
   python main.py
   ```

   Server runs on: http://localhost:8000
   API docs: http://localhost:8000/docs

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Frontend runs on: http://localhost:3000

## Development Workflow

### Adding a New Platform

1. **Create mapping YAML:**
   ```bash
   cp server/mappings/ebay.yaml server/mappings/newplatform.yaml
   ```

2. **Edit the mapping:**
   - Define `meta` section (output format, encoding)
   - Map columns from master to platform format
   - Add transforms as needed
   - Set required fields and policies

3. **Create category lookup:**
   ```bash
   # Create server/lookups/category_map_newplatform.csv
   category_path,newplatform_category_id,newplatform_category_name
   Electronics/Phones/Smartphones,12345,Mobile Phones
   ```

4. **Add to Platform enum:**
   Edit `server/core/schema.py`:
   ```python
   class Platform(str, Enum):
       # ... existing platforms
       NEWPLATFORM = "newplatform"
   ```

5. **Test:**
   ```bash
   python convert.py \
     --input sample_master.xlsx \
     --targets newplatform \
     --out test_output/
   ```

### Adding a New Transform

1. **Edit `server/core/transforms.py`:**
   ```python
   def my_transform(value: Any, param1: str, param2: int) -> Any:
       """Transform description"""
       # Your logic here
       return transformed_value
   ```

2. **Register in `apply_transform`:**
   ```python
   transform_map = {
       # ... existing transforms
       'my_transform': lambda v, p: my_transform(
           v,
           p.get('param1', 'default'),
           p.get('param2', 0)
       ),
   }
   ```

3. **Use in YAML:**
   ```yaml
   columns:
     MyField:
       from: source_field
       transforms:
         - my_transform:
             param1: "value"
             param2: 42
   ```

### Testing

#### Test Backend

```bash
cd server
source venv/bin/activate

# Test with sample data
python convert.py \
  --input sample_master.xlsx \
  --targets ebay,shopify,coupang \
  --out test_output/

# Validate only
python convert.py \
  --input sample_master.xlsx \
  --targets ebay \
  --validate-only

# Dry run
python convert.py \
  --input sample_master.xlsx \
  --targets ebay \
  --dry-run
```

#### Test API Endpoints

```bash
# Start server
python main.py

# In another terminal, test with curl:

# Health check
curl http://localhost:8000/

# Upload file (need to have a file ready)
curl -X POST \
  -F "file=@sample_master.xlsx" \
  http://localhost:8000/api/ingest

# Get latest report
curl http://localhost:8000/api/report/latest
```

#### Test Frontend

1. Start both backend and frontend servers
2. Navigate to http://localhost:3000/converter
3. Upload `sample_master.xlsx`
4. Verify all steps work

## API Documentation

FastAPI provides automatic API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Debugging

### Backend Logs

Logs are written to `server/logs/convert_*.jsonl` in JSONL format.

To view logs:
```bash
cd server/logs
cat convert_*.jsonl | jq .
```

### Common Issues

1. **"Module not found" error:**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

2. **"File not found" for lookups:**
   - Check that all CSV files exist in `server/lookups/`
   - Verify file names match exactly (case-sensitive)

3. **Category mapping fails:**
   - Ensure `category_path` in Master matches entries in lookup CSV
   - Check for trailing spaces or typos

4. **Currency conversion error:**
   - Verify FX sheet has the currency code
   - Check `rate_to_USD` and `rate_from_USD` are present

## Code Style

### Python

- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Use Pydantic for data validation

### TypeScript/React

- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Use Tailwind CSS for styling

## Performance Tips

1. **Large files:**
   - Use streaming for files > 10MB
   - Increase `max_workers` for parallel processing

2. **Many platforms:**
   - Use parallel conversion (default: 8 workers)
   - Adjust with `--max-workers` flag

3. **Production deployment:**
   - Use Redis for session storage
   - Enable file cleanup cron job
   - Set up CDN for static files

## Deployment

### Backend (FastAPI)

**Option 1: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option 2: Direct**
```bash
cd server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend (Next.js)

**Vercel:**
```bash
vercel --prod
```

**Build for production:**
```bash
npm run build
npm start
```

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

## License

MIT
