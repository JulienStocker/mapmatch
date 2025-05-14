import React, { useState, useCallback, useEffect, useContext } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';
import axios from 'axios';
import { MapContext } from '../contexts/MapContext';

// Replace with your Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoianVsaWVuc3RvY2tlciIsImEiOiJjbWFvYWhqMXAwNW9vMmpyMGtmNjBqYzZoIn0.MDBDP08GAAF2SuXeAN3yuw';

// Switzerland coordinates (centered on the country)
const SWITZERLAND_COORDINATES = {
  lng: 8.2275,
  lat: 46.8182
};

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

const SearchContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  width: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 5px;
`;

const SearchResultItem = styled.div`
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const LocationLabel = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  font-weight: bold;
`;

const ReactMapGLComponent = () => {
  const { zoomLevel } = useContext(MapContext);
  
  const [viewState, setViewState] = useState({
    longitude: SWITZERLAND_COORDINATES.lng,
    latitude: SWITZERLAND_COORDINATES.lat,
    zoom: zoomLevels.country // Default to country view of Switzerland
  });
  
  const [markerPosition, setMarkerPosition] = useState({
    longitude: SWITZERLAND_COORDINATES.lng,
    latitude: SWITZERLAND_COORDINATES.lat
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [locationName, setLocationName] = useState('Switzerland');
  
  // Update zoom level when it changes in context
  useEffect(() => {
    if (zoomLevel && zoomLevels[zoomLevel]) {
      setViewState(prev => ({
        ...prev,
        zoom: zoomLevels[zoomLevel]
      }));
    }
  }, [zoomLevel]);
  
  // Function to search for locations using Mapbox Geocoding API
  const searchLocations = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            limit: 5
          }
        }
      );
      
      setSearchResults(response.data.features);
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);
  
  // Handle search result selection
  const handleSelectLocation = (result) => {
    const [longitude, latitude] = result.center;
    
    setViewState({
      ...viewState,
      longitude,
      latitude,
      zoom: 12
    });
    
    setMarkerPosition({
      longitude,
      latitude
    });
    
    setLocationName(result.place_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <SearchResults>
            {searchResults.map((result) => (
              <SearchResultItem
                key={result.id}
                onClick={() => handleSelectLocation(result)}
              >
                {result.place_name}
              </SearchResultItem>
            ))}
          </SearchResults>
        )}
      </SearchContainer>
      
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <Marker 
          longitude={markerPosition.longitude} 
          latitude={markerPosition.latitude} 
          color="red" 
        />
      </Map>
      
      <LocationLabel>
        {locationName}
      </LocationLabel>
    </div>
  );
};

export default ReactMapGLComponent; 