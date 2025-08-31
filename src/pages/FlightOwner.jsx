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
    origin: '',
    destination: '',
    fare: ''
  });

  // Edit Flight Modal states
  const [showEditFlightModal, setShowEditFlightModal] = useState(false);
  const [editFlightForm, setEditFlightForm] = useState({
    id: '',
    origin: '',
    destination: '',
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
      console.log('🔐 Token:', token ? 'Present' : 'Missing');
      
      let usersData = [];
      
      // Try Admin/users first
      try {
        console.log('🔄 Trying Admin/users endpoint...');
        const response = await fetch('http://localhost:5244/api/Admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('👥 Admin/users response status:', response.status);
        
        if (response.ok) {
          usersData = await response.json();
          console.log('👥 Admin/users data:', usersData);
        } else {
          console.log('❌ Admin/users failed, trying alternative...');
          // Try Auth/users endpoint as fallback
          const altResponse = await fetch('http://localhost:5244/api/Auth/users', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('👥 Auth/users endpoint response status:', altResponse.status);
          
          if (altResponse.ok) {
            usersData = await altResponse.json();
            console.log('👥 Auth/users endpoint data:', usersData);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      // Process the data
      if (Array.isArray(usersData) && usersData.length > 0) {
        console.log('🔄 Processing users data...');
        console.log('👤 First user object:', usersData[0]);
        console.log('🔑 User properties:', Object.keys(usersData[0]));
        
        // Normalize user data to ensure consistent field names
        const normalizedUsers = usersData.map(user => ({
          ...user,
          id: user.id || user.Id,
          firstName: user.firstName || user.FirstName,
          lastName: user.lastName || user.LastName,
          email: user.email || user.Email,
          role: user.role || user.Role || 'User',
          createdAt: user.createdAt || user.CreatedAt || user.dateJoined || user.DateJoined
        }));
        
        console.log('✅ Processed users:', normalizedUsers);
        setUsers(normalizedUsers);
      } else {
        console.log('❌ No valid users data received');
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
      console.log('🔐 Token:', token ? 'Present' : 'Missing');
      
      // Try multiple endpoints to get flight data
      let flightsData = [];
      let bookingsData = [];
      
      // First try Admin endpoints
      try {
        console.log('🔄 Trying Admin/flights endpoint...');
        const flightsResponse = await fetch('http://localhost:5244/api/Admin/flights', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('✈️ Admin/flights response status:', flightsResponse.status);
        
        if (flightsResponse.ok) {
          flightsData = await flightsResponse.json();
          console.log('✈️ Admin/flights data:', flightsData);
        } else {
          console.log('❌ Admin/flights failed, trying alternative...');
          // Try Flights endpoint as fallback
          const altFlightsResponse = await fetch('http://localhost:5244/api/Flights', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('✈️ Flights endpoint response status:', altFlightsResponse.status);
          
          if (altFlightsResponse.ok) {
            flightsData = await altFlightsResponse.json();
            console.log('✈️ Flights endpoint data:', flightsData);
          }
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
      }
      
      // Load bookings
      try {
        console.log('🔄 Trying Admin/bookings endpoint...');
        const bookingsResponse = await fetch('http://localhost:5244/api/Admin/bookings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📋 Admin/bookings response status:', bookingsResponse.status);
        
        if (bookingsResponse.ok) {
          bookingsData = await bookingsResponse.json();
          console.log('📋 Admin/bookings data:', bookingsData);
        } else {
          console.log('❌ Admin/bookings failed, trying alternative...');
          // Try bookings endpoint as fallback
          const altBookingsResponse = await fetch('http://localhost:5244/api/bookings', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📋 Bookings endpoint response status:', altBookingsResponse.status);
          
          if (altBookingsResponse.ok) {
            bookingsData = await altBookingsResponse.json();
            console.log('📋 Bookings endpoint data:', bookingsData);
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }

      // Process the data
      if (Array.isArray(flightsData) && flightsData.length > 0) {
        console.log('🔄 Processing flights data...');
        console.log('🛫 First flight object:', flightsData[0]);
        console.log('� Flight properties:', Object.keys(flightsData[0]));
        
        // Calculate available seats for each flight
        const flightsWithSeats = flightsData.map(flight => {
          const flightBookings = Array.isArray(bookingsData) ? 
            bookingsData.filter(booking => (booking.flightId || booking.FlightId) === (flight.id || flight.Id)) : [];
          const totalBooked = flightBookings.reduce((sum, booking) => sum + (booking.passengerCount || booking.passengers || 1), 0);
          const availableSeats = 120 - totalBooked;
          
          // Get flight name and times from bookings table
          const flightInfo = flightBookings.length > 0 ? flightBookings[0] : null;
          const flightName = flightInfo ? (flightInfo.flight || flightInfo.Flight || `Flight ${flight.id || flight.Id}`) : `Flight ${flight.id || flight.Id}`;
          const departureTime = flightInfo ? (flightInfo.departureTime || flightInfo.DepartureTime) : null;
          const arrivalTime = flightInfo ? (flightInfo.arrivalTime || flightInfo.ArrivalTime) : null;
          
          console.log(`✈️ Flight ${flight.id || flight.Id}: ${totalBooked} booked, ${availableSeats} available, name: ${flightName}`);
          
          return {
            ...flight,
            totalSeats: 120,
            bookedSeats: totalBooked,
            availableSeats: Math.max(0, availableSeats),
            // Use flight name from bookings table
            flightName: flightName,
            origin: flight.origin || flight.Origin,
            destination: flight.destination || flight.Destination,
            // Use departure/arrival times from bookings table
            departureTime: departureTime || flight.departureTime || flight.DepartureTime,
            arrivalTime: arrivalTime || flight.arrivalTime || flight.ArrivalTime,
            fare: flight.fare || flight.Fare || flight.price || flight.Price
          };
        });
        
        console.log('✅ Processed flights with seats:', flightsWithSeats);
        setFlights(flightsWithSeats);
      } else {
        console.log('❌ No valid flights data received');
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
      console.log('🔐 Token:', token ? 'Present' : 'Missing');
      
      let bookingsData = [];
      
      // Try Admin/bookings first
      try {
        console.log('🔄 Trying Admin/bookings endpoint...');
        const response = await fetch('http://localhost:5244/api/Admin/bookings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📋 Admin/bookings response status:', response.status);
        
        if (response.ok) {
          bookingsData = await response.json();
          console.log('📋 Admin/bookings data:', bookingsData);
        } else {
          console.log('❌ Admin/bookings failed, trying alternative...');
          // Try bookings endpoint as fallback
          const altResponse = await fetch('http://localhost:5244/api/bookings', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📋 Bookings endpoint response status:', altResponse.status);
          
          if (altResponse.ok) {
            bookingsData = await altResponse.json();
            console.log('📋 Bookings endpoint data:', bookingsData);
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }

      // Process the data
      if (Array.isArray(bookingsData) && bookingsData.length > 0) {
        console.log('🔄 Processing bookings data...');
        console.log('📝 First booking object:', bookingsData[0]);
        console.log('🔑 Booking properties:', Object.keys(bookingsData[0]));
        
        // Normalize booking data to ensure consistent field names
        const normalizedBookings = bookingsData.map(booking => ({
          ...booking,
          bookingId: booking.bookingId || booking.BookingId || booking.id || booking.Id,
          userName: booking.userName || booking.UserName || booking.customerName || booking.CustomerName,
          // Use the "Flight" column from bookings table for flight name
          flightName: booking.flight || booking.Flight || booking.flightName || booking.FlightName || `Flight ${booking.flightId || booking.FlightId}`,
          flightId: booking.flightId || booking.FlightId,
          passengerCount: booking.passengerCount || booking.PassengerCount || booking.passengers || booking.Passengers || 1,
          totalAmount: booking.totalAmount || booking.TotalAmount || booking.amount || booking.Amount,
          status: booking.status || booking.Status || 'Confirmed',
          bookingDate: booking.bookingDate || booking.BookingDate || booking.createdAt || booking.CreatedAt
        }));
        
        console.log('✅ Processed bookings:', normalizedBookings);
        setBookings(normalizedBookings);
      } else {
        console.log('❌ No valid bookings data received');
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
      
      console.log('🔑 Token:', token);
      console.log('👤 User Data:', userData);
      console.log('🔍 User Role:', userData.Role);
      
      const formData = {
        origin: addFlightForm.origin,
        destination: addFlightForm.destination,
        price: parseFloat(addFlightForm.fare)
      };

      console.log('📦 Adding new flight:', formData);

      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success result:', result);
        alert('Flight added successfully!');
        setShowAddFlightModal(false);
        setAddFlightForm({
          origin: '',
          destination: '',
          fare: ''
        });
        loadFlights(); // Reload flights
      } else {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        alert(`Failed to add flight: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error adding flight:', error);
      alert('Error adding flight. Please try again.');
    }
  };

  const handleEditFlight = (flight) => {
    setEditFlightForm({
      id: flight.id,
      origin: flight.origin || '',
      destination: flight.destination || '',
      fare: flight.fare || flight.price || ''
    });
    setShowEditFlightModal(true);
  };

  const handleUpdateFlight = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('userToken');
      
      const formData = {
        id: parseInt(editFlightForm.id),
        origin: editFlightForm.origin,
        destination: editFlightForm.destination,
        price: parseFloat(editFlightForm.fare)
      };

      console.log('📝 Updating flight:', formData);

      const response = await fetch(`http://localhost:5244/api/Flights/${editFlightForm.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Flight updated successfully!');
        setShowEditFlightModal(false);
        setEditFlightForm({
          id: '',
          origin: '',
          destination: '',
          fare: ''
        });
        loadFlights(); // Reload flights
      } else {
        const errorData = await response.json();
        alert(`Failed to update flight: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      alert('Error updating flight. Please try again.');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!confirm('Are you sure you want to delete this flight? This will also delete all associated bookings.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');

      console.log('🗑️ Deleting flight:', flightId);

      const response = await fetch(`http://localhost:5244/api/Flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Flight deleted successfully!');
        loadFlights(); // Reload flights
      } else {
        const errorData = await response.json();
        alert(`Failed to delete flight: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    // Use setTimeout to ensure localStorage is cleared before navigation
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 0);
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id || index}>
                            <td>{user.id || 'N/A'}</td>
                            <td>{user.name || user.firstName || user.lastName || 'N/A'}</td>
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
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
                            <td>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  style={{
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}
                                  onClick={() => handleEditFlight(flight)}
                                  title="Edit Flight"
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  style={{
                                    background: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}
                                  onClick={() => handleDeleteFlight(flight.id)}
                                  title="Delete Flight"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
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
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading bookings...</p>
                </div>
              ) : (
                <div className="bookings-table-container">
                  <div className="table-scroll">
                    <table className="bookings-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>User & Route</th>
                          <th>Flight Schedule</th>
                          <th>Booking Details</th>
                          <th>Payment & Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length > 0 ? (
                          filteredBookings.map((booking, index) => (
                            <tr key={booking.bookingId || index} className="booking-row">
                              {/* Booking ID */}
                              <td className="booking-id-cell">
                                <div className="booking-id-badge">
                                  #{booking.bookingId || 'N/A'}
                                </div>
                                <div className="booking-date">
                                  {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : 'N/A'}
                                </div>
                              </td>

                              {/* User & Route */}
                              <td className="user-route-cell">
                                <div className="user-info">
                                  <div className="user-name">{booking.userName || 'Unknown'}</div>
                                  <div className="user-email">{booking.userEmail || 'N/A'}</div>
                                </div>
                                <div className="route-info">
                                  <div className="route-main">
                                    {booking.flightOrigin && booking.flightDestination ? 
                                      `${booking.flightOrigin} → ${booking.flightDestination}` : 
                                      (booking.route || 'N/A')
                                    }
                                  </div>
                                  <div className="airline-name">{booking.flight || 'N/A'}</div>
                                </div>
                              </td>

                              {/* Flight Schedule */}
                              <td className="schedule-cell">
                                <div className="departure-info">
                                  <div className="time-label">Departure</div>
                                  <div className="date-time">
                                    {booking.departureTime ? new Date(booking.departureTime).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short'
                                    }) : 'N/A'}
                                  </div>
                                  <div className="time">
                                    {booking.departureTime ? new Date(booking.departureTime).toLocaleTimeString('en-IN', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    }) : 'N/A'}
                                  </div>
                                </div>
                                {booking.arrivalTime && (
                                  <div className="arrival-info">
                                    <div className="time-label">Arrival</div>
                                    <div className="time">
                                      {new Date(booking.arrivalTime).toLocaleTimeString('en-IN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Booking Details */}
                              <td className="booking-details-cell">
                                <div className="detail-row">
                                  <span className="detail-label">Seats:</span>
                                  <span className="seats-badge">
                                    {booking.seatNumbers || booking.selectedSeats || 'N/A'}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Passengers:</span>
                                  <span className="passengers-count">
                                    {booking.passengerCount || booking.passengers || 0}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Class:</span>
                                  <span className="ticket-type">
                                    {booking.ticketType || 'Economy'}
                                  </span>
                                </div>
                              </td>

                              {/* Payment Info */}
                              <td className="payment-cell">
                                <div className="total-amount">
                                  ₹{booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'N/A'}
                                </div>
                                <div className="booking-time">
                                  {booking.ticketBookingTime || 'N/A'}
                                </div>
                                <div className="booking-status">
                                  <span className={`status-badge ${(booking.status || 'Confirmed').toLowerCase()}`}>
                                    {booking.status || 'Confirmed'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="no-data-cell">
                              {bookings.length === 0 ? (
                                <div className="no-data-message">
                                  <div className="no-data-icon">📭</div>
                                  <div>No bookings found</div>
                                </div>
                              ) : (
                                <div className="no-data-message">
                                  <div className="no-data-icon">🔍</div>
                                  <div>No bookings match your search criteria</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Origin</label>
                  <input 
                    type="text"
                    value={addFlightForm.origin}
                    onChange={(e) => setAddFlightForm(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="e.g., MAA"
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
                    placeholder="e.g., BLR"
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

                <div style={{ gridColumn: 'span 2' }}>
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
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  <strong>Note:</strong> Flight will be created with Origin, Destination, and Price. Additional details can be managed through bookings.
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

      {/* Edit Flight Modal */}
      {showEditFlightModal && (
        <div className="modal-overlay" onClick={() => setShowEditFlightModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Edit Flight</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowEditFlightModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >×</button>
            </div>
            <form onSubmit={handleUpdateFlight}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Flight ID</label>
                  <input 
                    type="text"
                    value={editFlightForm.id}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#f5f5f5',
                      color: '#666'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#2c3e50' }}>Fare (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editFlightForm.fare}
                    onChange={(e) => setEditFlightForm(prev => ({ ...prev, fare: e.target.value }))}
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
                    value={editFlightForm.origin}
                    onChange={(e) => setEditFlightForm(prev => ({ ...prev, origin: e.target.value }))}
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
                    value={editFlightForm.destination}
                    onChange={(e) => setEditFlightForm(prev => ({ ...prev, destination: e.target.value }))}
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
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center', padding: '12px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                  <strong>Note:</strong> Flight ID cannot be modified. Only origin, destination, and fare can be updated.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditFlightModal(false)}
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
                    background: '#f39c12',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Update Flight
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
