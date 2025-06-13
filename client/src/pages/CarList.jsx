import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../styles/CarList.css';

const CarList = () => {
  const { token, role } = useAuth(); //destrukturyzacja
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Token in CarList useEffect:', token); // Debug token
    const fetchCars = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/cars', {
          headers: { Authorization: `Bearer ${token}` }, // Dodaj token
        });
        setCars(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setLoading(false);
      }
    };
    if (token) fetchCars(); // Wywołaj tylko, jeśli token istnieje
  }, [token]);

  const handleReserve = (carId) => {
    if (token) {
      navigate(`/ReservationForm?carId=${carId}`);
    } else {
      navigate('/login');
    }
  };

  const handleMyReservations = () => {
    if (token) {
      navigate('/UserReservations');
    } else {
      navigate('/login');
    }
  };

  const handleAdminPanel = () => {
    if (token && role === 'admin') {
      navigate('/admin');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#666' }}>Ładowanie...</p>;
  if (!token) return <p style={{ textAlign: 'center', color: '#666' }}>Zaloguj się, aby zobaczyć listę aut.</p>;

  return (
    <div className="carlist-container">
      <div className="carlist-box">
        <div className="carlist-inner">
          <h1 className="carlist-title">Lista Samochodów</h1>
          <div className="carlist-buttons">
            <button onClick={handleMyReservations} className="carlist-button">Moje Rezerwacje</button>
            {role === 'admin' && (
              <button
                onClick={handleAdminPanel}
                className="carlist-button"
                style={{ backgroundColor: '#f39c12' }}
              >
                Panel Admina
              </button>
            )}
            <LogoutButton />
          </div>
          <div className="carlist-grid">
            {cars.map((car) => (
              <div key={car._id} className="carlist-card">
                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} />
                <h2>{car.brand} {car.model}</h2>
                <p>Rok: {car.year}</p>
                <p>Cena/dzień: {car.pricePerDay} PLN</p>
                <p>Dostępność: {car.available ? 'Tak' : 'Nie'}</p>
                <button
                  onClick={() => handleReserve(car._id)}
                  disabled={!car.available}
                  className="carlist-card button"
                >
                  Zarezerwuj
                </button>
              </div>
            ))}
          </div>
          {cars.length === 0 && <p className="carlist-no-cars">Brak samochodów.</p>}
        </div>
      </div>
    </div>
  );
};

export default CarList;