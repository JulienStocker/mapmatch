import React, { useState, useEffect, useContext } from 'react';
import { MapProvider, MapContext } from './contexts/MapContext';
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

function AppContent() {
  const { zoomLevel, changeZoomLevel } = useContext(MapContext);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPOITypes, setSelectedPOITypes] = useState({
    hospitals: true,
    migros: true,
    coop: true,
    aldi: true,
    lidl: true,
    denner: true,
    spar: true
  });
  
  // Use ReactMapGL component by default
  const [mapComponent, setMapComponent] = useState('reactmapgl'); // 'reactmapgl', 'simple', or 'original'

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const togglePOIType = (type, value) => {
    setSelectedPOITypes({
      ...selectedPOITypes,
      [type]: value !== undefined ? value : !selectedPOITypes[type]
    });
  };
  
  // Toggle all supermarkets at once with a single state update
  const toggleAllSupermarkets = (value) => {
    setSelectedPOITypes({
      ...selectedPOITypes,
      migros: value,
      coop: value,
      aldi: value,
      lidl: value,
      denner: value,
      spar: value
    });
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
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} />
      <MainContent>
        {showSidebar && (
          <Sidebar 
            selectedPOITypes={selectedPOITypes} 
            togglePOIType={togglePOIType}
            toggleAllSupermarkets={toggleAllSupermarkets}
            zoomLevel={zoomLevel}
            changeZoomLevel={changeZoomLevel}
          />
        )}
        <MapContainer>
          {mapComponent === 'reactmapgl' && <ReactMapGLComponent selectedPOITypes={selectedPOITypes} />}
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
  );
}

function App() {
  return (
    <MapProvider>
      <AppContent />
    </MapProvider>
  );
}

export default App; 