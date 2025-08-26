import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all flight routes
export const getAllFlightRoutes = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/FlightRoute`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all flight routes error:', error);
    throw error;
  }
};

// Get flight routes with pagination
export const getFlightRoutesPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/FlightRoute/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get flight routes paged error:', error);
    throw error;
  }
};

// Create new flight route
export const createFlightRoute = async (routeData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/FlightRoute`, routeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create flight route error:', error);
    throw error;
  }
};

// Get flight route by ID
export const getFlightRouteById = async (routeId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/FlightRoute/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get flight route by ID error:', error);
    throw error;
  }
};

// Update flight route
export const updateFlightRoute = async (routeId, routeData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/FlightRoute/${routeId}`, routeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update flight route error:', error);
    throw error;
  }
};

// Delete flight route
export const deleteFlightRoute = async (routeId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/FlightRoute/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete flight route error:', error);
    throw error;
  }
};
