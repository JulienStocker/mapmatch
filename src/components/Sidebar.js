import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapContext } from '../contexts/MapContext';
import PropertyCard from './PropertyCard';

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
  const { properties, selectProperty, selectedProperty } = useContext(MapContext);
  const [sliderValue, setSliderValue] = useState(zoomLevelMap[zoomLevel] || 10);
  const [supermarketsExpanded, setSupermarketsExpanded] = useState(false);
  const [transportExpanded, setTransportExpanded] = useState(false);
  
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