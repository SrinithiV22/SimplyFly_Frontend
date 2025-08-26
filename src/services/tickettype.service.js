import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all ticket types
export const getAllTicketTypes = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/TicketType`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get all ticket types error:', error);
    throw error;
  }
};

// Get ticket types with pagination
export const getTicketTypesPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/TicketType/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get ticket types paged error:', error);
    throw error;
  }
};

// Create new ticket type
export const createTicketType = async (ticketTypeData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/TicketType`, ticketTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create ticket type error:', error);
    throw error;
  }
};

// Get ticket type by ID
export const getTicketTypeById = async (ticketTypeId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/TicketType/${ticketTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get ticket type by ID error:', error);
    throw error;
  }
};

// Update ticket type
export const updateTicketType = async (ticketTypeId, ticketTypeData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/TicketType/${ticketTypeId}`, ticketTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update ticket type error:', error);
    throw error;
  }
};

// Delete ticket type
export const deleteTicketType = async (ticketTypeId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/TicketType/${ticketTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete ticket type error:', error);
    throw error;
  }
};
