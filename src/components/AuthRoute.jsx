import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default AuthRoute;
