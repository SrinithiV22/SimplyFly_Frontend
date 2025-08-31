import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const RouteGuard = ({ children, requiredAuth = null, allowedFromPages = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Check basic authentication
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If no specific authorization required, allow access
  if (!requiredAuth) {
    return children;
  }

  // Check for specific authorization flags
  const hasRequiredAuth = sessionStorage.getItem(requiredAuth);
  
  // If authorization is required but not present, block access
  if (!hasRequiredAuth) {
    console.log(`Unauthorized direct URL access to ${location.pathname} - missing ${requiredAuth} flag`);
    // Clear any existing session data to prevent bypass attempts
    sessionStorage.clear();
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Specific route guards for different pages
export const PaymentGuard = ({ children }) => (
  <RouteGuard 
    children={children}
    requiredAuth="fromPassengerDetails"
    allowedFromPages={['/passenger-details']}
  />
);

export const BookingConfirmationGuard = ({ children }) => (
  <RouteGuard 
    children={children}
    requiredAuth="fromPayment"
    allowedFromPages={['/payment']}
  />
);

export const PassengerDetailsGuard = ({ children }) => (
  <RouteGuard 
    children={children}
    requiredAuth="fromBookings"
    allowedFromPages={['/bookings']}
  />
);

export default RouteGuard;
