import React, { useContext, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MapContext } from '../contexts/MapContext';
import PropertyCard from './PropertyCard';
import mapboxgl from 'mapbox-gl';

const SidebarContainer = styled.div`
  width: 320px;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarSection = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
`;

const ZoomLevelControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2c3e50;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2c3e50;
    cursor: pointer;
  }
`;

const ZoomLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const ZoomValue = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
`;

const ZoomPresets = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 5px;
`;

const PresetButton = styled.button`
  flex: 1;
  padding: 6px;
  background-color: ${props => props.active ? '#2c3e50' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: ${props => props.active ? '#2c3e50' : '#dee2e6'};
  }
`;

const PropertiesContainer = styled.div`
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
`;

const NestedCheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 25px;
  margin-top: 5px;
`;

const SearchContainer = styled.div`
  width: 100%;
  margin-top: 15px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2c3e50;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${props => props.show ? 'block' : 'none'};
`;

const ResultItem = styled.li`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const StatusMessage = styled.div`
  padding: 10px 12px;
  color: ${props => props.isError ? '#e74c3c' : '#7f8c8d'};
  text-align: center;
  font-size: 14px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #95a5a6;
  font-size: 18px;
  
  &:hover {
    color: #2c3e50;
  }
`;

const SearchForm = styled.div`
  position: relative;
