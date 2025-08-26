import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faPlane,
  faCalendarAlt,
  faClock,
  faUsers,
  faTicketAlt,
  faMapMarkerAlt,
  faRupeeSign,
  faDownload,
  faQrcode,
  faPrint,
  faInfoCircle,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import './BookingDetailsModal.css';

export default function BookingDetailsModal({ booking, onClose }) {
  const [activeTab, setActiveTab] = useState('details');

  const generateQRCode = () => {
    // In a real app, you'd generate an actual QR code
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="150" fill="white"/>
        <rect x="10" y="10" width="130" height="130" fill="black"/>
        <rect x="20" y="20" width="110" height="110" fill="white"/>
        <text x="75" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          ${booking.bookingId}
        </text>
      </svg>
    `)}`;
  };

  const handleDownloadTicket = () => {
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob([`E-Ticket - ${booking.bookingId}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ticket-${booking.bookingId}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Booking Details</h3>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Flight Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
            onClick={() => setActiveTab('ticket')}
          >
            E-Ticket
          </button>
          <button 
            className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Code
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="booking-summary">
                <div className="summary-header">
                  <div className="booking-ref">
                    <strong>Booking Reference: {booking.bookingId}</strong>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="total-amount">
                    <FontAwesomeIcon icon={faRupeeSign} />
                    {booking.totalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="flight-info">
                  <div className="airline-section">
                    <h4>{booking.airline}</h4>
                    <p>Flight {booking.flightNumber}</p>
                  </div>

                  <div className="route-details">
                    <div className="departure">
                      <div className="time">{booking.departureTime}</div>
                      <div className="city">{booking.from}</div>
                      <div className="date">{new Date(booking.departureDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</div>
                      {booking.terminal && <div className="terminal">Terminal {booking.terminal}</div>}
                      {booking.gate && <div className="gate">Gate {booking.gate}</div>}
                    </div>

                    <div className="flight-path">
                      <FontAwesomeIcon icon={faPlane} />
                      <div className="duration">{booking.duration}</div>
                    </div>

                    <div className="arrival">
                      <div className="time">{booking.arrivalTime}</div>
                      <div className="city">{booking.to}</div>
                      <div className="date">{new Date(booking.departureDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</div>
                    </div>
                  </div>
                </div>

                <div className="passenger-details">
                  <h5>Passenger Information</h5>
                  <div className="passenger-grid">
                    <div className="detail-row">
                      <span className="label">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Passengers:
                      </span>
                      <span className="value">{booking.passengers}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                        Class:
                      </span>
                      <span className="value">{booking.class}</span>
                    </div>
                    {booking.seatNumbers && (
                      <div className="detail-row">
                        <span className="label">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                          Seats:
                        </span>
                        <span className="value">{booking.seatNumbers.join(', ')}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        Booked on:
                      </span>
                      <span className="value">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {booking.status === 'cancelled' && booking.refundAmount && (
                  <div className="refund-info">
                    <h5>Refund Information</h5>
                    <div className="refund-details">
                      <div className="refund-amount">
                        <FontAwesomeIcon icon={faRupeeSign} />
                        {booking.refundAmount.toLocaleString()} refunded
                      </div>
                      <div className="refund-status">
                        Status: {booking.refundStatus || 'Processing'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="important-info">
                  <h5>
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Important Information
                  </h5>
                  <ul>
                    <li>Please arrive at the airport at least 2 hours before domestic flights</li>
                    <li>Carry a valid government-issued photo ID</li>
                    <li>Check-in online to save time at the airport</li>
                    <li>Baggage allowance: 15kg for Economy, 25kg for Premium</li>
                  </ul>
                </div>

                <div className="contact-info">
                  <h5>Need Help?</h5>
                  <div className="contact-details">
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      <span>Customer Care: 1800-123-4567</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      <span>Email: support@simplyfly.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ticket' && (
            <div className="ticket-tab">
              <div className="e-ticket">
                <div className="ticket-header">
                  <h3>Electronic Ticket</h3>
                  <div className="ticket-actions">
                    <button className="btn btn-primary" onClick={handleDownloadTicket}>
                      <FontAwesomeIcon icon={faDownload} className="me-2" />
                      Download PDF
                    </button>
                    <button className="btn btn-outline-primary" onClick={handlePrintTicket}>
                      <FontAwesomeIcon icon={faPrint} className="me-2" />
                      Print
                    </button>
                  </div>
                </div>

                <div className="ticket-content">
                  <div className="ticket-info">
                    <div className="airline-logo">
                      <div className="logo-placeholder">{booking.airline.charAt(0)}</div>
                      <div className="airline-name">{booking.airline}</div>
                    </div>
                    
                    <div className="flight-details">
                      <div className="flight-number">Flight {booking.flightNumber}</div>
                      <div className="booking-ref">PNR: {booking.bookingId}</div>
                    </div>
                  </div>

                  <div className="journey-details">
                    <div className="journey-point">
                      <div className="city-code">{booking.from.substring(0, 3).toUpperCase()}</div>
                      <div className="city-name">{booking.from}</div>
                      <div className="datetime">
                        {new Date(booking.departureDate).toLocaleDateString()}
                        <br />
                        {booking.departureTime}
                      </div>
                    </div>

                    <div className="journey-arrow">
                      <FontAwesomeIcon icon={faPlane} />
                    </div>

                    <div className="journey-point">
                      <div className="city-code">{booking.to.substring(0, 3).toUpperCase()}</div>
                      <div className="city-name">{booking.to}</div>
                      <div className="datetime">
                        {new Date(booking.departureDate).toLocaleDateString()}
                        <br />
                        {booking.arrivalTime}
                      </div>
                    </div>
                  </div>

                  <div className="passenger-info">
                    <div className="info-row">
                      <span>Passenger(s):</span>
                      <span>{booking.passengers} Adult(s)</span>
                    </div>
                    <div className="info-row">
                      <span>Class:</span>
                      <span>{booking.class}</span>
                    </div>
                    {booking.seatNumbers && (
                      <div className="info-row">
                        <span>Seat(s):</span>
                        <span>{booking.seatNumbers.join(', ')}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span>Total Amount:</span>
                      <span>₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="barcode">
                    <div className="barcode-lines">
                      {Array.from({ length: 50 }, (_, i) => (
                        <div key={i} className={`bar ${i % 3 === 0 ? 'thick' : 'thin'}`}></div>
                      ))}
                    </div>
                    <div className="barcode-text">{booking.bookingId}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="qr-tab">
              <div className="qr-section">
                <h4>Mobile Boarding Pass</h4>
                <p>Scan this QR code at the airport for quick check-in</p>
                
                <div className="qr-code-container">
                  <img src={generateQRCode()} alt="QR Code" className="qr-code" />
                  <div className="qr-info">
                    <div className="booking-ref">{booking.bookingId}</div>
                    <div className="flight-info">{booking.flightNumber} • {booking.route}</div>
                  </div>
                </div>

                <div className="qr-instructions">
                  <h5>How to use:</h5>
                  <ol>
                    <li>Save this QR code to your mobile device</li>
                    <li>Present it at the check-in counter or self-service kiosk</li>
                    <li>Use it at security checkpoints and boarding gates</li>
                    <li>Keep your phone charged and brightness high</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
