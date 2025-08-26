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
import BookFlight from './BookFlight';
import MyBookings from './MyBookings';
import Payments from './Payments';
import Profile from './Profile';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  
  // Direct localStorage access for debugging
  const [userFromStorage, setUserFromStorage] = useState(null);
  
  useEffect(() => {
    // Force refresh user data from localStorage
    const rawUserData = localStorage.getItem("user");
    const authToken = localStorage.getItem("authToken");
    
    
    // console.log('Dashboard loading - checking user data...');
    // console.log('Raw user data:', rawUserData);
    
    if (rawUserData && rawUserData !== 'null' && rawUserData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(rawUserData);
        // console.log('User loaded successfully:', parsedUser.name, parsedUser.email);
        setUserFromStorage(parsedUser);
      } catch (e) {
        console.error('Parse error:', e);
        setUserFromStorage(null);
      }
    } else {
      // console.log('No user data found - redirecting to login');
      // If no user data but we have a token, redirect to login
      if (authToken) {
        localStorage.removeItem('authToken');
        navigate('/login', { replace: true });
      }
      setUserFromStorage(null);
    }
  }, [navigate]);

  const user = userFromStorage || {};

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationCount] = useState(3); // Example notification count
  const [currentUser, setCurrentUser] = useState({});
  // Flight search form state
  const [flightSearch, setFlightSearch] = useState({
    from: '',
    to: '',
    departureDate: '',
    passengers: 1,
    tripType: 'one-way'
  });

  // User-specific data states
  const [userBookings, setUserBookings] = useState([]);
  const [userUpcomingTrips, setUserUpcomingTrips] = useState([]);
  const [userPayments, setUserPayments] = useState({ pendingPayments: [], refunds: [] });
  const [userNotifications, setUserNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    thisYearTrips: 0,
    upcomingTrips: 0,
    pendingPayments: 0,
    membershipStatus: 'Silver'
  });

  // General offers (not user-specific)
  const [offers] = useState([
    {
      id: 1,
      title: 'Weekend Getaway',
      description: '25% off on domestic flights',
      validTill: '2024-08-31',
      code: 'WEEKEND25'
    },
    {
      id: 2,
      title: 'International Special',
      description: 'Flat ₹5000 off on international bookings',
      validTill: '2024-09-15',
      code: 'INTL5000'
    }
  ]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else {
      loadUserData();
    }
  }, [token, navigate]);

  // Recalculate stats when user data changes
  useEffect(() => {
    calculateUserStats();
  }, [userBookings, userUpcomingTrips, userPayments]);

  // Function to load user-specific data
  const loadUserData = async () => {
    try {
      const userId = userFromStorage?.id || userFromStorage?.email || 'defaultUser';
      
      // Load user bookings from localStorage or API
      const savedBookings = localStorage.getItem(`userBookings_${userId}`);
      if (savedBookings) {
        const bookings = JSON.parse(savedBookings);
        setUserBookings(bookings);
      } else {
        // Initialize with sample data for new users
        initializeSampleData(userId);
      }

      // Load upcoming trips
      const savedTrips = localStorage.getItem(`userTrips_${userId}`);
      if (savedTrips) {
        setUserUpcomingTrips(JSON.parse(savedTrips));
      }

      // Load payments data
      const savedPayments = localStorage.getItem(`userPayments_${userId}`);
      if (savedPayments) {
        setUserPayments(JSON.parse(savedPayments));
      }

      // Load notifications
      const savedNotifications = localStorage.getItem(`userNotifications_${userId}`);
      if (savedNotifications) {
        setUserNotifications(JSON.parse(savedNotifications));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Initialize sample data for new users
  const initializeSampleData = (userId) => {
    const sampleBookings = [
      {
        id: 'SF001',
        route: 'Mumbai → Delhi',
        date: '2024-08-20',
        flightNumber: 'AI 131',
        status: 'Completed',
        amount: '₹4,500'
      },
      {
        id: 'SF002',
        route: 'Delhi → Bangalore',
        date: '2024-08-15',
        flightNumber: 'SG 8156',
        status: 'Cancelled',
        amount: '₹6,200'
      }
    ];

    const sampleTrips = [
      {
        id: 'SF004',
        route: 'Mumbai → Goa',
        date: '2024-08-30',
        time: '14:30',
        flightNumber: 'AI 635',
        status: 'Confirmed',
        gate: 'A12',
        seat: '12A'
      }
    ];

    const samplePayments = {
      pendingPayments: [
        { id: 'P001', description: 'Mumbai → Goa Flight', amount: '₹3,200', dueDate: '2024-08-28' }
      ],
      refunds: [
        { id: 'R001', description: 'Delhi → Bangalore Cancellation', amount: '₹6,200', status: 'Processing' }
      ]
    };

    const sampleNotifications = [
      { id: 1, type: 'flight-update', message: 'Flight AI 635 gate changed to A12', time: '2 hours ago', read: false },
      { id: 2, type: 'offer', message: '20% off on international flights', time: '1 day ago', read: false }
    ];

    // Save sample data to localStorage
    localStorage.setItem(`userBookings_${userId}`, JSON.stringify(sampleBookings));
    localStorage.setItem(`userTrips_${userId}`, JSON.stringify(sampleTrips));
    localStorage.setItem(`userPayments_${userId}`, JSON.stringify(samplePayments));
    localStorage.setItem(`userNotifications_${userId}`, JSON.stringify(sampleNotifications));

    // Set the state
    setUserBookings(sampleBookings);
    setUserUpcomingTrips(sampleTrips);
    setUserPayments(samplePayments);
    setUserNotifications(sampleNotifications);
  };

  // Function to calculate user statistics
  const calculateUserStats = () => {
    const currentYear = new Date().getFullYear();
    const totalBookings = userBookings.length;
    const thisYearBookings = userBookings.filter(booking => 
      new Date(booking.date).getFullYear() === currentYear
    ).length;
    
    const pendingPaymentsTotal = userPayments.pendingPayments.reduce((total, payment) => {
      return total + parseFloat(payment.amount.replace('₹', '').replace(',', ''));
    }, 0);

    setUserStats({
      totalTrips: totalBookings,
      thisYearTrips: thisYearBookings,
      upcomingTrips: userUpcomingTrips.length,
      pendingPayments: pendingPaymentsTotal,
      membershipStatus: totalBookings > 10 ? 'Gold' : totalBookings > 5 ? 'Silver' : 'Bronze'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  };

  // Handle flight search form changes
  const handleFlightSearchChange = (e) => {
    const { name, value } = e.target;
    setFlightSearch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle flight search submission
  const handleFlightSearch = (e) => {
    e.preventDefault();
    console.log('Flight search data:', flightSearch);
    // Add your flight search API call here
    alert(`Searching flights from ${flightSearch.from} to ${flightSearch.to} on ${flightSearch.departureDate} for ${flightSearch.passengers} passenger(s)`);
  };

  // Get today's date in YYYY-MM-DD format for date input min value
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const renderWelcomeSection = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";
    else greeting = "Good Evening";


    return (
      <div className="welcome-section card mb-4">
        <div className="card-body">
          <div className="welcome-header mb-3">
            <h2>{greeting}, {userFromStorage?.name || 'DEBUG: No Name Found'}!</h2>
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
                <h3>{userStats.upcomingTrips}</h3>
                <p className="text-muted small mb-0">
                  {userUpcomingTrips.length > 0 ? 
                    `Next trip: ${new Date(userUpcomingTrips[0]?.date).toLocaleDateString()}` : 
                    'No upcoming trips'
                  }
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h6>Total Bookings</h6>
                <h3>{userStats.totalTrips}</h3>
                <p className="text-muted small mb-0">{userStats.thisYearTrips} this year</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h6>Pending Payments</h6>
                <h3>₹{userStats.pendingPayments.toLocaleString()}</h3>
                <p className="text-muted small mb-0">
                  {userPayments.pendingPayments.length > 0 ? 
                    `${userPayments.pendingPayments.length} pending` : 
                    'No pending payments'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'bookFlight':
        return <BookFlight />;
      case 'myBookings':
        return <MyBookings />;
      case 'payments':
        return <Payments />;
      case 'profile':
        return <Profile />;
      case 'dashboard':
        return (
          <>
            {renderWelcomeSection()}
            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
                      Quick Flight Search
                    </h5>
                    <form onSubmit={handleFlightSearch} className="flight-search-form">
                      <div className="row g-3">
                        {/* From and To fields */}
                        <div className="col-md-6">
                          <label htmlFor="from" className="form-label">From</label>
                          <input
                            type="text"
                            className="form-control"
                            id="from"
                            name="from"
                            value={flightSearch.from}
                            onChange={handleFlightSearchChange}
                            placeholder="Enter departure city"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="to" className="form-label">To</label>
                          <input
                            type="text"
                            className="form-control"
                            id="to"
                            name="to"
                            value={flightSearch.to}
                            onChange={handleFlightSearchChange}
                            placeholder="Enter destination city"
                            required
                          />
                        </div>
                        
                        {/* Date and Passengers */}
                        <div className="col-md-6">
                          <label htmlFor="departureDate" className="form-label">Departure Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="departureDate"
                            name="departureDate"
                            value={flightSearch.departureDate}
                            onChange={handleFlightSearchChange}
                            min={getTodayDate()}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="passengers" className="form-label">Passengers</label>
                          <select
                            className="form-select"
                            id="passengers"
                            name="passengers"
                            value={flightSearch.passengers}
                            onChange={handleFlightSearchChange}
                            required
                          >
                            {[1,2,3,4,5,6,7,8,9].map(num => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Passenger' : 'Passengers'}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Search Button */}
                        <div className="col-12">
                          <button 
                            type="submit" 
                            className="btn search-btn w-100 mt-3"
                          >
                            <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
                            Search Flights
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                {/* Upcoming Trips Section */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faPlane} className="me-2" />
                      Upcoming Trips
                    </h5>
                    {userUpcomingTrips.length > 0 ? (
                      <div className="row g-3">
                        {userUpcomingTrips.map(trip => (
                          <div key={trip.id} className="col-12">
                            <div className="trip-card p-3 border rounded">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1 text-primary">{trip.route}</h6>
                                  <small className="text-muted">{trip.flightNumber}</small>
                                </div>
                                <span className={`badge ${trip.status === 'Confirmed' ? 'bg-success' : 'bg-warning'}`}>
                                  {trip.status}
                                </span>
                              </div>
                              <div className="row text-sm">
                                <div className="col-6">
                                  <strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}
                                </div>
                                <div className="col-6">
                                  <strong>Time:</strong> {trip.time}
                                </div>
                                <div className="col-6">
                                  <strong>Gate:</strong> {trip.gate}
                                </div>
                                <div className="col-6">
                                  <strong>Seat:</strong> {trip.seat}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No upcoming trips</p>
                    )}
                  </div>
                </div>

                {/* Recent Bookings Section */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faBookmark} className="me-2" />
                      Recent Bookings
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Route</th>
                            <th>Flight</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>{booking.route}</td>
                              <td>{booking.flightNumber}</td>
                              <td>{new Date(booking.date).toLocaleDateString()}</td>
                              <td>{booking.amount}</td>
                              <td>
                                <span className={`badge ${
                                  booking.status === 'Completed' ? 'bg-success' : 
                                  booking.status === 'Cancelled' ? 'bg-danger' : 'bg-info'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                {/* Profile Snapshot */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Profile Snapshot
                    </h5>
                    <div className="profile-info">
                      <div className="d-flex align-items-center mb-3">
                        <div className="profile-avatar me-3">
                          <FontAwesomeIcon icon={faUser} className="fa-2x text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">{userFromStorage?.name || 'DEBUG: No Name Found'}</h6>
                          <small className="text-muted">{userFromStorage?.email || 'DEBUG: No Email Found'}</small>
                        </div>
                      </div>
                      <div className="profile-stats">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="stat-item">
                              <h6 className="mb-0">{userStats.totalTrips}</h6>
                              <small className="text-muted">Total Trips</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="stat-item">
                              <h6 className="mb-0">{userStats.thisYearTrips}</h6>
                              <small className="text-muted">This Year</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="stat-item">
                              <h6 className="mb-0">{userStats.membershipStatus}</h6>
                              <small className="text-muted">Status</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faBell} className="me-2" />
                      Notifications
                    </h5>
                    <div className="notifications-list">
                      {userNotifications.length > 0 ? userNotifications.map(notification => (
                        <div key={notification.id} className={`notification-item p-2 mb-2 rounded ${!notification.read ? 'bg-light' : ''}`}>
                          <div className="d-flex align-items-start">
                            <FontAwesomeIcon 
                              icon={
                                notification.type === 'flight-update' ? faPlane :
                                notification.type === 'offer' ? faWallet : faBell
                              } 
                              className="me-2 mt-1 text-primary" 
                            />
                            <div className="flex-grow-1">
                              <p className="mb-1 small">{notification.message}</p>
                              <small className="text-muted">{notification.time}</small>
                            </div>
                            {!notification.read && <div className="notification-dot bg-primary rounded-circle"></div>}
                          </div>
                        </div>
                      )) : (
                        <p className="text-muted text-center">No notifications</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payments & Refunds Overview */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faWallet} className="me-2" />
                      Payments & Refunds
                    </h5>
                    
                    {/* Pending Payments */}
                    <div className="mb-3">
                      <h6 className="text-warning mb-2">Pending Payments</h6>
                      {userPayments.pendingPayments.length > 0 ? userPayments.pendingPayments.map(payment => (
                        <div key={payment.id} className="payment-item p-2 mb-2 bg-light rounded">
                          <div className="d-flex justify-content-between">
                            <div>
                              <small className="d-block">{payment.description}</small>
                              <small className="text-muted">Due: {new Date(payment.dueDate).toLocaleDateString()}</small>
                            </div>
                            <strong className="text-warning">{payment.amount}</strong>
                          </div>
                        </div>
                      )) : (
                        <p className="text-muted small">No pending payments</p>
                      )}
                    </div>

                    {/* Refunds */}
                    <div>
                      <h6 className="text-info mb-2">Refund Status</h6>
                      {userPayments.refunds.length > 0 ? userPayments.refunds.map(refund => (
                        <div key={refund.id} className="payment-item p-2 mb-2 bg-light rounded">
                          <div className="d-flex justify-content-between">
                            <div>
                              <small className="d-block">{refund.description}</small>
                              <span className={`badge badge-sm ${refund.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                                {refund.status}
                              </span>
                            </div>
                            <strong className="text-success">{refund.amount}</strong>
                          </div>
                        </div>
                      )) : (
                        <p className="text-muted small">No refunds</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promotions & Offers */}
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <FontAwesomeIcon icon={faWallet} className="me-2" />
                      Current Offers
                    </h5>
                    {offers.map(offer => (
                      <div key={offer.id} className="offer-card p-3 mb-3 border rounded bg-gradient">
                        <h6 className="text-primary mb-2">{offer.title}</h6>
                        <p className="mb-2 small">{offer.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <code className="bg-primary text-white px-2 py-1 rounded">{offer.code}</code>
                          <small className="text-muted">Valid till {new Date(offer.validTill).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
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
                {notificationCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notificationCount}
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