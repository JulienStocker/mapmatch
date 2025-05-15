import axios from 'axios';

// Google Maps API key
const GOOGLE_API_KEY = 'AIzaSyCSYR9OOid38DFZmlXVbh1JtNSEmzdHbUQ';

/**
 * Fetch nearby places from Google Places API
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {string} type - The type of place to search for (e.g., 'hospital', 'restaurant', etc.)
 * @param {number} radius - The radius in meters to search within (max 50000)
 * @returns {Promise} - Promise resolving to the places data
 */
export const fetchNearbyPlaces = async (coords, type, radius = 5000) => {
  try {
    // Use direct fetch for testing
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
    
    // For local development - using a different proxy approach
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(proxyUrl);
    
    if (response.data && response.data.contents) {
      const data = JSON.parse(response.data.contents);
      if (data.status === 'OK') {
        return data.results;
      } else {
        console.error('Error fetching places:', data.status);
        return []; // Return empty array instead of throwing an error
      }
    } else {
      console.error('Invalid response format');
      return [];
    }
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch specific retail chain stores by name
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {string} name - The name of the store chain (e.g., 'Migros', 'Coop', etc.)
 * @param {number} radius - The radius in meters to search within (max 50000)
 * @returns {Promise} - Promise resolving to the places data
 */
export const fetchRetailChain = async (coords, name, radius = 5000) => {
  try {
    // Use direct fetch with name search
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&keyword=${name}&key=${GOOGLE_API_KEY}`;
    
    // For local development - using a different proxy approach
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(proxyUrl);
    
    if (response.data && response.data.contents) {
      const data = JSON.parse(response.data.contents);
      if (data.status === 'OK') {
        return data.results;
      } else {
        console.error(`Error fetching ${name} stores:`, data.status);
        return []; // Return empty array instead of throwing an error
      }
    } else {
      console.error('Invalid response format');
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${name} stores:`, error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch all specified retail chains and hospitals
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {Object} selectedTypes - Object with boolean values for selected types
 * @param {number} radius - The radius in meters to search within
 * @returns {Promise} - Promise resolving to an object with each type of POI
 */
export const fetchAllPOIs = async (coords, selectedTypes, radius = 5000) => {
  const result = {};
  const fetchPromises = [];

  // Only fetch selected types
  if (selectedTypes.hospitals) {
    fetchPromises.push(
      fetchNearbyPlaces(coords, 'hospital', radius)
        .then(data => { result.hospitals = data; })
    );
  }

  if (selectedTypes.migros) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Migros', radius)
        .then(data => { result.migros = data; })
    );
  }

  if (selectedTypes.coop) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Coop', radius)
        .then(data => { result.coop = data; })
    );
  }

  if (selectedTypes.aldi) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Aldi', radius)
        .then(data => { result.aldi = data; })
    );
  }

  if (selectedTypes.lidl) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Lidl', radius)
        .then(data => { result.lidl = data; })
    );
  }

  // Wait for all selected POI types to be fetched
  await Promise.all(fetchPromises);
  return result;
};

/**
 * Get place details from Google Places API
 * 
 * @param {string} placeId - The Google Place ID
 * @returns {Promise} - Promise resolving to the place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,geometry,photos,opening_hours,rating,website&key=${GOOGLE_API_KEY}`;
    
    // For local development - using a different proxy approach
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(proxyUrl);
    
    if (response.data && response.data.contents) {
      const data = JSON.parse(response.data.contents);
      if (data.status === 'OK') {
        return data.result;
      } else {
        console.error('Error fetching place details:', data.status);
        return null;
      }
    } else {
      console.error('Invalid response format');
      return null;
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

/**
 * Get place photo URL from Google Places API
 * 
 * @param {string} photoReference - The photo reference from a Place result
 * @param {number} maxWidth - The maximum width of the photo
 * @returns {string} - The URL for the photo
 */
export const getPlacePhotoUrl = (photoReference, maxWidth = 400) => {
  // For photos, we can use direct URL with the API key since these work in img tags
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
};

/**
 * Convert a place type to a display name
 * 
 * @param {string} type - The place type
 * @returns {string} - A user-friendly display name
 */
export const getPlaceTypeDisplayName = (type) => {
  const displayNames = {
    'grocery_or_supermarket': 'Grocery Store',
    'supermarket': 'Grocery Store',
    'shopping_mall': 'Shopping Mall',
    'department_store': 'Shopping Mall',
    'train_station': 'Transportation Hub',
    'subway_station': 'Transportation Hub',
    'bus_station': 'Transportation Hub',
    'transit_station': 'Transportation Hub',
    'hospital': 'Hospital',
    'doctor': 'Hospital',
    'health': 'Hospital',
    'pharmacy': 'Pharmacy',
    'restaurant': 'Restaurant',
    'cafe': 'Cafe',
    'bar': 'Bar',
    'park': 'Park',
    'school': 'School',
    'bank': 'Bank',
    'atm': 'ATM',
    'gas_station': 'Gas Station',
    'post_office': 'Post Office',
    'library': 'Library',
    'museum': 'Museum',
    'tourist_attraction': 'Tourist Attraction',
    'lodging': 'Hotel',
    'migros': 'Migros',
    'coop': 'Coop',
    'aldi': 'Aldi',
    'lidl': 'Lidl'
  };
  
  return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}; 