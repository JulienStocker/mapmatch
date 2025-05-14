import React, { useContext } from 'react';
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

const ZoomLevelSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const ZoomButton = styled.button`
  flex: 1;
  padding: 8px;
  background-color: ${props => props.active ? '#2c3e50' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
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

const Sidebar = ({ selectedPOITypes, togglePOIType, zoomLevel, changeZoomLevel }) => {
  const { properties, selectProperty, selectedProperty } = useContext(MapContext);

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Zoom Level</SectionTitle>
        <ZoomLevelSelector>
          <ZoomButton 
            active={zoomLevel === 'city'} 
            onClick={() => changeZoomLevel('city')}
          >
            City
          </ZoomButton>
          <ZoomButton 
            active={zoomLevel === 'neighborhood'} 
            onClick={() => changeZoomLevel('neighborhood')}
          >
            Neighborhood
          </ZoomButton>
          <ZoomButton 
            active={zoomLevel === 'street'} 
            onClick={() => changeZoomLevel('street')}
          >
            Street
          </ZoomButton>
        </ZoomLevelSelector>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Points of Interest</SectionTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={selectedPOITypes.groceries} 
              onChange={() => togglePOIType('groceries')} 
            />
            Grocery Stores
          </CheckboxLabel>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={selectedPOITypes.malls} 
              onChange={() => togglePOIType('malls')} 
            />
            Shopping Malls
          </CheckboxLabel>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={selectedPOITypes.transport} 
              onChange={() => togglePOIType('transport')} 
            />
            Transportation Hubs
          </CheckboxLabel>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={selectedPOITypes.hospitals} 
              onChange={() => togglePOIType('hospitals')} 
            />
            Hospitals
          </CheckboxLabel>
        </CheckboxGroup>
      </SidebarSection>
      
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
    </SidebarContainer>
  );
};

export default Sidebar; 