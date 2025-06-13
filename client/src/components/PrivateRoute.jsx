import React from 'react'; 
import { useAuth } from '../context/AuthContext'; // Import hooka do autoryzacji
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth(); // Pobieramy token z kontekstu, aby sprawdzić czy użytkownik jest zalogowany

  // Jeśli jest token (czyli użytkownik jest zalogowany), renderujemy dzieci (chronione komponenty),
  // w przeciwnym razie przekierowujemy na stronę logowania
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
