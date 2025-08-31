import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayDateString, createDateString } from '../utils/dateUtils';
import './Home.css';

function Home() {
  const [tripType, setTripType] = useState('oneWay');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCitySearch, setFromCitySearch] = useState('');
  const [toCitySearch, setToCitySearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [travelClass, setTravelClass] = useState('Business');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFlightOwner, setIsFlightOwner] = useState(false);
  
  // Calendar states
  const [showDepartCalendar, setShowDepartCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Set to first day of current month
  });
  const [returnMonth, setReturnMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Set to first day of current month
  });
  
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const returnCalendarRef = useRef(null);
  const passengerDropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  const popularCities = [
    { code: 'MAA', name: 'Chennai', country: 'IN', airport: 'Chennai Airport (MAA)' },
    { code: 'COK', name: 'Kochi', country: 'IN', airport: 'Cochin International Airport (COK)' },
    { code: 'DEL', name: 'New Delhi', country: 'IN', airport: 'Indira Gandhi Airport (DEL)' },
    { code: 'BOM', name: 'Mumbai', country: 'IN', airport: 'Chhatrapati Shivaji Airport (BOM)' },
    { code: 'BLR', name: 'Bengaluru', country: 'IN', airport: 'Kempegowda International Airport (BLR)' },
    { code: 'HYD', name: 'Hyderabad', country: 'IN', airport: 'Rajiv Gandhi International Airport (HYD)' },
    { code: 'CCU', name: 'Kolkata', country: 'IN', airport: 'Netaji Subhas Chandra Bose International Airport (CCU)' },
    { code: 'GOI', name: 'Goa', country: 'IN', airport: 'Dabolim Airport (GOI)' }
  ];

  // Set default date to today
  useEffect(() => {
    setDepartDate(getTodayDateString());
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

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.calendar-nav')) {
        return;
      }
      
      if (calendarRef.current && !calendarRef.current.contains(event.target) && 
          !event.target.closest('.date-input:not(.return-date)')) {
        setShowDepartCalendar(false);
      }
      
      if (returnCalendarRef.current && !returnCalendarRef.current.contains(event.target) && 
          !event.target.closest('.return-date')) {
        setShowReturnCalendar(false);
      }
      
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target) && 
          !event.target.closest('.passenger-class-selector')) {
        setShowPassengerDropdown(false);
      }

      // Close city dropdowns
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target) && 
          !event.target.closest('.from-city')) {
        setShowFromDropdown(false);
      }

      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target) && 
          !event.target.closest('.to-city')) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter cities based on search
  const getFilteredCities = (searchTerm) => {
    if (!searchTerm) return popularCities;
    return popularCities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.airport.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCitySelect = (city, type) => {
    if (type === 'from') {
      setFromCity(city.code);
      setFromCitySearch(`${city.code} - ${city.name}, ${city.country}`);
      setShowFromDropdown(false);
    } else {
      setToCity(city.code);
      setToCitySearch(`${city.code} - ${city.name}, ${city.country}`);
      setShowToDropdown(false);
    }
  };

  const swapCities = () => {
    const tempCode = fromCity;
    const tempSearch = fromCitySearch;
    
    setFromCity(toCity);
    setFromCitySearch(toCitySearch);
    setToCity(tempCode);
    setToCitySearch(tempSearch);
  };

  // ... rest of your existing functions (formatDisplayDate, generateCalendar, etc.)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calendar = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Create date string without timezone issues
      const dateString = createDateString(year, month, day);
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateString === departDate || dateString === returnDate;
      const isPast = date < today;
      
      calendar.push({
        day,
        date: dateString,
        isToday,
        isSelected,
        isPast
      });
    }

    return calendar;
  };

  const handleDateSelect = (dateString, type) => {
    if (type === 'depart') {
      setDepartDate(dateString);
      setShowDepartCalendar(false);
      if (returnDate && returnDate < dateString) {
        setReturnDate('');
      }
    } else {
      setReturnDate(dateString);
      setShowReturnCalendar(false);
    }
  };

  const navigateMonth = (direction, type = 'depart') => {
    if (type === 'depart') {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
        return newMonth;
      });
    } else {
      setReturnMonth(prev => {
        const newMonth = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
        return newMonth;
      });
    }
  };

  const handleSearch = () => {
    if (!fromCity || !toCity || !departDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const searchParams = new URLSearchParams({
      from: fromCity,
      to: toCity,
      departure: departDate,
      ...(tripType === 'roundTrip' && { return: returnDate }),
      passengers: passengers.adults + passengers.children,
      class: travelClass
    });
    
    navigate(`/flights?${searchParams.toString()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    navigate('/login');
  };

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const getPassengerDisplayText = () => {
    const { adults, children, infants } = passengers;
    const total = adults + children + infants;
    
    if (total === 1) {
      return `${total} Traveller`;
    } else {
      return `${total} Travellers`;
    }
  };

  const getTravelClassDisplayText = () => {
    return travelClass;
  };

  const updatePassengers = (type, action) => {
    setPassengers(prev => ({
      ...prev,
      [type]: action === 'increase' 
        ? prev[type] + 1 
        : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1)
    }));
  };

  const CalendarComponent = ({ month, onNavigate, onDateSelect, type, calendarRef }) => (
    <div className="calendar-popup" ref={calendarRef}>
      <div className="calendar-header">
        <button 
          type="button" 
          className="calendar-nav"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1, type);
          }}
        >
          ←
        </button>
        <span className="calendar-month">
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button 
          type="button" 
          className="calendar-nav"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1, type);
          }}
        >
          →
        </button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {generateCalendar(month.getMonth(), month.getFullYear()).map((dayObj, index) => {
            const isDisabled = dayObj?.isPast || (type === 'return' && dayObj && dayObj.date < departDate);
            return (
              <div
                key={index}
                className={`calendar-day ${dayObj ? '' : 'empty'} ${
                  dayObj?.isToday ? 'today' : ''
                } ${dayObj?.isSelected ? 'selected' : ''} ${
                  isDisabled ? 'past' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dayObj && !isDisabled) {
                    onDateSelect(dayObj.date, type);
                  }
                }}
              >
                {dayObj?.day}
                {dayObj && !isDisabled && (
                  <span className="price">₹{Math.floor(Math.random() * 2000) + 3000}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-icon">✈️</span>
            <span className="logo-text">SimplyFly</span>
            <span className="logo-subtitle">Fly Like A Bird</span>
          </div>

          <div className="navbar-menu">
            <a href="#" className="navbar-item">
              <span className="navbar-icon">🎯</span>
              Home
            </a>
            <a 
              href="#" 
              className="navbar-item"
              onClick={(e) => {
                e.preventDefault();
                navigate('/flights');
              }}
            >
              <span className="navbar-icon">✈️</span>
              Flights
            </a>
            {!isAdmin && !isFlightOwner && (
              <a 
                href="#" 
                className="navbar-item"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/my-bookings');
                }}
              >
                <span className="navbar-icon">📋</span>
                Bookings
              </a>
            )}
            {isAdmin && (
              <a 
                href="#" 
                className="navbar-item"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
              >
                <span className="navbar-icon">👨‍💼</span>
                Admin
              </a>
            )}
            {isFlightOwner && (
              <a 
                href="#" 
                className="navbar-item"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/flight-owner');
                }}
              >
                <span className="navbar-icon">🛫</span>
                Flight Owner
              </a>
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
      <div className="main-content">
        <div className="content-wrapper">
          <div className="search-section">
            <div className="search-header">
              <h1>Search flights</h1>
              <p>Enjoy hassle free flight ticket bookings at lowest airfare</p>
            </div>

            <div className="search-form-container">
              {/* Trip Type Row */}
              <div className="trip-type-row">
                <div className="trip-type-group">
                  <label className={tripType === 'oneWay' ? 'active' : ''}>
                    <input
                      type="radio"
                      value="oneWay"
                      checked={tripType === 'oneWay'}
                      onChange={(e) => setTripType(e.target.value)}
                    />
                    <span className="trip-icon">→</span>
                    One way
                  </label>
                  <label className={tripType === 'roundTrip' ? 'active' : ''}>
                    <input
                      type="radio"
                      value="roundTrip"
                      checked={tripType === 'roundTrip'}
                      onChange={(e) => setTripType(e.target.value)}
                    />
                    <span className="trip-icon">⇄</span>
                    Round trip
                  </label>
                </div>
                
                <div className="passenger-class-selector" ref={passengerDropdownRef}>
                  <div 
                    className="passenger-display"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassengerDropdown(!showPassengerDropdown);
                    }}
                  >
                    <span className="passenger-icon">👤</span>
                    {getPassengerDisplayText()}, {getTravelClassDisplayText()}
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  
                  {showPassengerDropdown && (
                    <div className="passenger-dropdown">
                      <div className="passenger-row">
                        <div className="passenger-info">
                          <span>Adults</span>
                          <small>(12+ years)</small>
                        </div>
                        <div className="passenger-controls">
                          <button 
                            type="button"
                            onClick={() => updatePassengers('adults', 'decrease')}
                            disabled={passengers.adults <= 1}
                          >
                            -
                          </button>
                          <span>{passengers.adults}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengers('adults', 'increase')}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="passenger-row">
                        <div className="passenger-info">
                          <span>Children</span>
                          <small>(2-12 years)</small>
                        </div>
                        <div className="passenger-controls">
                          <button 
                            type="button"
                            onClick={() => updatePassengers('children', 'decrease')}
                            disabled={passengers.children <= 0}
                          >
                            -
                          </button>
                          <span>{passengers.children}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengers('children', 'increase')}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="passenger-row">
                        <div className="passenger-info">
                          <span>Infants</span>
                          <small>(Under 2 years)</small>
                        </div>
                        <div className="passenger-controls">
                          <button 
                            type="button"
                            onClick={() => updatePassengers('infants', 'decrease')}
                            disabled={passengers.infants <= 0}
                          >
                            -
                          </button>
                          <span>{passengers.infants}</span>
                          <button 
                            type="button"
                            onClick={() => updatePassengers('infants', 'increase')}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="class-selector">
                        <label>Travel Class</label>
                        <select 
                          value={travelClass}
                          onChange={(e) => setTravelClass(e.target.value)}
                        >
                          <option value="Economy">Economy</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business">Business</option>
                          <option value="First Class">First Class</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cities Row - NEW SEARCHABLE DROPDOWNS */}
              <div className="cities-row">
                <div className="city-input from-city">
                  <span className="city-icon">✈️</span>
                  <input
                    type="text"
                    className="city-search-input"
                    placeholder="Where from?"
                    value={fromCitySearch}
                    onChange={(e) => {
                      setFromCitySearch(e.target.value);
                      setShowFromDropdown(true);
                      setShowToDropdown(false);
                    }}
                    onFocus={() => {
                      setShowFromDropdown(true);
                      setShowToDropdown(false);
                    }}
                  />
                  
                  {showFromDropdown && (
                    <div className="city-dropdown" ref={fromDropdownRef}>
                      {getFilteredCities(fromCitySearch).length > 0 ? (
                        getFilteredCities(fromCitySearch).map(city => (
                          <div 
                            key={city.code} 
                            className="city-dropdown-item"
                            onClick={() => handleCitySelect(city, 'from')}
                          >
                            <div className="city-code">{city.code}</div>
                            <div className="city-details">
                              <div className="city-name">{city.name}, {city.country}</div>
                              <div className="city-airport">{city.airport}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-results">No cities found</div>
                      )}
                    </div>
                  )}
                </div>

                <button className="swap-cities-btn" onClick={swapCities}>
                  ⇄
                </button>

                <div className="city-input to-city">
                  <span className="city-icon">🛬</span>
                  <input
                    type="text"
                    className="city-search-input"
                    placeholder="Where to?"
                    value={toCitySearch}
                    onChange={(e) => {
                      setToCitySearch(e.target.value);
                      setShowToDropdown(true);
                      setShowFromDropdown(false);
                    }}
                    onFocus={() => {
                      setShowToDropdown(true);
                      setShowFromDropdown(false);
                    }}
                  />
                  
                  {showToDropdown && (
                    <div className="city-dropdown" ref={toDropdownRef}>
                      {getFilteredCities(toCitySearch).length > 0 ? (
                        getFilteredCities(toCitySearch).map(city => (
                          <div 
                            key={city.code} 
                            className="city-dropdown-item"
                            onClick={() => handleCitySelect(city, 'to')}
                          >
                            <div className="city-code">{city.code}</div>
                            <div className="city-details">
                              <div className="city-name">{city.name}, {city.country}</div>
                              <div className="city-airport">{city.airport}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-results">No cities found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Row */}
              <div className="date-row">
                <div className="date-input" onClick={(e) => {
                  e.stopPropagation();
                  setShowDepartCalendar(!showDepartCalendar);
                  setShowReturnCalendar(false);
                }}>
                  <span className="date-icon">📅</span>
                  <div className="date-content">
                    <span className="date-display">
                      {departDate ? formatDisplayDate(departDate) : 'Departure'}
                    </span>
                  </div>
                  
                  {showDepartCalendar && (
                    <CalendarComponent
                      month={currentMonth}
                      onNavigate={navigateMonth}
                      onDateSelect={handleDateSelect}
                      type="depart"
                      calendarRef={calendarRef}
                    />
                  )}
                </div>

                {tripType === 'roundTrip' && (
                  <div className="date-input return-date" onClick={(e) => {
                    e.stopPropagation();
                    setShowReturnCalendar(!showReturnCalendar);
                    setShowDepartCalendar(false);
                  }}>
                    <span className="date-icon">📅</span>
                    <div className="date-content">
                      <span className="date-display">
                        {returnDate ? formatDisplayDate(returnDate) : 'Return'}
                      </span>
                    </div>
                    
                    {showReturnCalendar && (
                      <CalendarComponent
                        month={returnMonth}
                        onNavigate={navigateMonth}
                        onDateSelect={handleDateSelect}
                        type="return"
                        calendarRef={returnCalendarRef}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Fare Options */}
              <div className="fare-options">
                <button className="fare-option">Senior citizen fare</button>
                <button className="fare-option">Student fare</button>
                <button className="fare-option">Armed forces fare</button>
              </div>

              {/* Special Offer */}
              <div className="special-offer">
                <input type="checkbox" id="simplyfly-work" />
                <label htmlFor="simplyfly-work">
                  <strong>Unlock 10% extra savings</strong>
                  <span className="new-badge">NEW</span>
                  <br />
                  <small>SimplyFly for Work</small>
                </label>
              </div>

              {/* Search Button */}
              <button className="search-flights-btn" onClick={handleSearch}>
                Search flights
              </button>
            </div>
          </div>

          {/* Offers Section */}
          <div className="offers-section">
            <div className="offer-card main-offer">
              <div className="offer-badge">DOMFLASH</div>
              <div className="offer-content">
                <h3>Starting ₹999</h3>
                <p>on Domestic Flights</p>
                <div className="offer-timer">DAILY 12PM</div>
              </div>
              <div className="offer-bank">
                <span>💳 HDFC BANK</span>
                <small>Valid on ✈️ Debit Card & EMI Transactions</small>
              </div>
            </div>

            <div className="more-offers">
              <div className="more-offers-header">
                <h4>More offers</h4>
                <a href="#" className="view-all">View all</a>
              </div>
              <div className="offer-item">
                <h5>Exclusive Flight Deals with SimplyFly for Work!</h5>
              </div>
              <div className="offer-item">
                <h5>Up to 12% off on Domestic Flights!</h5>
                <p>Extra ₹1000 off with Super Coins + 5% cashback with Flipkart Axis Card</p>
              </div>
              <div className="offer-item">
                <p>Use Coupon code CFWSPL</p>
                <a href="#" className="know-more">Know more</a>
              </div>
            </div>

            <div className="popular-destinations-sidebar">
              <h4>Popular destinations</h4>
              <div className="destinations-mini-grid">
                {[
                  { city: 'Goa', price: '₹4,235', image: '🏖️' },
                  { city: 'Mumbai', price: '₹3,891', image: '🏙️' },
                  { city: 'Bangalore', price: '₹2,156', image: '🌆' },
                  { city: 'Delhi', price: '₹3,456', image: '🏛️' }
                ].map((dest, index) => (
                  <div key={index} className="destination-mini-card">
                    <div className="destination-mini-image">{dest.image}</div>
                    <div className="destination-mini-info">
                      <h5>{dest.city}</h5>
                      <p>from {dest.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations Full Section */}
      <div className="popular-destinations">
        <div className="container">
          <h2>Popular destinations</h2>
          <div className="destinations-grid">
            {[
              { city: 'Goa', price: '₹4,235', image: '🏖️' },
              { city: 'Mumbai', price: '₹3,891', image: '🏙️' },
              { city: 'Bangalore', price: '₹2,156', image: '🌆' },
              { city: 'Delhi', price: '₹3,456', image: '🏛️' },
              { city: 'Chennai', price: '₹2,890', image: '🏖️' },
              { city: 'Hyderabad', price: '₹3,234', image: '🌃' }
            ].map((dest, index) => (
              <div key={index} className="destination-card">
                <div className="destination-image">{dest.image}</div>
                <div className="destination-info">
                  <h3>{dest.city}</h3>
                  <p>from {dest.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Easy booking</h3>
              <p>Quick and hassle-free flight bookings in just a few clicks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best prices</h3>
              <p>Compare prices across airlines to get the best deals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Trusted platform</h3>
              <p>Millions of customers trust us for their travel needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;