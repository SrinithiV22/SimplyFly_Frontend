import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBookings, cancelBooking } from '../api';
import './Admin.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(null);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Loading states
  const [usersLoading, setUsersLoading] = useState(false);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Search states - removed airlineSearch
  const [userSearch, setUserSearch] = useState('');
  const [flightSearch, setFlightSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Add these states at the top of your Admin component
  const [editingFlight, setEditingFlight] = useState(null);
  const [editFormData, setEditFormData] = useState({
    origin: '',
    destination: '',
    price: ''
  });

  // Booking management states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const navigate = useNavigate();

  // Check admin role on component mount
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        let userData = JSON.parse(localStorage.getItem('userData') || '{}');
        console.log('Checking user data:', userData);
        
        const userRole = userData.Role;
        console.log('User role:', userRole);
        
        if (userRole === 'Admin') {
          console.log('Access granted - user is Admin');
          setIsAdmin(true);
          await loadDashboardData();
        } else {
          console.log('Access denied - user role is:', userRole);
          setIsAdmin(false);
          setShowAdminAlert(true);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setShowAdminAlert(true);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [navigate]);

  // Load dashboard data from APIs
  const loadDashboardData = async () => {
    await Promise.all([
      loadUsers(),
      loadFlights(),
      loadBookings()
    ]);
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

  // Removed loadAirlines function entirely

  const loadFlights = async () => {
    setFlightsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('🛫 Making API call to get flights');
      
      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✈️ Flights response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🛬 Flights API response:', data);
        console.log('📊 Flights response type:', typeof data);
        console.log('📃 Is array:', Array.isArray(data));
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('🛫 First flight object:', data[0]);
          console.log('🔑 Flight properties:', Object.keys(data[0]));
        }
        
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

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 Loading all bookings for admin...');
      
      const response = await fetch('http://localhost:5244/api/Admin/bookings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Admin bookings response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Admin bookings data:', data);
        setBookings(data || []);
      } else {
        console.error('Failed to load admin bookings:', response.status);
        // Fallback to regular bookings API if admin endpoint doesn't exist
        const fallbackResponse = await fetch('http://localhost:5244/api/bookings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('📋 Fallback bookings data:', fallbackData);
          setBookings(fallbackData || []);
        } else {
          setBookings([]);
        }
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
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleAdminAlertClose = () => {
    setShowAdminAlert(false);
    navigate('/home', { replace: true });
  };

  // Booking Management Functions
  const handleViewBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5244/api/Admin/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const bookingData = await response.json();
        setSelectedBooking(bookingData);
        setShowBookingModal(true);
      } else {
        alert('Failed to load booking details');
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      alert('Error loading booking details');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`http://localhost:5244/api/Admin/booking/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Booking deleted successfully');
          // Remove the booking from the local state immediately
          setBookings(prevBookings => prevBookings.filter(booking => booking.bookingId !== bookingId));
        } else {
          const errorData = await response.json();
          alert(`Failed to delete booking: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
      }
    }
  };

// Add these functions in your Admin component
const handleEditFlight = (flight) => {
  setEditingFlight(flight.id);
  
  setEditFormData({
    origin: flight.origin || '',
    destination: flight.destination || '',
    price: flight.price || ''
  });
};

