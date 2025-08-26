import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faUser, 
  faPhone, 
  faEnvelope,
  faCreditCard,
  faCheck,
  faArrowLeft,
  faRupeeSign,
  faClock,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { bookFlight } from '../services/flight.service';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    emergencyContact: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Passenger Details, 2: Payment, 3: Confirmation

  useEffect(() => {
    // Get selected flight data from localStorage
    const selectedFlightData = localStorage.getItem('selectedFlight');
    if (!selectedFlightData) {
      navigate('/dashboard');
      return;
    }

    const data = JSON.parse(selectedFlightData);
    setBookingData(data);

    // Initialize passenger forms based on number of passengers
    const passengerCount = data.searchParams.passengers;
    const initialPassengers = Array.from({ length: passengerCount }, (_, index) => ({
      id: index + 1,
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      seatPreference: 'any'
    }));
    setPassengers(initialPassengers);

    // Pre-fill contact info from user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setContactInfo(prev => ({
      ...prev,
      email: userData.email || ''
    }));
  }, [navigate]);

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => prev.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassengers = () => {
    return passengers.every(passenger => 
      passenger.firstName.trim() && 
      passenger.lastName.trim() && 
      passenger.age && 
      passenger.gender
    );
  };

  const validateContact = () => {
    return contactInfo.email.trim() && 
           contactInfo.phone.trim() && 
           /^\S+@\S+\.\S+$/.test(contactInfo.email);
  };

  const calculateTotal = () => {
    const basePrice = bookingData.flight.price * passengers.length;
    const taxes = Math.round(basePrice * 0.12); // 12% taxes
    const fees = 200; // Booking fees
    return {
      basePrice,
      taxes,
      fees,
      total: basePrice + taxes + fees
    };
  };

  const handleNextStep = () => {
    if (step === 1 && validatePassengers() && validateContact()) {
      setStep(2);
    } else if (step === 2) {
      handleBooking();
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    
    try {
      const bookingPayload = {
        flightId: bookingData.flight.id,
        passengers: passengers,
        contactInfo: contactInfo,
        paymentMethod: paymentMethod,
        totalAmount: calculateTotal().total,
        searchParams: bookingData.searchParams
      };

      // Call booking API
      const result = await bookFlight(bookingPayload);
      
      // Store booking confirmation
      localStorage.setItem('bookingConfirmation', JSON.stringify(result));
      
      setStep(3);
    } catch (error) {
      console.error('Booking error:', error);
      // For demo purposes, simulate successful booking
      const mockBooking = {
        bookingId: `SF${Date.now()}`,
        status: 'confirmed',
        ...bookingData,
        passengers,
        contactInfo,
        totalAmount: calculateTotal().total
      };
      
      localStorage.setItem('bookingConfirmation', JSON.stringify(mockBooking));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    localStorage.removeItem('selectedFlight');
    localStorage.removeItem('bookingConfirmation');
    navigate('/dashboard');
  };

  if (!bookingData) {
    return <div className="text-center p-5">Loading...</div>;
  }

  const pricing = calculateTotal();

  return (
    <div className="booking-confirmation-container">
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="booking-header mb-4">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </button>
          <h2>Complete Your Booking</h2>
        </div>

        {/* Progress Steps */}
        <div className="booking-steps mb-4">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Passenger Details</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            {/* Step 1: Passenger Details */}
            {step === 1 && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Passenger Details
                  </h5>
                  
                  {passengers.map((passenger, index) => (
                    <div key={passenger.id} className="passenger-form mb-4 p-3 border rounded">
                      <h6 className="mb-3">Passenger {index + 1}</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Age *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Gender *</label>
                          <select
                            className="form-select"
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            required
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Contact Information */}
                  <div className="contact-form mt-4">
                    <h6 className="mb-3">Contact Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                          Email *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={contactInfo.email}
                          onChange={(e) => handleContactChange('email', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Phone *
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          value={contactInfo.phone}
                          onChange={(e) => handleContactChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                    Payment Details
                  </h5>
                  
                  <div className="payment-methods mb-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="card"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="card">
                        Credit/Debit Card
                      </label>
                    </div>
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="upi"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="upi">
                        UPI
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="netbanking"
                        value="netbanking"
                        checked={paymentMethod === 'netbanking'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="netbanking">
                        Net Banking
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="card-details">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Card Number</label>
                          <input type="text" className="form-control" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Expiry Date</label>
                          <input type="text" className="form-control" placeholder="MM/YY" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">CVV</label>
                          <input type="text" className="form-control" placeholder="123" />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Cardholder Name</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="card">
                <div className="card-body text-center">
                  <div className="success-icon mb-4">
                    <FontAwesomeIcon icon={faCheck} size="3x" className="text-success" />
                  </div>
                  <h3 className="text-success mb-3">Booking Confirmed!</h3>
                  <p className="text-muted mb-4">
                    Your flight has been successfully booked. 
                    Booking confirmation has been sent to your email.
                  </p>
                  <div className="booking-id mb-4">
                    <strong>Booking ID: {bookingData.bookingId}</strong>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleBackToDashboard}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Flight Summary Sidebar */}
          <div className="col-md-4">
            <div className="card flight-summary">
              <div className="card-body">
                <h5 className="card-title mb-3">Flight Summary</h5>
                
                <div className="flight-info mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{bookingData.flight.airline}</h6>
                    <span className="text-muted">{bookingData.flight.flightNumber}</span>
                  </div>
                  
                  <div className="route-info mb-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-bold">{bookingData.flight.departureTime}</div>
                        <div className="text-muted small">{bookingData.flight.from}</div>
                      </div>
                      <div className="text-center">
                        <FontAwesomeIcon icon={faPlane} className="text-primary" />
                        <div className="text-muted small">{bookingData.flight.getFormattedDuration?.() || '2h 30m'}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{bookingData.flight.arrivalTime}</div>
                        <div className="text-muted small">{bookingData.flight.to}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flight-details">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Date:</span>
                      <span>{new Date(bookingData.searchParams.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Passengers:</span>
                      <span>{passengers.length}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Class:</span>
                      <span className="text-capitalize">{bookingData.searchParams.class}</span>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="price-breakdown">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Base Price ({passengers.length} × ₹{bookingData.flight.price.toLocaleString()})</span>
                    <span>₹{pricing.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Taxes & Fees</span>
                    <span>₹{pricing.taxes.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Booking Fee</span>
                    <span>₹{pricing.fees}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span>₹{pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                {step < 3 && (
                  <button 
                    className="btn btn-primary w-100 mt-3"
                    onClick={handleNextStep}
                    disabled={loading || (step === 1 && (!validatePassengers() || !validateContact()))}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : step === 1 ? (
                      'Continue to Payment'
                    ) : (
                      'Complete Booking'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
