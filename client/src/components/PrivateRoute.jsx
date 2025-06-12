import React from 'react'; // Usunięto useContext
import { useAuth } from '../context/AuthContext'; // Zaktualizowany import
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth(); // Użycie useAuth
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;