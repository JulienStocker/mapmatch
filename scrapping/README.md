# Property Data Extractor

A comprehensive tool that converts real estate websites to PDF and extracts structured property data using OpenAI's API.

## Features

- 🌐 **Website to PDF Conversion**: Converts any real estate website to PDF format
- 🤖 **AI-Powered Data Extraction**: Uses OpenAI's GPT model to extract structured property data
- 📊 **Multiple Output Formats**: Saves data as CSV, JSON, and raw text
- 🚀 **Easy to Use**: Simple configuration and execution

## Extracted Data Fields

The tool extracts the following property information:

- **Address**: Full property address
- **Price**: Property price (original format/currency)
- **Rooms**: Number of rooms
- **Bathrooms**: Number of bathrooms
- **Area m²**: Area in square meters
- **Zip Code**: Postal/ZIP code
- **Latitude**: Latitude coordinate (if available)
- **Longitude**: Longitude coordinate (if available)
- **URL**: Property listing URL

## Prerequisites

- Python 3.7+
- Google Chrome browser
- OpenAI API key

## Quick Setup

1. **Run the setup script:**
   ```bash
   cd scrapping
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure your settings:**
   Edit `extract_properties.py` and update:
   - `WEBSITE_URL`: Your property website URL
   - `OPENAI_API_KEY`: Your OpenAI API key

3. **Run the extraction:**
   ```bash
   python3 extract_properties.py
   ```

## Manual Installation

If you prefer to install dependencies manually:

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Make scripts executable
chmod +x website_to_pdf_extractor.py
chmod +x extract_properties.py
```

## Usage Options

### Option 1: Simple Configuration (Recommended)

1. Edit `extract_properties.py`
2. Update the configuration variables at the top
3. Run: `python3 extract_properties.py`

### Option 2: Command Line

```bash
python3 website_to_pdf_extractor.py "https://your-website.com" --openai-key "your-api-key"
```

**Command line options:**
- `--output-dir`: Custom output directory (default: outputs)
- `--headless`: Run browser in headless mode (default: True)

## Output Files

The tool generates several files in the `outputs` directory:

- `website_TIMESTAMP.pdf`: PDF version of the website
- `property_data_TIMESTAMP.csv`: Structured property data (CSV format)
- `property_data_TIMESTAMP.json`: Structured property data (JSON format)
- `extracted_text_TIMESTAMP.txt`: Raw extracted text from website

## Configuration

### OpenAI API Key

You need an OpenAI API key to use this tool. Get one from:
https://platform.openai.com/api-keys

The tool uses the `gpt-4o-mini` model for cost-effectiveness.

### Browser Settings

- **Headless Mode**: Set to `False` if you want to see the browser window
- **Timeout**: Default 30 seconds for page loading

## Supported Websites

The tool works with most real estate websites, including:
- Property listing sites
- Real estate agency websites
- Property search results pages
- Individual property pages

## Troubleshooting

### Common Issues

1. **Chrome not found**
   - Install Google Chrome from https://www.google.com/chrome/
   - Make sure it's installed in the default location

2. **OpenAI API errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure you have access to the GPT models

3. **Website loading issues**
   - Check your internet connection
   - Verify the website URL is accessible
   - Some websites may block automated access

4. **Permission errors**
   - Make sure scripts are executable: `chmod +x *.py`
   - Check write permissions in the output directory

### Debugging

Enable debug logging by setting the environment variable:
```bash
export LOG_LEVEL=DEBUG
python3 extract_properties.py
```

## Examples

### Basic Usage
```python
from website_to_pdf_extractor import WebsiteToPDFExtractor

extractor = WebsiteToPDFExtractor(openai_api_key="your-key")
results = extractor.process_website("https://example-realestate.com")
```

### Custom Configuration
```python
extractor = WebsiteToPDFExtractor(
    openai_api_key="your-key",
    headless=False  # Show browser window
)
results = extractor.process_website(
    url="https://example-realestate.com",
    output_dir="custom_output"
)
```

## Cost Considerations

- The tool uses OpenAI's `gpt-4o-mini` model to minimize costs
- Typical cost per property listing: $0.001 - $0.01
- Large websites with many properties will cost more

## Privacy and Security

- Your OpenAI API key is never logged or stored
- Website content is only sent to OpenAI for processing
- All data is saved locally on your machine

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the log files (`pdf_extractor.log`)
3. Ensure all prerequisites are met

## Dependencies

- `selenium`: Web browser automation
- `openai`: OpenAI API client
- `requests`: HTTP requests
- `beautifulsoup4`: HTML parsing
- `pandas`: Data manipulation
- `openpyxl`: Excel file support

## License

This tool is provided as-is for educational and research purposes. 