import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet,
  faCreditCard,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faDownload,
  faEye,
  faFilter,
  faSearch,
  faRupeeSign,
  faCalendarAlt,
  faReceipt,
  faUndo,
  faInfoCircle,
  faArrowRight,
  faArrowLeft,
  faBan,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getPaymentHistory, getRefundStatus } from '../services/payment.service';
import PaymentDetailsModal from '../Components/Payments/PaymentDetailsModal';
import RefundTimelineModal from '../Components/Payments/RefundTimelineModal';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, activeFilter, searchTerm, activeTab]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // Get data from API
      const paymentHistory = await getPaymentHistory();
      const refundData = await getRefundStatus();
      setPayments(paymentHistory || []);
      setRefunds(refundData || []);
    } catch (error) {
      console.error('Error loading payment data:', error);
      setPayments([]);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockPayments = [
      {
        id: 'PAY001',
        transactionId: 'TXN240001',
        bookingId: 'SF24001',
        amount: 9000,
        status: 'successful',
        paymentMethod: 'Credit Card',
        cardLast4: '4532',
        paymentDate: '2024-08-20T14:30:00Z',
        description: 'Flight booking - Mumbai to Delhi',
        airline: 'Air India',
        flightNumber: 'AI 131',
        gatewayResponse: 'Payment processed successfully',
        receiptUrl: '/receipts/PAY001.pdf'
      },
      {
        id: 'PAY002',
        transactionId: 'TXN240002',
        bookingId: 'SF24002',
        amount: 6200,
        status: 'successful',
        paymentMethod: 'UPI',
        upiId: 'user@paytm',
        paymentDate: '2024-07-25T09:15:00Z',
        description: 'Flight booking - Delhi to Bangalore',
        airline: 'SpiceJet',
        flightNumber: 'SG 8156',
        gatewayResponse: 'Payment completed via UPI',
        receiptUrl: '/receipts/PAY002.pdf'
      },
      {
        id: 'PAY003',
        transactionId: 'TXN240003',
        bookingId: 'SF24003',
        amount: 4500,
        status: 'failed',
        paymentMethod: 'Debit Card',
        cardLast4: '7890',
        paymentDate: '2024-08-15T16:45:00Z',
        description: 'Flight booking - Bangalore to Chennai',
        airline: 'GoAir',
        flightNumber: 'G8 2134',
        gatewayResponse: 'Insufficient funds',
        failureReason: 'Card declined due to insufficient balance'
      },
      {
        id: 'PAY004',
        transactionId: 'TXN240004',
        bookingId: 'SF24004',
        amount: 12000,
        status: 'pending',
        paymentMethod: 'Net Banking',
        bankName: 'HDFC Bank',
        paymentDate: '2024-08-26T10:30:00Z',
        description: 'Flight booking - Mumbai to Goa',
        airline: 'Vistara',
        flightNumber: 'UK 955',
        gatewayResponse: 'Payment processing in progress'
      },
      {
        id: 'PAY005',
        transactionId: 'TXN240005',
        bookingId: 'SF24005',
        amount: 8500,
        status: 'successful',
        paymentMethod: 'Wallet',
        walletName: 'Paytm Wallet',
        paymentDate: '2024-08-10T12:20:00Z',
        description: 'Flight booking - Chennai to Hyderabad',
        airline: 'IndiGo',
        flightNumber: '6E 345',
        gatewayResponse: 'Payment successful via wallet',
        receiptUrl: '/receipts/PAY005.pdf'
      }
    ];

    const mockRefunds = [
      {
        id: 'REF001',
        paymentId: 'PAY006',
        bookingId: 'SF24003',
        refundAmount: 12480,
        originalAmount: 15600,
        status: 'completed',
        refundDate: '2024-07-25T00:00:00Z',
        completedDate: '2024-08-01T00:00:00Z',
        refundMethod: 'Original Payment Method',
        reason: 'Flight cancellation by airline',
        timeline: [
          {
            status: 'initiated',
            date: '2024-07-25T10:00:00Z',
            description: 'Refund request initiated'
          },
          {
            status: 'processing',
            date: '2024-07-26T14:30:00Z',
            description: 'Refund approved and processing'
          },
          {
            status: 'completed',
            date: '2024-08-01T09:15:00Z',
            description: 'Refund credited to original payment method'
          }
        ]
      },
      {
        id: 'REF002',
        paymentId: 'PAY007',
        bookingId: 'SF24006',
        refundAmount: 5400,
        originalAmount: 6000,
        status: 'processing',
        refundDate: '2024-08-20T00:00:00Z',
        refundMethod: 'Bank Transfer',
        reason: 'Customer cancellation',
        timeline: [
          {
            status: 'initiated',
            date: '2024-08-20T11:00:00Z',
            description: 'Refund request submitted'
          },
          {
            status: 'processing',
            date: '2024-08-22T16:00:00Z',
            description: 'Refund under review'
          }
        ],
        estimatedCompletion: '2024-08-28T00:00:00Z'
      },
      {
        id: 'REF003',
        paymentId: 'PAY008',
        bookingId: 'SF24007',
        refundAmount: 0,
        originalAmount: 7500,
        status: 'rejected',
        refundDate: '2024-08-18T00:00:00Z',
        rejectedDate: '2024-08-19T00:00:00Z',
        reason: 'Cancellation after departure time',
        rejectionReason: 'Refund not applicable as per airline policy',
        timeline: [
          {
            status: 'initiated',
            date: '2024-08-18T15:30:00Z',
            description: 'Refund request submitted'
          },
          {
            status: 'rejected',
            date: '2024-08-19T10:00:00Z',
            description: 'Refund rejected - Policy violation'
          }
        ]
      }
    ];

    return { payments: mockPayments, refunds: mockRefunds };
  };

  const filterPayments = () => {
    let filtered = activeTab === 'payments' ? [...payments] : [...refunds];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.transactionId && item.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.bookingId && item.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.airline && item.airline.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.flightNumber && item.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPayments(filtered);
  };

  const handleDownloadReceipt = (payment) => {
    // Simulate receipt download
    const element = document.createElement('a');
    const file = new Blob([`Receipt - ${payment.transactionId}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${payment.transactionId}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewRefundTimeline = (refund) => {
    setSelectedRefund(refund);
    setShowRefundModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'failed':
      case 'rejected':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
      case 'pending':
      case 'processing':
        return <FontAwesomeIcon icon={faClock} className="text-warning" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-info" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      successful: { color: 'success', text: 'Successful' },
      failed: { color: 'danger', text: 'Failed' },
      pending: { color: 'warning', text: 'Pending' },
      completed: { color: 'success', text: 'Completed' },
      processing: { color: 'info', text: 'Processing' },
      rejected: { color: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  const getFilterOptions = () => {
    if (activeTab === 'payments') {
      return [
        { key: 'all', label: 'All Payments', count: payments.length },
        { key: 'successful', label: 'Successful', count: payments.filter(p => p.status === 'successful').length },
        { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { key: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed').length }
      ];
    } else {
      return [
        { key: 'all', label: 'All Refunds', count: refunds.length },
        { key: 'completed', label: 'Completed', count: refunds.filter(r => r.status === 'completed').length },
        { key: 'processing', label: 'Processing', count: refunds.filter(r => r.status === 'processing').length },
        { key: 'rejected', label: 'Rejected', count: refunds.filter(r => r.status === 'rejected').length }
      ];
    }
  };

  if (loading) {
    return (
      <div className="payments-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      {/* Header */}
      <div className="payments-header mb-4">
        <h2>
          <FontAwesomeIcon icon={faWallet} className="me-2" />
          Payments & Refunds
        </h2>
        <p className="text-muted">Track your payment history and refund status</p>
      </div>

      {/* Tabs */}
      <div className="payment-tabs mb-4">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FontAwesomeIcon icon={faCreditCard} className="me-2" />
          Payment History
        </button>
        <button
          className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveTab('refunds')}
        >
          <FontAwesomeIcon icon={faUndo} className="me-2" />
          Refund Status
        </button>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="payment-filters">
            {getFilterOptions().map(option => (
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
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="payments-list">
        {filteredPayments.length === 0 ? (
          <div className="no-payments text-center py-5">
            <FontAwesomeIcon 
              icon={activeTab === 'payments' ? faCreditCard : faUndo} 
              size="3x" 
              className="text-muted mb-3" 
            />
            <h4 className="text-muted">No {activeTab} found</h4>
            <p className="text-muted">
              {searchTerm ? 'Try adjusting your search criteria' : `You haven't made any ${activeTab} yet`}
            </p>
          </div>
        ) : (
          filteredPayments.map(item => (
            <div key={item.id} className="payment-card">
              <div className="payment-header">
                <div className="payment-info">
                  <div className="transaction-id">
                    <strong>{activeTab === 'payments' ? item.transactionId : item.id}</strong>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="payment-description">
                    {item.description || `Refund for booking ${item.bookingId}`}
                  </div>
                  <div className="payment-date">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                    {new Date(activeTab === 'payments' ? (item.paymentDate || new Date()) : (item.refundDate || new Date())).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="payment-amount">
                  <div className="amount">
                    <FontAwesomeIcon icon={faRupeeSign} />
                    {(activeTab === 'payments' ? (item.amount || 0) : (item.refundAmount || 0)).toLocaleString()}
                  </div>
                  <div className="status-icon">
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              </div>

              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Booking ID:</span>
                  <span className="value">{item.bookingId}</span>
                </div>
                {activeTab === 'payments' ? (
                  <>
                    <div className="detail-row">
                      <span className="label">Payment Method:</span>
                      <span className="value">
                        {item.paymentMethod}
                        {item.cardLast4 && ` ending in ${item.cardLast4}`}
                        {item.upiId && ` (${item.upiId})`}
                        {item.bankName && ` - ${item.bankName}`}
                        {item.walletName && ` - ${item.walletName}`}
                      </span>
                    </div>
                    {item.airline && (
                      <div className="detail-row">
                        <span className="label">Flight:</span>
                        <span className="value">{item.airline} {item.flightNumber}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <span className="label">Original Amount:</span>
                      <span className="value">₹{(item.originalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Refund Method:</span>
                      <span className="value">{item.refundMethod}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Reason:</span>
                      <span className="value">{item.reason}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="payment-actions">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => activeTab === 'payments' ? handleViewPaymentDetails(item) : handleViewRefundTimeline(item)}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  {activeTab === 'payments' ? 'View Details' : 'View Timeline'}
                </button>
                
                {activeTab === 'payments' && item.status === 'successful' && item.receiptUrl && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleDownloadReceipt(item)}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                    Download Receipt
                  </button>
                )}

                {activeTab === 'refunds' && item.status === 'processing' && item.estimatedCompletion && (
                  <div className="estimated-completion">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    Expected by: {new Date(item.estimatedCompletion).toLocaleDateString()}
                  </div>
                )}

                {item.status === 'failed' && item.failureReason && (
                  <div className="failure-reason">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    {item.failureReason}
                  </div>
                )}

                {item.status === 'rejected' && item.rejectionReason && (
                  <div className="rejection-reason">
                    <FontAwesomeIcon icon={faBan} className="me-1" />
                    {item.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showPaymentModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
        />
      )}

      {showRefundModal && selectedRefund && (
        <RefundTimelineModal
          refund={selectedRefund}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedRefund(null);
          }}
        />
      )}
    </div>
  );
}
