const API_BASE_URL = 'http://localhost:5244/api'; // Change port if needed

export const fetchFlights = async () => {
  try {
    console.log('🛫 Fetching flights from:', `${API_BASE_URL}/Flights`);
    const response = await fetch(`${API_BASE_URL}/Flights`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors' // Explicitly set CORS mode
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Failed to fetch flights: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data); // Debug log
    
    // Return the data array, handle different response formats
    return Array.isArray(data) ? data : (data.flights || data.data || []);
  } catch (error) {
    console.error('❌ Error in fetchFlights:', error);
    throw new Error(error.message || 'Failed to fetch flights from server');
  }
};

// Create a booking
export const createBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/Bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Failed to create booking: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get booked seats for a flight
export const getBookedSeats = async (flightId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Bookings/flight/${flightId}/seats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch booked seats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/Bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user bookings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async () => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/Bookings/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all bookings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/Bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel booking: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};
