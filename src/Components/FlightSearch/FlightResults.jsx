import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faClock, 
  faRupeeSign,
  faWifi,
  faUtensils,
  faSuitcase,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function FlightResults({ flights, loading, searchParams }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('price');

  const handleBookFlight = (flight) => {
    // Store flight details in localStorage for booking process
    localStorage.setItem('selectedFlight', JSON.stringify({
      flight,
      searchParams,
      bookingId: `BK${Date.now()}`
    }));
    
    // Navigate to booking confirmation page
    navigate('/booking-confirmation');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStopsText = (stops) => {
    if (stops === 0) return 'Non-stop';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  const sortOptions = [
    { value: 'price', label: 'Price' },
    { value: 'duration', label: 'Duration' },
    { value: 'departure', label: 'Departure Time' },
    { value: 'arrival', label: 'Arrival Time' }
  ];

  if (loading) {
    return (
      <div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="loading-skeleton mb-3"></div>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon icon={faPlane} size="3x" className="text-muted mb-3" />
        <h4 className="text-muted">No flights found</h4>
        <p className="text-muted">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Options */}
      <div className="sort-options mb-4">
        <span className="me-3 text-muted">Sort by:</span>
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => setSortBy(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Flight Cards */}
      <div className="flight-results">
        {flights.map(flight => (
          <div key={flight.id} className="flight-card">
            {/* Flight Header */}
            <div className="flight-header">
              <div className="airline-info">
                <div className="airline-logo">
                  {flight.airline ? flight.airline.substring(0, 2).toUpperCase() : 'FL'}
                </div>
                <div>
                  <h6 className="mb-0">{flight.airline || 'Unknown Airline'}</h6>
                  <small className="text-muted">{flight.flightNumber || 'N/A'}</small>
                </div>
              </div>
              <div className="flight-badges">
                {flight.stops === 0 && (
                  <span className="flight-badge badge-nonstop">Non-stop</span>
                )}
                {flight.refundable && (
                  <span className="flight-badge badge-refundable ms-2">Refundable</span>
                )}
                {flight.price < 5000 && (
                  <span className="flight-badge badge-popular ms-2">Great Deal</span>
                )}
              </div>
            </div>

            {/* Flight Route */}
            <div className="flight-route">
              <div className="route-point">
                <div className="time">{flight.departureTime || 'N/A'}</div>
                <div className="city">{flight.from || 'N/A'}</div>
              </div>
              
              <div className="route-line">
                <div className="route-duration">
                  {flight.duration ? formatDuration(flight.duration) : 'N/A'}
                  <br />
                  <small>{getStopsText(flight.stops || 0)}</small>
                </div>
              </div>
              
              <div className="route-point">
                <div className="time">{flight.arrivalTime || 'N/A'}</div>
                <div className="city">{flight.to || 'N/A'}</div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="flight-details">
              <div className="flight-info">
                <span title="Aircraft">
                  <FontAwesomeIcon icon={faPlane} className="me-1" />
                  {flight.aircraft || 'N/A'}
                </span>
                <span title="Baggage">
                  <FontAwesomeIcon icon={faSuitcase} className="me-1" />
                  {flight.baggage || '20kg'}
                </span>
                <span title="Available Seats" className="text-success">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                  {flight.availableSeats || 0} seats left
                </span>
              </div>
              
              <div className="flight-price">
                <div className="price-amount">
                  <FontAwesomeIcon icon={faRupeeSign} />
                  {(flight.price || 0).toLocaleString()}
                </div>
                <div className="price-per-person">per person</div>
                <button 
                  className="btn book-btn"
                  onClick={() => handleBookFlight(flight)}
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Additional Flight Services */}
            <div className="flight-services mt-3 pt-3 border-top">
              <div className="row text-center">
                <div className="col-3">
                  <FontAwesomeIcon icon={faWifi} className="text-primary mb-1" />
                  <br />
                  <small className="text-muted">WiFi</small>
                </div>
                <div className="col-3">
                  <FontAwesomeIcon icon={faUtensils} className="text-primary mb-1" />
                  <br />
                  <small className="text-muted">Meals</small>
                </div>
                <div className="col-3">
                  <FontAwesomeIcon icon={faSuitcase} className="text-primary mb-1" />
                  <br />
                  <small className="text-muted">Baggage</small>
                </div>
                <div className="col-3">
                  <FontAwesomeIcon icon={faClock} className="text-primary mb-1" />
                  <br />
                  <small className="text-muted">On-time</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {flights.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">
            Showing {flights.length} flights for {searchParams.from} → {searchParams.to}
          </p>
        </div>
      )}
    </div>
  );
}
