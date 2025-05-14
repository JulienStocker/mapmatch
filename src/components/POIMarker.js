import React from 'react';
import styled from 'styled-components';

const PopupContainer = styled.div`
  padding: 5px;
  max-width: 200px;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
`;

const POIType = styled.div`
  font-size: 13px;
  color: #777;
  text-transform: capitalize;
  margin-bottom: 8px;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
`;

const Icon = styled.div`
  width: 25px;
  height: 25px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const POIMarker = ({ poi, type }) => {
  const { name } = poi;
  
  // Get icon URL based on POI type
  let iconUrl;
  switch(type) {
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
  
  // Get display name for POI type
  let typeDisplayName;
  switch(type) {
    case 'groceries':
      typeDisplayName = 'Grocery Store';
      break;
    case 'malls':
      typeDisplayName = 'Shopping Mall';
      break;
    case 'transport':
      typeDisplayName = 'Transport Hub';
      break;
    case 'hospitals':
      typeDisplayName = 'Hospital';
      break;
    default:
      typeDisplayName = type;
  }
  
  return (
    <PopupContainer>
      <IconContainer>
        <Icon style={{ backgroundImage: `url(${iconUrl})` }} />
      </IconContainer>
      <Title>{name}</Title>
      <POIType>{typeDisplayName}</POIType>
    </PopupContainer>
  );
};

export default POIMarker; 