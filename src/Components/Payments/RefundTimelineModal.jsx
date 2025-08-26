import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faRupeeSign,
  faCalendarAlt,
  faInfoCircle,
  faExclamationTriangle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './RefundTimelineModal.css';

export default function RefundTimelineModal({ refund, onClose }) {
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'initiated':
        return <FontAwesomeIcon icon={faInfoCircle} className="timeline-icon initiated" />;
      case 'processing':
        return <FontAwesomeIcon icon={faSpinner} className="timeline-icon processing" />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="timeline-icon completed" />;
      case 'rejected':
        return <FontAwesomeIcon icon={faTimesCircle} className="timeline-icon rejected" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="timeline-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'processing':
        return 'info';
      case 'initiated':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Refund Timeline</h3>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          {/* Refund Summary */}
          <div className="refund-summary">
            <div className="summary-header">
              <div className="refund-info">
                <h4>Refund ID: {refund.id}</h4>
                <p>Booking: {refund.bookingId}</p>
                <span className={`status-badge ${getStatusColor(refund.status)}`}>
                  {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                </span>
              </div>
              <div className="refund-amount">
                <div className="amount">
                  <FontAwesomeIcon icon={faRupeeSign} />
                  {refund.refundAmount.toLocaleString()}
                </div>
                <div className="original-amount">
                  of ₹{refund.originalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="refund-details">
              <div className="detail-row">
                <span className="label">Refund Method:</span>
                <span className="value">{refund.refundMethod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Reason:</span>
                <span className="value">{refund.reason}</span>
              </div>
              <div className="detail-row">
                <span className="label">Requested Date:</span>
                <span className="value">{formatDate(refund.refundDate)}</span>
              </div>
              {refund.completedDate && (
                <div className="detail-row">
                  <span className="label">Completed Date:</span>
                  <span className="value">{formatDate(refund.completedDate)}</span>
                </div>
              )}
              {refund.rejectedDate && (
                <div className="detail-row">
                  <span className="label">Rejected Date:</span>
                  <span className="value">{formatDate(refund.rejectedDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="refund-timeline">
            <h5>Refund Progress</h5>
            <div className="timeline-container">
              {refund.timeline.map((step, index) => (
                <div key={index} className={`timeline-step ${step.status}`}>
                  <div className="timeline-marker">
                    {getTimelineIcon(step.status)}
                    {index < refund.timeline.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </div>
                    <div className="timeline-description">
                      {step.description}
                    </div>
                    <div className="timeline-date">
                      {formatDate(step.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="additional-info">
            {refund.status === 'processing' && refund.estimatedCompletion && (
              <div className="info-card processing">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <div>
                  <strong>Estimated Completion:</strong>
                  <p>{formatDate(refund.estimatedCompletion)}</p>
                </div>
              </div>
            )}

            {refund.status === 'rejected' && refund.rejectionReason && (
              <div className="info-card rejected">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <div>
                  <strong>Rejection Reason:</strong>
                  <p>{refund.rejectionReason}</p>
                </div>
              </div>
            )}

            {refund.status === 'completed' && (
              <div className="info-card completed">
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                <div>
                  <strong>Refund Completed:</strong>
                  <p>The refund amount has been credited to your original payment method. It may take 3-5 business days to reflect in your account.</p>
                </div>
              </div>
            )}

            <div className="help-info">
              <h6>Need Help?</h6>
              <p>If you have any questions about your refund, please contact our customer support:</p>
              <ul>
                <li>Phone: 1800-123-4567</li>
                <li>Email: refunds@simplyfly.com</li>
                <li>Live Chat: Available 24/7 on our website</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
