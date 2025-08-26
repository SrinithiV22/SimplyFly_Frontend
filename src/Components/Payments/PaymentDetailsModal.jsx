import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faCreditCard,
  faCalendarAlt,
  faRupeeSign,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faDownload,
  faPrint,
  faInfoCircle,
  faReceipt,
  faShieldAlt,
  faBuilding,
  faWallet,
  faUniversity
} from '@fortawesome/free-solid-svg-icons';
import './PaymentDetailsModal.css';

export default function PaymentDetailsModal({ payment, onClose }) {
  const handleDownloadReceipt = () => {
    // Simulate receipt download
    const element = document.createElement('a');
    const file = new Blob([`Receipt - ${payment.transactionId}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${payment.transactionId}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return faCreditCard;
      case 'net banking':
        return faUniversity;
      case 'wallet':
        return faWallet;
      case 'upi':
        return faShieldAlt;
      default:
        return faCreditCard;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="text-warning" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-info" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          <div className="payment-receipt">
            {/* Receipt Header */}
            <div className="receipt-header">
              <div className="company-info">
                <h2>SimplyFly</h2>
                <p>Your trusted travel partner</p>
              </div>
              <div className="receipt-info">
                <h4>Payment Receipt</h4>
                <p>Transaction ID: {payment.transactionId}</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="payment-status">
              <div className="status-indicator">
                {getStatusIcon(payment.status)}
                <span className={`status-text ${payment.status}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
              <div className="payment-amount-large">
                <FontAwesomeIcon icon={faRupeeSign} />
                {payment.amount.toLocaleString()}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="transaction-details">
              <h5>Transaction Information</h5>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{payment.transactionId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Booking ID:</span>
                  <span className="value">{payment.bookingId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payment Date:</span>
                  <span className="value">
                    {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span className="value">₹{payment.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="payment-method-details">
              <h5>
                <FontAwesomeIcon icon={getPaymentMethodIcon(payment.paymentMethod)} className="me-2" />
                Payment Method
              </h5>
              <div className="method-info">
                <div className="method-card">
                  <div className="method-type">{payment.paymentMethod}</div>
                  <div className="method-details">
                    {payment.cardLast4 && (
                      <span>Card ending in {payment.cardLast4}</span>
                    )}
                    {payment.upiId && (
                      <span>UPI ID: {payment.upiId}</span>
                    )}
                    {payment.bankName && (
                      <span>Bank: {payment.bankName}</span>
                    )}
                    {payment.walletName && (
                      <span>Wallet: {payment.walletName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            {payment.airline && (
              <div className="flight-details">
                <h5>Flight Information</h5>
                <div className="flight-info">
                  <div className="airline-info">
                    <span className="airline">{payment.airline}</span>
                    <span className="flight-number">{payment.flightNumber}</span>
                  </div>
                  <div className="booking-description">
                    {payment.description}
                  </div>
                </div>
              </div>
            )}

            {/* Gateway Response */}
            <div className="gateway-response">
              <h5>Gateway Response</h5>
              <div className={`response-message ${payment.status}`}>
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                {payment.gatewayResponse}
              </div>
              {payment.failureReason && (
                <div className="failure-details">
                  <strong>Failure Reason:</strong> {payment.failureReason}
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="important-notes">
              <h5>Important Information</h5>
              <ul>
                <li>This is a computer-generated receipt and does not require a signature</li>
                <li>Please save this receipt for your records</li>
                <li>For any queries, contact our customer support at 1800-123-4567</li>
                {payment.status === 'successful' && (
                  <li>Your booking is confirmed and e-tickets have been sent to your email</li>
                )}
                {payment.status === 'failed' && (
                  <li>No amount has been charged to your account</li>
                )}
                {payment.status === 'pending' && (
                  <li>Payment is being processed. You will receive confirmation shortly</li>
                )}
              </ul>
            </div>

            {/* Footer */}
            <div className="receipt-footer">
              <div className="company-details">
                <p><strong>SimplyFly Private Limited</strong></p>
                <p>123 Aviation Street, Mumbai, Maharashtra 400001</p>
                <p>Email: support@simplyfly.com | Phone: 1800-123-4567</p>
                <p>GST No: 27AABCS1234A1Z5</p>
              </div>
              <div className="receipt-timestamp">
                <p>Receipt generated on: {new Date().toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            {payment.status === 'successful' && payment.receiptUrl && (
              <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Download PDF
              </button>
            )}
            <button className="btn btn-outline-primary" onClick={handlePrintReceipt}>
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print Receipt
            </button>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
