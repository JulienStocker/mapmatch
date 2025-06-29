#!/bin/bash

echo "🔧 Setting up Property Data Extractor..."
echo "========================================"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ pip3 found"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if Chrome is installed (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Google Chrome.app" ]; then
        echo "✅ Google Chrome found"
    else
        echo "❌ Google Chrome not found. Please install Google Chrome from https://www.google.com/chrome/"
        echo "   The script needs Chrome to convert websites to PDF"
        exit 1
    fi
fi

# Check if Chrome is installed (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v google-chrome &> /dev/null || command -v google-chrome-stable &> /dev/null; then
        echo "✅ Google Chrome found"
    else
        echo "❌ Google Chrome not found. Please install Google Chrome:"
        echo "   Ubuntu/Debian: sudo apt-get install google-chrome-stable"
        echo "   CentOS/RHEL: sudo yum install google-chrome-stable"
        exit 1
    fi
fi

# Make scripts executable
chmod +x website_to_pdf_extractor.py
chmod +x extract_properties.py

echo ""
echo "🎉 Setup complete!"
echo "===================="
echo ""
echo "📝 Next steps:"
echo "1. Edit 'extract_properties.py' and update:"
echo "   - WEBSITE_URL with your property website URL"
echo "   - OPENAI_API_KEY with your actual OpenAI API key"
echo ""
echo "2. Run the extraction:"
echo "   python3 extract_properties.py"
echo ""
echo "📁 Output files will be saved in the 'outputs' directory"
echo ""
echo "🔧 Alternative usage (command line):"
echo "   python3 website_to_pdf_extractor.py 'YOUR_URL' --openai-key 'YOUR_KEY'"
echo "" 