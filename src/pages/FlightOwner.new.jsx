import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './FlightOwner.css';
import './Home.css'; // Import Home.css for navbar styles

function FlightOwner() {
  const [isFlightOwner, setIsFlightOwner] = useState(null);
  const [showAccessAlert, setShowAccessAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('flights'); // 'users', 'flights', 'bookings'
  
  // Data states
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightNames, setFlightNames] = useState({}); // Store flight names by flight ID
  const [flightTimings, setFlightTimings] = useState({}); // Store flight timings by flight ID
  const [seatAvailability, setSeatAvailability] = useState({}); // Store available seats by flight ID
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Search states
  const [flightSearch, setFlightSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Edit Flight Modal states
  const [editingFlight, setEditingFlight] = useState(null);
  const [editFormData, setEditFormData] = useState({
    origin: '',
    destination: '',
    price: ''
  });

  // Add Flight Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    origin: '',
    destination: '',
    price: ''
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
        
        if (userData.role !== 'Flightowner') {
          setIsFlightOwner(false);
          setShowAccessAlert(true);
        } else {
          setIsFlightOwner(true);
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

  // Load data when component mounts and user is confirmed as flight owner
  useEffect(() => {
    if (isFlightOwner && !loading) {
      console.log('Loading data for flight owner...');
      if (activeTab === 'flights') {
        loadFlights();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'bookings') {
        loadBookings();
      }
    }
  }, [isFlightOwner, loading, activeTab]);

  const loadFlights = async () => {
    setFlightsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data || []);
        
        // After loading flights, fetch additional data from bookings
        await loadFlightNames();
        await loadFlightTimings();
        await loadSeatAvailability();
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

  const loadFlightNames = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      console.log('Token for flight names:', token ? 'Token present' : 'No token');
      
      const response = await fetch('http://localhost:5244/api/Flights/names', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Flight names API response status:', response.status);

      if (response.ok) {
        const flightNamesData = await response.json();
        console.log('Flight names data:', flightNamesData);
        
        // Create a map of flight ID to flight name
        const flightNameMap = {};
        flightNamesData.forEach(item => {
          console.log('Processing flight name item:', item);
          
          const flightId = item.flightId || item.FlightId;
          const flightName = item.flightName || item.FlightName;
          
          if (flightId && flightName) {
            flightNameMap[flightId] = flightName;
            console.log(`Mapped flight ${flightId} to name ${flightName}`);
          }
        });
        
        console.log('Final flight name map:', flightNameMap);
        setFlightNames(flightNameMap);
      } else {
        console.error('Failed to load flight names:', response.status);
      }
    } catch (error) {
      console.error('Error loading flight names:', error);
    }
  };

  const loadFlightTimings = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5244/api/Bookings/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const bookings = await response.json();
        
        // Create a map of flight ID to timing information
        const timingMap = {};
        bookings.forEach(booking => {
          if (booking.flightId && booking.departureTime && booking.arrivalTime) {
            timingMap[booking.flightId] = {
              departure: booking.departureTime,
              arrival: booking.arrivalTime
            };
          }
        });
        
        setFlightTimings(timingMap);
      } else {
        console.error('Failed to load flight timings:', response.status);
      }
    } catch (error) {
      console.error('Error loading flight timings:', error);
    }
  };

  const loadSeatAvailability = async () => {
    console.log('=== Starting loadSeatAvailability ===');
    
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No token found for seat availability');
        return;
      }
      
      console.log('Token found, making API call to get bookings...');
      
      // Get all bookings
      const response = await fetch('http://localhost:5244/api/Bookings/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Bookings API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load bookings:', response.status, errorText);
        return;
      }

      const bookings = await response.json();
      console.log('All bookings received:', bookings);
      console.log('Number of bookings:', bookings.length);
      
      // Calculate seat availability for each flight
      const totalSeatsPerFlight = 120;
      const seatMap = {};
      
      // Count booked seats for each flight
      const bookedSeatsCount = {};
      
      bookings.forEach((booking, index) => {
        console.log(`Processing booking ${index + 1}:`, booking);
        
        if (booking.flightId && booking.selectedSeats) {
          const flightId = booking.flightId;
          const seatsString = booking.selectedSeats.toString().trim();
          
          if (seatsString) {
            const seats = seatsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
            console.log(`Flight ${flightId}: Found ${seats.length} seats: [${seats.join(', ')}]`);
            
            bookedSeatsCount[flightId] = (bookedSeatsCount[flightId] || 0) + seats.length;
            console.log(`Flight ${flightId}: Total booked seats so far: ${bookedSeatsCount[flightId]}`);
          }
        } else {
          console.log('Booking missing flightId or selectedSeats:', booking);
        }
      });
      
      console.log('Final booked seats count:', bookedSeatsCount);
      
      // Calculate available seats for ALL flights (including those without bookings)
      const currentFlights = flights.length > 0 ? flights : [];
      console.log('Current flights for seat calculation:', currentFlights);
      
      currentFlights.forEach(flight => {
        const bookedCount = bookedSeatsCount[flight.id] || 0;
        const availableSeats = Math.max(0, totalSeatsPerFlight - bookedCount);
        seatMap[flight.id] = availableSeats;
        console.log(`Flight ${flight.id}: ${bookedCount} booked → ${availableSeats} available (${totalSeatsPerFlight} total)`);
      });
      
      console.log('Final seat availability map:', seatMap);
      setSeatAvailability(seatMap);
      console.log('=== Seat availability updated ===');
      
    } catch (error) {
      console.error('Error in loadSeatAvailability:', error);
      console.error('Error stack:', error.stack);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
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

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Bookings/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
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

  const handleEditFlight = (flight) => {
    setEditingFlight(flight.id);
    setEditFormData({
      origin: flight.origin || '',
      destination: flight.destination || '',
      price: flight.price || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingFlight(null);
    setEditFormData({
      origin: '',
      destination: '',
      price: ''
    });
  };

  const handleUpdateFlight = async (flightId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5244/api/Flights/${flightId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        alert('Flight updated successfully!');
        setEditingFlight(null);
        setEditFormData({ origin: '', destination: '', price: '' });
        loadFlights(); // Reload the flights list
      } else {
        alert('Failed to update flight. Please try again.');
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      alert('Error updating flight. Please try again.');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`http://localhost:5244/api/Flights/${flightId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Flight deleted successfully!');
          loadFlights(); // Reload the flights list
        } else {
          alert('Failed to delete flight. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
        alert('Error deleting flight. Please try again.');
      }
    }
  };

  const handleAddFlight = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addFormData),
      });

      if (response.ok) {
        alert('Flight added successfully!');
        setShowAddModal(false);
        setAddFormData({ origin: '', destination: '', price: '' });
        loadFlights(); // Reload the flights list
      } else {
        alert('Failed to add flight. Please try again.');
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Error adding flight. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Filter functions
  const filteredFlights = flights.filter(flight =>
    !flightSearch || 
    flight.origin?.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.destination?.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.id?.toString().includes(flightSearch)
  );

  const filteredUsers = users.filter(user =>
    !userSearch || 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    !bookingSearch || 
    booking.bookingId?.toString().includes(bookingSearch) ||
    booking.flight?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    booking.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isFlightOwner) {
    return (
      <div className="page-container">
        <Navbar onLogout={handleLogout} />
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page. This page is only for flight owners.</p>
          <button onClick={() => navigate('/')} className="primary-btn">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar onLogout={handleLogout} />
      
      <div className="flight-owner-layout">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Flight Owner Dashboard</h3>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              User Management
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              <span className="nav-icon">✈️</span>
              Flight Management
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="nav-icon">🎫</span>
              Booking Management
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="content-section">
              <div className="section-header">
                <h2>👥 User Management</h2>
                <div className="section-actions">
                  <div className="search-controls">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              <div className="table-container">
                {usersLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name || 'N/A'}</td>
                            <td>{user.email || 'N/A'}</td>
                            <td>
                              <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                {user.role || 'N/A'}
                              </span>
                            </td>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div className="content-section">
              <div className="section-header">
                <h2>✈️ Flight Management</h2>
                <div className="section-actions">
                  <div className="search-controls">
                    <input
                      type="text"
                      placeholder="Search flights by origin, destination, or ID..."
                      value={flightSearch}
                      onChange={(e) => setFlightSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="primary-btn"
                  >
                    Add New Flight
                  </button>
                  <button 
                    onClick={loadFlights}
                    className="secondary-btn refresh-btn"
                    disabled={flightsLoading}
                  >
                    {flightsLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="table-container">
                {flightsLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading flights...</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Flight Name</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Price (₹)</th>
                        <th>Available Seats</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                            No flights found
                          </td>
                        </tr>
                      ) : (
                        filteredFlights.map((flight) => (
                          <tr key={flight.id}>
                            <td>{flight.id}</td>
                            <td>
                              <span style={{ 
                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)', 
                                color: 'white', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {flightNames[flight.id] || 'Loading...'}
                              </span>
                            </td>
                            <td>{flight.origin}</td>
                            <td>{flight.destination}</td>
                            <td>
                              {editingFlight === flight.id ? (
                                <input
                                  type="number"
                                  value={editFormData.price}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    price: e.target.value
                                  })}
                                  style={{
                                    width: '80px',
                                    padding: '4px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                  }}
                                />
                              ) : (
                                <span style={{ 
                                  background: '#e1f5fe', 
                                  padding: '4px 8px', 
                                  borderRadius: '4px', 
                                  fontWeight: 'bold',
                                  color: '#0277bd'
                                }}>
                                  ₹{flight.price ? flight.price.toLocaleString('en-IN') : 'N/A'}
                                </span>
                              )}
                            </td>
                            
                            {/* Available Seats */}
                            <td>
                              <span style={{ 
                                background: seatAvailability[flight.id] !== undefined && seatAvailability[flight.id] > 60 ? '#e8f5e8' : 
                                          seatAvailability[flight.id] !== undefined && seatAvailability[flight.id] > 30 ? '#fff3e0' : 
                                          seatAvailability[flight.id] !== undefined ? '#ffebee' : '#f8f9fa', 
                                color: seatAvailability[flight.id] !== undefined && seatAvailability[flight.id] > 60 ? '#2e7d32' : 
                                       seatAvailability[flight.id] !== undefined && seatAvailability[flight.id] > 30 ? '#f57c00' : 
                                       seatAvailability[flight.id] !== undefined ? '#c62828' : '#6c757d',
                                padding: '6px 10px', 
                                borderRadius: '4px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}>
                                {seatAvailability[flight.id] !== undefined ? `${seatAvailability[flight.id]} / 120` : 'Loading...'}
                              </span>
                            </td>
                            
                            {/* Departure Time */}
                            <td>
                              {flightTimings[flight.id] ? (
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{
                                    background: '#f3e5f5',
                                    color: '#7b1fa2',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    marginBottom: '2px'
                                  }}>
                                    {new Date(flightTimings[flight.id].departure).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div style={{
                                    fontSize: '10px',
                                    color: '#666',
                                    fontWeight: '500'
                                  }}>
                                    {new Date(flightTimings[flight.id].departure).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#999', fontSize: '12px' }}>No timing data</span>
                              )}
                            </td>
                            
                            {/* Arrival Time */}
                            <td>
                              {flightTimings[flight.id] ? (
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{
                                    background: '#e8f5e8',
                                    color: '#2e7d32',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    marginBottom: '2px'
                                  }}>
                                    {new Date(flightTimings[flight.id].arrival).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div style={{
                                    fontSize: '10px',
                                    color: '#666',
                                    fontWeight: '500'
                                  }}>
                                    {new Date(flightTimings[flight.id].arrival).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#999', fontSize: '12px' }}>No timing data</span>
                              )}
                            </td>
                            
                            <td>
                              <div className="action-buttons">
                                {editingFlight === flight.id ? (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateFlight(flight.id)}
                                      className="save-btn"
                                    >
                                      Save
                                    </button>
                                    <button 
                                      onClick={handleCancelEdit}
                                      className="cancel-btn"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleEditFlight(flight)}
                                      className="edit-btn"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteFlight(flight.id)}
                                      className="delete-btn"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="content-section">
              <div className="section-header">
                <h2>🎫 Booking Management</h2>
                <div className="section-actions">
                  <div className="search-controls">
                    <input
                      type="text"
                      placeholder="Search bookings by ID, flight, or user email..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <button 
                    onClick={loadBookings}
                    className="secondary-btn refresh-btn"
                    disabled={bookingsLoading}
                  >
                    {bookingsLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="table-container">
                {bookingsLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading bookings...</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Flight</th>
                        <th>User Email</th>
                        <th>Selected Seats</th>
                        <th>Passengers</th>
                        <th>Total Amount</th>
                        <th>Route</th>
                        <th>Booking Date</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                            No bookings found
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => (
                          <tr key={booking.bookingId}>
                            <td>
                              <span style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                #{booking.bookingId}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {booking.flight || 'N/A'}
                              </span>
                            </td>
                            <td>{booking.user?.email || 'N/A'}</td>
                            <td>
                              <span style={{
                                background: '#f3e5f5',
                                color: '#7b1fa2',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {booking.selectedSeats || 'N/A'}
                              </span>
                            </td>
                            <td>{booking.passengers || 'N/A'}</td>
                            <td>
                              <span style={{
                                background: '#e8f5e8',
                                color: '#2e7d32',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                ₹{booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </td>
                            <td>{booking.route || 'N/A'}</td>
                            <td>
                              {booking.ticketBookingDate ? 
                                new Date(booking.ticketBookingDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                            </td>
                            <td>
                              {booking.departureTime ? 
                                new Date(booking.departureTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                            </td>
                            <td>
                              {booking.arrivalTime ? 
                                new Date(booking.arrivalTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Flight Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Flight</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Origin:</label>
                <input
                  type="text"
                  value={addFormData.origin}
                  onChange={(e) => setAddFormData({
                    ...addFormData,
                    origin: e.target.value
                  })}
                  placeholder="Enter origin city"
                />
              </div>
              <div className="form-group">
                <label>Destination:</label>
                <input
                  type="text"
                  value={addFormData.destination}
                  onChange={(e) => setAddFormData({
                    ...addFormData,
                    destination: e.target.value
                  })}
                  placeholder="Enter destination city"
                />
              </div>
              <div className="form-group">
                <label>Price (₹):</label>
                <input
                  type="number"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData({
                    ...addFormData,
                    price: e.target.value
                  })}
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleAddFlight}
                className="primary-btn"
              >
                Add Flight
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightOwner;
