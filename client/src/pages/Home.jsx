import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/cars');
      return;
    }

    const fetchCars = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/cars');
        setCars(res.data.filter(car => car.available));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCars();
  }, [navigate]);

  if (loading) return <p style={{ textAlign: 'center', color: '#666' }}>Ładowanie...</p>;

  return (
    <div className="carlist-container">
      <div className="carlist-box">
        <div className="carlist-inner">
          <h1 className="carlist-title">Wypożyczalnia Samochodów</h1>
          <p style={{ textAlign: 'center', color: '#555' }}>
            Sprawdź dostępne auta i zarejestruj się, aby zacząć wypożyczanie!
          </p>

          {cars.length === 0 ? (
            <p className="carlist-no-cars">Brak dostępnych samochodów.</p>
          ) : (
            <div className="carlist-grid">
              {cars.map(car => (
                <div key={car._id} className="carlist-card">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                  />
                  <h2>{car.brand} {car.model}</h2>
                  <p>Rok: {car.year}</p>
                  <p>Cena/dzień: {car.pricePerDay} PLN</p>
                </div>
              ))}
            </div>
          )}

          <div className="carlist-login-buttons">
            <button
              className="carlist-login-button"
              onClick={() => navigate('/login')}
            >
              Zaloguj się
            </button>
            <button
              className="carlist-login-button"
              onClick={() => navigate('/register')}
            >
              Zarejestruj się
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
