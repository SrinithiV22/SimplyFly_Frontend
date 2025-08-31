import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightOwner.css';

function FlightOwner() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFlightOwner, setIsFlightOwner] = useState(null);
  const [showAccessAlert, setShowAccessAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Data states
  const [flights, setFlights] = useState([]);
  const [flightDetails, setFlightDetails] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Loading states
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightDetailsLoading, setFlightDetailsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Search states
  const [flightSearch, setFlightSearch] = useState('');
  const [flightDetailSearch, setFlightDetailSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Flight Detail Form states
  const [showFlightDetailForm, setShowFlightDetailForm] = useState(false);
  const [editingFlightDetail, setEditingFlightDetail] = useState(null);
  const [flightDetailForm, setFlightDetailForm] = useState({
    flightId: '',
    flightName: '',
    baggageInfo: '',
    numberOfSeats: '',
    departureTime: '',
    arrivalTime: '',
    fare: ''
  });

  const navigate = useNavigate();

  // Check flight owner role on component mount
  useEffect(() => {
    const checkFlightOwnerRole = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        let userData = JSON.parse(localStorage.getItem('userData') || '{}');
        console.log('🔍 Checking user data:', userData);
        console.log('🔍 Available keys:', Object.keys(userData));
        console.log('🔍 User ID field:', userData.Id);
        console.log('🔍 User role field:', userData.Role);
        
        const userRole = userData.Role;
        const userId = userData.Id;
        console.log('User role:', userRole, 'User ID:', userId);
        
        if (userRole === 'Flightowner') {
          console.log('Access granted - user is Flight Owner');
          setIsFlightOwner(true);
          setCurrentUser(userData);
          await loadDashboardData(userId);
        } else {
          console.log('Access denied - user role is:', userRole);
          setIsFlightOwner(false);
          setShowAccessAlert(true);
        }
      } catch (error) {
        console.error('Error checking flight owner role:', error);
        setIsFlightOwner(false);
        setShowAccessAlert(true);
      } finally {
        setLoading(false);
      }
    };

    checkFlightOwnerRole();
  }, [navigate]);

  // Load dashboard data from APIs
  const loadDashboardData = async (userId) => {
    await Promise.all([
      loadFlights(),
      loadFlightDetails(userId),
      loadBookings(userId)
    ]);
  };

  const loadFlights = async () => {
    setFlightsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('🛫 Loading flights for flight owner...');
      
      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✈️ Flights loaded:', data);
        setFlights(data || []);
      } else {
        console.error('Failed to load flights:', response.status);
        setFlights([]);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      setFlights([]);
    } finally {
      setFlightsLoading(false);
    }
  };

  const loadFlightDetails = async (userId) => {
    setFlightDetailsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const ownerUserId = userId || currentUser?.Id;
      console.log('🛫 Loading flight details for owner ID:', ownerUserId);
      
      // This would be an API endpoint to get flight details by owner
      const response = await fetch(`http://localhost:5244/api/FlightOwner/flight-details/${ownerUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Flight details loaded:', data);
        setFlightDetails(data || []);
      } else {
        console.error('Failed to load flight details:', response.status);
        setFlightDetails([]);
      }
    } catch (error) {
      console.error('Error loading flight details:', error);
      setFlightDetails([]);
    } finally {
      setFlightDetailsLoading(false);
    }
  };

  const loadBookings = async (userId) => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const ownerUserId = userId || currentUser?.Id;
      console.log('📋 Loading bookings for flight owner:', ownerUserId);
      
      // This would be an API endpoint to get bookings for this flight owner's flights
      const response = await fetch(`http://localhost:5244/api/FlightOwner/bookings/${ownerUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Bookings loaded:', data);
        setBookings(data || []);
      } else {
        console.error('Failed to load bookings:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleAccessAlertClose = () => {
    setShowAccessAlert(false);
    navigate('/home', { replace: true });
  };

  // Flight Detail CRUD Operations
  const handleAddFlightDetail = () => {
    console.log('🚀 Opening Add Flight Detail form...');
    setEditingFlightDetail(null);
    setFlightDetailForm({
      flightId: '',
      flightName: '',
      baggageInfo: '',
      numberOfSeats: '',
      departureTime: '',
      arrivalTime: '',
      fare: ''
    });
    console.log('🔄 Form state reset:', {
      flightId: '',
      flightName: '',
      baggageInfo: '',
      numberOfSeats: '',
      departureTime: '',
      arrivalTime: '',
      fare: ''
    });
    setShowFlightDetailForm(true);
  };

  const handleEditFlightDetail = (flightDetail) => {
    setEditingFlightDetail(flightDetail.flightDetailId);
    setFlightDetailForm({
      flightId: flightDetail.flightId,
      flightName: flightDetail.flightName,
      baggageInfo: flightDetail.baggageInfo || '',
      numberOfSeats: flightDetail.numberOfSeats,
      departureTime: flightDetail.departureTime?.slice(0, 16) || '', // Format for datetime-local
      arrivalTime: flightDetail.arrivalTime?.slice(0, 16) || '',
      fare: flightDetail.fare
    });
    setShowFlightDetailForm(true);
  };

  const handleSubmitFlightDetail = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.Id || currentUser?.Id;
      
      console.log('🚀 Submitting flight detail with userId:', userId);
      console.log('📋 Current user data:', userData);
      console.log('🔐 Token exists:', !!token);
      
      if (!userId) {
        alert('Error: User ID not found. Please log in again.');
        return;
      }
      
      const url = editingFlightDetail 
        ? `http://localhost:5244/api/FlightOwner/flight-details/${editingFlightDetail}`
        : 'http://localhost:5244/api/FlightOwner/flight-details';
      
      const method = editingFlightDetail ? 'PUT' : 'POST';
      
      const formData = {
        ...flightDetailForm,
        flightOwnerId: userId,
        numberOfSeats: parseInt(flightDetailForm.numberOfSeats),
        fare: parseFloat(flightDetailForm.fare),
        departureTime: new Date(flightDetailForm.departureTime).toISOString(),
        arrivalTime: new Date(flightDetailForm.arrivalTime).toISOString()
      };

      console.log('📦 Sending form data:', formData);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingFlightDetail ? 'Flight detail updated successfully!' : 'Flight detail added successfully!');
        setShowFlightDetailForm(false);
        loadFlightDetails();
      } else {
        const errorData = await response.json();
        alert(`Failed to save flight detail: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving flight detail:', error);
      alert('Error saving flight detail. Please try again.');
    }
  };

  const handleDeleteFlightDetail = async (flightDetailId) => {
    if (!window.confirm('Are you sure you want to delete this flight detail?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5244/api/FlightOwner/flight-details/${flightDetailId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Flight detail deleted successfully!');
        loadFlightDetails();
      } else {
        alert('Failed to delete flight detail. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting flight detail:', error);
      alert('Error deleting flight detail. Please try again.');
    }
  };

  // Filter functions
  const filteredFlights = flights.filter(flight =>
    (flight.origin || '').toLowerCase().includes(flightSearch.toLowerCase()) ||
    (flight.destination || '').toLowerCase().includes(flightSearch.toLowerCase())
  );

  const filteredFlightDetails = flightDetails.filter(detail =>
    (detail.flightName || '').toLowerCase().includes(flightDetailSearch.toLowerCase()) ||
    (detail.baggageInfo || '').toLowerCase().includes(flightDetailSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    (booking.bookingId ? booking.bookingId.toString().includes(bookingSearch) : false) ||
    (booking.userName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.flightName || '').toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flightowner-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking flight owner privileges...</p>
        </div>
      </div>
    );
  }

  // Access Alert Modal
  if (showAccessAlert) {
    return (
      <div className="flightowner-alert-overlay">
        <div className="flightowner-alert-modal">
          <div className="alert-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>You don't have flight owner privileges to access this dashboard.</p>
          <p>Please logout and login with flight owner credentials to continue.</p>
          <div className="alert-actions">
            <button className="alert-btn primary" onClick={handleLogout}>
              Logout & Login as Flight Owner
            </button>
            <button className="alert-btn secondary" onClick={handleAccessAlertClose}>
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isFlightOwner) {
    return null;
  }

  return (
    <div className="flightowner-dashboard">
      {/* Navigation Bar */}
      <nav className="flightowner-navbar" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">✈️</span>
            <span className="logo-text">SimplyFly Flight Owner</span>
            <span className="logo-subtitle">Manage Your Flights</span>
          </div>

          <div className="navbar-auth">
            <span className="flightowner-badge">🛫 Flight Owner</span>
            <button className="flightowner-logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Add padding to the container to account for fixed navbar */}
      <div className="flightowner-container" style={{ paddingTop: '80px' }}>
        {/* Sidebar */}
        <div className="flightowner-sidebar">
          <div className="sidebar-menu">
            <div 
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="sidebar-icon">📊</span>
              Overview
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              <span className="sidebar-icon">✈️</span>
              All Flights
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'flight-details' ? 'active' : ''}`}
              onClick={() => setActiveTab('flight-details')}
            >
              <span className="sidebar-icon">📋</span>
              My Flight Details
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="sidebar-icon">🎫</span>
              Bookings
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flightowner-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h1>Flight Owner Dashboard Overview</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">✈️</div>
                  <div className="stat-info">
                    <h3>{flights.length}</h3>
                    <p>Total Flights</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-info">
                    <h3>{flightDetails.length}</h3>
                    <p>My Flight Details</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-info">
                    <h3>{bookings.length}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>₹{bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0).toLocaleString('en-IN')}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Dashboard Status</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">✈️</span>
                    <span>Flights loaded: {flights.length} records</span>
                    <span className="activity-time">{flightsLoading ? 'Loading...' : 'Ready'}</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">📋</span>
                    <span>Flight details: {flightDetails.length} records</span>
                    <span className="activity-time">{flightDetailsLoading ? 'Loading...' : 'Ready'}</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🎫</span>
                    <span>Bookings: {bookings.length} records</span>
                    <span className="activity-time">{bookingsLoading ? 'Loading...' : 'Ready'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Flights Tab */}
          {activeTab === 'flights' && (
            <div className="flights-section">
              <div className="section-header">
                <h1>All Flights</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={flightSearch}
                    onChange={(e) => setFlightSearch(e.target.value)}
                    className="search-input"
                  />
                  <button className="refresh-btn" onClick={loadFlights} disabled={flightsLoading}>
                    {flightsLoading ? '⟳' : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {flightsLoading ? (
                <div className="loading-state">Loading flights...</div>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Price (₹)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.length > 0 ? (
                        filteredFlights.map((flight, index) => (
                          <tr key={flight.id || index}>
                            <td>{flight.id || 'N/A'}</td>
                            <td>
                              <span style={{ 
                                background: '#e8f5e8', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: '#2e7d32'
                              }}>
                                {flight.origin || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#fff3e0', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: '#f57c00'
                              }}>
                                {flight.destination || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#e1f5fe', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: '#0277bd'
                              }}>
                                ₹{flight.price ? flight.price.toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="add-detail-btn"
                                onClick={() => {
                                  setFlightDetailForm(prev => ({ ...prev, flightId: flight.id }));
                                  handleAddFlightDetail();
                                }}
                                title="Add Flight Detail"
                              >
                                ➕ Add Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            {flights.length === 0 ? 'No flights found' : 'No flights match your search criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Flight Details Tab */}
          {activeTab === 'flight-details' && (
            <div className="flight-details-section">
              <div className="section-header">
                <h1>My Flight Details</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search flight details..."
                    value={flightDetailSearch}
                    onChange={(e) => setFlightDetailSearch(e.target.value)}
                    className="search-input"
                  />
                  <button className="add-btn" onClick={handleAddFlightDetail}>
                    ➕ Add Flight Detail
                  </button>
                  <button className="refresh-btn" onClick={loadFlightDetails} disabled={flightDetailsLoading}>
                    {flightDetailsLoading ? '⟳' : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {flightDetailsLoading ? (
                <div className="loading-state">Loading flight details...</div>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Flight Name</th>
                        <th>Route</th>
                        <th>Seats</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Fare (₹)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlightDetails.length > 0 ? (
                        filteredFlightDetails.map((detail, index) => (
                          <tr key={detail.flightDetailId || index}>
                            <td>{detail.flightDetailId || 'N/A'}</td>
                            <td>{detail.flightName || 'N/A'}</td>
                            <td>{detail.flightRoute || 'N/A'}</td>
                            <td>{detail.numberOfSeats || 'N/A'}</td>
                            <td>{detail.departureTime ? new Date(detail.departureTime).toLocaleString() : 'N/A'}</td>
                            <td>{detail.arrivalTime ? new Date(detail.arrivalTime).toLocaleString() : 'N/A'}</td>
                            <td>₹{detail.fare ? detail.fare.toLocaleString('en-IN') : 'N/A'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEditFlightDetail(detail)}
                                  title="Edit Flight Detail"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDeleteFlightDetail(detail.flightDetailId)} 
                                  title="Delete Flight Detail"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            {flightDetails.length === 0 ? 'No flight details found' : 'No flight details match your search criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <div className="section-header">
                <h1>Flight Bookings</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="search-input"
                  />
                  <button className="refresh-btn" onClick={loadBookings} disabled={bookingsLoading}>
                    {bookingsLoading ? '⟳' : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="loading-state">Loading bookings...</div>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Flight</th>
                        <th>Passengers</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <tr key={booking.bookingId || index}>
                            <td>#{booking.bookingId || 'N/A'}</td>
                            <td>{booking.userName || 'N/A'}</td>
                            <td>{booking.flightName || 'N/A'}</td>
                            <td>{booking.passengerCount || 0}</td>
                            <td>₹{booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'N/A'}</td>
                            <td>
                              <span className={`status-badge ${(booking.status || 'confirmed').toLowerCase()}`}>
                                {booking.status || 'Confirmed'}
                              </span>
                            </td>
                            <td>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            {bookings.length === 0 ? 'No bookings found' : 'No bookings match your search criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flight Detail Form Modal */}
      {showFlightDetailForm && (
        <div className="modal-overlay" onClick={() => setShowFlightDetailForm(false)}>
          <div className="modal-content flight-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFlightDetail ? 'Edit Flight Detail' : 'Add Flight Detail'}</h3>
              <button className="close-btn" onClick={() => setShowFlightDetailForm(false)}>×</button>
            </div>
            <form key={`form-${showFlightDetailForm}-${Date.now()}`} onSubmit={handleSubmitFlightDetail} className="flight-detail-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Flight</label>
                  <select 
                    value={flightDetailForm.flightId} 
                    onChange={(e) => setFlightDetailForm(prev => ({ ...prev, flightId: e.target.value }))}
                    required
                  >
                    <option value="">Select Flight</option>
                    {flights.map(flight => (
                      <option key={flight.id} value={flight.id}>
                        {flight.origin} → {flight.destination} (₹{flight.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Flight Name</label>
                  <input 
                    type="text"
                    value={flightDetailForm.flightName}
                    onChange={(e) => {
                      console.log('🎯 Flight Name input changed:', e.target.value);
                      setFlightDetailForm(prev => ({ ...prev, flightName: e.target.value }));
                    }}
                    placeholder="e.g., SpiceJet SG-123"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Number of Seats</label>
                  <input 
                    type="number"
                    value={flightDetailForm.numberOfSeats}
                    onChange={(e) => {
                      console.log('🪑 Number of Seats changed:', e.target.value);
                      setFlightDetailForm(prev => ({ ...prev, numberOfSeats: e.target.value }));
                    }}
                    placeholder="180"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fare (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={flightDetailForm.fare}
                    onChange={(e) => {
                      console.log('💰 Fare changed:', e.target.value);
                      setFlightDetailForm(prev => ({ ...prev, fare: e.target.value }));
                    }}
                    placeholder="5000.00"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Departure Time</label>
                  <input 
                    type="datetime-local"
                    value={flightDetailForm.departureTime}
                    onChange={(e) => setFlightDetailForm(prev => ({ ...prev, departureTime: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Arrival Time</label>
                  <input 
                    type="datetime-local"
                    value={flightDetailForm.arrivalTime}
                    onChange={(e) => setFlightDetailForm(prev => ({ ...prev, arrivalTime: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Baggage Information</label>
                  <textarea 
                    value={flightDetailForm.baggageInfo}
                    onChange={(e) => setFlightDetailForm(prev => ({ ...prev, baggageInfo: e.target.value }))}
                    placeholder="Carry-on: 7kg, Check-in: 15kg"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowFlightDetailForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingFlightDetail ? 'Update' : 'Add'} Flight Detail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightOwner;
