import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlaneDeparture, 
  faPlaneArrival, 
  faCalendarAlt, 
  faUsers,
  faFilter,
  faClock,
  faRupeeSign,
  faPlane
} from '@fortawesome/free-solid-svg-icons';
import FlightSearchForm from '../Components/FlightSearch/FlightSearchForm';
import FlightResults from '../Components/FlightSearch/FlightResults';
import FlightFilters from '../Components/FlightSearch/FlightFilters';
import { searchFlights } from '../services/flight.service';
import './BookFlight.css';

export default function BookFlight() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
    tripType: 'oneWay'
  });

  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    timeRange: 'all',
    airlines: [],
    stops: 'all',
    sortBy: 'price'
  });

  // Handle search form submission
  const handleSearch = async (searchData) => {
    setLoading(true);
    setHasSearched(true);
    setSearchParams(searchData);
    
    try {
      const results = await searchFlights(searchData);
      setFlights(results);
      setFilteredFlights(results);
    } catch (error) {
      console.error('Flight search error:', error);
      // For demo purposes, use mock data
      const mockFlights = generateMockFlights(searchData);
      setFlights(mockFlights);
      setFilteredFlights(mockFlights);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to flights
  useEffect(() => {
    let filtered = [...flights];

    // Price filter
    filtered = filtered.filter(flight => 
      flight.price >= filters.priceRange[0] && flight.price <= filters.priceRange[1]
    );

    // Time filter
    if (filters.timeRange !== 'all') {
      filtered = filtered.filter(flight => {
        const hour = parseInt(flight.departureTime.split(':')[0]);
        switch (filters.timeRange) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 24;
          case 'night': return hour >= 0 && hour < 6;
          default: return true;
        }
      });
    }

    // Airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        filters.airlines.includes(flight.airline)
      );
    }

    // Stops filter
    if (filters.stops !== 'all') {
      filtered = filtered.filter(flight => {
        if (filters.stops === 'nonstop') return flight.stops === 0;
        if (filters.stops === '1stop') return flight.stops === 1;
        if (filters.stops === '2+stops') return flight.stops >= 2;
        return true;
      });
    }

    // Sort flights
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price': return a.price - b.price;
        case 'duration': return a.duration - b.duration;
        case 'departure': return a.departureTime.localeCompare(b.departureTime);
        case 'arrival': return a.arrivalTime.localeCompare(b.arrivalTime);
        default: return 0;
      }
    });

    setFilteredFlights(filtered);
  }, [flights, filters]);

  // Generate mock flight data for demo
  const generateMockFlights = (searchData) => {
    const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir'];
    const mockFlights = [];

    for (let i = 0; i < 8; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const basePrice = Math.floor(Math.random() * 15000) + 3000;
      const stops = Math.floor(Math.random() * 3);
      const duration = 120 + Math.floor(Math.random() * 300) + (stops * 60);
      
      const departureHour = Math.floor(Math.random() * 24);
      const departureMinute = Math.floor(Math.random() * 60);
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
      
      const arrivalTime = new Date();
      arrivalTime.setHours(departureHour);
      arrivalTime.setMinutes(departureMinute);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + duration);
      const arrivalTimeStr = `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`;

      mockFlights.push({
        id: `FL${1000 + i}`,
        airline: airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()} ${Math.floor(Math.random() * 9000) + 1000}`,
        from: searchData.from,
        to: searchData.to,
        departureTime: departureTime,
        arrivalTime: arrivalTimeStr,
        duration: duration,
        price: basePrice,
        stops: stops,
        aircraft: 'Boeing 737',
        availableSeats: Math.floor(Math.random() * 50) + 10,
        baggage: '15 kg',
        refundable: Math.random() > 0.5
      });
    }

    return mockFlights;
  };

  return (
    <div className="book-flight-container">
      <div className="book-flight-header mb-4">
        <h2>
          <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
          Book Your Flight
        </h2>
        <p className="text-muted">Find and book the perfect flight for your journey</p>
      </div>

      {/* Flight Search Form */}
      <div className="card mb-4">
        <div className="card-body">
          <FlightSearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Filters
                </h5>
                <FlightFilters 
                  filters={filters} 
                  onFiltersChange={setFilters}
                  flights={flights}
                />
              </div>
            </div>
          </div>

          {/* Flight Results */}
          <div className="col-md-9">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <FontAwesomeIcon icon={faPlane} className="me-2" />
                    Available Flights
                  </h5>
                  <span className="text-muted">
                    {loading ? 'Searching...' : `${filteredFlights.length} flights found`}
                  </span>
                </div>
                
                <FlightResults 
                  flights={filteredFlights} 
                  loading={loading}
                  searchParams={searchParams}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Search Yet */}
      {!hasSearched && (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faPlaneDeparture} size="3x" className="text-muted mb-3" />
          <h4 className="text-muted">Search for flights to get started</h4>
          <p className="text-muted">Enter your travel details above to find available flights</p>
        </div>
      )}
    </div>
  );
}
