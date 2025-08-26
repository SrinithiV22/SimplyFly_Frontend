import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all cancellations
export const getAllCancellations = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Cancellation`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all cancellations error:', error);
    throw error;
  }
};

// Get cancellations with pagination
export const getCancellationsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Cancellation/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get cancellations paged error:', error);
    throw error;
  }
};

// Create new cancellation
export const createCancellation = async (cancellationData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Cancellation`, cancellationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create cancellation error:', error);
    throw error;
  }
};

// Get cancellation by ID
export const getCancellationById = async (cancellationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Cancellation/${cancellationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get cancellation by ID error:', error);
    throw error;
  }
};

// Update cancellation
export const updateCancellation = async (cancellationId, cancellationData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/Cancellation/${cancellationId}`, cancellationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update cancellation error:', error);
    throw error;
  }
};

// Delete cancellation
export const deleteCancellation = async (cancellationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/Cancellation/${cancellationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete cancellation error:', error);
    throw error;
  }
};
