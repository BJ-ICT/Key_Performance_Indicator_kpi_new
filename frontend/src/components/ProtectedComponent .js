import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedComponent = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if token is not present
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
    
      {children}
    </div>
  );
};

export default ProtectedComponent;
