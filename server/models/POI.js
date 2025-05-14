const mongoose = require('mongoose');

const POISchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['groceries', 'malls', 'transport', 'hospitals'],
    default: 'groceries'
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
  description: {
    type: String,
    trim: true
  },
  contactInfo: {
    phone: {
      type: String
    },
    website: {
      type: String
    },
    email: {
      type: String
    }
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  amenities: [{
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
POISchema.index({ 'coordinates': '2dsphere' });

// Update the updatedAt timestamp before saving
POISchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('POI', POISchema); 