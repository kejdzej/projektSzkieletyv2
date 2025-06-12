import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/cars');
        setCars(res.data.filter(car => car.available));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Ładowanie...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Wypożyczalnia Samochodów</h1>
          <p className="text-center text-gray-600 mb-8">Sprawdź dostępne auta i zarejestruj się, aby начать wypożyczanie!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cars.map((car) => (
              <div key={car._id} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition">
                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-40 object-cover rounded mb-2" />
                <h2 className="text-xl font-semibold text-gray-800">{car.brand} {car.model}</h2>
                <p className="text-gray-600">Rok: {car.year}</p>
                <p className="text-gray-600">Cena/dzień: {car.pricePerDay} PLN</p>
              </div>
            ))}
          </div>
          {cars.length === 0 && <p className="text-center text-gray-500">Brak dostępnych samochodów.</p>}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Zaloguj się
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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