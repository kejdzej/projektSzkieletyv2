import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const AdminPanel = () => {
  // Pobieranie tokena i roli użytkownika z kontekstu autoryzacji
  const { token, role } = useAuth();
  const navigate = useNavigate();

  // Stan przechowujący listę rezerwacji oraz stan ładowania
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Efekt uruchamiający się po załadowaniu komponentu, sprawdza uprawnienia i pobiera rezerwacje
  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/'); // Przekierowanie jeśli brak tokena lub brak roli admina
      return;
    }
    fetchReservations();
  }, [token, role, navigate]);

  // Funkcja pobierająca wszystkie rezerwacje (dostępna tylko dla admina)
  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/reservations/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setLoading(false);
    }
  };

  // Funkcja anulująca rezerwację o podanym ID
  const cancelReservation = async (reservationId) => {
    try {
      await axios.delete(`http://localhost:5001/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReservations(); // Odświeżenie listy po anulowaniu
    } catch (err) {
      console.error('Error canceling reservation:', err);
    }
  };

  // Wyświetlenie komunikatu podczas ładowania danych
  if (loading) return <p className="admin-no-reservations">Ładowanie...</p>;

  // Ukrycie panelu jeśli brak tokena lub brak uprawnień admina
  if (!token || role !== 'admin') return null;

  // Render panelu admina z listą rezerwacji i możliwością anulowania
  return (
    <div className="admin-container">
      <div className="admin-box">
        <div className="admin-inner">
          {/* Nagłówek panelu z tytułem i przyciskiem wylogowania */}
          <div className="admin-header">
            <h2 className="admin-title">Panel Admina</h2>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => navigate('/')}
                className="admin-button"
                style={{ backgroundColor: '#2ecc71', marginRight: '10px' }}
              >
                Strona główna
              </button>
              <LogoutButton />
            </div>
          </div>

          <h3 className="admin-subtitle">Aktywne rezerwacje</h3>

          {/* Jeśli brak rezerwacji, wyświetl komunikat */}
          {reservations.length === 0 ? (
            <p className="admin-no-reservations">Brak aktywnych rezerwacji.</p>
          ) : (
            // Lista rezerwacji
            <ul className="admin-list">
              {reservations.map((res) => (
                <li key={res._id} className="admin-item">
                  <span>
                    {res.carId?.brand ? `${res.carId.brand} ${res.carId.model}` : 'Nieznany model'} -{' '}
                    {new Date(res.startDate).toLocaleDateString()} do {new Date(res.endDate).toLocaleDateString()}
                  </span>
                  {/* Przycisk anulowania rezerwacji */}
                  <button
                    onClick={() => cancelReservation(res._id)}
                    className="admin-cancel"
                  >
                    Anuluj
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;