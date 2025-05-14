import axios from 'axios';

// Define API base URL - explicitly use port 5001 where the test server is running
const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Properties API calls
export const getProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching property with id ${id}:`, error);
    throw error;
  }
};

export const getPropertiesByType = async (type) => {
  try {
    const response = await api.get(`/properties/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching properties of type ${type}:`, error);
    throw error;
  }
};

export const getPropertiesInRadius = async (lat, lng, radius) => {
  try {
    const response = await api.get(`/properties/radius/${lat}/${lng}/${radius}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching properties within ${radius}km:`, error);
    throw error;
  }
};

export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating property with id ${id}:`, error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting property with id ${id}:`, error);
    throw error;
  }
};

// POI API calls
export const getAllPOIs = async () => {
  try {
    const response = await api.get('/poi');
    return response.data;
  } catch (error) {
    console.error('Error fetching POIs:', error);
    throw error;
  }
};

export const getPOIById = async (id) => {
  try {
    const response = await api.get(`/poi/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching POI with id ${id}:`, error);
    throw error;
  }
};

export const getPOIsByType = async (type) => {
  try {
    const response = await api.get(`/poi/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching POIs of type ${type}:`, error);
    throw error;
  }
};

export const getPOIsInRadius = async (lat, lng, radius) => {
  try {
    const response = await api.get(`/poi/radius/${lat}/${lng}/${radius}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching POIs within ${radius}km:`, error);
    throw error;
  }
};

export const getPOIsInRadiusByType = async (lat, lng, radius, type) => {
  try {
    const response = await api.get(`/poi/radius/${lat}/${lng}/${radius}/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} POIs within ${radius}km:`, error);
    throw error;
  }
};

export const createPOI = async (poiData) => {
  try {
    const response = await api.post('/poi', poiData);
    return response.data;
  } catch (error) {
    console.error('Error creating POI:', error);
    throw error;
  }
};

export const updatePOI = async (id, poiData) => {
  try {
    const response = await api.put(`/poi/${id}`, poiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating POI with id ${id}:`, error);
    throw error;
  }
};

export const deletePOI = async (id) => {
  try {
    const response = await api.delete(`/poi/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting POI with id ${id}:`, error);
    throw error;
  }
};

export default api; 