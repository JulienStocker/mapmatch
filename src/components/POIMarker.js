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
    case 'migros':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
      break;
    case 'coop':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724927.png';
      break;
    case 'aldi':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
      break;
    case 'lidl':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
      break;
    case 'denner':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
      break;
    case 'spar':
      iconUrl = 'https://cdn-icons-png.flaticon.com/512/3724/3724888.png';
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
    case 'migros':
      typeDisplayName = 'Migros';
      break;
    case 'coop':
      typeDisplayName = 'Coop';
      break;
    case 'aldi':
      typeDisplayName = 'Aldi';
      break;
    case 'lidl':
      typeDisplayName = 'Lidl';
      break;
    case 'denner':
      typeDisplayName = 'Denner';
      break;
    case 'spar':
      typeDisplayName = 'Spar';
      break;
    case 'hospitals':
      typeDisplayName = 'Healthcare';
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