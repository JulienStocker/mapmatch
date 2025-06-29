# 🏠 AI-Powered Property Data Extractor

Your MapMatch application now includes powerful AI-driven property data extraction capabilities that automatically extract structured data from real estate websites and save it to your database.

## ✨ New Features

### 🤖 **Smart Property Extraction**
- **AI-Powered**: Uses OpenAI's GPT models to intelligently extract property data
- **Automatic Database Storage**: Extracted properties are automatically saved to MongoDB
- **Real-time CSV Integration**: Data appears instantly in your Excel viewer
- **Duplicate Prevention**: Automatically checks for existing properties by URL

### 📊 **Extracted Data Fields**
The system automatically extracts:
- **Address** (Full address)
- **Price** (Original format + numeric value)
- **Rooms** (Number of rooms)
- **Bathrooms** (Number of bathrooms)
- **Area** (Square meters + automatic sqft conversion)
- **Zip Code**
- **Property Title & Description**
- **Property Type** (Sale, Rent, New Construction)
- **Coordinates** (When available)

## 🚀 How to Use

### 1. **Setup (One-time)**
```bash
# Run the setup script
./setup_property_extractor.sh

# Update your .env file with your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. **Start the Application**
```bash
npm run dev
```

### 3. **Extract Property Data**
1. **Browse Properties**: Click Homegate, Immoscout24, or Comparis buttons to find properties
2. **Copy URL**: Copy any property listing URL
3. **Paste & Extract**: Paste the URL in the input field and click "Add"
4. **AI Magic**: Watch as the AI automatically extracts all property data
5. **Review & Export**: Data appears in the CSV viewer below

## 🎯 User Interface

### **Property Scout Sidebar**
```
🏠 Property Scout
AI-powered property data extraction

[Homegate] [Immoscout24] [Comparis]

┌─────────────────────────────────────┐
│ Paste property link here...         │ [Add]
└─────────────────────────────────────┘

✅ Property successfully extracted and saved!

┌─────────────────────────────────────┐
│ ● 3.5 Room Apartment in Zurich     │
│ Price: CHF 2,500/month              │
│ Address: Bahnhofstrasse 123, 8001   │
│ Rooms: 3.5                         │
│ Area: 85 m²                        │
└─────────────────────────────────────┘
```

## 🔧 Technical Architecture

### **Frontend Integration**
- **ScoutSidebar Component**: Enhanced with AI extraction UI
- **Real-time Status Updates**: Loading indicators and success/error messages
- **Property Preview**: Instant preview of extracted data
- **CSV Integration**: Automatic mapping to existing spreadsheet columns

### **Backend Services**
- **Property Scraping Service**: Node.js service for URL processing
- **OpenAI Integration**: GPT-4o-mini for cost-effective extraction
- **MongoDB Storage**: Automatic property saving with metadata
- **Duplicate Detection**: URL-based duplicate checking
- **RESTful API**: `/api/properties/scrape` endpoint

### **Database Schema**
Enhanced Property model with scraping metadata:
```javascript
{
  // Standard fields
  title, price, address, coordinates, rooms, bathrooms, sqft, type,
  
  // Scraping-specific fields
  priceRaw: "CHF 2,500/month",        // Original price string
  areaM2: 85,                         // Area in square meters
  rooms: "3.5",                       // Rooms as string (can include decimals)
  sourceUrl: "https://...",           // Original listing URL
  isScraped: true,                    // Flag for scraped properties
  scrapingMethod: "ai_extraction",    // How it was extracted
  scrapedAt: "2024-01-15T10:30:00Z", // When it was scraped
  originalData: {...}                 // Raw extracted data for reference
}
```

## 🌐 API Endpoints

### **Scrape Property**
```http
POST /api/properties/scrape
Content-Type: application/json

{
  "url": "https://www.homegate.ch/rent/123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property successfully scraped and added to database",
  "data": {
    "_id": "...",
    "title": "3.5 Room Apartment in Zurich",
    "price": 2500,
    "priceRaw": "CHF 2,500/month",
    "address": {
      "full": "Bahnhofstrasse 123, 8001 Zurich",
      "zip": "8001"
    },
    "rooms": "3.5",
    "bathrooms": 1,
    "areaM2": 85,
    "sqft": 915,
    "coordinates": { "lat": 47.3769, "lng": 8.5417 },
    "type": "rent",
    "sourceUrl": "https://www.homegate.ch/rent/123456",
    "isScraped": true,
    "scrapedAt": "2024-01-15T10:30:00Z"
  },
  "isNew": true
}
```

### **Get Scraped Properties**
```http
GET /api/properties/scraped
```

## 🔑 Configuration

### **Required Environment Variables**
```bash
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-your-openai-api-key

# MongoDB Connection (Required)
MONGO_URI=mongodb://localhost:27017/mapmatch

# Optional: Other API keys for enhanced features
REACT_APP_GOOGLE_API_KEY=your-google-api-key
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
```

### **Cost Optimization**
- Uses `gpt-4o-mini` model for cost efficiency
- Typical cost: $0.001-$0.01 per property
- Content limited to first 6000 characters for token efficiency

## 🎨 Supported Websites

The AI extraction works with most real estate websites including:
- ✅ **Homegate.ch** (Switzerland)
- ✅ **Immoscout24.ch** (Switzerland)  
- ✅ **Comparis.ch** (Switzerland)
- ✅ **Most international real estate sites**
- ✅ **Individual property listings**
- ✅ **Property search results**

## 🚨 Error Handling

The system gracefully handles:
- **Invalid URLs**: Validates URL format before processing
- **Network Issues**: Timeout and retry logic
- **Extraction Failures**: Clear error messages to user
- **Duplicate Properties**: Prevents duplicate entries
- **Missing Data**: Handles partial property information
- **API Limits**: Proper OpenAI API error handling

## 📈 Performance Features

- **Fast Extraction**: 3-10 seconds per property
- **Batch Processing**: Multiple properties in sequence
- **Caching**: Prevents re-processing of existing URLs
- **Background Processing**: Non-blocking UI during extraction
- **Progress Indicators**: Real-time status updates

## 🔮 Future Enhancements

Planned improvements:
- **Bulk URL Processing**: Upload CSV of URLs for batch processing
- **Image Extraction**: Automatically download and store property images
- **Price Monitoring**: Track price changes over time
- **Geocoding Integration**: Automatic coordinate lookup for addresses
- **Browser Automation**: Selenium fallback for JavaScript-heavy sites
- **Custom Extraction Rules**: Site-specific extraction patterns

## 🛟 Troubleshooting

### **Common Issues**

1. **"Failed to extract property data"**
   - Check your OpenAI API key
   - Verify you have API credits
   - Try a different property URL

2. **"Invalid URL format"**
   - Ensure you're pasting the complete URL
   - URL should start with `http://` or `https://`

3. **"Property already exists in database"**
   - This URL has been processed before
   - The existing property data is returned

4. **Loading forever**
   - Check your internet connection
   - Some websites may block automated access
   - Try a different property URL

### **Debug Mode**
Enable detailed logging:
```bash
export LOG_LEVEL=DEBUG
npm run dev
```

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Review the server logs in the terminal
3. Verify all environment variables are set correctly
4. Test with a simple property URL first

---

**🎉 Enjoy your new AI-powered property extraction capabilities!** 

The system transforms your workflow from manual data entry to automatic extraction, saving hours of time while ensuring accurate, structured property data. 