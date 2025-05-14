import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const MapContext = createContext();

// Set the API base URL to the test server port
const API_URL = 'http://localhost:5001/api';

// Zoom level mappings - keep in sync with other components
const zoomLevels = {
  world: 1,
  continent: 4,
  country: 6,
  state: 8,
  city: 10,
  district: 12,
  neighborhood: 14,
  street: 16,
  building: 18,
  max: 20
};

export const MapProvider = ({ children }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 46.8182, lng: 8.2275 }); // Default to Switzerland
  const [mapZoom, setMapZoom] = useState(zoomLevels.country);
  const [zoomLevel, setZoomLevel] = useState('country'); // Default to country view
  const [properties, setProperties] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState({
    groceries: [],
    malls: [],
    transport: [],
    hospitals: []
  });
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Update the numeric zoom when the named zoom level changes
  useEffect(() => {
    if (zoomLevel && zoomLevels[zoomLevel]) {
      setMapZoom(zoomLevels[zoomLevel]);
    }
  }, [zoomLevel]);

  // Update the named zoom level when the numeric zoom changes
  useEffect(() => {
    // Find the closest named zoom level for the current mapZoom
    const entries = Object.entries(zoomLevels);
    let closestLevel = entries[0];
    
    for (const [level, value] of entries) {
      if (Math.abs(value - mapZoom) < Math.abs(closestLevel[1] - mapZoom)) {
        closestLevel = [level, value];
      }
    }
    
    // Only update if different to avoid loops
    if (closestLevel[0] !== zoomLevel) {
      setZoomLevel(closestLevel[0]);
    }
  }, [mapZoom]);

  useEffect(() => {
    // Fetch initial properties data
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties from:', `${API_URL}/properties`);
        const response = await axios.get(`${API_URL}/properties`);
        setProperties(response.data.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Fallback to mock data if server request fails
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
        
        setProperties(mockProperties);
      }
    };

    // Fetch POIs for each type
    const fetchPOIs = async () => {
      try {
        const poiTypes = ['groceries', 'malls', 'transport', 'hospitals'];
        const poiData = {};
        
        for (const type of poiTypes) {
          console.log('Fetching POIs for type:', type, 'from:', `${API_URL}/poi/type/${type}`);
          const response = await axios.get(`${API_URL}/poi/type/${type}`);
          poiData[type] = response.data.data;
        }
        
        setPointsOfInterest(poiData);
      } catch (error) {
        console.error('Error fetching points of interest:', error);
        // Fallback to mock data if server request fails
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
        
        setPointsOfInterest(mockPOIs);
      }
    };

    fetchProperties();
    fetchPOIs();
  }, []);

  const setMapView = (center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  const changeZoomLevel = (level) => {
    setZoomLevel(level);
  };

  const selectProperty = (property) => {
    setSelectedProperty(property);
    if (property) {
      setMapView(property.coordinates, zoomLevels.street);
    }
  };

  return (
    <MapContext.Provider
      value={{
        mapInstance,
        setMapInstance,
        mapCenter,
        mapZoom,
        setMapView,
        zoomLevel,
        changeZoomLevel,
        properties,
        setProperties,
        pointsOfInterest,
        setPointsOfInterest,
        selectedProperty,
        selectProperty
      }}
    >
      {children}
    </MapContext.Provider>
  );
}; 