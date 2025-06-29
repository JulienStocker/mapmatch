const Property = require('../models/Property');
const PropertyScrapingService = require('../services/propertyScrapingService');

// Initialize scraping service
const scrapingService = new PropertyScrapingService(process.env.OPENAI_API_KEY);

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Scrape property from URL
// @route   POST /api/properties/scrape
// @access  Public
exports.scrapeProperty = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Check if URL has already been scraped
    const isAlreadyScraped = await scrapingService.isUrlAlreadyScraped(url, Property);
    if (isAlreadyScraped) {
      const existingProperty = await Property.findOne({ sourceUrl: url });
      return res.status(200).json({
        success: true,
        message: 'Property already exists in database',
        data: existingProperty,
        isNew: false
      });
    }

    // Extract property data from URL
    console.log(`Starting scraping process for: ${url}`);
    const extractionResult = await scrapingService.extractPropertyFromUrl(url);
    
    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        error: extractionResult.error,
        details: 'Failed to extract property data from URL'
      });
    }

    // Create new property in database
    const propertyData = extractionResult.data;
    const newProperty = await Property.create(propertyData);
    
    console.log(`Successfully scraped and saved property: ${newProperty._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Property successfully scraped and added to database',
      data: newProperty,
      isNew: true,
      extractionDetails: {
        source: extractionResult.source,
        extractedAt: extractionResult.extractedAt
      }
    });

  } catch (error) {
    console.error('Error in scrapeProperty:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
        details: 'Property validation failed'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

// @desc    Get properties by type (sale, rent, new_construction)
// @route   GET /api/properties/type/:type
// @access  Public
exports.getPropertiesByType = async (req, res) => {
  try {
    const properties = await Property.find({ type: req.params.type });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get scraped properties only
// @route   GET /api/properties/scraped
// @access  Public
exports.getScrapedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isScraped: true }).sort({ scrapedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get properties within a certain radius
// @route   GET /api/properties/radius/:lat/:lng/:radius
// @access  Public
exports.getPropertiesInRadius = async (req, res) => {
  try {
    const { lat, lng, radius } = req.params;
    
    // Convert radius from km to meters (required by MongoDB)
    const radiusInMeters = radius * 1000;
    
    const properties = await Property.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (should be protected with auth)
exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (should be protected with auth)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (should be protected with auth)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    await property.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 