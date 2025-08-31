import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightOwnerNew.css';

function FlightOwner() {
  const [isFlightOwner, setIsFlightOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('flights'); // 'users', 'flights', 'bookings'
  
  // Data states
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
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
    flightId: '',
    origin: '',
    destination: '',
    price: '',
    flightName: '',
    baggageInfo: '',
    numberOfSeats: 120,
    departureTime: '',
    arrivalTime: '',
    fare: ''
  });

  // Add Flight Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    origin: '',
    destination: '',
    price: '',
    flightName: '',
    baggageInfo: '',
    numberOfSeats: 120,
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
        console.log('Checking user data:', userData);
        
        const userRole = userData.Role || userData.role;
        console.log('User role:', userRole);
        
        if (userRole === 'FlightOwner' || userRole === 'flightowner') {
          console.log('Access granted - user is FlightOwner');
          setIsFlightOwner(true);
        } else {
          console.log('Access denied - user role is:', userRole);
          setIsFlightOwner(false);
        }
      } catch (error) {
        console.error('Error checking flight owner role:', error);
        setIsFlightOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkFlightOwnerRole();
  }, [navigate]);

  // Load data when component mounts and user is confirmed as flight owner
  useEffect(() => {
    if (isFlightOwner && !loading) {
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
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.userId || userData.UserId;
      
      if (!userId) {
        console.error('No userId found in userData');
        setFlightsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5244/api/FlightOwner/flight-details/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data || []);
        console.log('Flight details loaded:', data);
      } else {
        console.error('Failed to load flight details:', response.status);
        setFlights([]);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      setFlights([]);
    } finally {
      setFlightsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Auth/users', {
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
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.userId || userData.UserId;

      const response = await fetch(`http://localhost:5244/api/FlightOwner/bookings/${userId}`, {
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
    setEditingFlight(flight.flightDetailId);
    setEditFormData({
      flightId: flight.flightId || '',
      origin: flight.flightRoute ? flight.flightRoute.split(' → ')[0] : '',
      destination: flight.flightRoute ? flight.flightRoute.split(' → ')[1] : '',
      price: flight.flightPrice || '',
      flightName: flight.flightName || '',
      baggageInfo: flight.baggageInfo || '',
      numberOfSeats: flight.numberOfSeats || 120,
      departureTime: flight.departureTime ? new Date(flight.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: flight.arrivalTime ? new Date(flight.arrivalTime).toISOString().slice(0, 16) : '',
      fare: flight.fare || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingFlight(null);
    setEditFormData({
      flightId: '',
      origin: '',
      destination: '',
      price: '',
      flightName: '',
      baggageInfo: '',
      numberOfSeats: 120,
      departureTime: '',
      arrivalTime: '',
      fare: ''
    });
  };

  const handleUpdateFlight = async (flightDetailId) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Prepare the update data according to UpdateFlightDetailDto
      const updateData = {
        flightId: parseInt(editFormData.flightId),
        flightName: editFormData.flightName,
        baggageInfo: editFormData.baggageInfo,
        numberOfSeats: parseInt(editFormData.numberOfSeats),
        departureTime: new Date(editFormData.departureTime).toISOString(),
        arrivalTime: new Date(editFormData.arrivalTime).toISOString(),
        fare: parseFloat(editFormData.fare)
      };

      const response = await fetch(`http://localhost:5244/api/FlightOwner/flight-details/${flightDetailId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert('Flight updated successfully!');
        setEditingFlight(null);
        handleCancelEdit();
        loadFlights(); // Reload the flights list
      } else {
        const errorData = await response.json();
        alert(`Failed to update flight: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      alert('Error updating flight. Please try again.');
    }
  };

  const handleDeleteFlight = async (flightDetailId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
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
          alert('Flight deleted successfully!');
          loadFlights(); // Reload the flights list
        } else {
          const errorData = await response.json();
          alert(`Failed to delete flight: ${errorData.message || 'Please try again.'}`);
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
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.userId || userData.UserId;

      // First create the basic flight if it doesn't exist
      let flightId;
      
      // Try to find existing flight with same origin and destination
      const existingFlightResponse = await fetch('http://localhost:5244/api/Flights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (existingFlightResponse.ok) {
        const allFlights = await existingFlightResponse.json();
        const existingFlight = allFlights.find(f => 
          f.origin === addFormData.origin && 
          f.destination === addFormData.destination
        );
        
        if (existingFlight) {
          flightId = existingFlight.id;
        }
      }

      // If no existing flight found, create one
      if (!flightId) {
        const createFlightResponse = await fetch('http://localhost:5244/api/Flights', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: addFormData.origin,
            destination: addFormData.destination,
            price: parseFloat(addFormData.price)
          }),
        });

        if (createFlightResponse.ok) {
          const newFlight = await createFlightResponse.json();
          flightId = newFlight.id;
        } else {
          throw new Error('Failed to create basic flight');
        }
      }

      // Now create the flight detail
      const flightDetailData = {
        flightId: flightId,
        flightOwnerId: parseInt(userId),
        flightName: addFormData.flightName,
        baggageInfo: addFormData.baggageInfo,
        numberOfSeats: parseInt(addFormData.numberOfSeats) || 120,
        departureTime: new Date(addFormData.departureTime).toISOString(),
        arrivalTime: new Date(addFormData.arrivalTime).toISOString(),
        fare: parseFloat(addFormData.fare)
      };

      const response = await fetch('http://localhost:5244/api/FlightOwner/flight-details', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightDetailData),
      });

      if (response.ok) {
        alert('Flight added successfully!');
        setShowAddModal(false);
        setAddFormData({
          origin: '',
          destination: '',
          price: '',
          flightName: '',
          baggageInfo: '',
          numberOfSeats: 120,
          departureTime: '',
          arrivalTime: '',
          fare: ''
        });
        loadFlights(); // Reload the flights list
      } else {
        const errorData = await response.json();
        alert(`Failed to add flight: ${errorData.message || 'Please try again.'}`);
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
    flight.flightRoute?.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.flightName?.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.flightDetailId?.toString().includes(flightSearch)
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
    booking.flightName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    booking.userEmail?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flightowner-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Flight Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isFlightOwner) {
    return (
      <div className="access-alert-overlay">
        <div className="access-alert-modal">
          <div className="alert-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>This dashboard is only available for flight owners.</p>
          <div className="alert-actions">
            <button 
              onClick={() => navigate('/')} 
              className="alert-btn primary"
            >
              Go to Home
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="alert-btn secondary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flightowner-page">
      {/* Header */}
      <div className="flightowner-header">
        <div className="flightowner-nav">
          <div className="nav-brand">
            <span className="brand-icon">✈️</span>
            <span className="brand-text">SimplyFly</span>
          </div>
          <div className="nav-actions">
            <span className="flightowner-badge">Flight Owner</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flightowner-container">
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
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="section-header">
                <h1>👥 User Management</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="data-table">
                <table>
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
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="loading-state">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <div className="empty-state-icon">👥</div>
                          <h3>No users found</h3>
                          <p>No users match your search criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.userId}>
                          <td>{user.userId}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role?.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div>
              <div className="section-header">
                <h1>✈️ Flight Management</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={flightSearch}
                    onChange={(e) => setFlightSearch(e.target.value)}
                    className="search-input"
                  />
                  <button 
                    onClick={() => setShowAddModal(true)} 
                    className="add-btn"
                  >
                    <span>➕</span> Add Flight
                  </button>
                  <button 
                    onClick={loadFlights} 
                    className="refresh-btn"
                    disabled={flightsLoading}
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Flight Name</th>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Seats</th>
                      <th>Fare</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightsLoading ? (
                      <tr>
                        <td colSpan="8" className="loading-state">
                          Loading flights...
                        </td>
                      </tr>
                    ) : filteredFlights.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          <div className="empty-state-icon">✈️</div>
                          <h3>No flights found</h3>
                          <p>Add your first flight to get started.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFlights.map((flight) => (
                        <tr key={flight.flightDetailId}>
                          <td>{flight.flightDetailId}</td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <input
                                type="text"
                                value={editFormData.flightName}
                                onChange={(e) => setEditFormData({...editFormData, flightName: e.target.value})}
                                className="inline-input"
                              />
                            ) : (
                              flight.flightName
                            )}
                          </td>
                          <td>{flight.flightRoute}</td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <input
                                type="datetime-local"
                                value={editFormData.departureTime}
                                onChange={(e) => setEditFormData({...editFormData, departureTime: e.target.value})}
                                className="inline-input"
                              />
                            ) : (
                              new Date(flight.departureTime).toLocaleString()
                            )}
                          </td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <input
                                type="datetime-local"
                                value={editFormData.arrivalTime}
                                onChange={(e) => setEditFormData({...editFormData, arrivalTime: e.target.value})}
                                className="inline-input"
                              />
                            ) : (
                              new Date(flight.arrivalTime).toLocaleString()
                            )}
                          </td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <input
                                type="number"
                                value={editFormData.numberOfSeats}
                                onChange={(e) => setEditFormData({...editFormData, numberOfSeats: e.target.value})}
                                className="inline-input"
                                min="1"
                              />
                            ) : (
                              <span className="stat-highlight">{flight.numberOfSeats}</span>
                            )}
                          </td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <input
                                type="number"
                                value={editFormData.fare}
                                onChange={(e) => setEditFormData({...editFormData, fare: e.target.value})}
                                className="inline-input"
                                step="0.01"
                              />
                            ) : (
                              `₹${flight.fare}`
                            )}
                          </td>
                          <td>
                            {editingFlight === flight.flightDetailId ? (
                              <div className="action-buttons">
                                <button 
                                  onClick={() => handleUpdateFlight(flight.flightDetailId)}
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
                              </div>
                            ) : (
                              <div className="action-buttons">
                                <button 
                                  onClick={() => handleEditFlight(flight)}
                                  className="edit-btn"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteFlight(flight.flightDetailId)}
                                  className="delete-btn"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="section-header">
                <h1>🎫 Booking Management</h1>
                <div className="section-actions">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Flight</th>
                      <th>Passengers</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan="7" className="loading-state">
                          Loading bookings...
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          <div className="empty-state-icon">🎫</div>
                          <h3>No bookings found</h3>
                          <p>No bookings have been made yet.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.bookingId}>
                          <td>{booking.bookingId}</td>
                          <td>
                            <div>
                              <div>{booking.userName || 'Unknown'}</div>
                              <div style={{fontSize: '12px', color: '#666'}}>
                                {booking.userEmail || 'Unknown'}
                              </div>
                            </div>
                          </td>
                          <td>{booking.flightName || 'N/A'}</td>
                          <td><span className="stat-highlight">{booking.passengerCount}</span></td>
                          <td>₹{booking.totalAmount}</td>
                          <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                          <td>
                            <span className="role-badge admin">{booking.status || 'Confirmed'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Flight Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">✈️ Add New Flight</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Flight Name:</label>
                <input
                  type="text"
                  value={addFormData.flightName}
                  onChange={(e) => setAddFormData({...addFormData, flightName: e.target.value})}
                  placeholder="e.g., AI 101"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Seats:</label>
                <input
                  type="number"
                  value={addFormData.numberOfSeats}
                  onChange={(e) => setAddFormData({...addFormData, numberOfSeats: e.target.value})}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Origin:</label>
                <input
                  type="text"
                  value={addFormData.origin}
                  onChange={(e) => setAddFormData({...addFormData, origin: e.target.value})}
                  placeholder="Departure city"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination:</label>
                <input
                  type="text"
                  value={addFormData.destination}
                  onChange={(e) => setAddFormData({...addFormData, destination: e.target.value})}
                  placeholder="Arrival city"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Departure Time:</label>
                <input
                  type="datetime-local"
                  value={addFormData.departureTime}
                  onChange={(e) => setAddFormData({...addFormData, departureTime: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Arrival Time:</label>
                <input
                  type="datetime-local"
                  value={addFormData.arrivalTime}
                  onChange={(e) => setAddFormData({...addFormData, arrivalTime: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Price (₹):</label>
                <input
                  type="number"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData({...addFormData, price: e.target.value})}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fare (₹):</label>
                <input
                  type="number"
                  value={addFormData.fare}
                  onChange={(e) => setAddFormData({...addFormData, fare: e.target.value})}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Baggage Information:</label>
                <textarea
                  value={addFormData.baggageInfo}
                  onChange={(e) => setAddFormData({...addFormData, baggageInfo: e.target.value})}
                  placeholder="Baggage allowance details..."
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleAddFlight}
                className="modal-btn primary"
              >
                Add Flight
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="modal-btn secondary"
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
