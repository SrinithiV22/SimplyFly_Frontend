import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = userData.Role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // If no role or wrong role, redirect to login instead of home
      return <Navigate to="/login" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('Error checking user role:', error);
    return <Navigate to="/login" replace />;
  }
};

export default RoleProtectedRoute;
