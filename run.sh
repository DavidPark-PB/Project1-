#!/bin/bash

# Multi-Platform Product Converter - Quick Start Script

echo "======================================"
echo "Multi-Platform Product Converter"
echo "======================================"
echo ""

# Check if in correct directory
if [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Setup backend if needed
if [ ! -d "server/venv" ]; then
    echo "📦 Setting up backend for the first time..."
    cd server
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    mkdir -p out temp logs
    python sample_data_generator.py
    cd ..
    echo "✅ Backend setup complete!"
    echo ""
fi

# Start backend
echo "🚀 Starting backend server..."
cd server
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

echo "✅ Backend running on http://localhost:8000"
echo ""

# Wait for backend to start
sleep 3

# Start frontend
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Frontend running on http://localhost:3000"
echo ""
echo "======================================"
echo "🎉 All servers are running!"
echo "======================================"
echo ""
echo "📍 Web UI: http://localhost:3000/converter"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to press Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
