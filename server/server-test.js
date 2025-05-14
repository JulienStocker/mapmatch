const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data for properties
const mockProperties = [
  {
    id: 1,
    title: 'Modern Downtown Apartment',
    type: 'sale',
    price: 750000,
    sqft: 1200,
    bedrooms: 2,
    bathrooms: 2,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    images: ['https://via.placeholder.com/400x300'],
    description: 'Beautiful apartment in the heart of the city.'
  },
  {
    id: 2,
    title: 'Luxury Condo with Bay View',
    type: 'sale',
    price: 1250000,
    sqft: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    coordinates: { lat: 37.7833, lng: -122.4167 },
    images: ['https://via.placeholder.com/400x300'],
    description: 'Stunning condo with panoramic views of the bay.'
  },
  {
    id: 3,
    title: 'Charming Victorian House',
    type: 'sale',
    price: 1500000,
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 3,
    coordinates: { lat: 37.7694, lng: -122.4862 },
    images: ['https://via.placeholder.com/400x300'],
    description: 'Historic Victorian house with modern amenities.'
  }
];

// Mock data for POIs
const mockPOIs = {
  groceries: [
    { id: 'g1', name: 'Whole Foods Market', coordinates: { lat: 37.7724, lng: -122.4097 } },
    { id: 'g2', name: 'Trader Joe\'s', coordinates: { lat: 37.7752, lng: -122.4232 } }
  ],
  malls: [
    { id: 'm1', name: 'Westfield San Francisco Centre', coordinates: { lat: 37.7841, lng: -122.4075 } },
    { id: 'm2', name: 'Stonestown Galleria', coordinates: { lat: 37.7285, lng: -122.4778 } }
  ],
  transport: [
    { id: 't1', name: 'Powell St. BART Station', coordinates: { lat: 37.7844, lng: -122.4079 } },
    { id: 't2', name: 'Embarcadero BART Station', coordinates: { lat: 37.7929, lng: -122.3968 } }
  ],
  hospitals: [
    { id: 'h1', name: 'UCSF Medical Center', coordinates: { lat: 37.7631, lng: -122.4576 } },
    { id: 'h2', name: 'Zuckerberg San Francisco General Hospital', coordinates: { lat: 37.7559, lng: -122.4051 } }
  ]
};

// API Routes for Properties
app.get('/api/properties', (req, res) => {
  res.status(200).json({
    success: true,
    count: mockProperties.length,
    data: mockProperties
  });
});

app.get('/api/properties/:id', (req, res) => {
  const property = mockProperties.find(p => p.id === parseInt(req.params.id));
  
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
});

app.get('/api/properties/type/:type', (req, res) => {
  const properties = mockProperties.filter(p => p.type === req.params.type);
  
  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// API Routes for POIs
app.get('/api/poi', (req, res) => {
  const allPOIs = Object.values(mockPOIs).flat();
  
  res.status(200).json({
    success: true,
    count: allPOIs.length,
    data: allPOIs
  });
});

app.get('/api/poi/type/:type', (req, res) => {
  const pois = mockPOIs[req.params.type] || [];
  
  res.status(200).json({
    success: true,
    count: pois.length,
    data: pois
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Define the port
const PORT = 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Using in-memory mock data (no MongoDB required)');
});

module.exports = app; 