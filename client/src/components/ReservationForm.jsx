import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from '../components/LogoutButton';
import '../styles/ReservationForm.css';

const ReservationForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Stany formularza i danych samochodu
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [carId, setCarId] = useState('');
  const [error, setError] = useState('');
  const [carData, setCarData] = useState(null);

  // Opcjonalne dodatki do rezerwacji
  const [insurance, setInsurance] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [offsiteDropoff, setOffsiteDropoff] = useState(false);

  // Efekt uruchamiany przy załadowaniu komponentu - pobranie ID auta z query params i danych auta
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('carId');
    if (id) setCarId(id);

    // Jeśli brak tokena - przekierowanie do logowania
    if (!token) navigate('/login');
    else if (id) fetchCarData(id);
  }, [token, navigate, location.search]);

  // Pobranie danych auta z backendu
  const fetchCarData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCarData(res.data);
    } catch (err) {
      console.error('Fetch car data error:', err.response ? err.response.data : err.message);
      setError('Nie udało się pobrać danych samochodu.');
      // Fallback, żeby formularz się nie załamał
      setCarData({ brand: 'Nieznany', model: 'Model', pricePerDay: 0 });
    }
  };

  // Obsługa wysłania formularza rezerwacji
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja dat
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
      console.log('Sending reservation data:', { carId, startDate, endDate, insurance, trailer, offsiteDropoff });
      await axios.post(
        'http://localhost:5001/api/reservations',
        { carId, startDate, endDate, insurance, trailer, offsiteDropoff },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/UserReservations');
    } catch (err) {
      setError('Błąd rezerwacji: ' + (err.response?.data?.message || err.message));
    }
  };

  // Funkcja licząca całkowity koszt rezerwacji
  const calculateTotalCost = () => {
    if (!carData || !startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const baseCost = days * carData.pricePerDay;

    // Dodatkowe opłaty
    const extraCosts = [
      insurance ? 50 : 0,
      trailer ? 100 : 0,
      offsiteDropoff ? 200 : 0,
    ];

    return baseCost + extraCosts.reduce((a, b) => a + b, 0);
  };

  // Jeśli brak tokena - nic nie renderuj
  if (!token) return null;

  return (
    <div className="resform-container">
      <div className="resform-box">
        <div className="resform-inner">
          <h1 className="resform-title">Rezerwacja</h1>
          <div className="resform-buttons">
            <button
              onClick={() => navigate('/')}
              className="resform-button home-button"
            >
              Strona główna
            </button>
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

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                  />{' '}
                  Dodatkowe ubezpieczenie (+50 zł)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={trailer}
                    onChange={(e) => setTrailer(e.target.checked)}
                  />{' '}
                  Przyczepka (+100 zł)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={offsiteDropoff}
                    onChange={(e) => setOffsiteDropoff(e.target.checked)}
                  />{' '}
                  Zostawienie w innym miejscu (+200 zł)
                </label>
              </div>

              <button type="submit" className="resform-button">
                Zarezerwuj
              </button>
            </form>

            <div className="resform-summary">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Podsumowanie</h3>
              {carData && (
                <div>
                  <p>
                    Model: {carData.brand} {carData.model}
                  </p>
                  <p>Cena bazowa/dzień: {carData.pricePerDay} zł</p>
                  <p>
                    Liczba dni:{' '}
                    {startDate && endDate
                      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
                      : 0}
                  </p>
                  <p>
                    Całkowity koszt: <strong>{calculateTotalCost()} zł</strong>
                  </p>
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