`;

// Zoom level mappings
const zoomLevelMap = {
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

const getZoomName = (value) => {
  const zoomValue = Number(value);
  
  if (zoomValue <= 2) return 'World';
  if (zoomValue <= 5) return 'Continent';
  if (zoomValue <= 7) return 'Country';
  if (zoomValue <= 9) return 'State/Region';
  if (zoomValue <= 11) return 'City';
  if (zoomValue <= 13) return 'District';
  if (zoomValue <= 15) return 'Neighborhood';
  if (zoomValue <= 17) return 'Street';
  if (zoomValue <= 19) return 'Building';
  return 'Maximum';
};

const Sidebar = ({ selectedPOITypes, togglePOIType, toggleAllSupermarkets, toggleAllTransport, zoomLevel, changeZoomLevel, showProperties = true }) => {
  const { properties, selectProperty, selectedProperty, setMapView } = useContext(MapContext);
  const [sliderValue, setSliderValue] = useState(zoomLevelMap[zoomLevel] || 10);
  const [supermarketsExpanded, setSupermarketsExpanded] = useState(false);
  const [transportExpanded, setTransportExpanded] = useState(false);
  
  // Search bar state
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
  
  // Check if all supermarkets are selected
  const allSupermarketsSelected = 
    selectedPOITypes.migros && 
    selectedPOITypes.coop && 
    selectedPOITypes.aldi && 
    selectedPOITypes.lidl && 
    selectedPOITypes.denner && 
    selectedPOITypes.spar;
  
  // Check if any supermarket is selected
  const anySupermarketSelected = 
    selectedPOITypes.migros || 
    selectedPOITypes.coop || 
    selectedPOITypes.aldi || 
    selectedPOITypes.lidl || 
    selectedPOITypes.denner || 
    selectedPOITypes.spar;
    
  // Check if all transport options are selected
  const allTransportSelected = 
    selectedPOITypes.trainStation && 
    selectedPOITypes.busStop;
    
  // Check if any transport option is selected
  const anyTransportSelected = 
    selectedPOITypes.trainStation || 
    selectedPOITypes.busStop;
  
  // Handle the supermarket parent checkbox click
  const handleSupermarketToggle = () => {
    toggleAllSupermarkets(!allSupermarketsSelected);
  };
  
  // Handle the transport parent checkbox click
  const handleTransportToggle = () => {
    toggleAllTransport(!allTransportSelected);
  };
  
  // Update slider value when zoomLevel prop changes
  useEffect(() => {
    setSliderValue(zoomLevelMap[zoomLevel] || 10);
  }, [zoomLevel]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    setSliderValue(newValue);
    
    // Find the closest named zoom level
    const entries = Object.entries(zoomLevelMap);
    let closestLevel = entries[0];
    
    for (const [level, value] of entries) {
      if (Math.abs(value - newValue) < Math.abs(closestLevel[1] - newValue)) {
        closestLevel = [level, value];
      }
    }
    
    // Only change the level if it's different
    if (closestLevel[0] !== zoomLevel) {
      changeZoomLevel(closestLevel[0]);
    }
  };
  
  // Handle preset button clicks
  const handlePresetClick = (level) => {
    setSliderValue(zoomLevelMap[level]);
    changeZoomLevel(level);
  };
  
  // Search bar functions
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }
    
    // Add debounce to prevent too many API calls
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      // Using Mapbox Geocoding API to search for locations
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${mapboxgl.accessToken}&types=place,address,neighborhood,locality,region&limit=5`
        );
        
        if (!response.ok) {
          throw new Error('Failed to search for locations');
        }
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          setResults(data.features);
          setShowResults(true);
        } else {
          setResults([]);
          setError('No locations found');
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        setError('Error searching for locations');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  };
  
  const handleSelectLocation = (result) => {
    const [lng, lat] = result.center;
    
    // Determine zoom level based on the result type
    let zoom = 12; // Default for cities
    if (result.place_type.includes('address')) {
      zoom = 16;
    } else if (result.place_type.includes('neighborhood') || result.place_type.includes('locality')) {
      zoom = 14;
    } else if (result.place_type.includes('region')) {
      zoom = 8;
    } else if (result.place_type.includes('country')) {
      zoom = 5;
    }
    
    // Update the map view with the selected location
    console.log('Setting map view to:', { lat, lng }, 'with zoom:', zoom);
    setMapView({ lat, lng }, zoom);
    setSearchTerm(result.place_name);
    setShowResults(false);
  };
  
  // Handle Enter key press in search input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelectLocation(results[0]);
    }
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Zoom Level</SectionTitle>
        <ZoomLevelControl>
          <ZoomValue>{getZoomName(sliderValue)} ({sliderValue})</ZoomValue>
          <SliderContainer>
            <StyledSlider 
              type="range" 
              min="1" 
              max="20" 
              step="0.5"
              value={sliderValue} 
              onChange={handleSliderChange}
            />
            <ZoomLabels>
              <span>World</span>
              <span>City</span>
              <span>Street</span>
            </ZoomLabels>
          </SliderContainer>
          <ZoomPresets>
            <PresetButton 
              active={zoomLevel === 'city'} 
              onClick={() => handlePresetClick('city')}
            >
              City
            </PresetButton>
            <PresetButton 
              active={zoomLevel === 'neighborhood'} 
              onClick={() => handlePresetClick('neighborhood')}
            >
              Neighborhood
            </PresetButton>
            <PresetButton 
              active={zoomLevel === 'street'} 
              onClick={() => handlePresetClick('street')}
            >
              Street
            </PresetButton>
          </ZoomPresets>
          
          {/* Add Search Bar below zoom controls */}
          <SearchContainer>
            <SearchForm>
              <SearchInput
                type="text"
                placeholder="Search for a city, address, or location..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {searchTerm && (
                <ClearButton onClick={clearSearch} type="button">×</ClearButton>
              )}
            </SearchForm>
            
            <ResultsList show={showResults}>
              {isLoading ? (
                <StatusMessage>Searching...</StatusMessage>
              ) : error ? (
                <StatusMessage isError>{error}</StatusMessage>
              ) : (
                results.map(result => (
                  <ResultItem
                    key={result.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur before click
                      handleSelectLocation(result);
                    }}
                  >
                    {result.place_name}
                  </ResultItem>
                ))
              )}
            </ResultsList>
          </SearchContainer>
        </ZoomLevelControl>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Points of Interest</SectionTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={selectedPOITypes.hospitals} 
              onChange={() => togglePOIType('hospitals')} 
            />
            Healthcare
          </CheckboxLabel>
          
          {/* Supermarkets parent checkbox */}
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={allSupermarketsSelected}
              onChange={handleSupermarketToggle}
              indeterminate={anySupermarketSelected && !allSupermarketsSelected}
              ref={el => {
                if (el) {
                  el.indeterminate = anySupermarketSelected && !allSupermarketsSelected;
                }
              }}
            />
            Supermarkets
            <span 
              style={{ marginLeft: '5px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setSupermarketsExpanded(!supermarketsExpanded)}
            >
              {supermarketsExpanded ? '▼' : '►'}
            </span>
          </CheckboxLabel>
          
          {/* Nested supermarket options */}
          {supermarketsExpanded && (
            <NestedCheckboxGroup>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.migros} 
                  onChange={() => togglePOIType('migros')} 
                />
                Migros
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.coop} 
                  onChange={() => togglePOIType('coop')} 
                />
                Coop
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.aldi} 
                  onChange={() => togglePOIType('aldi')} 
                />
                Aldi
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.lidl} 
                  onChange={() => togglePOIType('lidl')} 
                />
                Lidl
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.denner} 
                  onChange={() => togglePOIType('denner')} 
                />
                Denner
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.spar} 
                  onChange={() => togglePOIType('spar')} 
                />
                Spar
              </CheckboxLabel>
            </NestedCheckboxGroup>
          )}
          
          {/* Public Transportation parent checkbox */}
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={allTransportSelected}
              onChange={handleTransportToggle}
              indeterminate={anyTransportSelected && !allTransportSelected}
              ref={el => {
                if (el) {
                  el.indeterminate = anyTransportSelected && !allTransportSelected;
                }
              }}
            />
            Public Transportation
            <span 
              style={{ marginLeft: '5px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setTransportExpanded(!transportExpanded)}
            >
              {transportExpanded ? '▼' : '►'}
            </span>
          </CheckboxLabel>
          
          {/* Nested transportation options */}
          {transportExpanded && (
            <NestedCheckboxGroup>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.trainStation} 
                  onChange={() => togglePOIType('trainStation')} 
                />
                Train Station
              </CheckboxLabel>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={selectedPOITypes.busStop} 
                  onChange={() => togglePOIType('busStop')} 
                />
                Bus Stop
              </CheckboxLabel>
            </NestedCheckboxGroup>
          )}
        </CheckboxGroup>
      </SidebarSection>
      
      {/* Hide Properties section when showProperties is false */}
      {showProperties && (
        <>
          <SidebarSection>
            <SectionTitle>Properties ({properties.length})</SectionTitle>
          </SidebarSection>
          
          <PropertiesContainer>
            {properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => selectProperty(property)}
                isSelected={selectedProperty && selectedProperty.id === property.id}
              />
            ))}
          </PropertiesContainer>
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 