import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const { token, login } = useAuth();// Wywołanie useContext na górze
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Przekierowanie, jeśli już zalogowany, w useEffect
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      login(res.data.token, res.data.role); // Ustawienie tokenu i roli
      navigate('/');
    } catch (err) {
      setError('Błąd logowania: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-inner">
          <h1 className="login-title">Logowanie</h1>
          {error && <p className="login-error">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-input"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="login-input"
              required
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