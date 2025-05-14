import React, { useState } from 'react';
import styled from 'styled-components';

const ControlContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 270px;
  z-index: 1;
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 250px;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
`;

const Section = styled.div`
  margin-bottom: 15px;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  cursor: pointer;
`;

const ToggleGroup = styled.div`
  display: flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  background: ${props => props.active ? '#2c3e50' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#333'};

  &:hover {
    background: ${props => props.active ? '#2c3e50' : '#e9ecef'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
`;

const Button = styled.button`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: #3b78e7;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const IsochroneControl = ({ onGenerateIsochrone }) => {
  const [profile, setProfile] = useState('walking');
  const [contourType, setContourType] = useState('minutes');
  const [contourValue, setContourValue] = useState('10 min');
  const [generatingIsochrone, setGeneratingIsochrone] = useState(false);

  const handleProfileChange = (e) => {
    setProfile(e.target.value);
  };

  const handleContourTypeChange = (type) => {
    setContourType(type);
    // Reset contour value when changing type
    if (type === 'minutes') {
      setContourValue('10 min');
    } else {
      setContourValue('1000 m');
    }
  };

  const handleContourValueChange = (e) => {
    setContourValue(e.target.value);
  };

  const handleGenerateClick = () => {
    setGeneratingIsochrone(true);
    
    // Extract numeric value from contour value string
    let value;
    if (contourType === 'minutes') {
      value = parseInt(contourValue.split(' ')[0]);
    } else {
      value = parseInt(contourValue.split(' ')[0]);
    }
    
    onGenerateIsochrone({
      profile,
      contourType,
      contourValue: value
    })
    .finally(() => {
      setGeneratingIsochrone(false);
    });
  };

  return (
    <ControlContainer>
      <Title>Isochrone Controls</Title>
      
      <Section>
        <SectionLabel>Routing Profile</SectionLabel>
        <RadioGroup>
          <RadioLabel>
            <input 
              type="radio" 
              value="walking" 
              checked={profile === 'walking'} 
              onChange={handleProfileChange}
            />
            Walking
          </RadioLabel>
          <RadioLabel>
            <input 
              type="radio" 
              value="cycling" 
              checked={profile === 'cycling'} 
              onChange={handleProfileChange}
            />
            Cycling
          </RadioLabel>
          <RadioLabel>
            <input 
              type="radio" 
              value="driving" 
              checked={profile === 'driving'} 
              onChange={handleProfileChange}
            />
            Driving
          </RadioLabel>
        </RadioGroup>
      </Section>
      
      <Section>
        <SectionLabel>Contour Type</SectionLabel>
        <ToggleGroup>
          <ToggleButton 
            active={contourType === 'minutes'} 
            onClick={() => handleContourTypeChange('minutes')}
          >
            Minutes
          </ToggleButton>
          <ToggleButton 
            active={contourType === 'meters'} 
            onClick={() => handleContourTypeChange('meters')}
          >
            Meters
          </ToggleButton>
        </ToggleGroup>
      </Section>
      
      <Section>
        <SectionLabel>Contour {contourType === 'minutes' ? 'Time' : 'Distance'}</SectionLabel>
        <Select value={contourValue} onChange={handleContourValueChange}>
          {contourType === 'minutes' ? (
            <>
              <option value="5 min">5 min</option>
              <option value="10 min">10 min</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="45 min">45 min</option>
              <option value="60 min">60 min</option>
            </>
          ) : (
            <>
              <option value="500 m">500 m</option>
              <option value="1000 m">1 km</option>
              <option value="2000 m">2 km</option>
              <option value="5000 m">5 km</option>
              <option value="10000 m">10 km</option>
            </>
          )}
        </Select>
      </Section>
      
      <Button 
        onClick={handleGenerateClick}
        disabled={generatingIsochrone}
      >
        {generatingIsochrone ? 'Generating...' : 'Generate Isochrone'}
      </Button>
    </ControlContainer>
  );
};

export default IsochroneControl; 