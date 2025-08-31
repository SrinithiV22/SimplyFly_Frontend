import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightOwner.css';

function FlightOwner() {
  const [isFlightOwner, setIsFlightOwner] = useState(null);
  const [showAccessAlert, setShowAccessAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  
  // Search states
  const [flightSearch, setFlightSearch] = useState('');
  
  // Edit states
  const [editingFlight, setEditingFlight] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
        const userRole = userData.Role;
        
        if (userRole === 'Flightowner') {
          setIsFlightOwner(true);
          await loadFlights();
        } else {
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

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5244/api/Flights/${editingFlight}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingFlight,
          origin: editFormData.origin,
          destination: editFormData.destination,
          price: parseFloat(editFormData.price)
        })
      });

      if (response.ok) {
        alert('Flight updated successfully!');
        setEditingFlight(null);
        await loadFlights();
      } else {
        alert('Failed to update flight');
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      alert('Error updating flight');
    }
  };

  const handleAddFlight = async () => {
    const origin = prompt('Enter origin city:');
    if (!origin) return;
    
    const destination = prompt('Enter destination city:');
    if (!destination) return;
    
    const price = prompt('Enter price:');
    if (!price || isNaN(price)) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5244/api/Flights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          price: parseFloat(price)
        })
      });

      if (response.ok) {
        alert('Flight added successfully!');
        await loadFlights();
      } else {
        alert('Failed to add flight');
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Error adding flight');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5244/api/Flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Flight deleted successfully!');
        await loadFlights();
      } else {
        alert('Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight');
    }
  };

  // Filter flights based on search
  const filteredFlights = flights.filter(flight => {
    if (!flightSearch) return true;
    
    const searchLower = flightSearch.toLowerCase();
    return (
      flight.origin?.toLowerCase().includes(searchLower) ||
      flight.destination?.toLowerCase().includes(searchLower) ||
      flight.price?.toString().includes(searchLower)
    );
  });

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

  if (showAccessAlert) {
    return (
      <div className="flightowner-alert-overlay">
        <div className="alert-modal">
          <div className="alert-header">
            <h3>⚠️ Access Denied</h3>
          </div>
          <div className="alert-body">
            <p>You don't have Flight Owner privileges.</p>
            <p>Please contact an administrator or log in with a Flight Owner account.</p>
          </div>
          <div className="alert-actions">
            <button onClick={() => navigate('/login')} className="primary-btn">
              Go to Login
            </button>
            <button onClick={() => navigate('/home')} className="secondary-btn">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flightowner-dashboard">
      <div className="dashboard-header">
        <h1>Flight Owner Dashboard</h1>
        <p>Manage your flights</p>
      </div>

      <div className="content-area">
        <div className="section">
          <div className="section-header">
            <h3>📊 Flight Management</h3>
            <div className="section-actions">
              <button onClick={handleAddFlight} className="add-btn">
                ➕ Add Flight
              </button>
              <button onClick={loadFlights} className="refresh-btn" disabled={flightsLoading}>
                {flightsLoading ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>

          <div className="search-controls">
            <input
              type="text"
              placeholder="🔍 Search flights by origin, destination, or price..."
              value={flightSearch}
              onChange={(e) => setFlightSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {flightsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading flights...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.length > 0 ? (
                    filteredFlights.map(flight => (
                      <tr key={flight.id}>
                        <td>{flight.id}</td>
                        
                        {/* Origin */}
                        <td>
                          {editingFlight === flight.id ? (
                            <input
                              type="text"
                              value={editFormData.origin}
                              onChange={(e) => handleFormChange('origin', e.target.value)}
                              placeholder="Origin"
                              style={{
                                width: '120px',
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
                              fontWeight: 'bold'
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
                                width: '120px',
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
                              fontWeight: 'bold'
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
                                onClick={() => handleDeleteFlight(flight.id)} 
                                title="Delete Flight"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
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
      </div>
    </div>
  );
}

export default FlightOwner;
