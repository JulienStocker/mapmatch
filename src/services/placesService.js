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
 * Fetch train stations - including both main railway stations and smaller stops
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {number} radius - The radius in meters to search within
 * @returns {Promise} - Promise resolving to the train stations data
 */
export const fetchTrainStations = async (coords, radius = 5000) => {
  try {
    // Fetch both train stations and light rail stops
    const stationUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&type=train_station&key=${GOOGLE_API_KEY}`;
    const lightRailUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&type=light_rail_station&key=${GOOGLE_API_KEY}`;
    
    // For local development - using a different proxy approach
    const stationProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(stationUrl)}`;
    const lightRailProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(lightRailUrl)}`;
    
    // Fetch both types in parallel
    const [stationResponse, lightRailResponse] = await Promise.all([
      axios.get(stationProxyUrl),
      axios.get(lightRailProxyUrl)
    ]);
    
    let stationResults = [];
    let lightRailResults = [];
    
    if (stationResponse.data && stationResponse.data.contents) {
      const data = JSON.parse(stationResponse.data.contents);
      if (data.status === 'OK') {
        stationResults = data.results;
      } else {
        console.error('Error fetching train stations:', data.status);
      }
    }
    
    if (lightRailResponse.data && lightRailResponse.data.contents) {
      const data = JSON.parse(lightRailResponse.data.contents);
      if (data.status === 'OK') {
        lightRailResults = data.results;
      } else {
        console.error('Error fetching light rail stations:', data.status);
      }
    }
    
    // Combine results, making sure there are no duplicates (using place_id as unique identifier)
    const combinedResults = [...stationResults];
    
    lightRailResults.forEach(lightRailStop => {
      if (!combinedResults.some(station => station.place_id === lightRailStop.place_id)) {
        combinedResults.push(lightRailStop);
      }
    });
    
    return combinedResults;
    
  } catch (error) {
    console.error('Error fetching train stations:', error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch bus stops using the Overpass API (which provides OpenStreetMap data)
 * This can often provide more accurate public transport data than Google Places API
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {number} radius - The radius in meters to search within
 * @returns {Promise} - Promise resolving to the bus stops data formatted like Google Places results
 */
export const fetchBusStopsFromOverpass = async (coords, radius = 5000) => {
  try {
    // Convert radius from meters to degrees (approximate)
    const radiusDegrees = radius / 111000; // 1 degree is roughly 111km
    
    // Create a bounding box for the query
    const bbox = [
      coords.lat - radiusDegrees,
      coords.lng - radiusDegrees,
      coords.lat + radiusDegrees,
      coords.lng + radiusDegrees
    ].join(',');
    
    // Overpass API query for bus stops
    const query = `
      [out:json];
      (
        node["highway"="bus_stop"](${bbox});
        node["public_transport"="platform"]["bus"="yes"](${bbox});
        node["public_transport"="stop_position"]["bus"="yes"](${bbox});
      );
      out body;
    `;
    
    // Use the Overpass API
    const response = await axios.post('https://overpass-api.de/api/interpreter', query);
    
    if (response.data && response.data.elements) {
      // Convert the Overpass API response to a format similar to Google Places API
      return response.data.elements.map(element => ({
        place_id: `overpass_${element.id}`,
        name: element.tags.name || element.tags.ref || 'Bus Stop',
        vicinity: element.tags.operator || 'Kriens',
        types: ['transit_station', 'bus_station'],
        rating: 0,
        geometry: {
          location: {
            lat: element.lat,
            lng: element.lon
          }
        }
      }));
    } else {
      console.error('Invalid response from Overpass API');
      return [];
    }
  } catch (error) {
    console.error('Error fetching bus stops from Overpass API:', error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch bus stops
 * 
 * @param {Object} coords - The coordinates (latitude, longitude)
 * @param {number} radius - The radius in meters to search within
 * @returns {Promise} - Promise resolving to the bus stops data
 */
export const fetchBusStops = async (coords, radius = 5000) => {
  try {
    // Try to get data from Overpass API first
    try {
      const overpassResults = await fetchBusStopsFromOverpass(coords, radius);
      if (overpassResults && overpassResults.length > 0) {
        console.log(`Found ${overpassResults.length} bus stops from Overpass API`);
        return overpassResults;
      }
    } catch (overpassError) {
      console.error('Overpass API failed, falling back to Google Places:', overpassError);
      // Continue with Google Places API as fallback
    }
    
    // Use direct fetch for bus stops with improved parameters
    // Search for both bus_station type and keyword transit to improve results
    const busStationUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&type=bus_station&key=${GOOGLE_API_KEY}`;
    const transitStopUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&keyword=bus stop&key=${GOOGLE_API_KEY}`;
    const kriensStopUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&keyword=bushaltestelle kriens&key=${GOOGLE_API_KEY}`;
    
    // For local development - using a different proxy approach
    const busStationProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(busStationUrl)}`;
    const transitStopProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(transitStopUrl)}`;
    const kriensStopProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(kriensStopUrl)}`;
    
    // Fetch all types in parallel
    const [busStationResponse, transitStopResponse, kriensStopResponse] = await Promise.all([
      axios.get(busStationProxyUrl),
      axios.get(transitStopProxyUrl),
      axios.get(kriensStopProxyUrl)
    ]);
    
    let busStationResults = [];
    let transitStopResults = [];
    let kriensStopResults = [];
    
    if (busStationResponse.data && busStationResponse.data.contents) {
      const data = JSON.parse(busStationResponse.data.contents);
      if (data.status === 'OK') {
        busStationResults = data.results;
      } else {
        console.error('Error fetching bus stations:', data.status);
      }
    }
    
    if (transitStopResponse.data && transitStopResponse.data.contents) {
      const data = JSON.parse(transitStopResponse.data.contents);
      if (data.status === 'OK') {
        transitStopResults = data.results;
      } else {
        console.error('Error fetching transit stops:', data.status);
      }
    }
    
    if (kriensStopResponse.data && kriensStopResponse.data.contents) {
      const data = JSON.parse(kriensStopResponse.data.contents);
      if (data.status === 'OK') {
        kriensStopResults = data.results;
      } else {
        console.error('Error fetching Kriens stops:', data.status);
      }
    }
    
    // Combine results, making sure there are no duplicates and filter out non-bus points
    const combinedResults = [...busStationResults];
    
    const addUniqueResults = (resultsArray) => {
      resultsArray.forEach(stop => {
        if (!combinedResults.some(station => station.place_id === stop.place_id)) {
          // Only include results that have relevant bus-related information in their name or types
          if (
            stop.name.toLowerCase().includes('bus') || 
            stop.name.toLowerCase().includes('stop') || 
            stop.name.toLowerCase().includes('station') ||
            stop.name.toLowerCase().includes('haltestelle') ||
            stop.types.includes('transit_station') ||
            stop.types.includes('bus_station')
          ) {
            combinedResults.push(stop);
          }
        }
      });
    };
    
    addUniqueResults(transitStopResults);
    addUniqueResults(kriensStopResults);
    
    // Post-process the results to ensure bus-related POIs only
    const filteredResults = combinedResults.filter(place => {
      // Remove any items clearly not related to buses (like restaurants or shops)
      const isNotBusStop = 
        place.types.includes('restaurant') ||
        place.types.includes('food') ||
        place.types.includes('store') ||
        place.types.includes('shop') ||
        place.types.includes('lodging') ||
        place.types.includes('establishment') && 
          !place.types.includes('transit_station') && 
          !place.types.includes('bus_station');
          
      return !isNotBusStop;
    });
    
    return filteredResults;
    
  } catch (error) {
    console.error('Error fetching bus stops:', error);
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

  if (selectedTypes.denner) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Denner', radius)
        .then(data => { result.denner = data; })
    );
  }

  if (selectedTypes.spar) {
    fetchPromises.push(
      fetchRetailChain(coords, 'Spar', radius)
        .then(data => { result.spar = data; })
    );
  }

  // Add public transportation stops
  if (selectedTypes.trainStation) {
    fetchPromises.push(
      fetchTrainStations(coords, radius)
        .then(data => { result.trainStation = data; })
    );
  }

  if (selectedTypes.busStop) {
    fetchPromises.push(
      fetchBusStops(coords, radius)
        .then(data => { result.busStop = data; })
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
    'hospital': 'Healthcare',
    'doctor': 'Healthcare',
    'health': 'Healthcare',
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
    'lidl': 'Lidl',
    'denner': 'Denner',
    'spar': 'Spar',
    'trainStation': 'Train Station',
    'busStop': 'Bus Stop'
  };
  
  return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}; 