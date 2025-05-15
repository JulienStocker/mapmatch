import axios from 'axios';

// Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoianVsaWVuc3RvY2tlciIsImEiOiJjbWFvYWhqMXAwNW9vMmpyMGtmNjBqYzZoIn0.MDBDP08GAAF2SuXeAN3yuw';

/**
 * Fetch isochrone data from Mapbox API
 * 
 * @param {Object} coords - The coordinates (longitude, latitude)
 * @param {Object} params - Isochrone parameters
 * @param {string} params.profile - The routing profile (walking, cycling, driving)
 * @param {string} params.contourType - The type of contour (minutes or meters)
 * @param {number} params.contourValue - The contour value
 * @returns {Promise} - Promise resolving to the isochrone GeoJSON
 */
export const fetchIsochrone = async (coords, params) => {
  try {
    const { profile, contourType, contourValue } = params;
    
    // Build the API URL
    const baseUrl = 'https://api.mapbox.com/isochrone/v1/mapbox';
    
    // Prepare the contours parameter
    let contours;
    if (contourType === 'minutes') {
      contours = `${contourValue}`;
    } else {
      contours = `${contourValue}`;
    }
    
    // Build the full URL
    const url = `${baseUrl}/${profile}/${coords.lng},${coords.lat}`;
    
    // Make the request
    const response = await axios.get(url, {
      params: {
        contours_minutes: contourType === 'minutes' ? contours : undefined,
        contours_meters: contourType === 'meters' ? contours : undefined,
        polygons: true,
        access_token: MAPBOX_TOKEN
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching isochrone data:', error);
    throw error;
  }
};

/**
 * Generate a color for an isochrone based on profile and value
 * 
 * @param {string} profile - The routing profile
 * @param {number} value - The contour value
 * @returns {string} - A color in rgba format
 */
export const getIsochroneColor = (profile, value) => {
  // Base colors for different profiles
  const baseColors = {
    walking: [86, 197, 150], // Green
    cycling: [250, 141, 0],  // Orange
    driving: [66, 133, 244]  // Blue
  };
  
  // Get the base color for the profile
  const color = baseColors[profile] || [100, 100, 100];
  
  // Calculate opacity based on contour value (higher values = more transparent)
  const opacity = 0.5 - (Math.min(value, 60) / 100);
  
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
};

/**
 * Calculate the appropriate fill color for the isochrone
 * 
 * @param {Object} feature - The GeoJSON feature
 * @param {string} profile - The routing profile
 * @param {string} contourType - The type of contour
 * @returns {string} - Color in rgba format
 */
export const getFeatureColor = (feature, profile, contourType) => {
  const value = contourType === 'minutes' 
    ? feature.properties.contour
    : feature.properties.contour / 1000; // Convert meters to kilometers for color scaling
    
  return getIsochroneColor(profile, value);
}; 