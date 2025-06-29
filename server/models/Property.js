const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sale', 'rent', 'new_construction'],
    default: 'sale'
  },
  price: {
    type: Number,
    required: true
  },
  // Raw price string as scraped (for display purposes)
  priceRaw: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sqft: {
    type: Number,
    required: true
  },
  // Area in square meters (from scraped data)
  areaM2: {
    type: Number
  },
  bedrooms: {
    type: Number,
    required: true
  },
  // Rooms field (from scraped data - may include bedrooms + living areas)
  rooms: {
    type: String,
    trim: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  images: [{
    type: String
  }],
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zip: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'USA',
      trim: true
    },
    // Full address as scraped
    full: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  yearBuilt: {
    type: Number
  },
  features: [{
    type: String
  }],
  // Scraping metadata
  sourceUrl: {
    type: String,
    trim: true
  },
  scrapedAt: {
    type: Date
  },
  isScraped: {
    type: Boolean,
    default: false
  },
  scrapingMethod: {
    type: String,
    enum: ['manual', 'ai_extraction', 'bulk_import'],
    default: 'manual'
  },
  // Original scraped data (for reference)
  originalData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
PropertySchema.index({ 'coordinates': '2dsphere' });

// Create index for source URL to prevent duplicates
PropertySchema.index({ 'sourceUrl': 1 });

// Update the updatedAt timestamp before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema); 