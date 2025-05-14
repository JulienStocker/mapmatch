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
  description: {
    type: String,
    trim: true
  },
  sqft: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
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

// Update the updatedAt timestamp before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema); 