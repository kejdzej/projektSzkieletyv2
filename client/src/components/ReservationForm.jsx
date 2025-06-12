import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';
import '../styles/ReservationForm.css';

const ReservationForm = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [carId, setCarId] = useState('');
  const [error, setError] = useState('');
  const [carData, setCarData] = useState(null);
  const [insurance, setInsurance] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [offsiteDropoff, setOffsiteDropoff] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('carId');
    if (id) setCarId(id);
    if (!token) navigate('/login');
    else {
      fetchCarData(id);
    }
  }, [token, navigate, location.search]);

  const fetchCarData = async (id) => {
  try {
    const res = await axios.get(`http://localhost:5001/api/cars/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCarData(res.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      setError('Samochód nie znaleziony. Skontaktuj się z administratorem.');
      setCarData({ brand: 'Nieznany', model: 'Model', pricePerDay: 0 });
    } else {
      console.error('Error fetching car data:', err);
      setError('Nie udało się pobrać danych samochodu.');
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Wybierz daty startu i końca.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffTime <= 0) {
      setError('Data końca musi być po dacie startu.');
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/reservations', { carId, startDate, endDate }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/UserReservations');
    } catch (err) {
      setError('Błąd rezerwacji: ' + err.response?.data?.message || err.message);
    }
  };

  const calculateTotalCost = () => {
    if (!carData || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let baseCost = diffTime > 0 ? diffTime * carData.pricePerDay : 0;
    const extraCosts = [
      insurance ? 50 : 0, // Extra ubezpieczenie (50 PLN)
      trailer ? 100 : 0,  // Extra przyczepka (100 PLN)
      offsiteDropoff ? 200 : 0, // Odstawienie poza punkt (200 PLN)
    ];
    return baseCost + extraCosts.reduce((a, b) => a + b, 0);
  };

  if (!token) return null;

  return (
    <div className="resform-container">
      <div className="resform-box">
        <div className="resform-inner">
          <h1 className="resform-title">Rezerwacja</h1>
          <div className="resform-buttons">
            <LogoutButton />
          </div>
          {error && <p style={{ color: '#e53e3e', textAlign: 'center' }}>{error}</p>}
          <div className="resform-content">
            <form onSubmit={handleSubmit} className="resform-form">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="resform-input"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="resform-input"
                required
              />
              <button type="submit" className="resform-button">
                Zarezerwuj
              </button>
            </form>
            <div className="resform-summary">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Podsumowanie</h3>
              {carData && (
                <div>
                  <p>Model: {carData.brand} {carData.model}</p>
                  <p>Cena bazowa/dzień: {carData.pricePerDay} PLN</p>
                  <p>Liczba dni: {startDate && endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0}</p>
                  <p>Całkowity koszt: {calculateTotalCost()} PLN</p>
                  <label>
                    <input
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                    /> Extra ubezpieczenie (+50 PLN)
                  </label>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={trailer}
                      onChange={(e) => setTrailer(e.target.checked)}
                    /> Extra przyczepka (+100 PLN)
                  </label>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={offsiteDropoff}
                      onChange={(e) => setOffsiteDropoff(e.target.checked)}
                    /> Odstawienie poza punkt (+200 PLN)
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;