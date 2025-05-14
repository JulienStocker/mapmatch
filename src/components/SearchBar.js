import React, { useState, useContext, useRef } from 'react';
import styled from 'styled-components';
import { MapContext } from '../contexts/MapContext';
import mapboxgl from 'mapbox-gl';

const SearchContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  z-index: 10;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: #2c3e50;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${props => props.show ? 'block' : 'none'};
`;

const ResultItem = styled.li`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const StatusMessage = styled.div`
  padding: 10px 12px;
  color: ${props => props.isError ? '#e74c3c' : '#7f8c8d'};
  text-align: center;
  font-size: 14px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #95a5a6;
  font-size: 18px;
  
  &:hover {
    color: #2c3e50;
  }
`;

const SearchForm = styled.div`
  position: relative;
`;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const searchTimeout = useRef(null);
  const { setMapView } = useContext(MapContext);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }
    
    // Add debounce to prevent too many API calls
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      // Using Mapbox Geocoding API to search for locations
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${mapboxgl.accessToken}&types=place,address,neighborhood,locality,region&limit=5`
        );
        
        if (!response.ok) {
          throw new Error('Failed to search for locations');
        }
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          setResults(data.features);
          setShowResults(true);
        } else {
          setResults([]);
          setError('No locations found');
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        setError('Error searching for locations');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  };
  
  const handleSelectLocation = (result) => {
    const [lng, lat] = result.center;
    
    // Determine zoom level based on the result type
    let zoom = 12; // Default for cities
    if (result.place_type.includes('address')) {
      zoom = 16;
    } else if (result.place_type.includes('neighborhood') || result.place_type.includes('locality')) {
      zoom = 14;
    } else if (result.place_type.includes('region')) {
      zoom = 8;
    } else if (result.place_type.includes('country')) {
      zoom = 5;
    }
    
    setMapView({ lat, lng }, zoom);
    setSearchTerm(result.place_name);
    setShowResults(false);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };
  
  return (
    <SearchContainer>
      <SearchForm>
        <SearchInput
          type="text"
          placeholder="Search for a city, address, or location..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => (results.length > 0 || error) && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {searchTerm && (
          <ClearButton onClick={clearSearch} type="button">×</ClearButton>
        )}
      </SearchForm>
      
      <ResultsList show={showResults}>
        {isLoading ? (
          <StatusMessage>Searching...</StatusMessage>
        ) : error ? (
          <StatusMessage isError>{error}</StatusMessage>
        ) : (
          results.map(result => (
            <ResultItem
              key={result.id}
              onClick={() => handleSelectLocation(result)}
            >
              {result.place_name}
            </ResultItem>
          ))
        )}
      </ResultsList>
    </SearchContainer>
  );
};

export default SearchBar; 