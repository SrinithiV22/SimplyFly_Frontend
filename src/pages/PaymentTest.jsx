import React from 'react';
import './Payment.css';

function PaymentTest() {
  const sampleBookingData = {
    bookingId: 999,
    route: "MAA to COK",
    passengerCount: 1,
    selectedSeats: "8D",
    totalAmount: 3500,
    departureTime: new Date().toISOString(),
    arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    passengers: [{
      firstName: "Test",
      lastName: "User",
      age: 25,
      gender: "Male",
      nationality: "Indian",
      passportNumber: "A1234567",
      seatNumber: "8D"
    }]
  };

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
              <span>{sampleBookingData.route}</span>
            </div>
            <div className="summary-row">
              <span>Passengers:</span>
              <span>{sampleBookingData.passengerCount}</span>
            </div>
            <div className="summary-row">
              <span>Seats:</span>
              <span>{sampleBookingData.selectedSeats}</span>
            </div>
            <div className="summary-row">
              <span>Departure:</span>
              <span>{new Date(sampleBookingData.departureTime).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Arrival:</span>
              <span>{new Date(sampleBookingData.arrivalTime).toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{sampleBookingData.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="passenger-summary">
          <h3>Passenger Details</h3>
          {sampleBookingData.passengers.map((passenger, index) => (
            <div key={index} className="passenger-info">
              <div className="passenger-header">
                <strong>Passenger {index + 1} - Seat {passenger.seatNumber}</strong>
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
                <div className="detail-row">
                  <span>Passport:</span>
                  <span>{passenger.passportNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          <div className="payment-options">
            <label className="payment-option">
              <input type="radio" value="credit-card" name="payment" />
              <span>Credit Card</span>
            </label>
            
            <label className="payment-option">
              <input type="radio" value="debit-card" name="payment" />
              <span>Debit Card</span>
            </label>
            
            <label className="payment-option">
              <input type="radio" value="upi" name="payment" />
              <span>UPI Payment</span>
            </label>
          </div>

          {/* Sample Card Form */}
          <div className="card-details">
            <div className="form-group">
              <label>Cardholder Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              
              <div className="form-group">
                <label>CVV</label>
                <input type="text" placeholder="123" />
              </div>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button className="btn-secondary">Cancel Booking</button>
          <button className="btn-primary payment-btn">
            Complete Payment ₹{sampleBookingData.totalAmount}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentTest;
