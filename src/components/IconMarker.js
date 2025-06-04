import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const MarkerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const IconContainer = styled.div`
  background: ${props => props.bgColor || '#fff'};
  border: 2px solid ${props => props.borderColor || '#333'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  ion-icon {
    color: ${props => props.iconColor || '#333'};
    font-size: ${props => props.size || '20px'};
  }
`;

const IconMarker = ({ 
  iconName, 
  bgColor, 
  borderColor, 
  iconColor, 
  size = '20px',
  onClick,
  className
}) => {
  const markerRef = useRef(null);

  useEffect(() => {
    // Ensure Ionicons are loaded
    if (typeof window !== 'undefined' && !window.customElements.get('ion-icon')) {
      // Load Ionicons scripts if not already loaded
      const script1 = document.createElement('script');
      script1.type = 'module';
      script1.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.noModule = true;
      script2.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
      document.head.appendChild(script2);
    }
  }, []);

  return (
    <MarkerContainer 
      ref={markerRef}
      onClick={onClick}
      className={className}
    >
      <IconContainer 
        bgColor={bgColor}
        borderColor={borderColor}
        iconColor={iconColor}
        size={size}
      >
        <ion-icon name={iconName}></ion-icon>
      </IconContainer>
    </MarkerContainer>
  );
};

export default IconMarker; 