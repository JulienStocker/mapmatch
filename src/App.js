import React, { useState, useEffect } from 'react';
import { MapProvider } from './contexts/MapContext';
import Header from './components/Header';
import MapView from './components/MapView';
import SimpleMap from './components/SimpleMap';
import ReactMapGLComponent from './components/ReactMapGL';
import Sidebar from './components/Sidebar';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MapContainer = styled.div`
  flex: 1;
  position: relative;
  height: calc(100vh - 60px);
  min-height: 500px; /* Ensure minimum height */
  overflow: hidden;
`;

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPOITypes, setSelectedPOITypes] = useState({
    groceries: true,
    malls: true,
    transport: true,
    hospitals: true
  });
  
  const [zoomLevel, setZoomLevel] = useState('city'); // 'city', 'neighborhood', 'street'
  // Use ReactMapGL component by default
  const [mapComponent, setMapComponent] = useState('reactmapgl'); // 'reactmapgl', 'simple', or 'original'

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const togglePOIType = (type) => {
    setSelectedPOITypes({
      ...selectedPOITypes,
      [type]: !selectedPOITypes[type]
    });
  };

  const changeZoomLevel = (level) => {
    setZoomLevel(level);
  };
  
  // Debug log the container dimensions
  useEffect(() => {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      console.log('App - Map container dimensions:');
      console.log('Width:', mapContainer.offsetWidth);
      console.log('Height:', mapContainer.offsetHeight);
      console.log('Visible:', mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0);
    }
    
    // Test if Mapbox GL is supported
    console.log("Mapbox GL JS supported:", !!mapboxgl.supported());
  }, []);

  return (
    <MapProvider>
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} />
        <MainContent>
          {showSidebar && (
            <Sidebar 
              selectedPOITypes={selectedPOITypes} 
              togglePOIType={togglePOIType}
              zoomLevel={zoomLevel}
              changeZoomLevel={changeZoomLevel}
            />
          )}
          <MapContainer>
            {mapComponent === 'reactmapgl' && <ReactMapGLComponent />}
            {mapComponent === 'simple' && <SimpleMap />}
            {mapComponent === 'original' && (
              <MapView 
                selectedPOITypes={selectedPOITypes}
                zoomLevel={zoomLevel}
              />
            )}
          </MapContainer>
        </MainContent>
      </AppContainer>
    </MapProvider>
  );
}

export default App; 