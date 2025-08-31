import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingConfirmation.css';

function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // Get booking data from location state or localStorage
    let bookingInfo = null;
    
    if (location.state?.bookingInfo) {
      bookingInfo = location.state.bookingInfo;
    } else {
      // Try to get from localStorage
      const storedBooking = localStorage.getItem('completeBookingInfo');
      if (storedBooking) {
        bookingInfo = JSON.parse(storedBooking);
      }
    }

    if (!bookingInfo) {
      // No booking data found, redirect to home
      navigate('/home');
      return;
    }
    
    setBookingData(bookingInfo);
    setLoading(false);
    
    // Prevent navigation back to payment page only
    let isFromPayment = true;
    
    const handlePopState = (event) => {
      if (isFromPayment) {
        // Block going back to payment page
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);
        // After first back attempt, allow normal navigation
        isFromPayment = false;
      }
    };
    
    // Add history entry to catch back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.state, navigate]);

  const generateTicketNumber = () => {
    return `SF${Date.now().toString().slice(-8)}`;
  };

  const handleDownloadTicket = () => {
    // Create ticket content for PDF download
    const ticketContent = generateTicketHTML();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateTicketHTML = () => {
    if (!bookingData) return '';

    const ticketNumber = generateTicketNumber();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SimplyFly E-Ticket</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .ticket { max-width: 800px; margin: 0 auto; border: 2px solid #667eea; border-radius: 10px; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 20px; }
        .airline-logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .ticket-title { font-size: 20px; font-weight: bold; color: #333; }
        .ticket-number { font-size: 16px; color: #666; margin-top: 10px; }
        .flight-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-section { border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; }
        .info-title { font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .info-item { margin-bottom: 8px; }
        .passenger-list { margin-top: 20px; }
        .passenger-item { background: #f8f9fa; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; }
        @media print { body { margin: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <div class="airline-logo">✈️ SIMPLYFLY AIRLINES</div>
          <div class="ticket-title">ELECTRONIC TICKET</div>
          <div class="ticket-number">Ticket Number: ${ticketNumber}</div>
        </div>
        
        <div class="flight-info">
          <div class="info-section">
            <div class="info-title">Flight Details</div>
            <div class="info-item"><strong>Route:</strong> ${bookingData.route}</div>
            <div class="info-item"><strong>Flight:</strong> ${bookingData.flight}</div>
            <div class="info-item"><strong>Class:</strong> ${bookingData.ticketType || 'Economy'}</div>
            <div class="info-item"><strong>Seats:</strong> ${bookingData.selectedSeats}</div>
          </div>
          
          <div class="info-section">
            <div class="info-title">Journey Information</div>
            <div class="info-item"><strong>Departure:</strong> ${new Date(bookingData.departureTime).toLocaleString()}</div>
            <div class="info-item"><strong>Arrival:</strong> ${new Date(bookingData.arrivalTime).toLocaleString()}</div>
            <div class="info-item"><strong>Total Amount:</strong> ₹${bookingData.totalAmount}</div>
            <div class="info-item"><strong>Booking ID:</strong> ${bookingData.bookingId}</div>
          </div>
        </div>
        
        <div class="passenger-list">
          <div class="info-title">Passenger Details</div>
          ${bookingData.passengers?.map((passenger, index) => `
            <div class="passenger-item">
              <strong>Passenger ${index + 1}:</strong> ${passenger.firstName} ${passenger.lastName}<br>
              Age: ${passenger.age} | Gender: ${passenger.gender} | Nationality: ${passenger.nationality}
              ${passenger.passportNumber ? `<br>Passport: ${passenger.passportNumber}` : ''}
            </div>
          `).join('') || ''}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing SimplyFly Airlines!</p>
          <p>Please arrive at the airport at least 2 hours before departure for domestic flights.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  if (loading) {
    return (
      <div className="booking-confirmation-container">
        <div className="loading">Loading your booking confirmation...</div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="booking-confirmation-container">
        <div className="error-message">
          <h2>❌ Booking Not Found</h2>
          <p>We couldn't find your booking details.</p>
          <button onClick={() => navigate('/home')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const ticketNumber = generateTicketNumber();

  return (
    <div className="booking-confirmation-container">
      <nav className="nav-menu">
        <button onClick={() => navigate('/home')} className="nav-link">Home</button>
        <button onClick={() => navigate('/flights')} className="nav-link">Flights</button>
        <button onClick={() => navigate('/booking-history')} className="nav-link">My Bookings</button>
        <button onClick={handleLogout} className="nav-link logout">Logout</button>
      </nav>
      <div className="confirmation-content">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>Your flight has been successfully booked</p>
        </div>

        <div className="ticket-display">
          <div className="ticket-header">
            <div className="airline-info">
              <h2>✈️ SIMPLYFLY AIRLINES</h2>
              <div className="ticket-number">Ticket #{ticketNumber}</div>
            </div>
          </div>

          <div className="ticket-body">
            <div className="flight-route">
              <div className="route-info">
                <div className="airport-code">{bookingData.origin}</div>
                <div className="route-line">
                  <div className="plane-icon">✈️</div>
                  <div className="line"></div>
                </div>
                <div className="airport-code">{bookingData.destination}</div>
              </div>
            </div>

            <div className="ticket-details">
              <div className="detail-section">
                <h3>Flight Information</h3>
                <div className="detail-item">
                  <span className="label">Flight:</span>
                  <span className="value">{bookingData.flight}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Route:</span>
                  <span className="value">{bookingData.route}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Class:</span>
                  <span className="value">{bookingData.ticketType || 'Economy'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Seats:</span>
                  <span className="value">{bookingData.selectedSeats}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Journey Details</h3>
                <div className="detail-item">
                  <span className="label">Departure:</span>
                  <span className="value">{new Date(bookingData.departureTime).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Arrival:</span>
                  <span className="value">{new Date(bookingData.arrivalTime).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Passengers:</span>
                  <span className="value">{bookingData.passengers?.length || bookingData.passengers}</span>
                </div>
                <div className="detail-item total">
                  <span className="label">Total Amount:</span>
                  <span className="value">₹{bookingData.totalAmount}</span>
                </div>
              </div>
            </div>

            {bookingData.passengers && Array.isArray(bookingData.passengers) && (
              <div className="passenger-details">
                <h3>Passenger Information</h3>
                {bookingData.passengers.map((passenger, index) => (
                  <div key={index} className="passenger-card">
                    <div className="passenger-header">
                      <strong>Passenger {index + 1}</strong>
                    </div>
                    <div className="passenger-info">
                      <div className="passenger-name">{passenger.firstName} {passenger.lastName}</div>
                      <div className="passenger-meta">
                        Age: {passenger.age} | Gender: {passenger.gender} | Nationality: {passenger.nationality}
                      </div>
                      {passenger.passportNumber && (
                        <div className="passport-info">Passport: {passenger.passportNumber}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ticket-footer">
            <div className="booking-id">Booking ID: {bookingData.bookingId}</div>
            <div className="generated-time">Generated on: {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleDownloadTicket} className="btn-primary download-btn">
            📄 Download Ticket (PDF)
          </button>
          <button onClick={() => navigate('/booking-history')} className="btn-secondary">
          View All Bookings
        </button>
        <button onClick={() => navigate('/home')} className="btn-secondary">
          Book Another Flight
        </button>
        </div>

        <div className="important-info">
          <h4>Important Information:</h4>
          <ul>
            <li>Please arrive at the airport at least 2 hours before departure for domestic flights</li>
            <li>Carry a valid photo ID and this ticket for check-in</li>
            <li>Check-in opens 3 hours before departure</li>
            <li>Baggage allowance: 15kg for domestic flights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
