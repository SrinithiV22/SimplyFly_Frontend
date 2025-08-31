import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings"; // Seat selection page
import PassengerDetails from "./pages/PassengerDetails"; // New passenger details page
import Payment from "./pages/Payment"; // New payment page
import BookingConfirmation from "./pages/BookingConfirmation"; // New booking confirmation page
import BookingHistory from "./pages/BookingHistory"; // Booking history page
import Admin from "./pages/Admin";
import FlightOwner from "./pages/FlightOwner";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import { PaymentGuard, BookingConfirmationGuard, PassengerDetailsGuard } from "./components/RouteGuard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} /> {/* Seat selection */}
        <Route path="/passenger-details" element={<ProtectedRoute><PassengerDetailsGuard><PassengerDetails /></PassengerDetailsGuard></ProtectedRoute>} /> {/* Passenger details */}
        <Route path="/payment" element={<ProtectedRoute><PaymentGuard><Payment /></PaymentGuard></ProtectedRoute>} /> {/* Payment page */}
        <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmationGuard><BookingConfirmation /></BookingConfirmationGuard></ProtectedRoute>} /> {/* Booking confirmation */}
        <Route path="/booking-history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} /> {/* Booking history */}
        <Route path="/my-bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} /> {/* Alias for booking history */}
        <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['Admin']}><Admin /></RoleProtectedRoute>} />
        <Route path="/flight-owner" element={<RoleProtectedRoute allowedRoles={['Flightowner']}><FlightOwner /></RoleProtectedRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      </Routes>
    </>
  );
}

export default App;