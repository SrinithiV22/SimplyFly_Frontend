import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5244/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('FULL API RESPONSE:', data);
        
        // Store the token
        localStorage.setItem('token', data.token);
        localStorage.setItem('userToken', data.token);
        
        // Decode the JWT token to get user information
        const decodedToken = decodeJWT(data.token);
        console.log('DECODED JWT TOKEN:', decodedToken);
        
        if (decodedToken) {
          // Extract user information from the decoded token
          // Common JWT claim names for role: 'role', 'roles', 'Role', or a custom claim
          const userRole = decodedToken.role || 
                          decodedToken.Role || 
                          decodedToken.roles || 
                          decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                          'User';
          
          const userName = decodedToken.name || 
                          decodedToken.Name ||
                          decodedToken.unique_name ||
                          decodedToken.sub ||
                          'User';
                          
          const userEmail = decodedToken.email || 
                           decodedToken.Email ||
                           email;
                           
          const userId = decodedToken.sub || 
                        decodedToken.id || 
                        decodedToken.Id ||
                        decodedToken.nameid;
          
          // Store the actual user data from decoded token
          localStorage.setItem('userData', JSON.stringify({
            Role: userRole,
            Name: userName,
            Email: userEmail,
            Id: userId
          }));
          
          console.log('STORED USER DATA FROM TOKEN:', {
            Role: userRole,
            Name: userName,
            Email: userEmail,
            Id: userId
          });
        } else {
          // Fallback if token decoding fails
          localStorage.setItem('userData', JSON.stringify({
            Role: 'User',
            Name: 'User',
            Email: email,
            Id: null
          }));
        }
        
        navigate('/home');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="floating-plane-1"></div>
      <div className="floating-plane-2"></div>
      <div className="floating-plane-3"></div>
      
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your SimplyFly account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;