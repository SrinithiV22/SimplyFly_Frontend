import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchFlights } from '../api';
import './Flights.css';

function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterBy, setFilterBy] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFlightOwner, setIsFlightOwner] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Parse search params from URL
  const searchParams = new URLSearchParams(location.search);
  const fromCity = searchParams.get('from') || '';
  const toCity = searchParams.get('to') || '';
  const departureDate = searchParams.get('departure') || '';
  const passengers = searchParams.get('passengers') || '1';
  const travelClass = searchParams.get('class') || 'Economy';

  // Enhanced airline data with logos and names - deterministic based on route
  const getAirlineInfo = (originalAirline, route) => {
    const airlines = [
      { name: 'IndiGo', logo: '🔵', code: '6E' },
      { name: 'Air India', logo: '🇮🇳', code: 'AI' },
      { name: 'SpiceJet', logo: '🌶️', code: 'SG' },
      { name: 'Vistara', logo: '✨', code: 'UK' },
      { name: 'GoFirst', logo: '🟢', code: 'G8' },
      { name: 'AirAsia India', logo: '🔴', code: 'I5' },
      { name: 'Akasa Air', logo: '🟣', code: 'QP' }
    ];

    if (originalAirline && originalAirline !== 'Unknown Airline') {
      return {
        name: originalAirline,
        logo: airlines.find(a => a.name === originalAirline)?.logo || '✈️',
        code: airlines.find(a => a.name === originalAirline)?.code || 'XX'
      };
    }

    // Deterministic airline selection based on route
    // Create a hash of the route to get consistent airline
    let hash = 0;
    for (let i = 0; i < route.length; i++) {
      const char = route.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const airlineIndex = Math.abs(hash) % airlines.length;
    
    return airlines[airlineIndex];
  };

  // Generate deterministic flight number based on route
  const generateFlightNumber = (airlineCode, route) => {
    // Create a hash of the route to get consistent flight number
    let hash = 0;
    for (let i = 0; i < route.length; i++) {
      const char = route.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const flightNum = 1000 + (Math.abs(hash) % 8999); // Generate number between 1000-9999
    return `${airlineCode}${flightNum}`;
  };

  // Flight duration data based on actual distances
  const getFlightDuration = (origin, destination) => {
    const durations = {
      // From Delhi (DEL)
      'DEL-BOM': { hours: 2, minutes: 20 },
      'DEL-BLR': { hours: 2, minutes: 45 },
      'DEL-MAA': { hours: 2, minutes: 50 },
      'DEL-CCU': { hours: 2, minutes: 30 },
      'DEL-HYD': { hours: 2, minutes: 35 },
      'DEL-COK': { hours: 3, minutes: 15 },
      'DEL-GOI': { hours: 2, minutes: 45 },
      
      // From Mumbai (BOM)
      'BOM-DEL': { hours: 2, minutes: 20 },
      'BOM-BLR': { hours: 1, minutes: 35 },
      'BOM-MAA': { hours: 1, minutes: 50 },
      'BOM-CCU': { hours: 2, minutes: 45 },
      'BOM-HYD': { hours: 1, minutes: 25 },
      'BOM-COK': { hours: 1, minutes: 30 },
      'BOM-GOI': { hours: 1, minutes: 15 },
      
      // From Bangalore (BLR)
      'BLR-DEL': { hours: 2, minutes: 45 },
      'BLR-BOM': { hours: 1, minutes: 35 },
      'BLR-MAA': { hours: 1, minutes: 15 },
      'BLR-CCU': { hours: 2, minutes: 30 },
      'BLR-HYD': { hours: 1, minutes: 20 },
      'BLR-COK': { hours: 1, minutes: 25 },
      'BLR-GOI': { hours: 1, minutes: 10 },
      
      // From Chennai (MAA)
      'MAA-DEL': { hours: 2, minutes: 50 },
      'MAA-BOM': { hours: 1, minutes: 50 },
      'MAA-BLR': { hours: 1, minutes: 15 },
      'MAA-CCU': { hours: 2, minutes: 15 },
      'MAA-HYD': { hours: 1, minutes: 30 },
      'MAA-COK': { hours: 1, minutes: 25 },
      'MAA-GOI': { hours: 1, minutes: 45 },
      
      // From Kolkata (CCU)
      'CCU-DEL': { hours: 2, minutes: 30 },
      'CCU-BOM': { hours: 2, minutes: 45 },
      'CCU-BLR': { hours: 2, minutes: 30 },
      'CCU-MAA': { hours: 2, minutes: 15 },
      'CCU-HYD': { hours: 2, minutes: 10 },
      'CCU-COK': { hours: 2, minutes: 50 },
      'CCU-GOI': { hours: 2, minutes: 30 },
      
      // From Hyderabad (HYD)
      'HYD-DEL': { hours: 2, minutes: 35 },
      'HYD-BOM': { hours: 1, minutes: 25 },
      'HYD-BLR': { hours: 1, minutes: 20 },
      'HYD-MAA': { hours: 1, minutes: 30 },
      'HYD-CCU': { hours: 2, minutes: 10 },
      'HYD-COK': { hours: 1, minutes: 45 },
      'HYD-GOI': { hours: 1, minutes: 30 },
      
      // From Kochi (COK)
      'COK-DEL': { hours: 3, minutes: 15 },
      'COK-BOM': { hours: 1, minutes: 30 },
      'COK-BLR': { hours: 1, minutes: 25 },
      'COK-MAA': { hours: 1, minutes: 25 },
      'COK-CCU': { hours: 2, minutes: 50 },
      'COK-HYD': { hours: 1, minutes: 45 },
      'COK-GOI': { hours: 1, minutes: 20 },
      
      // From Goa (GOI)
      'GOI-DEL': { hours: 2, minutes: 45 },
      'GOI-BOM': { hours: 1, minutes: 15 },
      'GOI-BLR': { hours: 1, minutes: 10 },
      'GOI-MAA': { hours: 1, minutes: 45 },
      'GOI-CCU': { hours: 2, minutes: 30 },
      'GOI-HYD': { hours: 1, minutes: 30 },
      'GOI-COK': { hours: 1, minutes: 20 }
    };

    const route = `${origin}-${destination}`;
    return durations[route] || { hours: 2, minutes: 30 }; // Default duration
  };

  const generateRealisticArrivalTime = (departureTime, origin, destination) => {
    if (!departureTime || !origin || !destination) return null;
    
    try {
      let depDate;
      if (departureTime.includes('T')) {
        depDate = new Date(departureTime);
      } else {
        depDate = new Date(departureTime.replace(' ', 'T'));
      }
      
      if (isNaN(depDate.getTime())) return null;
      
      const duration = getFlightDuration(origin, destination);
      const totalMinutes = (duration.hours * 60) + duration.minutes;
      
      const arrivalDate = new Date(depDate.getTime() + (totalMinutes * 60 * 1000));
      return arrivalDate.toISOString();
    } catch (error) {
      console.error('Error generating arrival time:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        const data = await fetchFlights();
        console.log('Fetched flights:', data);
        
        // Enhance flights with deterministic data based on route
        const enhancedFlights = data.map((flight, index) => {
          const route = `${flight.origin}-${flight.destination}`;
          const airlineInfo = getAirlineInfo(flight.airline, route);
          const flightNumber = generateFlightNumber(airlineInfo.code, route);
          
          // Calculate price based on travel class
          const basePriceMultiplier = {
            'Economy': 1.0,
            'Premium Economy': 1.4,
            'Business': 2.2,
            'First Class': 3.5
          };
          const multiplier = basePriceMultiplier[travelClass] || 1.0;
          const adjustedPrice = Math.round(parseFloat(flight.price || 0) * multiplier);
          
          // Generate departure time if not present (use search date or default to today)
          let departureTime = flight.departureTime;
          if (!departureTime) {
            // Use the searched departure date if available, otherwise use current date
            const baseDate = departureDate ? new Date(departureDate) : new Date();
            // Generate consistent time based on route hash
            let routeHash = 0;
            for (let i = 0; i < route.length; i++) {
              routeHash = ((routeHash << 5) - routeHash) + route.charCodeAt(i);
            }
            const hours = 6 + (Math.abs(routeHash) % 16); // 6 AM to 10 PM
            const minutes = (Math.abs(routeHash) % 4) * 15; // 0, 15, 30, 45 minutes
            baseDate.setHours(hours, minutes, 0, 0);
            departureTime = baseDate.toISOString();
          }
          
          // Generate realistic arrival time if not present or invalid
          let arrivalTime = flight.arrivalTime;
          if (!arrivalTime || arrivalTime === departureTime) {
            arrivalTime = generateRealisticArrivalTime(departureTime, flight.origin, flight.destination);
          }
          
          // Deterministic stops based on route (consistent for same route)
          let hash = 0;
          for (let i = 0; i < route.length; i++) {
            const char = route.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          const hasStops = (Math.abs(hash) % 10) < 3; // 30% chance consistently per route
          
          return {
            ...flight,
            // Preserve the original database ID, but add a display ID for UI purposes
            id: flight.id, // Keep the database ID for booking
            displayId: `${route}-${airlineInfo.code}`, // For display purposes
            airline: airlineInfo.name,
            airlineLogo: airlineInfo.logo,
            flightNumber: flight.flightNumber || flightNumber,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            stops: flight.stops !== undefined ? flight.stops : (hasStops ? 1 : 0),
            price: adjustedPrice // Use the class-adjusted price
          };
        });
        
        setFlights(enhancedFlights);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError(err.message || 'Failed to fetch flights');
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, []);

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      // If no token, redirect to login
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = userData.Role;
        setIsAdmin(userRole === 'Admin');
        setIsFlightOwner(userRole === 'Flightowner');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        setIsFlightOwner(false);
        // If there's an error parsing user data, redirect to login
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Safe date and time formatting functions
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString.replace(' ', 'T'));
      }
      
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error, dateString);
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString.replace(' ', 'T'));
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const calculateDuration = (departureString, arrivalString) => {
    if (!departureString || !arrivalString) return '--h --m';
    
    try {
      let departureDate, arrivalDate;
      
      if (departureString.includes('T')) {
        departureDate = new Date(departureString);
        arrivalDate = new Date(arrivalString);
      } else {
        departureDate = new Date(departureString.replace(' ', 'T'));
        arrivalDate = new Date(arrivalString.replace(' ', 'T'));
      }
      
      if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
        return '--h --m';
      }
      
      const diff = arrivalDate - departureDate;
      if (diff <= 0) return '--h --m';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating duration:', error, departureString, arrivalString);
      return '--h --m';
    }
  };

  // Update the sortedAndFilteredFlights logic to include origin/destination filtering
