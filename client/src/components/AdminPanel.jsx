import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const AdminPanel = () => {
  const { token, role } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReservations();
  }, [token, role, navigate]);

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

  const cancelReservation = async (reservationId) => {
    try {
      await axios.delete(`http://localhost:5001/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReservations();
    } catch (err) {
      console.error('Error canceling reservation:', err);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Ładowanie...</p>;
  if (!token || role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="flex justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Panel Admina</h2>
            <LogoutButton />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Aktywne rezerwacje</h3>
          {reservations.length === 0 ? (
            <p className="text-center text-gray-500">Brak aktywnych rezerwacji.</p>
          ) : (
            <ul className="space-y-4">
              {reservations.map((res) => (
                <li key={res._id} className="bg-gray-50 p-4 rounded-lg shadow">
                  {res.carId?.brand ? `${res.carId.brand} ${res.carId.model}` : 'Nieznany model'} - 
                  {new Date(res.startDate).toLocaleDateString()} do {new Date(res.endDate).toLocaleDateString()}
                  <button
                    onClick={() => cancelReservation(res._id)}
                    className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
