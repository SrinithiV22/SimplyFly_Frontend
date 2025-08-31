import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const isLoggedIn = localStorage.getItem('userToken') || localStorage.getItem('token');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <span className="logo-icon">✈️</span>
          <div>
            <span className="logo-text">SimplyFly</span>
            <span className="logo-subtitle">Fly Like A Bird</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="navbar-menu">
          <Link to="/home" className="navbar-item">
            <span className="navbar-icon">🏠</span>
            Home
          </Link>

          <Link to="/flights" className="navbar-item">
            <span className="navbar-icon">✈️</span>
            Flights
          </Link>

          <Link to="/flight-owner" className="navbar-item">
            <span className="navbar-icon">🛫</span>
            Flight Owner
          </Link>

          {/* Auth Section */}
          <div className="navbar-auth">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
