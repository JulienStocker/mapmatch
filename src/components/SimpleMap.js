import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token
mapboxgl.accessToken = 'pk.eyJ1IjoianVsaWVuc3RvY2tlciIsImEiOiJjbWFvYWhqMXAwNW9vMmpyMGtmNjBqYzZoIn0.MDBDP08GAAF2SuXeAN3yuw';

// New York City coordinates
const NYC_COORDINATES = {
  lng: -74.0060,
  lat: 40.7128
};

const SimpleMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (map.current) return; // already initialized
    
    try {
      console.log('Creating simple map for New York City');
      
      // Check for browser support
      if (!mapboxgl.supported()) {
        setError('This browser does not support Mapbox GL');
        return;
      }
      
      // Initialize map with NYC coordinates
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [NYC_COORDINATES.lng, NYC_COORDINATES.lat],
        zoom: 12,
        attributionControl: true
      });
      
      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add a marker for NYC
      new mapboxgl.Marker({
        color: '#ff0000'
      })
        .setLngLat([NYC_COORDINATES.lng, NYC_COORDINATES.lat])
        .addTo(map.current);
        
      // Log when map loads
      map.current.on('load', () => {
        console.log('Simple map loaded successfully!');
        
        // Force resize after load to ensure proper rendering
        setTimeout(() => {
          map.current.resize();
          console.log('Map resized');
        }, 100);
      });
      
      // Log any errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Mapbox error: ' + (e.error?.message || 'Unknown error'));
      });
    } catch (e) {
      console.error('Error initializing map:', e);
      setError('Error initializing map: ' + e.message);
    }
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          zIndex: 999
        }}>
          {error}
        </div>
      )}
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0 
        }}
      />
    </div>
  );
};

export default SimpleMap; 