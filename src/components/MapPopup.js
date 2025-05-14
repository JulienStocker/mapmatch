import React from 'react';
import styled from 'styled-components';

const PopupContainer = styled.div`
  padding: 5px;
  max-width: 250px;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #e74c3c;
`;

const Description = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
  color: #555;
`;

const PropertyDetails = styled.div`
  display: flex;
  font-size: 13px;
  margin-bottom: 8px;
  color: #777;
`;

const PropertyDetail = styled.div`
  margin-right: 10px;
`;

const Button = styled.button`
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  
  &:hover {
    background-color: #34495e;
  }
`;

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const MapPopup = ({ property }) => {
  const { title, price, description, bedrooms, bathrooms, sqft } = property;
  
  return (
    <PopupContainer>
      <Title>{title}</Title>
      <Price>{formatPrice(price)}</Price>
      <PropertyDetails>
        <PropertyDetail>{bedrooms} BD</PropertyDetail>
        <PropertyDetail>{bathrooms} BA</PropertyDetail>
        <PropertyDetail>{sqft} SQFT</PropertyDetail>
      </PropertyDetails>
      <Description>{description}</Description>
      <Button>View Details</Button>
    </PopupContainer>
  );
};

export default MapPopup; 