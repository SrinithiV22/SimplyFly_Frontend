import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightOwner.css';

function FlightOwner() {
  const [activeTab, setActiveTab] = useState('users');
  const [isFlightOwner, setIsFlightOwner] = useState(null);
  const [showAccessAlert, setShowAccessAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Loading states
  const [usersLoading, setUsersLoading] = useState(false);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [flightSearch, setFlightSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Add Flight Modal states
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [addFlightForm, setAddFlightForm] = useState({
    flightName: '',
    origin: '',
    destination: '',
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
        
        const userRole = userData.Role;
        console.log('User role:', userRole);
        
        if (userRole === 'Flightowner') {
          console.log('Access granted - user is Flight Owner');
          setIsFlightOwner(true);
          // Load initial data
          loadUsers();
          loadFlights();
          loadBookings();
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

  // Load data when tab changes
  useEffect(() => {
    if (isFlightOwner) {
      if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'flights') {
        loadFlights();
      } else if (activeTab === 'bookings') {
        loadBookings();
      }
    }
  }, [isFlightOwner, activeTab]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('👥 Loading users...');
      
      const response = await fetch('http://localhost:5244/api/Admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👥 Users loaded:', data);
        setUsers(data || []);
      } else {
        console.error('Failed to load users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadFlights = async () => {
    setFlightsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('✈️ Loading flights...');
      
      // Load both flights and bookings to calculate available seats
      const [flightsResponse, bookingsResponse] = await Promise.all([
        fetch('http://localhost:5244/api/Admin/flights', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:5244/api/Admin/bookings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (flightsResponse.ok && bookingsResponse.ok) {
        const flightsData = await flightsResponse.json();
        const bookingsData = await bookingsResponse.json();
        
        console.log('✈️ Flights data:', flightsData);
        console.log('📋 Bookings data:', bookingsData);
        
        // Calculate available seats for each flight
        const flightsWithSeats = flightsData.map(flight => {
          const flightBookings = bookingsData.filter(booking => booking.flightId === flight.id);
          const totalBooked = flightBookings.reduce((sum, booking) => sum + (booking.passengerCount || 1), 0);
          const availableSeats = 120 - totalBooked;
          
          return {
            ...flight,
            totalSeats: 120,
            bookedSeats: totalBooked,
            availableSeats: Math.max(0, availableSeats)
          };
        });
        
        setFlights(flightsWithSeats);
      } else {
        console.error('Failed to load flights or bookings');
        setFlights([]);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      setFlights([]);
    } finally {
      setFlightsLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('📋 Loading bookings...');
      
      const response = await fetch('http://localhost:5244/api/Admin/bookings', {
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

  const handleAddFlight = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const formData = {
        ...addFlightForm,
        flightOwnerId: userData.Id,
        numberOfSeats: 120, // Default to 120 seats
        fare: parseFloat(addFlightForm.fare),
        departureTime: new Date(addFlightForm.departureTime).toISOString(),
        arrivalTime: new Date(addFlightForm.arrivalTime).toISOString()
      };

      console.log('📦 Adding new flight:', formData);

      const response = await fetch('http://localhost:5244/api/FlightOwner/flight-details', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Flight added successfully!');
        setShowAddFlightModal(false);
        setAddFlightForm({
          flightName: '',
          origin: '',
          destination: '',
          departureTime: '',
          arrivalTime: '',
          fare: ''
        });
        loadFlights(); // Reload flights
      } else {
        const errorData = await response.json();
        alert(`Failed to add flight: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Error adding flight. Please try again.');
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

  // Filter functions
  const filteredUsers = users.filter(user =>
    (user.firstName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.lastName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFlights = flights.filter(flight =>
    (flight.flightName || '').toLowerCase().includes(flightSearch.toLowerCase()) ||
    (flight.origin || '').toLowerCase().includes(flightSearch.toLowerCase()) ||
    (flight.destination || '').toLowerCase().includes(flightSearch.toLowerCase())
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
            <span className="logo-subtitle">Manage Your Operations</span>
          </div>

          <div className="navbar-auth">
            <span className="flightowner-badge">🛫 Flight Owner</span>
            <button className="flightowner-logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flightowner-container" style={{ paddingTop: '80px' }}>
        {/* Sidebar */}
        <div className="flightowner-sidebar">
          <div className="sidebar-menu">
            <div 
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="sidebar-icon">👥</span>
              User Management
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              <span className="sidebar-icon">✈️</span>
              Flight Management
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="sidebar-icon">🎫</span>
              Booking Management
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flightowner-content">
          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h1>User Management</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="search-input"
                  />
                  <button className="refresh-btn" onClick={loadUsers} disabled={usersLoading}>
                    {usersLoading ? '⟳' : '🔄'} Refresh
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <div className="loading-state">Loading users...</div>
              ) : (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id || index}>
                            <td>{user.id || 'N/A'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  background: '#3498db', 
                                  padding: '4px 8px', 
                                  borderRadius: '50%', 
                                  fontWeight: 'bold',
                                  color: 'white',
                                  minWidth: '32px',
                                  textAlign: 'center'
                                }}>
                                  {(user.firstName || user.email || '?')[0].toUpperCase()}
                                </span>
                                <span>
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}` 
                                    : user.firstName || user.lastName || 'N/A'
                                  }
                                </span>
                              </div>
                            </td>
                            <td>{user.email || 'N/A'}</td>
                            <td>
                              <span style={{ 
                                background: user.role === 'Admin' ? '#e74c3c' : 
                                          user.role === 'Flightowner' ? '#9b59b6' : '#27ae60',
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: '12px'
                              }}>
                                {user.role || 'User'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#27ae60', 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: '12px'
                              }}>
                                Active
                              </span>
                            </td>
                            <td>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                               user.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 
                               'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Flight Management Tab */}
          {activeTab === 'flights' && (
            <div className="flights-section">
              <div className="section-header">
                <h1>Flight Management</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={flightSearch}
                    onChange={(e) => setFlightSearch(e.target.value)}
                    className="search-input"
                  />
                  <button 
                    className="add-btn" 
                    onClick={() => setShowAddFlightModal(true)}
                    style={{
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ➕ Add New Flight
                  </button>
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
                        <th>Flight ID</th>
                        <th>Flight Name</th>
                        <th>Available Seats</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Departure Time</th>
                        <th>Arrival Time</th>
                        <th>Fare (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.length > 0 ? (
                        filteredFlights.map((flight, index) => (
                          <tr key={flight.id || index}>
                            <td>{flight.id || 'N/A'}</td>
                            <td>
                              <span style={{ 
                                background: '#3498db', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {flight.flightName || `Flight ${flight.id}`}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: flight.availableSeats > 50 ? '#27ae60' : 
                                          flight.availableSeats > 20 ? '#f39c12' : '#e74c3c',
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {flight.availableSeats || 120}/120
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#27ae60', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {flight.origin || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#e67e22', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {flight.destination || 'N/A'}
                              </span>
                            </td>
                            <td>{flight.departureTime ? new Date(flight.departureTime).toLocaleString() : 'N/A'}</td>
                            <td>{flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleString() : 'N/A'}</td>
                            <td>
                              <span style={{ 
                                background: '#9b59b6', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                ₹{flight.fare ? flight.fare.toLocaleString('en-IN') : flight.price ? flight.price.toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
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

          {/* Booking Management Tab */}
          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <div className="section-header">
                <h1>Booking Management</h1>
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
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th>Booking Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <tr key={booking.bookingId || index}>
                            <td>
                              <span style={{ 
                                background: '#3498db', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                #{booking.bookingId || 'N/A'}
                              </span>
                            </td>
                            <td>{booking.userName || booking.customerName || 'N/A'}</td>
                            <td>{booking.flightName || `Flight ${booking.flightId}` || 'N/A'}</td>
                            <td>
                              <span style={{ 
                                background: '#9b59b6', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                {booking.passengerCount || booking.passengers || 1}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#27ae60', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                color: 'white'
                              }}>
                                ₹{booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                background: '#27ae60', 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 'bold',
                                color: 'white',
                                fontSize: '12px'
                              }}>
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

      {/* Add Flight Modal */}
      {showAddFlightModal && (
        <div className="modal-overlay" onClick={() => setShowAddFlightModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Add New Flight</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAddFlightModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >×</button>
            </div>
            <form onSubmit={handleAddFlight}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Flight Name</label>
                  <input 
                    type="text"
                    value={addFlightForm.flightName}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, flightName: e.target.value }))}
                    placeholder="e.g., SpiceJet SG-123"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Fare (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={addFlightForm.fare}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, fare: e.target.value }))}
                    placeholder="5000.00"
                    min="0"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Origin</label>
                  <input 
                    type="text"
                    value={addFlightForm.origin}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="e.g., Delhi"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Destination</label>
                  <input 
                    type="text"
                    value={addFlightForm.destination}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="e.g., Mumbai"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Departure Time</label>
                  <input 
                    type="datetime-local"
                    value={addFlightForm.departureTime}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, departureTime: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Arrival Time</label>
                  <input 
                    type="datetime-local"
                    value={addFlightForm.arrivalTime}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, arrivalTime: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  <strong>Note:</strong> New flights will automatically have 120 total seats available.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddFlightModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '2px solid #ddd',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: '#3498db',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Flight
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
