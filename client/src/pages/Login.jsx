import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Hook do autoryzacji
import '../styles/Login.css';

const Login = () => {
  // Pobranie tokenu i funkcji logowania z kontekstu autoryzacji
  const { token, login } = useAuth();

  // Stany lokalne dla emaila, hasła oraz komunikatu błędu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Hook do nawigacji (przekierowania)
  const navigate = useNavigate();

  // Efekt do przekierowania na stronę główną, jeśli użytkownik jest już zalogowany
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Obsługa formularza logowania
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Wywołanie endpointu logowania backendu
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      // Zapisanie tokenu i roli w kontekście autoryzacji
      login(res.data.token, res.data.role);
      // Przekierowanie po udanym logowaniu na stronę główną
      navigate('/');
    } catch (err) {
      // Wyświetlenie błędu z serwera lub ogólny komunikat
      setError('Błąd logowania: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-inner">
          <h1 className="login-title">Logowanie</h1>
          {/* Wyświetlanie błędu jeśli istnieje */}
          {error && <p className="login-error">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-input"
              required
              autoComplete="username"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="login-input"
              required
              autoComplete="current-password"
            />
            <button type="submit" className="login-button">
              Zaloguj
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
