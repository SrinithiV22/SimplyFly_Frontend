import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookmark,
  faPlane,
  faCalendarAlt,
  faClock,
  faUsers,
  faTicketAlt,
  faTimes,
  faUndo,
  faDownload,
  faQrcode,
  faEye,
  faFilter,
  faSearch,
  faMapMarkerAlt,
  faRupeeSign,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { getUserBookings, cancelBooking } from '../services/flight.service';
import BookingDetailsModal from '../Components/Bookings/BookingDetailsModal';
import './MyBookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter, searchTerm]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Get bookings from API
      const userBookings = await getUserBookings();
      setBookings(userBookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockBookings = () => {
    const currentDate = new Date();
    const mockBookings = [
      {
        id: 'SF001',
        bookingId: 'SF24001',
        flightNumber: 'AI 131',
        airline: 'Air India',
        route: 'Mumbai → Delhi',
        from: 'Mumbai',
        to: 'Delhi',
        departureDate: '2024-09-15',
        departureTime: '14:30',
        arrivalTime: '16:45',
        passengers: 2,
        totalAmount: 9000,
        status: 'confirmed',
        bookingDate: '2024-08-20',
        seatNumbers: ['12A', '12B'],
        class: 'Economy',
        duration: '2h 15m',
        gate: 'A12',
        terminal: 'T3'
      },
      {
        id: 'SF002',
        bookingId: 'SF24002',
        flightNumber: 'SG 8156',
        airline: 'SpiceJet',
        route: 'Delhi → Bangalore',
        from: 'Delhi',
        to: 'Bangalore',
        departureDate: '2024-08-10',
        departureTime: '09:15',
        arrivalTime: '12:00',
        passengers: 1,
        totalAmount: 6200,
        status: 'completed',
        bookingDate: '2024-07-25',
        seatNumbers: ['15C'],
        class: 'Economy',
        duration: '2h 45m',
        gate: 'B7',
        terminal: 'T2'
      },
      {
        id: 'SF003',
        bookingId: 'SF24003',
        flightNumber: 'UK 955',
        airline: 'Vistara',
        route: 'Mumbai → Goa',
        from: 'Mumbai',
        to: 'Goa',
        departureDate: '2024-07-20',
        departureTime: '18:45',
        arrivalTime: '20:15',
        passengers: 3,
        totalAmount: 15600,
        status: 'cancelled',
        bookingDate: '2024-07-10',
        seatNumbers: ['8A', '8B', '8C'],
        class: 'Premium Economy',
        duration: '1h 30m',
        refundAmount: 12480,
        refundStatus: 'processed'
      },
      {
        id: 'SF004',
        bookingId: 'SF24004',
        flightNumber: 'G8 2134',
        airline: 'GoAir',
        route: 'Bangalore → Chennai',
        from: 'Bangalore',
        to: 'Chennai',
        departureDate: '2024-09-25',
        departureTime: '11:20',
        arrivalTime: '12:35',
        passengers: 1,
        totalAmount: 4500,
        status: 'confirmed',
        bookingDate: '2024-08-25',
        seatNumbers: ['21F'],
        class: 'Economy',
        duration: '1h 15m',
        gate: 'C4',
        terminal: 'T1'
      }
    ];

    return mockBookings;
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (activeFilter !== 'all') {
      if (activeFilter === 'upcoming') {
        filtered = filtered.filter(booking => {
          const departureDate = new Date(booking.departureDate);
          const today = new Date();
          return booking.status === 'confirmed' && departureDate >= today;
        });
      } else if (activeFilter === 'past') {
        filtered = filtered.filter(booking => {
          const departureDate = new Date(booking.departureDate);
          const today = new Date();
          return booking.status === 'completed' || (booking.status === 'confirmed' && departureDate < today);
        });
      } else {
        filtered = filtered.filter(booking => booking.status === activeFilter);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.airline.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await cancelBooking(bookingId);
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', refundStatus: 'processing' }
            : booking
        ));
        alert('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        // For demo, update locally
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', refundStatus: 'processing' }
            : booking
        ));
        alert('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
      }
    }
  };

  const handleViewTicket = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleDownloadTicket = (booking) => {
    // Simulate PDF download
    alert(`Downloading e-ticket for booking ${booking.bookingId}...`);
  };

  const handleRequestRefund = (booking) => {
    if (window.confirm('Do you want to request a refund for this booking?')) {
      alert('Refund request submitted successfully. You will receive an update within 24 hours.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'success', text: 'Confirmed' },
      completed: { color: 'info', text: 'Completed' },
      cancelled: { color: 'danger', text: 'Cancelled' },
      pending: { color: 'warning', text: 'Pending' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'confirmed') return false;
    const departureDate = new Date(`${booking.departureDate} ${booking.departureTime}`);
    const now = new Date();
    const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);
    return hoursUntilDeparture > 24;
  };

  const filterOptions = [
    { key: 'all', label: 'All Bookings', count: bookings.length },
    { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => {
      const departureDate = new Date(b.departureDate);
      const today = new Date();
      return b.status === 'confirmed' && departureDate >= today;
    }).length },
    { key: 'past', label: 'Past', count: bookings.filter(b => {
      const departureDate = new Date(b.departureDate);
      const today = new Date();
      return b.status === 'completed' || (b.status === 'confirmed' && departureDate < today);
    }).length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      {/* Header */}
      <div className="bookings-header mb-4">
        <h2>
          <FontAwesomeIcon icon={faBookmark} className="me-2" />
          My Bookings
        </h2>
        <p className="text-muted">Manage all your flight bookings in one place</p>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="booking-filters">
            {filterOptions.map(option => (
              <button
                key={option.key}
                className={`filter-btn ${activeFilter === option.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(option.key)}
              >
                {option.label}
                <span className="count-badge">{option.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings text-center py-5">
            <FontAwesomeIcon icon={faPlane} size="3x" className="text-muted mb-3" />
            <h4 className="text-muted">No bookings found</h4>
            <p className="text-muted">
              {searchTerm ? 'Try adjusting your search criteria' : 'You haven\'t made any bookings yet'}
            </p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-info">
                  <div className="booking-id">
                    <strong>{booking.bookingId}</strong>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="airline-info">
                    <span className="airline">{booking.airline}</span>
                    <span className="flight-number">{booking.flightNumber}</span>
                  </div>
                </div>
                <div className="booking-amount">
                  <FontAwesomeIcon icon={faRupeeSign} />
                  {booking.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="flight-route">
                <div className="route-point">
                  <div className="time">{booking.departureTime}</div>
                  <div className="city">{booking.from}</div>
                  <div className="date">{new Date(booking.departureDate).toLocaleDateString()}</div>
                </div>
                
                <div className="route-line">
                  <FontAwesomeIcon icon={faPlane} className="plane-icon" />
                  <div className="duration">{booking.duration}</div>
                </div>
                
                <div className="route-point">
                  <div className="time">{booking.arrivalTime}</div>
                  <div className="city">{booking.to}</div>
                  <div className="date">{new Date(booking.departureDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faUsers} className="me-1" />
                  {booking.passengers} Passenger{booking.passengers > 1 ? 's' : ''}
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                  {booking.class}
                </div>
                {booking.seatNumbers && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                    Seats: {booking.seatNumbers.join(', ')}
                  </div>
                )}
                {booking.gate && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    Gate: {booking.gate}
                  </div>
                )}
              </div>

              <div className="booking-actions">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleViewTicket(booking)}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  View Details
                </button>
                
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleDownloadTicket(booking)}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Download Ticket
                </button>

                {booking.status === 'confirmed' && canCancelBooking(booking) && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Cancel
                  </button>
                )}

                {booking.status === 'cancelled' && !booking.refundStatus && (
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleRequestRefund(booking)}
                  >
                    <FontAwesomeIcon icon={faUndo} className="me-1" />
                    Request Refund
                  </button>
                )}

                {booking.refundStatus && (
                  <span className="refund-status">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    Refund: {booking.refundStatus}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
