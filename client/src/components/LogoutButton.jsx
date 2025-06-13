import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  // Pobranie funkcji logout z kontekstu autoryzacji
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Funkcja wylogowania i przekierowania na stronę logowania
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="admin-cancel" // Użycie Twojej klasy CSS zamiast Tailwind
    >
      Wyloguj
    </button>
  );
};

export default LogoutButton;
