import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all flights
export const searchFlights = async (searchParams) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Flight`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Flight search API error:', error);
    throw error;
  }
};

// Get flights with pagination
export const getFlightsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Flight/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get flights paged error:', error);
    throw error;
  }
};

// Get flight details by ID
export const getFlightDetails = async (flightId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Flight/${flightId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get flight details error:', error);
    throw error;
  }
};

// Create new flight (admin function)
export const createFlight = async (flightData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Flight`, flightData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create flight error:', error);
    throw error;
  }
};

// Update flight (admin function)
export const updateFlight = async (flightId, flightData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/Flight/${flightId}`, flightData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update flight error:', error);
    throw error;
  }
};

// Delete flight (admin function)
export const deleteFlight = async (flightId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/Flight/${flightId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete flight error:', error);
    throw error;
  }
};


// Get all bookings
export const getUserBookings = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Booking`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get bookings with pagination
export const getBookingsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Booking/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get bookings paged error:', error);
    throw error;
  }
};

// Book a flight
export const bookFlight = async (bookingData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Booking`, bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Book flight error:', error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get booking by ID error:', error);
    throw error;
  }
};

// Update booking
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/Booking/${bookingId}`, bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update booking error:', error);
    throw error;
  }
};

// Cancel booking (using specific cancel endpoint)
export const cancelBooking = async (bookingId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Booking/${bookingId}/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/Booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete booking error:', error);
    throw error;
  }
};

// Get popular destinations
export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flights/popular-destinations`);
    return response.data;
  } catch (error) {
    console.error('Get popular destinations error:', error);
    // Return fallback data
    return [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
      'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'
    ];
  }
};

// Get flight price trends
export const getPriceTrends = async (route) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flights/price-trends`, {
      params: route
    });
    return response.data;
  } catch (error) {
    console.error('Get price trends error:', error);
    throw error;
  }
};
