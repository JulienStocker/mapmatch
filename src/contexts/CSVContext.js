import React, { createContext, useState } from 'react';

// Initial columns for the CSV
const initialColumns = ['Address', 'Price', 'Rooms', 'Area', 'Latitude', 'Longitude', 'URL', 'Notes'];

export const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([
    // Empty initial data with one blank row
    Array(initialColumns.length).fill('')
  ]);
  const [columns, setColumns] = useState(initialColumns);
  
  // Extract coordinates from Google Maps URL
  const extractCoordsFromMapsUrl = (url) => {
    if (!url) return null;
    
    console.log("Attempting to extract coordinates from URL:", url);
    
    // Try various URL patterns for Google Maps
    
    // Pattern 1: Regular format with @lat,lng,zoom
    // Example: https://www.google.com/maps/place/Somewhere/@47.3774241,8.5331746,17z/
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    let match = url.match(atPattern);
    if (match && match.length >= 3) {
      console.log("Matched @lat,lng pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 2: Search results with ?q=lat,lng
    // Example: https://www.google.com/maps?q=47.3774241,8.5331746
    const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    match = url.match(qPattern);
    if (match && match.length >= 3) {
      console.log("Matched ?q=lat,lng pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 3: Directions with ?daddr=lat,lng or ?saddr=lat,lng
    // Example: https://www.google.com/maps?daddr=47.3774241,8.5331746
    const addrPattern = /[?&][ds]addr=(-?\d+\.\d+),(-?\d+\.\d+)/;
    match = url.match(addrPattern);
    if (match && match.length >= 3) {
      console.log("Matched ?daddr= or ?saddr= pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 4: Directions with !3d{lat}!4d{lng}
    // Example: https://www.google.com/maps/dir//Place/data=!3d47.3774241!4d8.5331746
    const d3d4Pattern = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    match = url.match(d3d4Pattern);
    if (match && match.length >= 3) {
      console.log("Matched !3d{lat}!4d{lng} pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 5: Shared link with ll=lat,lng
    // Example: https://www.google.com/maps?ll=47.3774241,8.5331746
    const llPattern = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    match = url.match(llPattern);
    if (match && match.length >= 3) {
      console.log("Matched ?ll=lat,lng pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 6: Search URL with coordinates after /search/
    // Example: https://www.google.com/maps/search/47.030515,+8.295879?entry=tts
    const searchPattern = /\/maps\/search\/(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    match = url.match(searchPattern);
    if (match && match.length >= 3) {
      console.log("Matched /search/lat,lng pattern:", match[1], match[2]);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    
    // Pattern 7: Direct coordinates at the beginning of the URL or anywhere else in the URL
    // This is a more generic pattern to catch coordinates that might not be in any of the standard patterns
    const genericPattern = /\b(-?\d+\.\d+),\s*(-?\d+\.\d+)\b/;
    match = url.match(genericPattern);
    if (match && match.length >= 3) {
      console.log("Matched generic lat,lng pattern:", match[1], match[2]);
      // Validate that these look like reasonable coordinates
      const potentialLat = parseFloat(match[1]);
      const potentialLng = parseFloat(match[2]);
      if (potentialLat >= -90 && potentialLat <= 90 && potentialLng >= -180 && potentialLng <= 180) {
        return {
          lat: potentialLat,
          lng: potentialLng
        };
      }
    }
    
    // If no patterns match, return null
    console.log("Could not extract coordinates from URL:", url);
    return null;
  };
  
  return (
    <CSVContext.Provider
      value={{
        csvData,
        setCsvData,
        columns,
        setColumns,
        extractCoordsFromMapsUrl
      }}
    >
      {children}
    </CSVContext.Provider>
  );
}; 