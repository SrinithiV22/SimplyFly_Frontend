import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightOwnerRefunds.css';

function FlightOwnerRefunds() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = userData.Role;
        if (userRole !== 'Flightowner') {
          navigate('/home');
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/home');
        return false;
      }
    };

    if (checkUserRole()) {
      fetchCancellationRequests();
    }
  }, [navigate]);

  const fetchCancellationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to view refund requests');
        navigate('/login');
        return;
      }

      // Get all bookings and filter for RequestedToCancel status
      const response = await fetch('http://localhost:5244/api/Admin/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const allBookings = await response.json();
      // Filter for cancellation requests
      const cancellationRequests = allBookings.filter(booking => 
        booking.status === 'RequestedToCancel'
      );
      
      setBookings(cancellationRequests || []);
      
    } catch (error) {
      console.error('Error fetching cancellation requests:', error);
      setError('Failed to load cancellation requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this refund? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingRefund(bookingId);
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`http://localhost:5244/api/FlightOwner/bookings/${bookingId}/approve-refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve refund');
      }

      const result = await response.json();
      alert(`Refund approved successfully! Amount: ₹${result.refundAmount?.toLocaleString('en-IN')}`);
      
      // Remove from local state
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.bookingId !== bookingId)
      );
      
    } catch (error) {
      console.error('Error approving refund:', error);
      alert(`Error approving refund: ${error.message}`);
    } finally {
      setProcessingRefund(null);
    }
  };

  const handleRejectRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this refund request?')) {
      return;
    }

    try {
      setProcessingRefund(bookingId);
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`http://localhost:5244/api/FlightOwner/bookings/${bookingId}/reject-refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject refund');
      }

      alert('Refund request rejected successfully');
      
      // Remove from local state
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.bookingId !== bookingId)
      );
      
    } catch (error) {
      console.error('Error rejecting refund:', error);
      alert(`Error rejecting refund: ${error.message}`);
    } finally {
      setProcessingRefund(null);
    }
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
      return 'Invalid Date';
    }
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

  if (loading) {
    return (
      <div className="refunds-page">
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
            <p>Loading refund requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="refunds-page">
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
            <div className="navbar-item" onClick={() => handleNavigation('/flightowner')} style={{ cursor: 'pointer' }}>
              <span className="navbar-icon">✈️</span>
              Dashboard
            </div>
            <div className="navbar-item active">
              <span className="navbar-icon">💰</span>
              Refund Requests
            </div>
          </div>

          <div className="navbar-auth">
            <button className="logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="refunds-content">
        <div className="refunds-container">
          <div className="page-header">
            <h1>Refund Requests</h1>
            <p>Manage cancellation requests and process refunds</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchCancellationRequests}
              >
                Try Again
              </button>
            </div>
          )}

          {!error && bookings.length === 0 ? (
            <div className="no-requests">
              <div className="no-requests-icon">💰</div>
              <h3>No refund requests</h3>
              <p>There are currently no pending cancellation requests.</p>
              <button 
                className="refresh-btn"
                onClick={fetchCancellationRequests}
              >
                Refresh
              </button>
            </div>
          ) : (
            !error && (
              <div className="requests-list">
                {bookings.map((booking) => (
                  <div key={booking.bookingId} className="request-card">
                    <div className="request-header">
                      <div className="flight-info">
                        <h3>{booking.flightOrigin || booking.route?.split(' → ')[0]} → {booking.flightDestination || booking.route?.split(' → ')[1]}</h3>
                        <p>Booking #{booking.bookingId}</p>
                      </div>
                      <div className="request-status">
                        <span className="status requested">Cancellation Requested</span>
                        <p className="request-date">Requested: {formatDate(booking.updatedAt || booking.bookingDate)}</p>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-group">
                        <label>Customer</label>
                        <p>{booking.userName || 'N/A'}</p>
                        <small>{booking.userEmail || 'N/A'}</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Flight Time</label>
                        <p>{formatDate(booking.departureTime)} - {formatDate(booking.arrivalTime)}</p>
                        <small>{booking.route}</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Seats & Passengers</label>
                        <p>{booking.selectedSeats || booking.seatNumbers || 'N/A'}</p>
                        <small>{booking.passengers || booking.passengerCount || 0} passenger(s)</small>
                      </div>
                      
                      <div className="detail-group">
                        <label>Refund Amount</label>
                        <p className="refund-amount">₹{parseFloat(booking.totalAmount || 0).toLocaleString()}</p>
                        <small>Original booking amount</small>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectRefund(booking.bookingId)}
                        disabled={processingRefund === booking.bookingId}
                      >
                        {processingRefund === booking.bookingId ? 'Processing...' : 'Reject Request'}
                      </button>
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveRefund(booking.bookingId)}
                        disabled={processingRefund === booking.bookingId}
                      >
                        {processingRefund === booking.bookingId ? 'Processing...' : 'Approve Refund'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default FlightOwnerRefunds;
