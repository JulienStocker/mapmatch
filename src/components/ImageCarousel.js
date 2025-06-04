import React, { useState } from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
`;

const ImageContainer = styled.div`
  display: flex;
  transition: transform 0.3s ease-in-out;
  transform: translateX(-${props => props.currentIndex * 100}%);
  height: 100%;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: translateY(-50%);
  }
  
  ${props => props.direction === 'left' ? 'left: 10px;' : 'right: 10px;'}
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.2);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 10;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
  flex-shrink: 0;
`;

const ImageCarousel = ({ images = [], title = "Property" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle empty or invalid images array
  const validImages = Array.isArray(images) && images.length > 0 
    ? images.filter(img => img && img.trim() !== '') 
    : [];
  
  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <CarouselContainer>
        <PlaceholderImage>
          <ion-icon name="image-outline" style={{ fontSize: '24px', marginRight: '8px' }}></ion-icon>
          {title}
        </PlaceholderImage>
      </CarouselContainer>
    );
  }
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  return (
    <CarouselContainer>
      <ImageContainer currentIndex={currentIndex}>
        {validImages.map((image, index) => (
          <CarouselImage 
            key={index}
            src={image} 
            alt={`${title} - Image ${index + 1}`}
            onError={(e) => {
              // Fallback for broken images
              e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
            }}
          />
        ))}
      </ImageContainer>
      
      {/* Only show arrows if there are multiple images */}
      {validImages.length > 1 && (
        <>
          <ArrowButton 
            direction="left" 
            onClick={goToPrevious}
            disabled={validImages.length <= 1}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </ArrowButton>
          
          <ArrowButton 
            direction="right" 
            onClick={goToNext}
            disabled={validImages.length <= 1}
          >
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </ArrowButton>
          
          {/* Image counter */}
          <ImageCounter>
            {currentIndex + 1} / {validImages.length}
          </ImageCounter>
          
          {/* Dots indicator */}
          <DotsContainer>
            {validImages.map((_, index) => (
              <Dot
                key={index}
                active={index === currentIndex}
                onClick={() => goToSlide(index)}
              />
            ))}
          </DotsContainer>
        </>
      )}
    </CarouselContainer>
  );
};

export default ImageCarousel; 