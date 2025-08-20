import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Redirect to login if no token is present
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1003:
        return "Admin";
      case 1004:
        return "Flight Owner";
      case 2002:
        return "User";
      default:
        return "Unknown Role";
    }
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to Dashboard</h2>
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">User Information</h5>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {getRoleName(user.roleId)}</p>
          <p><strong>Authentication Status:</strong> {token ? "Authenticated" : "Not Authenticated"}</p>
        </div>
      </div>
    </div>
  );
}