#!/usr/bin/env python3
"""
Simple Property Extractor - Easy to use wrapper
Just modify the configuration below and run this script
"""

import os
from website_to_pdf_extractor import WebsiteToPDFExtractor

# CONFIGURATION - MODIFY THESE VALUES
# ====================================

# The website URL you want to process (REPLACE WITH YOUR ACTUAL URL)
WEBSITE_URL = "https://example-real-estate-site.com"  # CHANGE THIS!

# Your OpenAI API Key (REPLACE WITH YOUR ACTUAL KEY)
OPENAI_API_KEY = "your-openai-api-key-here"  # CHANGE THIS!

# Output directory (optional - will create if doesn't exist)
OUTPUT_DIR = "outputs"

# Browser settings
HEADLESS_MODE = True  # Set to False if you want to see the browser window

# ====================================

def main():
    """Main function to run the property extraction"""
    
    # Validate configuration
    if WEBSITE_URL == "https://example-real-estate-site.com":
        print("❌ ERROR: Please update WEBSITE_URL with your actual website URL")
        print("   Edit this file and change the WEBSITE_URL variable")
        return
    
    if OPENAI_API_KEY == "your-openai-api-key-here":
        print("❌ ERROR: Please update OPENAI_API_KEY with your actual OpenAI API key")
        print("   Edit this file and change the OPENAI_API_KEY variable")
        return
    
    print("🚀 Starting Property Data Extraction")
    print(f"📄 Website: {WEBSITE_URL}")
    print(f"📁 Output Directory: {OUTPUT_DIR}")
    print("="*60)
    
    try:
        # Initialize the extractor
        extractor = WebsiteToPDFExtractor(
            openai_api_key=OPENAI_API_KEY,
            headless=HEADLESS_MODE
        )
        
        # Process the website
        results = extractor.process_website(WEBSITE_URL, OUTPUT_DIR)
        
        # Display results
        print("\n" + "="*60)
        print("✅ EXTRACTION COMPLETE!")
        print("="*60)
        
        if results:
            print("📄 Generated Files:")
            for file_type, path in results.items():
                print(f"   {file_type.upper()}: {path}")
        
        print("\n💡 Tips:")
        print("   - Check the CSV file for structured property data")
        print("   - The PDF contains the original website content")
        print("   - The JSON file has the same data as CSV but in JSON format")
        print("   - The TXT file contains the raw extracted text")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("\n🛠️  Troubleshooting:")
        print("   1. Make sure you have Chrome browser installed")
        print("   2. Check your internet connection")
        print("   3. Verify your OpenAI API key is correct")
        print("   4. Make sure the website URL is accessible")

if __name__ == "__main__":
    main() 