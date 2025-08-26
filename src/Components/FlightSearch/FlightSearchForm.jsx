import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlaneDeparture, 
  faPlaneArrival, 
  faCalendarAlt, 
  faUsers,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';

export default function FlightSearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
    tripType: 'oneWay'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTripTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      tripType: type,
      returnDate: type === 'oneWay' ? '' : prev.returnDate
    }));
  };

  const swapCities = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.from.trim()) {
      newErrors.from = 'Departure city is required';
    }
    
    if (!formData.to.trim()) {
      newErrors.to = 'Destination city is required';
    }
    
    if (formData.from.trim() === formData.to.trim()) {
      newErrors.to = 'Destination must be different from departure city';
    }
    
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    }
    
    if (formData.tripType === 'roundTrip' && !formData.returnDate) {
      newErrors.returnDate = 'Return date is required for round trip';
    }
    
    if (formData.tripType === 'roundTrip' && formData.returnDate && formData.departureDate) {
      if (new Date(formData.returnDate) <= new Date(formData.departureDate)) {
        newErrors.returnDate = 'Return date must be after departure date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSearch(formData);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'
  ];

  return (
    <form onSubmit={handleSubmit} className="flight-search-form">
      {/* Trip Type Selection */}
      <div className="trip-type-tabs">
        <button
          type="button"
          className={`trip-type-tab ${formData.tripType === 'oneWay' ? 'active' : ''}`}
          onClick={() => handleTripTypeChange('oneWay')}
        >
          One Way
        </button>
        <button
          type="button"
          className={`trip-type-tab ${formData.tripType === 'roundTrip' ? 'active' : ''}`}
          onClick={() => handleTripTypeChange('roundTrip')}
        >
          Round Trip
        </button>
        <button
          type="button"
          className={`trip-type-tab ${formData.tripType === 'multiCity' ? 'active' : ''}`}
          onClick={() => handleTripTypeChange('multiCity')}
        >
          Multi City
        </button>
      </div>

      <div className="row g-3">
        {/* From and To Cities with Swap Button */}
        <div className="col-md-5">
          <label htmlFor="from" className="form-label">
            <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
            From
          </label>
          <input
            type="text"
            className={`form-control ${errors.from ? 'is-invalid' : ''}`}
            id="from"
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            placeholder="Enter departure city"
            list="fromCities"
          />
          <datalist id="fromCities">
            {popularCities.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
          {errors.from && <div className="invalid-feedback">{errors.from}</div>}
        </div>

        <div className="col-md-2 d-flex align-items-end justify-content-center">
          <button
            type="button"
            className="btn btn-outline-light rounded-circle p-2"
            onClick={swapCities}
            title="Swap cities"
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
          </button>
        </div>

        <div className="col-md-5">
          <label htmlFor="to" className="form-label">
            <FontAwesomeIcon icon={faPlaneArrival} className="me-2" />
            To
          </label>
          <input
            type="text"
            className={`form-control ${errors.to ? 'is-invalid' : ''}`}
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            placeholder="Enter destination city"
            list="toCities"
          />
          <datalist id="toCities">
            {popularCities.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
          {errors.to && <div className="invalid-feedback">{errors.to}</div>}
        </div>

        {/* Dates */}
        <div className={formData.tripType === 'roundTrip' ? 'col-md-6' : 'col-md-4'}>
          <label htmlFor="departureDate" className="form-label">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Departure Date
          </label>
          <input
            type="date"
            className={`form-control ${errors.departureDate ? 'is-invalid' : ''}`}
            id="departureDate"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleInputChange}
            min={getTodayDate()}
          />
          {errors.departureDate && <div className="invalid-feedback">{errors.departureDate}</div>}
        </div>

        {formData.tripType === 'roundTrip' && (
          <div className="col-md-6">
            <label htmlFor="returnDate" className="form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Return Date
            </label>
            <input
              type="date"
              className={`form-control ${errors.returnDate ? 'is-invalid' : ''}`}
              id="returnDate"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleInputChange}
              min={formData.departureDate || getTodayDate()}
            />
            {errors.returnDate && <div className="invalid-feedback">{errors.returnDate}</div>}
          </div>
        )}

        {/* Passengers and Class */}
        <div className={formData.tripType === 'roundTrip' ? 'col-md-6' : 'col-md-4'}>
          <label htmlFor="passengers" className="form-label">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Passengers
          </label>
          <select
            className="form-select"
            id="passengers"
            name="passengers"
            value={formData.passengers}
            onChange={handleInputChange}
          >
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Passenger' : 'Passengers'}
              </option>
            ))}
          </select>
        </div>

        <div className={formData.tripType === 'roundTrip' ? 'col-md-6' : 'col-md-4'}>
          <label htmlFor="class" className="form-label">Class</label>
          <select
            className="form-select"
            id="class"
            name="class"
            value={formData.class}
            onChange={handleInputChange}
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="col-12">
          <button type="submit" className="btn search-btn w-100 mt-3">
            <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
            Search Flights
          </button>
        </div>
      </div>
    </form>
  );
}
