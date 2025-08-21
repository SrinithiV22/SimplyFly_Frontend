import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faBookmark,
  faWallet,
  faUser,
  faSignOutAlt,
  faPlaneDeparture,
  faPlane,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Add this console log to debug
  console.log('User data from localStorage:', user);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications] = useState(3); // Example notification count

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  };

  const renderWelcomeSection = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    // Debug the actual name value
    console.log('User name value:', user.name);

    return (
      <div className="welcome-section card mb-4">
        <div className="card-body">
          <div className="welcome-header mb-3">
            <h2>{greeting}, {user.name ? user.name : 'User'}!</h2>
            <p className="text-light mb-0">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="stat-card">
                <h6>Upcoming Trips</h6>
                <h3>2</h3>
                <p className="text-muted small mb-0">Next trip in 5 days</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h6>Total Bookings</h6>
                <h3>5</h3>
                <p className="text-muted small mb-0">This year</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h6>Pending Payments</h6>
                <h3>₹1,200</h3>
                <p className="text-muted small mb-0">Due in 3 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            {renderWelcomeSection()}
            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Quick Flight Search</h5>
                    {/* Flight search form will go here */}
                  </div>
                </div>
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Upcoming Trips</h5>
                    {/* Upcoming trips list will go here */}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Notifications</h5>
                    {/* Notifications will go here */}
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Current Offers</h5>
                    {/* Offers will go here */}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <FontAwesomeIcon icon={faPlane} className="me-2" />
            SimplyFly
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'bookFlight' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookFlight')}
                >
                  <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
                  Book Flight
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'myBookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('myBookings')}
                >
                  <FontAwesomeIcon icon={faBookmark} className="me-2" />
                  My Bookings
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payments')}
                >
                  <FontAwesomeIcon icon={faWallet} className="me-2" />
                  Payments
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Profile
                </a>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              <div className="notifications-bell me-3 position-relative">
                <FontAwesomeIcon icon={faBell} className="text-light" />
                {notifications > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications}
                  </span>
                )}
              </div>
              <button className="btn btn-logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {renderContent()}
      </div>
    </div>
  );
}