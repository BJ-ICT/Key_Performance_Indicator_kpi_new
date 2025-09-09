import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthGuard = ({ requiredPage, children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAccess = () => {
      try {
        // 1. Check token and user data
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('userData');

        if (!token || !userDataString) {
          navigate('/', { replace: true });
          return;
        }

        // 2. Verify token and check expiration
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          navigate('/', { replace: true, state: { message: 'Session expired' } });
          return;
        }

        // 3. Parse user data
        const userData = JSON.parse(userDataString);

        // 4. Check user role from BOTH token and userData
        const isAdmin = 
          (decoded.role === 'admin' || decoded.role === 'superadmin') && 
          (userData.role === 'admin' || userData.role === 'superadmin');

        if (isAdmin) {
          setIsAuthorized(true);
          return;
        }

        // 5. For regular users, check page access
        const hasPageAccess = userData.pages?.includes(requiredPage);

        if (hasPageAccess) {
          setIsAuthorized(true);
          return;
        }

        // 6. No access, redirect to unauthorized
        navigate('/unauthorized', {
          state: {
            requiredPage,
            userPages: userData.pages || [],
          },
        });

      } catch (error) {
        console.error('Auth validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/', { replace: true });
      }
    };

    validateAccess();
  }, [requiredPage, navigate]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return children;
};

export default AuthGuard;