const sortedAndFilteredFlights = flights
  .filter(flight => {
    if (!flight) return false;
    
    // Filter by origin and destination if provided in search params
    if (fromCity && fromCity !== 'Any') {
      const flightOrigin = (flight.origin || '').toLowerCase();
      const searchFrom = fromCity.toLowerCase();
      if (!flightOrigin.includes(searchFrom)) return false;
    }
    
    if (toCity && toCity !== 'Any') {
      const flightDestination = (flight.destination || '').toLowerCase();
      const searchTo = toCity.toLowerCase();
      if (!flightDestination.includes(searchTo)) return false;
    }
    
    // Existing filter logic for stops
    if (filterBy === 'all') return true;
    if (filterBy === 'direct') return !flight.stops || flight.stops === 0 || flight.stops === '0';
    if (filterBy === 'stops') return flight.stops && flight.stops > 0;
    return true;
  })
  .sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case 'price':
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
      case 'duration':
        const durationA = new Date(a.arrivalTime || 0) - new Date(a.departureTime || 0);
        const durationB = new Date(b.arrivalTime || 0) - new Date(b.departureTime || 0);
        return durationA - durationB;
      case 'departure':
        const depA = new Date(a.departureTime || 0);
        const depB = new Date(b.departureTime || 0);
        return depA - depB;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flights-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="logo-icon">✈️</span>
              <span className="logo-text">SimplyFly</span>
              <span className="logo-subtitle">A Flipkart Company</span>
            </div>
          </div>
        </nav>
        
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching for the best flights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flights-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="logo-icon">✈️</span>
              <span className="logo-text">SimplyFly</span>
              <span className="logo-subtitle">A Flipkart Company</span>
            </div>
          </div>
        </nav>
        
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flights-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">✈️</span>
            <span className="logo-text">SimplyFly</span>
            <span className="logo-subtitle">Fly Like A Bird</span>
          </div>

          <div className="navbar-menu">
            <div className="navbar-item" onClick={() => handleNavigation('/home')} style={{ cursor: 'pointer' }}>
              <span className="navbar-icon">🎯</span>
              Home
            </div>
            <div className="navbar-item active">
              <span className="navbar-icon">✈️</span>
              Flights
            </div>
            {!isAdmin && !isFlightOwner && (
              <div className="navbar-item" onClick={() => handleNavigation('/my-bookings')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">📋</span>
                Bookings
              </div>
            )}
            {isAdmin && (
              <div className="navbar-item" onClick={() => handleNavigation('/admin')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">👨‍💼</span>
                Admin
              </div>
            )}
            {isFlightOwner && (
              <div className="navbar-item" onClick={() => handleNavigation('/flight-owner')} style={{ cursor: 'pointer' }}>
                <span className="navbar-icon">🛫</span>
                Flight Owner
              </div>
            )}
          </div>

          <div className="navbar-auth">
            <button className="logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flights-content">
        <div className="flights-container">
          
      {/* Search Summary */}
      <div className="search-summary">
        <div className="route-info">
          <div className="route-cities">
            <span className="from-city">{fromCity || 'Any Origin'}</span>
            <span className="route-arrow">→</span>
            <span className="to-city">{toCity || 'Any Destination'}</span>
          </div>
          <div className="travel-details">
            <span className="travel-date">{departureDate ? formatDate(departureDate) : 'Any Date'}</span>
            <span className="separator">•</span>
            <span className="passenger-count">{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
            <span className="separator">•</span>
            <span className="travel-class">{travelClass}</span>
          </div>
        </div>
        
        <button className="modify-search-btn" onClick={() => handleNavigation('/home')}>
          Modify Search
        </button>
      </div>

          {/* Filters and Sort */}
          <div className="filters-section">
            <div className="filters-left">
              <div className="filter-group">
                <label>Filter by:</label>
                <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                  <option value="all">All Flights</option>
                  <option value="direct">Direct Flights</option>
                  <option value="stops">Flights with Stops</option>
                </select>
              </div>
            </div>
            
            <div className="filters-right">
              <div className="sort-group">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="price">Price (Low to High)</option>
                  <option value="duration">Duration (Shortest First)</option>
                  <option value="departure">Departure Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            <h2>{sortedAndFilteredFlights.length} flights found</h2>
            <p>
              {fromCity && toCity 
                ? `Showing flights from ${fromCity} to ${toCity}` 
                : fromCity 
                  ? `Showing flights from ${fromCity}` 
                  : toCity 
                    ? `Showing flights to ${toCity}` 
                    : 'Showing all available flights'
              }
            </p>
          </div>

          {/* Flights List */}
          <div className="flights-list">
            {sortedAndFilteredFlights.length === 0 ? (
              <div className="no-flights">
                <div className="no-flights-icon">✈️</div>
                <h3>No flights found</h3>
                <p>Try adjusting your search criteria or add more flights to the database</p>
              </div>
            ) : (
              sortedAndFilteredFlights.map(flight => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-header">
                    <div className="airline-info">
                      <span className="airline-logo">{flight.airlineLogo || '✈️'}</span>
                      <div className="airline-details">
                        <span className="airline-name">{flight.airline}</span>
                        <span className="flight-number">{flight.flightNumber}</span>
                      </div>
                    </div>
                    <div className="flight-price">
                      <span className="price">₹{parseFloat(flight.price || 0).toLocaleString()}</span>
                      <span className="price-per-person">per person</span>
                    </div>
                  </div>

                  <div className="flight-route">
                    <div className="departure-info">
                      <div className="time">{formatTime(flight.departureTime)}</div>
                      <div className="city">{flight.origin || flight.source || 'N/A'}</div>
                      <div className="date">{formatDate(flight.departureTime)}</div>
                    </div>

                    <div className="flight-duration">
                      <div className="duration-line">
                        <div className="duration-dot start"></div>
                        <div className="duration-path">
                          {(flight.stops && flight.stops > 0) && (
                            <div className="stop-indicator">
                              <span>{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                        <div className="duration-dot end"></div>
                      </div>
                      <div className="duration-text">
                        {calculateDuration(flight.departureTime, flight.arrivalTime)}
                      </div>
                    </div>

                    <div className="arrival-info">
                      <div className="time">{formatTime(flight.arrivalTime)}</div>
                      <div className="city">{flight.destination || 'N/A'}</div>
                      <div className="date">{formatDate(flight.arrivalTime)}</div>
                    </div>
                  </div>

                  <div className="flight-footer">
                    <div className="flight-details">
                      <span className="baggage-info">✅ Cabin bag included</span>
                      <span className="separator">•</span>
                      <span className="cancellation">❌ Cancellable</span>
                    </div>
                    
                    <div className="flight-actions">
                      <button className="book-now-btn" onClick={() => {
                        // Store complete flight data for booking page
                        const flightDataForBooking = {
                          ...flight,
                          duration: calculateDuration(flight.departureTime, flight.arrivalTime),
                          searchedDepartureDate: departureDate, // Add the original search date
                          travelClass: travelClass // Add the selected travel class
                        };
                        localStorage.setItem('selectedFlightData', JSON.stringify(flightDataForBooking));
                        
                        const bookingParams = new URLSearchParams({
                          flightId: flight.id, // Use the database ID
                          price: flight.price,
                          passengers: passengers,
                          departureDate: departureDate || (() => {
                            const today = new Date();
                            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          })() // Pass the departure date without timezone issues
                        });
                        navigate(`/bookings?${bookingParams.toString()}`);
                      }}>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flights;