#!/bin/bash

echo "🚀 Setting up Integrated Property Extractor..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "🐍 Setting up Python environment for advanced scraping (optional)..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    
    # Install Python dependencies for the advanced scraping tools
    cd scrapping
    pip3 install -r requirements.txt 2>/dev/null || echo "⚠️  Optional: Python dependencies not installed (advanced scraping features may not work)"
    cd ..
else
    echo "⚠️  Python 3 not found. Advanced scraping features will use basic HTTP requests only."
fi

# Check for Chrome browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Google Chrome.app" ]; then
        echo "✅ Google Chrome found"
    else
        echo "⚠️  Google Chrome not found. Install from https://www.google.com/chrome/ for optimal extraction."
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your API keys."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with:"
echo "   - OPENAI_API_KEY=your_openai_api_key"
echo "   - MONGO_URI=your_mongodb_connection_string"
echo "   - Other API keys as needed"
echo ""
echo "2. Start the application:"
echo "   npm run dev    # Start both frontend and backend"
echo ""
echo "3. Open http://localhost:3000 and test the property extraction!"
echo ""
echo "💡 Features ready:"
echo "   ✅ AI-powered property data extraction"
echo "   ✅ Automatic database storage"
echo "   ✅ Real-time CSV integration"
echo "   ✅ Support for major real estate sites"
echo "" 