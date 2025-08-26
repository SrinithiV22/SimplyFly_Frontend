import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all passenger details
export const getAllPassengerDetails = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/PassengerDetail`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all passenger details error:', error);
    throw error;
  }
};

// Get passenger details with pagination
export const getPassengerDetailsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/PassengerDetail/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get passenger details paged error:', error);
    throw error;
  }
};

// Create new passenger detail
export const createPassengerDetail = async (passengerData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/PassengerDetail`, passengerData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create passenger detail error:', error);
    throw error;
  }
};

// Get passenger detail by ID
export const getPassengerDetailById = async (passengerId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/PassengerDetail/${passengerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get passenger detail by ID error:', error);
    throw error;
  }
};

// Update passenger detail
export const updatePassengerDetail = async (passengerId, passengerData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/PassengerDetail/${passengerId}`, passengerData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update passenger detail error:', error);
    throw error;
  }
};

// Delete passenger detail
export const deletePassengerDetail = async (passengerId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/PassengerDetail/${passengerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete passenger detail error:', error);
    throw error;
  }
};
