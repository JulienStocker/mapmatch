const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const OpenAI = require('openai');

class PropertyScrapingService {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }

  /**
   * Extract property data from a URL using AI
   * @param {string} url - The property website URL
   * @returns {Promise<Object>} Extracted property data
   */
  async extractPropertyFromUrl(url) {
    try {
      console.log(`Starting extraction for URL: ${url}`);
      
      // First, try to get the page content
      const pageContent = await this.fetchPageContent(url);
      
      if (!pageContent) {
        throw new Error('Could not fetch page content');
      }

      // Extract property data using OpenAI
      const propertyData = await this.extractWithOpenAI(pageContent, url);
      
      return {
        success: true,
        data: propertyData,
        source: 'ai_extraction',
        extractedAt: new Date()
      };

    } catch (error) {
      console.error('Error in property extraction:', error);
      return {
        success: false,
        error: error.message,
        source: 'ai_extraction',
        extractedAt: new Date()
      };
    }
  }

  /**
   * Fetch page content using a simple HTTP request first, fallback to browser if needed
   */
  async fetchPageContent(url) {
    try {
      // Try simple fetch first (faster)
      const axios = require('axios');
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });

      return response.data;
    } catch (error) {
      console.log('Simple fetch failed, trying browser-based extraction...');
      // If simple fetch fails, we could implement browser automation here
      // For now, return null to indicate we need browser automation
      return null;
    }
  }

  /**
   * Extract property data using OpenAI GPT
   */
  async extractWithOpenAI(content, url) {
    const prompt = `
    Please analyze the following real estate website content and extract property information. 
    Return the data as a JSON object with these exact fields:
    
    {
      "address": "Full property address",
      "price": "Property price (keep original format/currency)",
      "priceNumeric": 0,  // Numeric price value for sorting/filtering
      "rooms": "Number of rooms",
      "bathrooms": "Number of bathrooms",
      "areaM2": "Area in square meters (numeric)",
      "zipCode": "Postal/ZIP code",
      "latitude": "Latitude coordinate (numeric, if available)",
      "longitude": "Longitude coordinate (numeric, if available)",
      "title": "Property title or description",
      "description": "Property description",
      "features": ["array", "of", "property", "features"],
      "type": "sale, rent, or new_construction"
    }
    
    If any field is not available, use null for the value.
    For numeric fields (priceNumeric, areaM2, latitude, longitude), ensure they are numbers or null.
    
    Website URL: ${url}
    
    Website content (first 6000 characters):
    ${content.substring(0, 6000)}
    
    Please return ONLY the JSON object, no additional text or formatting.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a specialized real estate data extraction assistant. Extract property information and return it as clean JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 2000
      });

      const content_response = response.choices[0].message.content.trim();
      
      // Clean up the response
      let cleanedContent = content_response;
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.replace("```json", "").replace("```", "").trim();
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace("```", "").trim();
      }

      // Parse the JSON
      const propertyData = JSON.parse(cleanedContent);
      
      // Validate and clean the data
      return this.validateAndCleanPropertyData(propertyData, url);

    } catch (error) {
      console.error('OpenAI extraction error:', error);
      throw new Error(`Failed to extract property data: ${error.message}`);
    }
  }

  /**
   * Validate and clean the extracted property data
   */
  validateAndCleanPropertyData(data, sourceUrl) {
    const cleaned = {
      // Basic info
      title: data.title || 'Property Listing',
      description: data.description || '',
      
      // Price
      priceRaw: data.price || '',
      price: this.parsePrice(data.price) || data.priceNumeric || 0,
      
      // Address
      address: {
        full: data.address || '',
        zip: data.zipCode || ''
      },
      
      // Property details
      rooms: data.rooms ? String(data.rooms) : '',
      bathrooms: this.parseNumber(data.bathrooms) || 0,
      areaM2: this.parseNumber(data.areaM2),
      sqft: data.areaM2 ? Math.round(data.areaM2 * 10.764) : 0, // Convert m² to sqft
      
      // Coordinates
      coordinates: {
        lat: this.parseNumber(data.latitude) || 0,
        lng: this.parseNumber(data.longitude) || 0
      },
      
      // Property type
      type: this.normalizePropertyType(data.type),
      
      // Features
      features: Array.isArray(data.features) ? data.features : [],
      
      // Source metadata
      sourceUrl: sourceUrl,
      isScraped: true,
      scrapingMethod: 'ai_extraction',
      scrapedAt: new Date(),
      originalData: data
    };

    // If we don't have coordinates, we might want to geocode the address
    if (cleaned.coordinates.lat === 0 && cleaned.coordinates.lng === 0 && cleaned.address.full) {
      // TODO: Implement geocoding service integration
      console.log('No coordinates found, would need geocoding for:', cleaned.address.full);
    }

    return cleaned;
  }

  /**
   * Parse price string to numeric value
   */
  parsePrice(priceStr) {
    if (!priceStr) return 0;
    
    // Remove currency symbols and spaces, extract numbers
    const numStr = priceStr.replace(/[^\d.,]/g, '');
    const num = parseFloat(numStr.replace(/,/g, ''));
    
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parse any numeric value safely
   */
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return null;
    
    const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? null : num;
  }

  /**
   * Normalize property type to our enum values
   */
  normalizePropertyType(type) {
    if (!type) return 'sale';
    
    const typeStr = String(type).toLowerCase();
    
    if (typeStr.includes('rent') || typeStr.includes('lease')) return 'rent';
    if (typeStr.includes('new') || typeStr.includes('construction')) return 'new_construction';
    
    return 'sale'; // default
  }

  /**
   * Check if a URL has already been scraped
   */
  async isUrlAlreadyScraped(url, Property) {
    try {
      const existing = await Property.findOne({ sourceUrl: url });
      return !!existing;
    } catch (error) {
      console.error('Error checking existing URL:', error);
      return false;
    }
  }
}

module.exports = PropertyScrapingService; 