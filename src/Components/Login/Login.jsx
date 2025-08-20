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
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data) {
        // Store token in axios defaults for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Store authentication data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          email: response.data.email,
          roleId: response.data.roleId,
          name: response.data.name,
          id: response.data.id
        }));

        // Navigate first, then show welcome message
        const role = response.data.roleId;
        switch (role) {
          case 1003: // Admin
            navigate("/admin-dashboard");
            break;
          case 1004: // Flight Owner
            navigate("/flight-owner-dashboard");
            break;
          case 2002: // User
            navigate("/dashboard");
            break;
          default:
            navigate("/");
            break;
        }

        // Show success message after navigation
        const successMessage = `Welcome back${response.data.name ? ', ' + response.data.name : ''}!`;
        alert(successMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setError("Your account is not active");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
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