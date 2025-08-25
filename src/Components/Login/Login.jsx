import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await axios.post(
        "http://localhost:5148/api/v1/auth/login",
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );


      if (response.data && response.data.token) {
        // console.log('Login successful - storing user data...');
        
        // Store authentication token first
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        
        // Set axios header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Create user data with available info (no profile API available)
        const userData = {
          email: formData.email,
          roleId: 1002, // Default customer role
          name: formData.email.split('@')[0], // Use email prefix as name
          id: Date.now() // Temporary ID
        };
        
        // console.log('Storing user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Determine route based on role
        const role = userData.roleId;
        let targetRoute = '/dashboard'; // Default route
        
        if (role === 1003) {
          targetRoute = "/admin-dashboard";
        } else if (role === 1004) {
          targetRoute = "/flight-owner-dashboard";
        }


        // Show welcome message
        alert(`Welcome back${userData.name ? ', ' + userData.name : ''}!`);
        
        // Navigate to dashboard
        navigate(targetRoute, { replace: true });
      }
    } catch (err) {
      console.error('Login error details:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your email or register first.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-4">Login to SimplyFly</h3>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="needs-validation">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              minLength="6"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        <div className="mt-3 text-center">
          <p>
            Don't have an account? <Link to="/register" className="text-primary">Register here</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;