import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBookedSeats, createBooking } from '../api';
import './Bookings.css';

function Bookings() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState(1);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFlightOwner, setIsFlightOwner] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse booking params from URL
  const searchParams = new URLSearchParams(location.search);
  const flightId = searchParams.get('flightId');
  const price = searchParams.get('price');
  const passengerCount = parseInt(searchParams.get('passengers')) || 1;
  const originalDepartureDate = searchParams.get('departureDate');

  // Generate seat layout with persistent booking data
  const generateSeatLayout = async (flightId) => {
    const rows = 20; // 20 rows
    const seatLayout = [];
    
    try {
      // Get existing bookings for this flight from API
      const bookedSeats = await getBookedSeats(flightId);
      console.log('Booked seats from API:', bookedSeats);
      
      for (let row = 7; row <= rows + 6; row++) {
        const rowSeats = [];
        
        // Left side: A, B, C
        ['A', 'B', 'C'].forEach(seat => {
          const seatId = `${row}${seat}`;
          const isBooked = bookedSeats.includes(seatId);
          
          rowSeats.push({
            id: seatId,
            row,
            seat,
            type: seat === 'A' ? 'window' : seat === 'C' ? 'aisle' : 'middle',
            status: isBooked ? 'occupied' : 'available'
          });
        });
        
        // Aisle gap
        rowSeats.push({ id: `${row}-aisle`, type: 'aisle-gap' });
        
        // Right side: D, E, F
        ['D', 'E', 'F'].forEach(seat => {
          const seatId = `${row}${seat}`;
          const isBooked = bookedSeats.includes(seatId);
          
          rowSeats.push({
            id: seatId,
            row,
            seat,
            type: seat === 'D' ? 'aisle' : seat === 'F' ? 'window' : 'middle',
            status: isBooked ? 'occupied' : 'available'
          });
        });
        
        seatLayout.push({ rowNumber: row, seats: rowSeats });
      }
      
      return seatLayout;
    } catch (error) {
      console.error('Error fetching booked seats:', error);
      // Fallback: return all seats as available
      for (let row = 7; row <= rows + 6; row++) {
        const rowSeats = [];
        
        ['A', 'B', 'C'].forEach(seat => {
          const seatId = `${row}${seat}`;
          rowSeats.push({
            id: seatId,
            row,
            seat,
            type: seat === 'A' ? 'window' : seat === 'C' ? 'aisle' : 'middle',
            status: 'available'
          });
        });
        
        rowSeats.push({ id: `${row}-aisle`, type: 'aisle-gap' });
        
        ['D', 'E', 'F'].forEach(seat => {
          const seatId = `${row}${seat}`;
          rowSeats.push({
            id: seatId,
            row,
            seat,
            type: seat === 'D' ? 'aisle' : seat === 'F' ? 'window' : 'middle',
            status: 'available'
          });
        });
        
        seatLayout.push({ rowNumber: row, seats: rowSeats });
      }
      
      return seatLayout;
    }
  };

  const [seatLayout, setSeatLayout] = useState([]);

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      // If no token, redirect to login
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = userData.Role;
        setIsAdmin(userRole === 'Admin');
        setIsFlightOwner(userRole === 'Flightowner');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        setIsFlightOwner(false);
        // If there's an error parsing user data, redirect to login
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  useEffect(() => {
    // Load flight data from URL params or localStorage
    const loadFlightData = async () => {
      try {
        if (!flightId) {
          setError('No flight selected');
          setLoading(false);
          return;
        }

        // Try to get flight data from localStorage (passed from flights page)
        const selectedFlightData = localStorage.getItem('selectedFlightData');
        
        if (selectedFlightData) {
          const parsedFlightData = JSON.parse(selectedFlightData);
          setFlightData({
            id: flightId,
            airline: parsedFlightData.airline || 'Unknown Airline',
            flightNumber: parsedFlightData.flightNumber || 'XX0000',
            origin: parsedFlightData.origin || 'N/A',
            destination: parsedFlightData.destination || 'N/A',
            departureTime: parsedFlightData.departureTime || '00:00',
            arrivalTime: parsedFlightData.arrivalTime || '00:00',
            duration: parsedFlightData.duration || '0h 0m',
            price: price || parsedFlightData.price || '0'
          });
          
          // Don't clear the data immediately - keep it until booking is confirmed
          // localStorage.removeItem('selectedFlightData');
        } else {
          // If no flight data available, redirect to flights page
          navigate('/flights');
          return;
        }
        
        setPassengers(passengerCount);
        
        // Generate seat layout with current bookings
        const layout = await generateSeatLayout(flightId);
        setSeatLayout(layout);
      } catch (error) {
        console.error('Error loading flight data:', error);
        setError('Failed to load flight data');
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      loadFlightData();
    } else {
      setLoading(false);
    }
  }, [flightId, price, passengerCount]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'occupied') return;
    
    const seatId = seat.id;
    const isSelected = selectedSeats.includes(seatId);
    
    if (isSelected) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      // Select seat (limit to passenger count)
      if (selectedSeats.length < passengers) {
        setSelectedSeats(prev => [...prev, seatId]);
      }
    }
  };

  const getSeatClass = (seat) => {
    if (seat.type === 'aisle-gap') return 'aisle-gap';
    
    let classes = ['seat'];
    
    // Seat status
    if (seat.status === 'occupied') {
      classes.push('occupied');
    } else if (selectedSeats.includes(seat.id)) {
      classes.push('selected');
    } else {
      classes.push('available');
    }
    
    // Seat type
    classes.push(seat.type);
    
    return classes.join(' ');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length !== passengers) {
      alert(`Please select ${passengers} seat(s)`);
      return;
    }
    
    try {
      // Use the original departure date selected by user, or fall back to the flight's departure time
      let departureTime;
      if (originalDepartureDate) {
        // If user selected a specific date, use that date with a time
        const selectedDate = new Date(originalDepartureDate);
        selectedDate.setHours(10, 30, 0, 0); // Set to 10:30 AM as default time
        departureTime = selectedDate;
      } else if (flightData.departureTime) {
        // Use the flight's existing departure time
        departureTime = new Date(flightData.departureTime);
      } else {
        // Fallback: 2 hours from now
        departureTime = new Date(Date.now() + (2 * 60 * 60 * 1000));
      }
      
      // Calculate arrival time (3 hours after departure for this example)
      const arrivalTime = new Date(departureTime.getTime() + (3 * 60 * 60 * 1000));
      
      // Store flight and booking information for passenger details page
      const bookingInfo = {
        flightId: parseInt(flightId),
        flight: flightData.airline || 'Unknown Airline', // Use actual airline name from flight data
        route: `${flightData.origin} to ${flightData.destination}`,
        selectedSeats: selectedSeats.join(', '), // Convert array to comma-separated string
        passengers: passengers,
        totalAmount: parseFloat(price) * passengers,
        ticketType: 'Economy', // Default to Economy
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        origin: flightData.origin,
        destination: flightData.destination,
        price: parseFloat(price)
      };
      
      // Store booking info in localStorage for passenger details page
      localStorage.setItem('pendingBookingInfo', JSON.stringify(bookingInfo));
      
      // Navigate to passenger details page with selected seats
      const passengerParams = new URLSearchParams({
        flightId: flightId,
        passengers: passengers,
        seats: selectedSeats.join(', '),
        route: `${flightData.origin} to ${flightData.destination}`,
        totalAmount: parseFloat(price) * passengers,
        price: price,
        departureDate: originalDepartureDate || (() => {
          const today = new Date();
          return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        })() // Pass the departure date without timezone issues
      });
      
      navigate(`/passenger-details?${passengerParams.toString()}`);
      
    } catch (error) {
      console.error('Error preparing booking:', error);
      alert(`❌ Error preparing booking!\n\n${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="logo-icon">✈️</span>
              <span className="logo-text">SimplyFly</span>
              <span className="logo-subtitle">Fly Like A Bird</span>
            </div>
          </div>
        </nav>
        
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="logo-icon">✈️</span>
              <span className="logo-text">SimplyFly</span>
              <span className="logo-subtitle">Fly Like A Bird</span>
            </div>
          </div>
        </nav>
        
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <h2>Booking Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/flights')} className="retry-btn">
              Back to Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">✈️</span>
            <span className="logo-text">SimplyFly</span>
            <span className="logo-subtitle">Fly Like A Bird</span>
          </div>

          <div className="navbar-menu">
            <div className="navbar-item" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="navbar-icon">🎯</span>
              Home
            </div>
            <div className="navbar-item" onClick={() => handleNavigation('/flights')} style={{ cursor: 'pointer' }}>
              <span className="navbar-icon">✈️</span>
              Flights
            </div>
            {!isAdmin && !isFlightOwner && (
              <div className="navbar-item" onClick={() => handleNavigation('/my-bookings')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">📋</span>
                Bookings
              </div>
            )}
            {isAdmin && (
              <div className="navbar-item" onClick={() => handleNavigation('/admin')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">👨‍💼</span>
                Admin
              </div>
            )}
            {isFlightOwner && (
              <div className="navbar-item" onClick={() => handleNavigation('/flight-owner')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">🛫</span>
                Flight Owner
              </div>
            )}
          </div>

          <div className="navbar-auth">
            <button className="logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="booking-content">
        <div className="booking-container">
          
          {/* Flight Info Header */}
          <div className="flight-info-header">
            <div className="flight-route">
              <h2>{flightData?.origin} → {flightData?.destination}</h2>
              <div className="flight-details">
                <span>{flightData?.airline} {flightData?.flightNumber}</span>
                <span>•</span>
                <span>{flightData?.departureTime} - {flightData?.arrivalTime}</span>
                <span>•</span>
                <span>{flightData?.duration}</span>
              </div>
            </div>
            <div className="passenger-info">
              <span>{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
            </div>
          </div>

            {/* Seat Selection */}
          <div className="seat-selection-section">
            <h3>Select your seats</h3>
            <div className="seat-selection-info">
              <div>
                <p>Selected: {selectedSeats.length}/{passengers} seats</p>
                <small style={{ color: '#6b7280', fontSize: '14px' }}>
                  Available seats: {seatLayout.reduce((count, row) => {
                    return count + row.seats.filter(seat => seat.type !== 'aisle-gap' && seat.status === 'available').length;
                  }, 0)}
                </small>
              </div>
              
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="seat available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="seat selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="seat occupied"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>            {/* Aircraft Layout */}
            <div className="aircraft-container">
              {/* Aircraft Nose */}
              <div className="aircraft-nose">
                <div className="nose-shape"></div>
              </div>

              {/* Seat Map */}
              <div className="seat-map">
                {/* Column Headers */}
                <div className="seat-headers">
                  <div className="header-row">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span className="aisle-space"></span>
                    <span>D</span>
                    <span>E</span>
                    <span>F</span>
                  </div>
                </div>

                {/* Seat Rows */}
                <div className="seat-rows">
                  {seatLayout.map((row) => (
                    <div key={row.rowNumber} className="seat-row">
                      <div className="row-number">{row.rowNumber}</div>
                      <div className="seats">
                        {row.seats.map((seat, index) => (
                          seat.type === 'aisle-gap' ? (
                            <div key={seat.id} className="aisle-gap"></div>
                          ) : (
                            <div
                              key={seat.id}
                              className={getSeatClass(seat)}
                              onClick={() => handleSeatClick(seat)}
                              title={`Seat ${seat.id} - ${seat.status}`}
                            >
                              {seat.seat}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exit Indicators */}
              <div className="exit-indicators">
                <div className="exit-left">EXIT</div>
                <div className="exit-right">EXIT</div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary">
            <div className="summary-header">
              <h3>Booking Summary</h3>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Flight:</span>
                <span>{flightData?.airline} {flightData?.flightNumber}</span>
              </div>
              <div className="summary-row">
                <span>Route:</span>
                <span>{flightData?.origin} → {flightData?.destination}</span>
              </div>
              <div className="summary-row">
                <span>Selected Seats:</span>
                <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</span>
              </div>
              <div className="summary-row">
                <span>Passengers:</span>
                <span>{passengers}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{(parseFloat(flightData?.price || 0) * passengers).toLocaleString()}</span>
              </div>
            </div>

            <div className="booking-actions">
              <button 
                className="back-btn" 
                onClick={() => navigate(-1)}
              >
                Back to Flights
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length !== passengers}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookings;
