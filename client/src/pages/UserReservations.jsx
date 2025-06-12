import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../styles/UserReservations.css';

const UserReservations = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setLoading(false);
      }
    };
    if (token) fetchReservations();
  }, [token]);

  const fetchCarDetails = async (carId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error('Error fetching car details:', err);
      return { brand: 'Nieznany', model: 'model' };
    }
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#666' }}>Ładowanie...</p>;
  if (!token) return <p style={{ textAlign: 'center', color: '#666' }}>Zaloguj się, aby zobaczyć rezerwacje.</p>;

  return (
    <div className="reservations-container">
      <div className="reservations-box">
        <div className="reservations-inner">
          <h1 className="reservations-title">Moje Rezerwacje</h1>
          <div className="reservations-buttons">
            <LogoutButton />
          </div>
          {reservations.length === 0 ? (
            <p className="reservations-no-data">Brak rezerwacji.</p>
          ) : (
            reservations.map((res) => (
              <div key={res._id} className="reservations-card">
                <p>
                  Model: {res.car ? `${res.car.brand} ${res.car.model}` : 'Nieznany model'}{' '}
                  - {new Date(res.startDate).toLocaleDateString()} do{' '}
                  {new Date(res.endDate).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReservations;