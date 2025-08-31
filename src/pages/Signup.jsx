import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const navigate = useNavigate();

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:5244/test');
        if (response.ok) {
          setConnectionStatus('connected');
          console.log('✅ API connection successful');
        } else {
          setConnectionStatus('error');
          console.log('❌ API responded with error:', response.status);
        }
      } catch (error) {
        setConnectionStatus('error');
        console.log('❌ API connection failed:', error);
      }
    };

    testConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected') {
      setError('Cannot connect to server. Please ensure the backend is running.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Sending registration request...');
      
      const response = await fetch('http://localhost:5244/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password 
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok || response.status === 201) {
        console.log('✅ Registration successful');
        setSuccess('Registration successful! Redirecting to login...');
        
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.log('❌ Registration failed with status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        try {
          const parsedError = JSON.parse(errorText);
          setError(parsedError.message || 'Registration failed');
        } catch {
          setError(`Registration failed (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="floating-plane-1"></div>
      <div className="floating-plane-2"></div>
      <div className="floating-plane-3"></div>
      
      <div className="signup-container">
        <div className="login-header">
          <h2>Join SimplyFly</h2>
          <p>Create your account to start flying</p>
          {connectionStatus === 'checking' && (
            <small style={{color: 'orange'}}>Checking server connection...</small>
          )}
          {connectionStatus === 'connected' && (
            <small style={{color: 'green'}}>✅ Connected to server</small>
          )}
          {connectionStatus === 'error' && (
            <small style={{color: 'red'}}>❌ Cannot connect to server</small>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-row">
            <div className="input-group half-width">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group half-width">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group half-width">
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

            <div className="input-group half-width">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading || connectionStatus !== 'connected'}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Already have an account? <Link to="/login" className="signup-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;