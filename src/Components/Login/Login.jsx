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
      console.log('Attempting login with:', formData); // Debug log

      const response = await axios.post(
        "http://localhost:5148/api/v1/auth/login",
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Login response:', response.data); // Debug log

      if (response.data) {
        // Store authentication data first
        localStorage.setItem('authToken', response.data.token);
        
        const userData = {
          email: response.data.email,
          roleId: response.data.roleId,
          name: response.data.name,
          id: response.data.id
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Stored user data:', userData); // Debug log

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Determine route based on role
        const role = response.data.roleId;
        let targetRoute = '/dashboard'; // Default route
        
        if (role === 1003) {
          targetRoute = "/admin-dashboard";
        } else if (role === 1004) {
          targetRoute = "/flight-owner-dashboard";
        }

        console.log('Target route:', targetRoute); // Debug log

        // Show welcome message first
        alert(`Welcome back${response.data.name ? ', ' + response.data.name : ''}!`);
        
        // Then navigate immediately
        navigate(targetRoute, { replace: true });
      }
    } catch (err) {
      // ... existing error handling code ...
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