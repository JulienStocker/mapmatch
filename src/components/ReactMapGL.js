import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import Map, { NavigationControl, Marker, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';
import axios from 'axios';
import { MapContext } from '../contexts/MapContext';
import IsochroneControl from './IsochroneControl';
import { fetchIsochrone, getFeatureColor } from '../services/isochroneService';
import { fetchAllPOIs } from '../services/placesService';

// Replace with your Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoianVsaWVuc3RvY2tlciIsImEiOiJjbWFvYWhqMXAwNW9vMmpyMGtmNjBqYzZoIn0.MDBDP08GAAF2SuXeAN3yuw';

// Switzerland coordinates (centered on the country)
const SWITZERLAND_COORDINATES = {
  lng: 8.2275,
  lat: 46.8182
};

// Kriens coordinates
const KRIENS_COORDINATES = {
  lng: 8.3156,
  lat: 47.0331
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

const InfoOverlay = styled.div`
  position: absolute;
  bottom: 50px;
  left: 10px;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  font-size: 13px;
  max-width: 250px;
  z-index: 1;
`;

const ControlToggle = styled.button`
  position: absolute;
  top: 10px;
  right: 60px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ResetButton = styled.button`
  position: absolute;
  top: 50px;
  right: 60px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const IsochroneControlContainer = styled.div`
  position: absolute;
  top: 48px;
  right: 60px;
  z-index: 1;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 0;
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
  transform-origin: top right;
`;

const StyledPopup = styled.div`
  padding: 10px;
  max-width: 200px;
`;

const PopupTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: bold;
`;

const PopupAddress = styled.p`
  margin: 0 0 5px;
  font-size: 12px;
`;

const ReactMapGLComponent = ({ selectedPOITypes, resetPOIs }) => {
  const { zoomLevel } = useContext(MapContext);
  
  const [viewState, setViewState] = useState({
    longitude: KRIENS_COORDINATES.lng,
    latitude: KRIENS_COORDINATES.lat,
    zoom: zoomLevels.city // Default to city view of Kriens
  });
  
  const [markerPosition, setMarkerPosition] = useState({
    longitude: KRIENS_COORDINATES.lng,
    latitude: KRIENS_COORDINATES.lat
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [locationName, setLocationName] = useState('Kriens, Switzerland');
  
  // Isochrone state
  const [showIsochroneControl, setShowIsochroneControl] = useState(true);
  const [isochroneData, setIsochroneData] = useState(null);
  const [isochroneParams, setIsochroneParams] = useState(null);
  const [isochroneLoading, setIsochroneLoading] = useState(false);
  const [isochroneError, setIsochroneError] = useState(null);
  
  // POI state
  const [pois, setPois] = useState({});
  const [loadingPOIs, setLoadingPOIs] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [poiIsochrones, setPoiIsochrones] = useState({});
  const [generatingMultipleIsochrones, setGeneratingMultipleIsochrones] = useState(false);
  
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
    
    // Clear existing isochrone when selecting a new location
    setIsochroneData(null);
    
    // Fetch POIs for the selected location
    fetchPOIsForLocation({ lat: latitude, lng: longitude });
  };

  // Fetch POIs for the given location
  const fetchPOIsForLocation = async (coords) => {
    setLoadingPOIs(true);
    try {
      const poiData = await fetchAllPOIs(coords, selectedPOITypes, 5000);
      setPois(poiData);
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setLoadingPOIs(false);
    }
  };
  
  // Update POIs when selected types change
  useEffect(() => {
    if (markerPosition && markerPosition.latitude) {
      const coords = {
        lat: markerPosition.latitude,
        lng: markerPosition.longitude
      };
      fetchPOIsForLocation(coords);
    }
  }, [selectedPOITypes, markerPosition]);

  // Load Kriens POIs on component mount
  useEffect(() => {
    const coords = {
      lat: KRIENS_COORDINATES.lat,
      lng: KRIENS_COORDINATES.lng
    };
    fetchPOIsForLocation(coords);
  }, []);

  // Generate isochrone for current marker position
  const handleGenerateIsochrone = async (params) => {
    // Are we generating for a single point (the pin) or for all POIs?
    const generateForAllPOIs = params.generateForAllPOIs;
    
    if (generateForAllPOIs) {
      await generateIsochronesForAllPOIs(params);
      return;
    }
    
    // Standard isochrone generation for the central pin
    setIsochroneLoading(true);
    setIsochroneError(null);
    
    try {
      // Convert marker position to the format needed for the API
      const coords = {
        lng: markerPosition.longitude,
        lat: markerPosition.latitude
      };
      
      // Fetch isochrone data
      const data = await fetchIsochrone(coords, params);
      
      // Store the data and parameters
      setIsochroneData(data);
      setIsochroneParams(params);
      
      return data;
    } catch (error) {
      console.error('Error generating isochrone:', error);
      setIsochroneError(error.message || 'Failed to generate isochrone');
      throw error;
    } finally {
      setIsochroneLoading(false);
    }
  };
  
  // Generate isochrones for all POIs
  const generateIsochronesForAllPOIs = async (params) => {
    setGeneratingMultipleIsochrones(true);
    
    try {
      // Clear previous isochrones
      setPoiIsochrones({});
      
      // Get all POIs as a flat array
      const allPOIs = [];
      Object.keys(pois).forEach(poiType => {
        if (selectedPOITypes[poiType] && pois[poiType] && pois[poiType].length > 0) {
          pois[poiType].forEach(poi => {
            allPOIs.push({
              id: `${poiType}-${poi.place_id}`,
              poiType,
              location: poi.geometry.location,
              name: poi.name
            });
          });
        }
      });
      
      // Update the info label
      setIsochroneParams({
        ...params,
        forAllPOIs: true,
        poiCount: allPOIs.length
      });
      
      // Generate isochrones for each POI (in batches to avoid overloading the API)
      const batchSize = 5;
      const newIsochrones = {};
      
      for (let i = 0; i < allPOIs.length; i += batchSize) {
        const batch = allPOIs.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchResults = await Promise.all(
          batch.map(poi => 
            fetchIsochrone(
              { lng: poi.location.lng, lat: poi.location.lat }, 
              params
            )
            .then(data => ({ id: poi.id, data, poiType: poi.poiType, name: poi.name }))
            .catch(error => {
              console.error(`Error generating isochrone for POI ${poi.id}:`, error);
              return null;
            })
          )
        );
        
        // Add successful isochrones to the collection
        batchResults.forEach(result => {
          if (result) {
            newIsochrones[result.id] = {
              data: result.data,
              poiType: result.poiType,
              name: result.name
            };
          }
        });
        
        // Update state incrementally to show progress
        setPoiIsochrones({...newIsochrones});
      }
      
      // Clear the central isochrone since we're showing multiple now
      setIsochroneData(null);
      
      return Object.values(newIsochrones).map(iso => iso.data);
    } catch (error) {
      console.error('Error generating isochrones for POIs:', error);
      setIsochroneError(error.message || 'Failed to generate isochrones for POIs');
      throw error;
    } finally {
      setGeneratingMultipleIsochrones(false);
    }
  };

  // Create the layer style for the isochrone
  const fillLayerStyle = useMemo(() => {
    if (!isochroneParams) return {};

    return {
      id: 'isochrone-fill',
      type: 'fill',
      paint: {
        'fill-color': [
          'case',
          ['has', 'contour'],
          getFeatureColor({properties: {contour: isochroneParams.contourValue}}, isochroneParams.profile, isochroneParams.contourType),
          'rgba(0, 0, 0, 0)'
        ],
        'fill-opacity': 0.35
      }
    };
  }, [isochroneParams]);

  // Create the outline style for the isochrone
  const lineLayerStyle = useMemo(() => {
    return {
      id: 'isochrone-outline',
      type: 'line',
      paint: {
        'line-color': '#000',
        'line-width': 1,
        'line-opacity': 0.5
      }
    };
  }, []);
  
  // Get isochrone color based on POI type
  const getIsochroneColor = (poiType, profile, contourType) => {
    // Base the fill color on the POI marker color but with transparency
    const baseColor = getMarkerColor(poiType);
    
    // Convert hex to rgba with 0.3 opacity
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
  };
  
  // Render all POI isochrones
  const renderPoiIsochrones = () => {
    return Object.keys(poiIsochrones).map(id => {
      const { data, poiType } = poiIsochrones[id];
      
      return (
        <Source key={`isochrone-${id}`} id={`isochrone-${id}`} type="geojson" data={data}>
          <Layer
            id={`isochrone-fill-${id}`}
            type="fill"
            paint={{
              'fill-color': getIsochroneColor(poiType, isochroneParams?.profile, isochroneParams?.contourType),
              'fill-opacity': 0.35
            }}
          />
          <Layer
            id={`isochrone-outline-${id}`}
            type="line"
            paint={{
              'line-color': getMarkerColor(poiType),
              'line-width': 1,
              'line-opacity': 0.7
            }}
          />
        </Source>
      );
    });
  };

  // Handle map click to place marker
  const handleMapClick = useCallback((event) => {
    const { lngLat } = event;
    
    setMarkerPosition({
      longitude: lngLat.lng,
      latitude: lngLat.lat
    });
    
    // Clear existing isochrone when placing a new marker
    setIsochroneData(null);
    
    // Reverse geocode to get location name
    axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1
        }
      }
    )
    .then(response => {
      if (response.data.features.length > 0) {
        setLocationName(response.data.features[0].place_name);
      } else {
        setLocationName(`${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
      }
      
      // Fetch POIs for the clicked location
      fetchPOIsForLocation({ lat: lngLat.lat, lng: lngLat.lng });
    })
    .catch(error => {
      console.error('Error reverse geocoding:', error);
      setLocationName(`${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
    });
  }, []);

  // Get marker color for POI type
  const getMarkerColor = (poiType) => {
    switch(poiType) {
      case 'hospitals':
        return '#ff4757'; // Red
      case 'migros':
        return '#ff9f43'; // Orange
      case 'coop':
        return '#0984e3'; // Blue
      case 'aldi':
        return '#00b894'; // Green
      case 'lidl':
        return '#6c5ce7'; // Purple
      case 'denner':
        return '#e84393'; // Pink
      case 'spar':
        return '#2ed573'; // Light green
      case 'trainStation':
        return '#3498db'; // Bright blue
      case 'busStop':
        return '#f1c40f'; // Yellow
      default:
        return '#2d3436'; // Dark grey
    }
  };

  // Render POI markers for all selected types
  const renderPOIMarkers = () => {
    const markers = [];
    
    Object.keys(pois).forEach(poiType => {
      if (pois[poiType] && pois[poiType].length > 0) {
        pois[poiType].forEach(poi => {
          if (poi.geometry && poi.geometry.location) {
            const lat = poi.geometry.location.lat;
            const lng = poi.geometry.location.lng;
            
            markers.push(
              <Marker
                key={`${poiType}-${poi.place_id}`}
                longitude={lng}
                latitude={lat}
                color={getMarkerColor(poiType)}
                scale={0.7}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPoi({ ...poi, poiType });
                }}
              />
            );
          }
        });
      }
    });
    
    return markers;
  };

  // Reset all overlays and isochrones
  const handleReset = () => {
    // Clear all isochrones
    setIsochroneData(null);
    setPoiIsochrones({});
    setIsochroneParams(null);
    setIsochroneError(null);
    
    // Reset POIs if the resetPOIs function is provided
    if (typeof resetPOIs === 'function') {
      resetPOIs();
    }
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
      
      <ControlToggle onClick={() => setShowIsochroneControl(!showIsochroneControl)}>
        {showIsochroneControl ? 'Hide MapMatch' : 'MapMatch'}
      </ControlToggle>
      
      <ResetButton onClick={handleReset}>
        Reset All
      </ResetButton>
      
      {showIsochroneControl && (
        <IsochroneControlContainer>
          <IsochroneControl 
            onGenerateIsochrone={handleGenerateIsochrone}
            hasSelectedPOIs={Object.keys(pois).some(type => selectedPOITypes[type] && pois[type]?.length > 0)}
          />
        </IsochroneControlContainer>
      )}
      
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />
        
        <Marker 
          longitude={markerPosition.longitude} 
          latitude={markerPosition.latitude} 
          color="red"
          draggable={true}
          onDragStart={() => {
            // Clear existing isochrone when starting to drag
            setIsochroneData(null);
          }}
          onDrag={evt => {
            setMarkerPosition({
              longitude: evt.lngLat.lng,
              latitude: evt.lngLat.lat
            });
          }}
          onDragEnd={evt => {
            // Reverse geocode to get location name after drag
            axios.get(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${evt.lngLat.lng},${evt.lngLat.lat}.json`,
              {
                params: {
                  access_token: MAPBOX_TOKEN,
                  limit: 1
                }
              }
            )
            .then(response => {
              if (response.data.features.length > 0) {
                setLocationName(response.data.features[0].place_name);
              } else {
                setLocationName(`${evt.lngLat.lat.toFixed(4)}, ${evt.lngLat.lng.toFixed(4)}`);
              }
              
              // Fetch POIs for the new marker position
              fetchPOIsForLocation({ lat: evt.lngLat.lat, lng: evt.lngLat.lng });
            })
            .catch(error => {
              console.error('Error reverse geocoding:', error);
              setLocationName(`${evt.lngLat.lat.toFixed(4)}, ${evt.lngLat.lng.toFixed(4)}`);
            });
          }}
        />

        {/* Render POI markers */}
        {renderPOIMarkers()}
        
        {/* Show popup for selected POI */}
        {selectedPoi && (
          <Popup
            longitude={selectedPoi.geometry.location.lng}
            latitude={selectedPoi.geometry.location.lat}
            anchor="bottom"
            onClose={() => setSelectedPoi(null)}
            closeButton={true}
          >
            <StyledPopup>
              <PopupTitle>{selectedPoi.name}</PopupTitle>
              {selectedPoi.vicinity && (
                <PopupAddress>{selectedPoi.vicinity}</PopupAddress>
              )}
              {selectedPoi.rating && (
                <div style={{ fontSize: '12px' }}>
                  Rating: {selectedPoi.rating} ⭐
                </div>
              )}
            </StyledPopup>
          </Popup>
        )}

        {/* Render standard isochrone (for the pin) */}
        {isochroneData && (
          <Source id="isochrone-data" type="geojson" data={isochroneData}>
            <Layer {...fillLayerStyle} />
            <Layer {...lineLayerStyle} />
          </Source>
        )}
        
        {/* Render isochrones for POIs */}
        {renderPoiIsochrones()}
      </Map>
      
      <LocationLabel>
        {locationName}
      </LocationLabel>
      
      {loadingPOIs && (
        <InfoOverlay>
          Loading points of interest...
        </InfoOverlay>
      )}
      
      {generatingMultipleIsochrones && (
        <InfoOverlay>
          Generating MapMatch for {Object.keys(poiIsochrones).length} / {isochroneParams?.poiCount || '?'} POIs...
        </InfoOverlay>
      )}
      
      {isochroneParams && isochroneData && (
        <InfoOverlay>
          {isochroneParams.profile.charAt(0).toUpperCase() + isochroneParams.profile.slice(1)} {' '}
          {isochroneParams.contourType === 'minutes' ? 'time' : 'distance'}: {' '}
          {isochroneParams.contourValue} {isochroneParams.contourType === 'minutes' ? 'min' : 'm'}
        </InfoOverlay>
      )}
      
      {isochroneParams && isochroneParams.forAllPOIs && Object.keys(poiIsochrones).length > 0 && (
        <InfoOverlay>
          MapMatch for {Object.keys(poiIsochrones).length} POIs: {' '}
          {isochroneParams.profile} {' '}
          {isochroneParams.contourType === 'minutes' ? 'time' : 'distance'}: {' '}
          {isochroneParams.contourValue} {isochroneParams.contourType === 'minutes' ? 'min' : 'm'}
        </InfoOverlay>
      )}
      
      {isochroneError && (
        <InfoOverlay style={{ backgroundColor: '#ffebee', color: '#d32f2f' }}>
          Error: {isochroneError}
        </InfoOverlay>
      )}
    </div>
  );
};

export default ReactMapGLComponent; 