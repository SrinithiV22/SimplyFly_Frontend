import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PassengerDetails.css';

function PassengerDetails() {
  const [passengers, setPassengers] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse booking data from URL or state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const flightId = searchParams.get('flightId');
    const passengerCount = parseInt(searchParams.get('passengers')) || 1;
    const seats = searchParams.get('seats');
    const route = searchParams.get('route');
    const totalAmount = searchParams.get('totalAmount');
    const price = searchParams.get('price');
    const departureDate = searchParams.get('departureDate');
    
    if (!flightId) {
      setError('Flight information not found');
      setLoading(false);
      return;
    }
    
    // Set booking data
    setBookingData({
      flightId,
      passengerCount,
      seats: seats ? seats.split(', ') : [],
      route,
      totalAmount,
      price,
      departureDate: departureDate || (() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      })() // Store the departure date without timezone issues
    });
    
    // Initialize passenger forms
    const initialPassengers = Array.from({ length: passengerCount }, (_, index) => ({
      id: index + 1,
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      passportNumber: '',
      nationality: '',
      seatNumber: seats ? seats.split(', ')[index] || '' : ''
    }));
    
    setPassengers(initialPassengers);
    setLoading(false);
  }, [location]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName.trim()) {
        setError(`Please enter first name for passenger ${i + 1}`);
        return false;
      }
      if (!passenger.lastName.trim()) {
        setError(`Please enter last name for passenger ${i + 1}`);
        return false;
      }
      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        setError(`Please enter a valid age for passenger ${i + 1}`);
        return false;
      }
      if (!passenger.gender) {
        setError(`Please select gender for passenger ${i + 1}`);
        return false;
      }
      if (!passenger.nationality.trim()) {
        setError(`Please enter nationality for passenger ${i + 1}`);
        return false;
      }
      // Passport number is optional for domestic flights
    }
    return true;
  };

  const handleSubmitPassengerDetails = async () => {
    setError('');
    
    if (!validatePassengers()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get pending booking info from localStorage
      const pendingBookingInfo = JSON.parse(localStorage.getItem('pendingBookingInfo') || '{}');
      
      // First create the booking in database
      const bookingData = {
        flightId: pendingBookingInfo.flightId,
        flight: pendingBookingInfo.flight,
        route: pendingBookingInfo.route,
        selectedSeats: pendingBookingInfo.selectedSeats,
        passengers: pendingBookingInfo.passengers,
        totalAmount: pendingBookingInfo.totalAmount,
        ticketType: pendingBookingInfo.ticketType,
        departureTime: pendingBookingInfo.departureTime,
        arrivalTime: pendingBookingInfo.arrivalTime
      };
      
      console.log('Creating booking with data:', bookingData);
      
      // Import createBooking function dynamically
      const { createBooking } = await import('../api.js');
      const booking = await createBooking(bookingData);
      console.log('Booking created:', booking);
      
      // Save passenger details to database
      const passengerDetailsData = {
        bookingId: booking.bookingId,
        passengers: passengers.map((passenger, index) => ({
          seatNo: `${index + 1}A`, // Simple seat assignment for now
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          age: parseInt(passenger.age),
          gender: passenger.gender,
          passportNumber: passenger.passportNumber,
          nationality: passenger.nationality
        }))
      };
      
      console.log('Saving passenger details:', passengerDetailsData);
      
      // Call the passenger details API
      const response = await fetch('http://localhost:5244/api/Passenger/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(passengerDetailsData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save passenger details: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Passenger details saved:', result);
      
      // Store complete booking and passenger info for payment page
      const completeBookingInfo = {
        ...pendingBookingInfo,
        bookingId: booking.bookingId,
        passengers: passengers,
        passengerDetails: result
      };
      
      localStorage.setItem('completeBookingInfo', JSON.stringify(completeBookingInfo));
      localStorage.removeItem('pendingBookingInfo');
      
      // Set authorization flag for payment page access
      sessionStorage.setItem('fromPassengerDetails', 'true');
      
      // Navigate to payment page
      navigate('/payment', { replace: true });
      
    } catch (error) {
      console.error('Error completing booking:', error);
      setError(`Failed to complete booking: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="passenger-details-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error && !bookingData) {
    return (
      <div className="passenger-details-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/home')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="passenger-details-container">
      {/* Navigation Header */}
      <header className="passenger-header">
        <div className="header-content">
          <h1 className="logo">SimplyFly</h1>
          <nav className="nav-menu">
            <button onClick={() => navigate('/home')} className="nav-link">Home</button>
            <button onClick={() => navigate('/flights')} className="nav-link">Flights</button>
            <button onClick={() => navigate('/booking-history')} className="nav-link">My Bookings</button>
            <button onClick={handleLogout} className="nav-link logout">Logout</button>
          </nav>
        </div>
      </header>

      <div className="passenger-content">
        {/* Booking Summary */}
        <div className="booking-summary">
          <h2>Booking Confirmed! ✅</h2>
          <div className="summary-details">
            <p><strong>Flight ID:</strong> {bookingData.flightId}</p>
            <p><strong>Route:</strong> {bookingData.route}</p>
            <p><strong>Seats:</strong> {bookingData.seats.join(', ')}</p>
            <p><strong>Total Amount:</strong> ₹{bookingData.totalAmount}</p>
          </div>
        </div>

        {/* Passenger Details Form */}
        <div className="passenger-details-section">
          <h3>Passenger Details</h3>
          <p className="instruction">Please provide details for all passengers</p>
          
          {error && <div className="error-message">{error}</div>}
          
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="passenger-form">
              <h4>Passenger {index + 1} - Seat {passenger.seatNumber}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    placeholder="Age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Passport Number</label>
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                    placeholder="Optional for domestic flights"
                  />
                </div>
                
                <div className="form-group">
                  <label>Nationality *</label>
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                    placeholder="Enter nationality"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="form-actions">
            <button 
              onClick={handleSubmitPassengerDetails}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Pay and Complete Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerDetails;
