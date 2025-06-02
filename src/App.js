import React, { useState, useEffect, useContext } from 'react';
import { MapProvider, MapContext } from './contexts/MapContext';
import { CSVProvider } from './contexts/CSVContext';
import Header from './components/Header';
import MapView from './components/MapView';
import SimpleMap from './components/SimpleMap';
import ReactMapGLComponent from './components/ReactMapGL';
import Sidebar from './components/Sidebar';
import ScoutView from './components/ScoutView';
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
  position: relative;
  height: calc(100vh - 60px);
  overflow: hidden;
`;

const SidebarWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  z-index: 10;
  height: 100%;
  overflow: hidden;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const MapContainer = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;
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
    spar: true,
    trainStation: true,
    busStop: true
  });
  
  // Add appMode state to toggle between map and scout views
  const [appMode, setAppMode] = useState('map'); // 'map' or 'scout'
  
  // Use ReactMapGL component by default
  const [mapComponent, setMapComponent] = useState('reactmapgl'); // 'reactmapgl', 'simple', or 'original'
  
  // Hide properties panel
  const [showProperties, setShowProperties] = useState(false); // Setting this to false to hide properties

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
  
  // Toggle all public transport at once
  const toggleAllTransport = (value) => {
    setSelectedPOITypes({
      ...selectedPOITypes,
      trainStation: value,
      busStop: value
    });
  };
  
  // Reset all POI selections by setting all to false
  const resetPOIs = () => {
    setSelectedPOITypes({
      hospitals: false,
      migros: false,
      coop: false,
      aldi: false,
      lidl: false,
      denner: false,
      spar: false,
      trainStation: false,
      busStop: false
    });
  };
  
  // Function to toggle between map and scout modes
  const toggleAppMode = () => {
    setAppMode(appMode === 'map' ? 'scout' : 'map');
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
      <Header toggleSidebar={toggleSidebar} toggleAppMode={toggleAppMode} appMode={appMode} />
      <MainContent>
        {appMode === 'map' ? (
          <>
            {showSidebar && (
              <SidebarWrapper>
                <Sidebar 
                  selectedPOITypes={selectedPOITypes} 
                  togglePOIType={togglePOIType}
                  toggleAllSupermarkets={toggleAllSupermarkets}
                  toggleAllTransport={toggleAllTransport}
                  zoomLevel={zoomLevel}
                  changeZoomLevel={changeZoomLevel}
                  showProperties={showProperties}
                />
              </SidebarWrapper>
            )}
            <MapContainer>
              {mapComponent === 'reactmapgl' && <ReactMapGLComponent 
                selectedPOITypes={selectedPOITypes} 
                resetPOIs={resetPOIs} 
                showProperties={showProperties}
              />}
              {mapComponent === 'simple' && <SimpleMap />}
              {mapComponent === 'original' && (
                <MapView 
                  selectedPOITypes={selectedPOITypes}
                  zoomLevel={zoomLevel}
                  showProperties={showProperties}
                />
              )}
            </MapContainer>
          </>
        ) : (
          <ScoutView />
        )}
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <MapProvider>
      <CSVProvider>
        <AppContent />
      </CSVProvider>
    </MapProvider>
  );
}

export default App; 