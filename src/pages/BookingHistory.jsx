import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingHistory.css';

function BookingHistory() {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  
  const navigate = useNavigate();

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = userData.Role;
        setIsAdmin(userRole === 'Admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user token for authentication
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');
        
        console.log('User token exists:', !!token);
        console.log('User data:', userData);
        
        if (!token) {
          setError('Please log in to view your bookings');
          navigate('/login');
          return;
        }

        console.log('Fetching user bookings...');
        const response = await fetch('http://localhost:5244/api/bookings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('userToken');
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }

        const bookings = await response.json();
        console.log('Fetched bookings:', bookings);
        setUserBookings(bookings || []);
        
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load booking history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [navigate]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleCancelBooking = (booking) => {
    try {
      // Parse the departure date
      const departureDate = new Date(booking.departureTime);
      const currentDate = new Date();
      
      // Reset time to midnight for date-only comparison
      const departureDateOnly = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      // Calculate the difference in days
      const timeDifference = departureDateOnly.getTime() - currentDateOnly.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
      console.log('Departure date:', departureDateOnly);
      console.log('Current date:', currentDateOnly);
      console.log('Days until departure:', daysDifference);
      
      if (daysDifference <= 2) {
        // Show error popup for cancellation within 2 days
        setCancelError('Sorry, you cannot cancel this booking. Tickets cannot be cancelled within 2 days of departure.');
        setShowCancelModal(true);
        setSelectedBooking(null);
      } else {
        // Show confirmation popup for valid cancellation
        setCancelError('');
        setSelectedBooking(booking);
        setShowCancelModal(true);
      }
    } catch (error) {
      console.error('Error processing cancellation:', error);
      setCancelError('Error processing cancellation request. Please try again.');
      setShowCancelModal(true);
      setSelectedBooking(null);
    }
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to cancel bookings');
        return;
      }

      console.log('Cancelling booking:', selectedBooking.bookingId);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Use the new request cancellation endpoint
      const response = await fetch(`http://localhost:5244/api/bookings/${selectedBooking.bookingId}/request-cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        
        if (response.status === 401) {
          setCancelError('Session expired. Please log in again.');
          localStorage.removeItem('userToken');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          return;
        } else if (response.status === 403) {
          setCancelError('You are not authorized to cancel this booking.');
          return;
        } else if (response.status === 404) {
          setCancelError('Booking not found. It may have already been cancelled.');
          return;
        } else {
          setCancelError(`Failed to cancel booking: ${response.status} - ${errorText}`);
          return;
        }
      }

      const result = await response.json();
      console.log('Cancellation request successful:', result);

      // Update the booking status in local state
      setUserBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.bookingId === selectedBooking.bookingId 
            ? { ...booking, status: 'RequestedToCancel' }
            : booking
        )
      );
      
      // Close the cancel modal and show refund confirmation
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelError('');
      setShowRefundModal(true);
      
      console.log('Booking cancelled successfully');
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setCancelError(`Failed to cancel booking: ${error.message}`);
    }
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
  };



  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelError('');
    setShowRefundModal(false);
  };

  if (loading) {
    return (
      <div className="booking-history-page">
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
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
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
            <div className="navbar-item active">
              <span className="navbar-icon">📋</span>
              My Bookings
            </div>
            {isAdmin && (
              <div className="navbar-item" onClick={() => handleNavigation('/admin')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">👨‍💼</span>
                Admin
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
      <div className="booking-history-content">
        <div className="booking-history-container">
          <div className="page-header">
            <h1>My Bookings</h1>
            <p>View and manage your flight reservations</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!error && userBookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">📋</div>
              <h3>No bookings found</h3>
              <p>You haven't made any flight bookings yet.</p>
              <button 
                className="search-flights-btn"
                onClick={() => handleNavigation('/home')}
              >
                Search Flights
              </button>
            </div>
          ) : (
            !error && (
              <div className="bookings-list">
                {userBookings.map((booking) => (
                  <div key={booking.bookingId} className="booking-card">
                    <div className="booking-header">
                      <div className="flight-info">
                        <h3>{booking.flight?.origin} → {booking.flight?.destination}</h3>
                        <p>Flight #{booking.flight?.id}</p>
                      </div>
                      <div className="booking-status">
                      <span className={`status ${(booking.status || '').toLowerCase().replace('requestedtocancel', 'requested')}`}>
                      {(booking.Status === 'RequestedToCancel' || booking.status === 'RequestedToCancel') ? 'Cancellation Requested' : 
                        (booking.Status === 'Refunded' || booking.status === 'Refunded') ? 'Refunded' :
                        (booking.Status === 'Cancelled' || booking.status === 'Cancelled') ? 'Cancelled' :
                        (booking.Status === 'Confirmed' || booking.status === 'Confirmed') ? 'Confirmed' : 'Unknown'}
                        </span>
                        <p className="booking-id">Booking #{booking.bookingId}</p>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-group">
                        <label>Flight Time</label>
                        <p>{formatDate(booking.departureTime)} - {formatDate(booking.arrivalTime)}</p>
                        <small>{booking.route}</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Seats</label>
                        <p>{booking.selectedSeats || 'N/A'}</p>
                        <small>{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Total Paid</label>
                        <p className="price">₹{parseFloat(booking.totalAmount || 0).toLocaleString()}</p>
                        <small>Booked on {formatDate(booking.ticketBookingDate)}</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Ticket Type</label>
                        <p>{booking.ticketType || 'Economy'}</p>
                        <small>Booking Time: {booking.ticketBookingTime || 'N/A'}</small>
                      </div>
                    </div>

                    <div className="booking-actions">
                    {(booking.status && booking.status.toLowerCase() === 'confirmed') && (
                          <button 
                            className="cancel-booking-btn"
                            onClick={() => handleCancelBooking(booking)}
                          >
                            Request Cancellation
                          </button>
                        )}
                      {booking.status === 'RequestedToCancel' && (
                        <div className="status-message">
                          <span className="status-icon">⏳</span>
                          <span>Cancellation request pending flight owner approval</span>
                        </div>
                      )}
                      {booking.status === 'Refunded' && (
                        <div className="status-message">
                          <span className="status-icon">✅</span>
                          <span>Refund processed - Check your payment method</span>
                        </div>
                      )}
                      {booking.status === 'Cancelled' && (
                        <div className="status-message">
                          <span className="status-icon">❌</span>
                          <span>Booking cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {cancelError ? (
              // Error Modal
              <>
                <div className="modal-header">
                  <h3>❌ Cannot Cancel Booking</h3>
                </div>
                <div className="modal-body">
                  <p>{cancelError}</p>
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeCancelModal}>
                    OK
                  </button>
                </div>
              </>
            ) : (
              // Confirmation Modal
              <>
                <div className="modal-header">
                  <h3>⚠️ Confirm Cancellation</h3>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to cancel this booking?</p>
                  {selectedBooking && (
                    <div className="booking-summary">
                      <p><strong>Flight:</strong> {selectedBooking.flight?.origin} → {selectedBooking.flight?.destination}</p>
                      <p><strong>Departure:</strong> {formatDate(selectedBooking.departureTime)}</p>
                      <p><strong>Booking ID:</strong> #{selectedBooking.bookingId}</p>
                      <p><strong>Amount:</strong> ₹{parseFloat(selectedBooking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="modal-btn secondary" onClick={closeCancelModal}>
                    No, Keep Booking
                  </button>
                  <button className="modal-btn primary" onClick={confirmCancelBooking}>
                    Yes, Cancel Booking
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✅ Cancellation Request Submitted</h3>
            </div>
            <div className="modal-body">
              <p>Your cancellation request has been submitted successfully.</p>
              <div className="refund-info">
                <div className="refund-icon">⏳</div>
                <h4>Next Steps</h4>
                <p>Your cancellation request is now pending approval from the flight owner.</p>
                <p className="refund-note">You will be notified once the flight owner reviews your request. If approved, the refund will be processed within 2-3 working days.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn primary" onClick={closeRefundModal}>
                OK, Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingHistory;
