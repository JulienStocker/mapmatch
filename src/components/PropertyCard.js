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
  // Handle both string and number prices
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price;
  
  if (isNaN(numericPrice)) {
    return price || 'N/A'; // Return original string if it can't be parsed
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(numericPrice);
};

const PropertyCard = ({ property, onClick, isSelected }) => {
  // Safely destructure with default values
  const {
    title = 'Property',
    type = 'csv',
    price = 'N/A',
    bedrooms = 'N/A',
    bathrooms = 'N/A',
    sqft = 'N/A',
    images = [],
    rawData = []
  } = property || {};
  
  // For CSV properties, we might not have all the standard fields
  // Check if this is a CSV property and handle accordingly
  const isCSVProperty = type === 'csv';
  
  // Use a placeholder image for CSV properties that don't have images
  const displayImage = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/400x300?text=Property';
  
  // For CSV properties, try to extract details from rawData if available
  let displayBedrooms = bedrooms;
  let displayBathrooms = bathrooms;
  let displaySqft = sqft;
  
  if (isCSVProperty && rawData && rawData.length > 0) {
    // Try to find rooms, area, etc. from the raw CSV data
    // This assumes the CSV might have columns like "Rooms", "Area", etc.
    const roomsCol = rawData[2]; // Assuming Rooms is the 3rd column based on your Excel
    const areaCol = rawData[3];  // Assuming Area is the 4th column
    
    if (roomsCol) displayBedrooms = roomsCol;
    if (areaCol) displaySqft = areaCol;
  }
  
  return (
    <Card onClick={onClick} isSelected={isSelected}>
      <ImageContainer>
        <PropertyImage src={displayImage} alt={title} />
        <PropertyType type={type}>{type === 'csv' ? 'CSV' : type.toUpperCase()}</PropertyType>
      </ImageContainer>
      <CardContent>
        <Title>{title}</Title>
        <Price>{formatPrice(price)}</Price>
        <Details>
          <Detail>{displayBedrooms !== 'N/A' ? `${displayBedrooms} rooms` : 'Rooms: N/A'}</Detail>
          <Detail>{displayBathrooms !== 'N/A' ? `${displayBathrooms} bath` : 'Bath: N/A'}</Detail>
          <Detail>{displaySqft !== 'N/A' ? `${displaySqft} area` : 'Area: N/A'}</Detail>
        </Details>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 