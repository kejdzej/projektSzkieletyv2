import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CarList from './pages/CarList';
import Login from './pages/Login';
import Register from './pages/Register';
import ReservationForm from './pages/ReservationForm';
import UserReservations from './pages/UserReservations';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Wystąpił błąd. Przepraszamy za niedogodności.</h1>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CarList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ReservationForm" element={<ReservationForm />} />
          <Route path="/UserReservations" element={<PrivateRoute><UserReservations /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/cars" element={<CarList />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;