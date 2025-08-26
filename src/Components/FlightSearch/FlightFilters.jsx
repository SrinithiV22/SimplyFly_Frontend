import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRupeeSign, 
  faClock, 
  faPlane,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

export default function FlightFilters({ filters, onFiltersChange, flights }) {
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  
  // Get unique airlines from flights
  const airlines = [...new Set(flights.map(flight => flight.airline))];
  
  // Price range limits based on available flights
  const minPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0;
  const maxPrice = flights.length > 0 ? Math.max(...flights.map(f => f.price)) : 50000;

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    onFiltersChange(prev => ({
      ...prev,
      priceRange: [minPrice, maxPrice]
    }));
  }, [flights]);

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const newRange = e.target.name === 'minPrice' 
      ? [value, priceRange[1]] 
      : [priceRange[0], value];
    
    setPriceRange(newRange);
    onFiltersChange(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  const handleTimeRangeChange = (timeRange) => {
    onFiltersChange(prev => ({
      ...prev,
      timeRange
    }));
  };

  const handleAirlineChange = (airline, checked) => {
    onFiltersChange(prev => ({
      ...prev,
      airlines: checked 
        ? [...prev.airlines, airline]
        : prev.airlines.filter(a => a !== airline)
    }));
  };

  const handleStopsChange = (stops) => {
    onFiltersChange(prev => ({
      ...prev,
      stops
    }));
  };

  const handleSortChange = (sortBy) => {
    onFiltersChange(prev => ({
      ...prev,
      sortBy
    }));
  };

  const clearAllFilters = () => {
    const resetFilters = {
      priceRange: [minPrice, maxPrice],
      timeRange: 'all',
      airlines: [],
      stops: 'all',
      sortBy: 'price'
    };
    setPriceRange([minPrice, maxPrice]);
    onFiltersChange(resetFilters);
  };

  const timeSlots = [
    { value: 'all', label: 'Any Time', icon: faClock },
    { value: 'morning', label: 'Morning', time: '6AM - 12PM' },
    { value: 'afternoon', label: 'Afternoon', time: '12PM - 6PM' },
    { value: 'evening', label: 'Evening', time: '6PM - 12AM' },
    { value: 'night', label: 'Night', time: '12AM - 6AM' }
  ];

  const stopOptions = [
    { value: 'all', label: 'Any Stops' },
    { value: 'nonstop', label: 'Non-stop' },
    { value: '1stop', label: '1 Stop' },
    { value: '2+stops', label: '2+ Stops' }
  ];

  const sortOptions = [
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'duration', label: 'Duration (Shortest)' },
    { value: 'departure', label: 'Departure Time' },
    { value: 'arrival', label: 'Arrival Time' }
  ];

  return (
    <div className="flight-filters">
      {/* Clear Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <FontAwesomeIcon icon={faFilter} className="me-2" />
          Filters
        </h6>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={clearAllFilters}
        >
          Clear All
        </button>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h6>
          <FontAwesomeIcon icon={faRupeeSign} className="me-2" />
          Price Range
        </h6>
        <div className="price-range-slider">
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small">Min Price</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="minPrice"
                value={priceRange[0]}
                onChange={handlePriceChange}
                min={minPrice}
                max={maxPrice}
              />
            </div>
            <div className="col-6">
              <label className="form-label small">Max Price</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="maxPrice"
                value={priceRange[1]}
                onChange={handlePriceChange}
                min={minPrice}
                max={maxPrice}
              />
            </div>
          </div>
          <div className="price-range-values">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Departure Time Filter */}
      <div className="filter-section">
        <h6>
          <FontAwesomeIcon icon={faClock} className="me-2" />
          Departure Time
        </h6>
        <div className="time-slots">
          {timeSlots.map(slot => (
            <div
              key={slot.value}
              className={`time-slot ${filters.timeRange === slot.value ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange(slot.value)}
            >
              <div className="fw-bold">{slot.label}</div>
              {slot.time && <small>{slot.time}</small>}
            </div>
          ))}
        </div>
      </div>

      {/* Airlines Filter */}
      {airlines.length > 0 && (
        <div className="filter-section">
          <h6>
            <FontAwesomeIcon icon={faPlane} className="me-2" />
            Airlines
          </h6>
          {airlines.map(airline => (
            <div key={airline} className="filter-option">
              <input
                type="checkbox"
                id={`airline-${airline}`}
                checked={filters.airlines.includes(airline)}
                onChange={(e) => handleAirlineChange(airline, e.target.checked)}
              />
              <label htmlFor={`airline-${airline}`} className="form-check-label">
                {airline}
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Stops Filter */}
      <div className="filter-section">
        <h6>Stops</h6>
        {stopOptions.map(option => (
          <div key={option.value} className="filter-option">
            <input
              type="radio"
              id={`stops-${option.value}`}
              name="stops"
              value={option.value}
              checked={filters.stops === option.value}
              onChange={() => handleStopsChange(option.value)}
            />
            <label htmlFor={`stops-${option.value}`} className="form-check-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {/* Sort By */}
      <div className="filter-section">
        <h6>Sort By</h6>
        {sortOptions.map(option => (
          <div key={option.value} className="filter-option">
            <input
              type="radio"
              id={`sort-${option.value}`}
              name="sortBy"
              value={option.value}
              checked={filters.sortBy === option.value}
              onChange={() => handleSortChange(option.value)}
            />
            <label htmlFor={`sort-${option.value}`} className="form-check-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {/* Filter Summary */}
      <div className="filter-summary mt-4 p-3 bg-light rounded">
        <small className="text-muted">
          <strong>Active Filters:</strong>
          <br />
          Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          <br />
          Time: {timeSlots.find(t => t.value === filters.timeRange)?.label}
          <br />
          Airlines: {filters.airlines.length > 0 ? filters.airlines.join(', ') : 'All'}
          <br />
          Stops: {stopOptions.find(s => s.value === filters.stops)?.label}
        </small>
      </div>
    </div>
  );
}
