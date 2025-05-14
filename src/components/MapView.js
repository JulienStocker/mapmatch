import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import { MapContext } from '../contexts/MapContext';
import ReactDOM from 'react-dom';
import MapPopup from './MapPopup';
import POIMarker from './POIMarker';
import SearchBar from './SearchBar';


// Use the new token provided by the user
mapboxgl.accessToken = 'pk.eyJ1IjoianVsaWVuc3RvY2tlciIsImEiOiJjbWFvYWhqMXAwNW9vMmpyMGtmNjBqYzZoIn0.MDBDP08GAAF2SuXeAN3yuw';

// Test that the token is valid
console.log('Mapbox token first 12 chars:', mapboxgl.accessToken.substring(0, 12));
console.log('Full token length:', mapboxgl.accessToken.length);

// Simple container for the map with fixed position
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const ZoomLevelIndicator = styled.div`
  position: absolute;
  bottom: 30px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
  font-size: 14px;
  font-weight: bold;
`;

// Zoom level mappings
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

const MapView = ({ selectedPOITypes, zoomLevel }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({
    properties: [],
    pois: { groceries: [], malls: [], transport: [], hospitals: [] }
  });
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }));
  
  const { 
    mapCenter, 
    mapZoom, 
    setMapInstance,
    properties,
    pointsOfInterest,
    selectedProperty,
    selectProperty
  } = useContext(MapContext);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    console.log("Initializing map with center:", mapCenter);
    
    // If map is already initialized, don't create another one
    if (map.current) return;
    
    // Additional validation
    if (!mapContainer.current) {
      console.error("Map container reference is null");
      setMapError("Map container reference is null");
      return;
    }

    try {
      // Create a new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoomLevels[zoomLevel] || mapZoom,
        attributionControl: true
      });
      
      console.log("Map object created:", !!map.current);
      
      // Add event handlers for the map
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setMapInstance(map.current);
        
        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      });
      
      map.current.on('error', (e) => {
        console.error("Mapbox error:", e);
        setMapError(`Map error: ${e.error?.message || JSON.stringify(e)}`);
      });
    } catch (error) {
      console.error("Error creating map:", error);
      setMapError(`Error creating map: ${error.message}`);
    }
    
    // Clean up on unmount
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);
  
  // Add property markers when properties or map changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    console.log("Adding property markers:", properties.length);
    
    // Remove existing markers
    markers.current.properties.forEach(marker => marker.remove());
    markers.current.properties = [];
    
    // Add new property markers
    properties.forEach(property => {
      const { coordinates, id, title } = property;
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'property-marker';
      markerEl.style.width = '25px';
      markerEl.style.height = '25px';
      markerEl.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
      markerEl.style.backgroundSize = 'cover';
      markerEl.style.cursor = 'pointer';
      
      // Create the marker
      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'bottom'
      })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map.current);
      
      // Add click handler
      marker.getElement().addEventListener('click', () => {
        selectProperty(property);
      });
      
      markers.current.properties.push(marker);
    });
  }, [properties, mapLoaded]);
  
  // Update map center & zoom when context changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    map.current.flyTo({
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      essential: true,
      duration: 1000
    });
  }, [mapCenter, mapZoom, mapLoaded]);
  
  // Update map zoom based on zoom level prop
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    map.current.flyTo({
      zoom: zoomLevels[zoomLevel],
      essential: true,
      duration: 1000
    });
  }, [zoomLevel, mapLoaded]);
  
  // Update POI markers based on selected types
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    Object.keys(pointsOfInterest).forEach(poiType => {
      // Remove existing POI markers of this type
      markers.current.pois[poiType].forEach(marker => marker.remove());
      markers.current.pois[poiType] = [];
      
      // Skip if this POI type is not selected
      if (!selectedPOITypes[poiType]) return;
      
      // Add new POI markers
      pointsOfInterest[poiType].forEach(poi => {
        const { coordinates, name, id } = poi;
        
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'poi-marker';
        
        // Add POI icon based on type
        let iconUrl;
        switch(poiType) {
          case 'groceries':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
            break;
          case 'malls':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724927.png';
            break;
          case 'transport':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/2549/2549605.png';
            break;
          case 'hospitals':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/3158/3158267.png';
            break;
          default:
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
        }
        
        markerEl.style.width = '20px';
        markerEl.style.height = '20px';
        markerEl.style.backgroundImage = `url(${iconUrl})`;
        markerEl.style.backgroundSize = 'cover';
        markerEl.style.cursor = 'pointer';
        
        // Create the marker
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'center'
        })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);
        
        // Add click handler
        marker.getElement().addEventListener('click', () => {
          const popupNode = document.createElement('div');
          ReactDOM.render(
            <POIMarker poi={poi} type={poiType} />,
            popupNode
          );
          
          popupRef.current
            .setLngLat([coordinates.lng, coordinates.lat])
            .setDOMContent(popupNode)
            .addTo(map.current);
        });
        
        markers.current.pois[poiType].push(marker);
      });
    });
  }, [pointsOfInterest, selectedPOITypes, mapLoaded]);
  
  // Highlight selected property
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedProperty) return;
    
    const { coordinates } = selectedProperty;
    
    map.current.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: 15,
      essential: true,
      duration: 1000
    });
    
    // Display popup for selected property
    const popupNode = document.createElement('div');
    ReactDOM.render(
      <MapPopup property={selectedProperty} />,
      popupNode
    );
    
    popupRef.current
      .setLngLat([coordinates.lng, coordinates.lat])
      .setDOMContent(popupNode)
      .addTo(map.current);
      
  }, [selectedProperty, mapLoaded]);

  return (
    <MapContainer 
      ref={mapContainer} 
      className="map-container"
      id="map"
    >
      <SearchBar />
      <ZoomLevelIndicator>
        Current View: {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)} Level
      </ZoomLevelIndicator>
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <h3>Map Error</h3>
          <p>{mapError}</p>
        </div>
      )}
    </MapContainer>
  );
};

export default MapView; 