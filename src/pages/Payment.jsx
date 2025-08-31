import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const loadBookingData = async () => {
      // Get complete booking info from localStorage
      const completeBookingInfo = localStorage.getItem('completeBookingInfo');
      if (!completeBookingInfo) {
        console.log('No booking info found, redirecting to home...');
        navigate('/home');
        return;
      }

      try {
        const bookingData = JSON.parse(completeBookingInfo);
        console.log('Loaded booking data:', bookingData);

        // If we have a bookingId, fetch the actual passenger details from the database
        if (bookingData.bookingId) {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5244/api/Passenger/booking/${bookingData.bookingId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const passengerDetails = await response.json();
              console.log('Fetched passenger details:', passengerDetails);
              
              // Update booking data with fetched passenger details
              const updatedBookingData = {
                ...bookingData,
                passengers: passengerDetails.map((passenger, index) => ({
                  firstName: passenger.firstName,
                  lastName: passenger.lastName,
                  age: passenger.age,
                  gender: passenger.gender,
                  nationality: passenger.nationality,
                  passportNumber: passenger.passportNumber,
                  seatNumber: passenger.seatNo || bookingData.selectedSeats.split(', ')[index]
                }))
              };
              
              setBookingInfo(updatedBookingData);
            } else {
              console.error('Failed to fetch passenger details');
              // Use the original booking data if fetch fails
              setBookingInfo(bookingData);
            }
          } catch (error) {
            console.error('Error fetching passenger details:', error);
            // Use the original booking data if fetch fails
            setBookingInfo(bookingData);
          }
        } else {
          // Use the original booking data if no bookingId
          setBookingInfo(bookingData);
        }
        
      } catch (error) {
        console.error('Error parsing booking info:', error);
        navigate('/home');
      }
      
      setLoading(false);
    };

    loadBookingData();

    // Add event listener for page unload to detect abandonment
    const handleBeforeUnload = (event) => {
      if (!paymentCompleted) {
        // User is leaving without completing payment
        handlePaymentAbandonment();
      }
    };

    const handlePopState = () => {
      if (!paymentCompleted) {
        handlePaymentAbandonment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, paymentCompleted]);

  const handlePaymentAbandonment = async () => {
    try {
      const completeBookingInfo = localStorage.getItem('completeBookingInfo');
      if (completeBookingInfo) {
        const bookingData = JSON.parse(completeBookingInfo);
        
        // Delete passenger details from database
        if (bookingData.bookingId) {
          await fetch(`http://localhost:5244/api/Passenger/booking/${bookingData.bookingId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          // Delete booking from database
          await fetch(`http://localhost:5244/api/Bookings/${bookingData.bookingId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
        
        // Clear localStorage
        localStorage.removeItem('completeBookingInfo');
        console.log('Payment abandoned - data cleaned up');
      }
    } catch (error) {
      console.error('Error during payment abandonment cleanup:', error);
    }
  };

  const handleCardDetailsChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePayment = () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || 
          !cardDetails.cvv || !cardDetails.cardholderName) {
        setError('Please fill all card details');
        return false;
      }
      if (cardDetails.cardNumber.length < 16) {
        setError('Please enter a valid card number');
        return false;
      }
      if (cardDetails.cvv.length < 3) {
        setError('Please enter a valid CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        setError('Please enter UPI ID');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    
    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark payment as completed to prevent cleanup
      setPaymentCompleted(true);

      // For demo purposes, we'll assume payment is successful
      console.log('Payment processed successfully');

      // Navigate to booking confirmation with payment success
      navigate('/booking-confirmation', {
        state: {
          bookingInfo,
          paymentSuccess: true,
          paymentMethod
        }
      });

    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel? Your booking details will be lost.')) {
      await handlePaymentAbandonment();
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading">Loading payment information...</div>
      </div>
    );
  }

  if (!bookingInfo) {
    return (
      <div className="payment-container">
        <div className="error-message">No booking information found</div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        <h2>Complete Your Payment</h2>
        
        {/* Booking Summary */}
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Route:</span>
              <span>{bookingInfo.route}</span>
            </div>
            <div className="summary-row">
              <span>Passengers:</span>
              <span>{Array.isArray(bookingInfo.passengers) ? bookingInfo.passengers.length : bookingInfo.passengerCount || bookingInfo.passengers}</span>
            </div>
            <div className="summary-row">
              <span>Seats:</span>
              <span>{bookingInfo.selectedSeats}</span>
            </div>
            <div className="summary-row">
              <span>Departure:</span>
              <span>{new Date(bookingInfo.departureTime).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Arrival:</span>
              <span>{new Date(bookingInfo.arrivalTime).toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{bookingInfo.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="passenger-summary">
          <h3>Passenger Details</h3>
          {Array.isArray(bookingInfo.passengers) && bookingInfo.passengers.length > 0 ? (
            bookingInfo.passengers.map((passenger, index) => (
              <div key={index} className="passenger-info">
                <div className="passenger-header">
                  <strong>Passenger {index + 1} - Seat {passenger.seatNumber || bookingInfo.selectedSeats.split(', ')[index]}</strong>
                </div>
                <div className="passenger-details">
                  <div className="detail-row">
                    <span>Name:</span>
                    <span>{passenger.firstName} {passenger.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Age:</span>
                    <span>{passenger.age}</span>
                  </div>
                  <div className="detail-row">
                    <span>Gender:</span>
                    <span>{passenger.gender}</span>
                  </div>
                  <div className="detail-row">
                    <span>Nationality:</span>
                    <span>{passenger.nationality}</span>
                  </div>
                  {passenger.passportNumber && (
                    <div className="detail-row">
                      <span>Passport:</span>
                      <span>{passenger.passportNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="passenger-info">
              <p>Loading passenger details...</p>
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit Card</span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                value="debit-card"
                checked={paymentMethod === 'debit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Debit Card</span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>UPI Payment</span>
            </label>
          </div>

          {/* Card Details Form */}
          {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
            <div className="card-details">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                  placeholder="Enter cardholder name"
                />
              </div>
              
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="16"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      handleCardDetailsChange('expiryDate', value);
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Details Form */}
          {paymentMethod === 'upi' && (
            <div className="upi-details">
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-actions">
          <button 
            onClick={handleCancel} 
            className="btn-secondary"
            disabled={isProcessing}
          >
            Cancel Booking
          </button>
          
          <button 
            onClick={handlePayment}
            className="btn-primary payment-btn"
            disabled={isProcessing || !paymentMethod}
          >
            {isProcessing ? 'Processing Payment...' : `Complete Payment ₹${bookingInfo.totalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