const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    // Validation
    if (!editFormData.origin || !editFormData.destination || !editFormData.price) {
      alert('Please fill in all fields');
      return;
    }
    
    // Get the original flight data to preserve other fields
    const originalFlight = flights.find(f => f.id === editingFlight);
    if (!originalFlight) {
      alert('Original flight data not found');
      return;
    }
    
    // Prepare the complete flight data with updates
    const updateData = {
      ...originalFlight, // Preserve all existing fields
      origin: editFormData.origin.trim(),
      destination: editFormData.destination.trim(),
      price: parseFloat(editFormData.price)
    };

    console.log('🔄 Original flight:', originalFlight);
    console.log('📝 Update data:', updateData);
    console.log('📡 API URL:', `http://localhost:5244/api/Flights/${editingFlight}`);

    const response = await fetch(`http://localhost:5244/api/Flights/${editingFlight}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const responseData = await response.text();
      console.log('✅ Success response:', responseData);
      alert('Flight updated successfully!');
      setEditingFlight(null);
      setEditFormData({ origin: '', destination: '', price: '' });
      loadFlights();
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to update flight:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // More user-friendly error messages
      switch (response.status) {
        case 400:
          alert('Bad Request: Please check your input data format');
          break;
        case 401:
          alert('Unauthorized: Please login again');
          break;
        case 404:
          alert('Flight not found');
          break;
        case 500:
          alert('Server error: Please try again later');
          break;
        default:
          alert(`Failed to update flight (${response.status}): ${errorText}`);
      }
    }
  } catch (error) {
    console.error('🚨 Network/Parse error:', error);
    alert(`Network error: ${error.message}`);
  }
};

const handleCancelEdit = () => {
  setEditingFlight(null);
  setEditFormData({ origin: '', destination: '', price: '' });
};

const handleFormChange = (field, value) => {
  setEditFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

  // CRUD Operations - removed airline case
  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      let apiUrl = '';
      
      switch (type) {
        case 'user':
          apiUrl = `http://localhost:5244/api/Auth/user/${id}`;
          break;
        case 'flight':
          apiUrl = `http://localhost:5244/api/Flights/${id}`;
          break;
        default:
          return;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Reload the specific data
        switch (type) {
          case 'user':
            loadUsers();
            break;
          case 'flight':
            loadFlights();
            break;
        }
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  // Filter functions - removed filteredAirlines
  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFlights = flights.filter(flight =>
    (flight.origin || '').toLowerCase().includes(flightSearch.toLowerCase()) ||
    (flight.destination || '').toLowerCase().includes(flightSearch.toLowerCase()) ||
    (flight.price ? flight.price.toString().includes(flightSearch) : false)
  );

  const filteredBookings = bookings.filter(booking =>
    (booking.bookingId ? booking.bookingId.toString().includes(bookingSearch) : false) ||
    (booking.userName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.userEmail || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.flightOrigin || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.flightDestination || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.seatNumbers || booking.selectedSeats || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (booking.route || '').toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  // Admin Alert Modal
  if (showAdminAlert) {
    return (
      <div className="admin-alert-overlay">
        <div className="admin-alert-modal">
          <div className="alert-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>You don't have administrator privileges to access this dashboard.</p>
          <p>Please logout and login with admin credentials to continue.</p>
          <div className="alert-actions">
            <button className="alert-btn primary" onClick={handleLogout}>
              Logout & Login as Admin
            </button>
            <button className="alert-btn secondary" onClick={handleAdminAlertClose}>
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

return (
  <div className="admin-dashboard">
    {/* Navigation Bar - Make it fixed */}
    <nav className="admin-navbar" style={{ 
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
          <span className="logo-text">SimplyFly Admin</span>
          <span className="logo-subtitle">Fly Like A Bird</span>
        </div>

        <div className="navbar-auth">
          <span className="admin-badge">👨‍💼 Admin</span>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </nav>

    {/* Add padding to the container to account for fixed navbar */}
    <div className="admin-container" style={{ paddingTop: '80px' }}>
      {/* Sidebar - removed airlines item */}
      <div className="admin-sidebar">
        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="sidebar-icon">📊</span>
            Overview
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="sidebar-icon">👥</span>
            Users
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            <span className="sidebar-icon">✈️</span>
            Flights
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="sidebar-icon">📋</span>
            Bookings
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="admin-content">
          {/* Overview Tab - removed airlines stat card */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h1>Dashboard Overview</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{users.length}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
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
                    <h3>0</h3>
                    <p>Bookings (Coming Soon)</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Database Status</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">👥</span>
                    <span>Users loaded: {users.length} records</span>
                    <span className="activity-time">{usersLoading ? 'Loading...' : 'Ready'}</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">✈️</span>
                    <span>Flights loaded: {flights.length} records</span>
                    <span className="activity-time">{flightsLoading ? 'Loading...' : 'Ready'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

{/* Users Tab */}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{user.id || 'N/A'}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase() || 'unknown'}`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete('user', user.id)} title="Delete User">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
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

          {/* Removed Airlines Tab entirely */}

{/* Flights Tab */}
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
            {filteredFlights.map((flight, index) => (
              <tr key={flight.id || index}>
                <td>{flight.id || 'N/A'}</td>
                
                {/* Origin */}
                <td>
                  {editingFlight === flight.id ? (
                    <input
                      type="text"
                      value={editFormData.origin}
                      onChange={(e) => handleFormChange('origin', e.target.value)}
                      placeholder="Origin"
                      style={{
                        width: '100px',
                        padding: '4px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <span style={{ 
                      background: '#e8f5e8', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold',
                      color: '#2e7d32'
                    }}>
                      {flight.origin || 'N/A'}
                    </span>
                  )}
                </td>
                
                {/* Destination */}
                <td>
                  {editingFlight === flight.id ? (
                    <input
                      type="text"
                      value={editFormData.destination}
                      onChange={(e) => handleFormChange('destination', e.target.value)}
                      placeholder="Destination"
                      style={{
                        width: '100px',
                        padding: '4px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <span style={{ 
                      background: '#fff3e0', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold',
                      color: '#f57c00'
                    }}>
                      {flight.destination || 'N/A'}
                    </span>
                  )}
                </td>
                
                {/* Price */}
                <td>
                  {editingFlight === flight.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>₹</span>
                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) => handleFormChange('price', e.target.value)}
                        placeholder="Price"
                        min="0"
                        step="1"
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
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
                
                {/* Actions */}
                <td>
                  {editingFlight === flight.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={handleSaveEdit}
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Save Changes"
                      >
                        ✅ Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Cancel Edit"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditFlight(flight)}
                        title="Edit Flight"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete('flight', flight.id)} 
                        title="Delete Flight"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFlights.length === 0 && (
          <div className="no-data">No flights found</div>
        )}
      </div>
    )}
  </div>
)}

          {/* Bookings Tab */}
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
                  <button 
                    className="refresh-btn" 
                    onClick={loadBookings} 
                    disabled={bookingsLoading}
                  >
                    {bookingsLoading ? '⟳' : '🔄'} Refresh
                  </button>
                </div>
              </div>

              <div className="booking-stats">
                <div className="stat-card">
                  <div className="stat-number">{bookings.length}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    ₹{bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {bookings.reduce((total, booking) => total + (booking.passengerCount || booking.passengers || 0), 0)}
                  </div>
                  <div className="stat-label">Total Passengers</div>
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
                          <th>Actions</th>
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

                              {/* Actions */}
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn view-btn"
                                    onClick={() => handleViewBooking(booking.bookingId)}
                                    title="View Details"
                                  >
                                    👁️
                                  </button>
                                  <button 
                                    className="action-btn cancel-btn"
                                    onClick={() => handleCancelBooking(booking.bookingId)}
                                    title="Cancel Booking"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-data-cell">
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

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details - #{selectedBooking.bookingId}</h3>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="booking-detail-grid">
                <div className="detail-section">
                  <h4>📋 Booking Information</h4>
                  <div className="detail-item">
                    <span className="label">Booking ID:</span>
                    <span className="value">#{selectedBooking.bookingId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value status-badge ${(selectedBooking.status || 'confirmed').toLowerCase()}`}>
                      {selectedBooking.status || 'Confirmed'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Date:</span>
                    <span className="value">{new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="value amount">₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>👤 User Information</h4>
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedBooking.userName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedBooking.userEmail}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>✈️ Flight Information</h4>
                  <div className="detail-item">
                    <span className="label">Route:</span>
                    <span className="value">{selectedBooking.flightOrigin} → {selectedBooking.flightDestination}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Departure:</span>
                    <span className="value">{new Date(selectedBooking.departureTime).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Arrival:</span>
                    <span className="value">{new Date(selectedBooking.arrivalTime).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Seats:</span>
                    <span className="value">{selectedBooking.seatNumbers}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Passengers:</span>
                    <span className="value">{selectedBooking.passengerCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Class:</span>
                    <span className="value">{selectedBooking.ticketType}</span>
                  </div>
                </div>

                {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                  <div className="detail-section full-width">
                    <h4>🧳 Passenger Details</h4>
                    <div className="passengers-list">
                      {selectedBooking.passengers.map((passenger, index) => (
                        <div key={index} className="passenger-card">
                          <div className="passenger-info">
                            <span className="passenger-name">{passenger.firstName} {passenger.lastName}</span>
                            <span className="passenger-details">
                              Age: {passenger.age} | Gender: {passenger.gender} | Nationality: {passenger.nationality}
                            </span>
                            {passenger.passportNumber && (
                              <span className="passport">Passport: {passenger.passportNumber}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;