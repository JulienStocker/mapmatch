import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid ${props => props.isSelected ? '#2c3e50' : '#e0e0e0'};
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: ${props => props.isSelected ? '0 0 0 2px #2c3e50' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  height: 160px;
  overflow: hidden;
  position: relative;
`;

const PropertyImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PropertyType = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${props => props.type === 'sale' ? '#e74c3c' : '#3498db'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`;

const CardContent = styled.div`
  padding: 15px;
`;

const Title = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
`;

const Detail = styled.span``;

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const PropertyCard = ({ property, onClick, isSelected }) => {
  const { title, type, price, bedrooms, bathrooms, sqft, images } = property;
  
  return (
    <Card onClick={onClick} isSelected={isSelected}>
      <ImageContainer>
        <PropertyImage src={images[0]} alt={title} />
        <PropertyType type={type}>{type}</PropertyType>
      </ImageContainer>
      <CardContent>
        <Title>{title}</Title>
        <Price>{formatPrice(price)}</Price>
        <Details>
          <Detail>{bedrooms} bed</Detail>
          <Detail>{bathrooms} bath</Detail>
          <Detail>{sqft} sqft</Detail>
        </Details>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 