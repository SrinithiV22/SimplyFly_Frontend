import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleId: 2002  // Default roleId for User
  });

  // Define role mappings
  const roleMapping = {
    'Admin': 1003,
    'Flight Owner': 1004,
    'User': 2002
  };

  const handleChange = (e) => {
    setError("");
    if (e.target.name === 'role') {
      // Map selected role to roleId
      setFormData({
        ...formData,
        roleId: roleMapping[e.target.value]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Create the registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        roleId: formData.roleId
      };

      console.log('Attempting registration with:', registrationData);

      // Single registration endpoint
      const response = await axios.post(
        "http://localhost:5148/api/v1/auth/register",
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Registration response:', response);

      if (response.data) {
        // Store registration data temporarily for login to access
        const tempUserData = {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          roleId: formData.roleId
        };
        localStorage.setItem('tempRegistrationData', JSON.stringify(tempUserData));
        
        alert("Registration successful! Please login.");
        navigate('/login');
      }

    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError("Registration service not available. Please try again later.");
            break;
          case 409:
            setError("Email already exists. Please use a different email.");
            break;
          case 400:
            setError(err.response.data.message || "Invalid registration data.");
            break;
          default:
            setError(err.response.data.message || "Registration failed. Please try again later.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-4">Register</h3>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="needs-validation">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            minLength="2"
            pattern="[A-Za-z ]*"
            title="Please enter a valid name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
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
              minLength="6"
              required
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

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            className="form-control"
            value={formData.phoneNumber}
            onChange={handleChange}
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit phone number"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-select"
            onChange={handleChange}
            required
          >
            <option value="">Select a role</option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Flight Owner">Flight Owner</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
    </div>
  );
}

export default Register;