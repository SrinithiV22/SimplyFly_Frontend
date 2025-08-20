import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faUser, 
  faPlane, 
  faTicket
} from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1003:
        return "Admin";
      case 1004:
        return "Flight Owner";
      case 2002:
        return "User";
      default:
        return "Unknown Role";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">User Profile</h5>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {getRoleName(user.roleId)}</p>
            </div>
          </div>
        );
      case 'searchFlights':
        return <div>Flight Search Component (Coming Soon)</div>;
      case 'myBookings':
        return <div>My Bookings Component (Coming Soon)</div>;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-dark bg-primary p-3">
        <div className="container-fluid">
          <span className="navbar-brand">SimplyFly Dashboard</span>
          <button className="btn btn-light" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Logout
          </button>
        </div>
      </nav>

      <div className="row min-vh-100">
        <div className="col-md-3 bg-light p-4">
          <div className="list-group">
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FontAwesomeIcon icon={faUser} className="me-2" />
              My Profile
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'searchFlights' ? 'active' : ''}`}
              onClick={() => setActiveTab('searchFlights')}
            >
              <FontAwesomeIcon icon={faPlane} className="me-2" />
              Search Flights
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'myBookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('myBookings')}
            >
              <FontAwesomeIcon icon={faTicket} className="me-2" />
              My Bookings
            </button>
          </div>
        </div>

        <div className="col-md-9 p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}