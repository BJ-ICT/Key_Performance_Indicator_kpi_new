import React, { useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import './login.css';

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: '882b0135-bd0b-4ce6-8bef-c4f66ad3d0cc', // Replace with your Azure AD App's Client ID
    authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee', // Replace with your Azure AD Tenant ID
    redirectUri: 'https://localhost:3000/', // Replace with your redirect URI
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const LoginPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize MSAL instance
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize(); // Initialize the MSAL instance
        setIsInitialized(true);
      } catch (err) {
        console.error('MSAL initialization error:', err);
        setError('Failed to initialize Microsoft login');
      }
    };

    initializeMsal();
  }, []);

  const handleAzureLogin = async () => {
    if (!isInitialized) {
      setError('Microsoft login is not initialized yet. Please try again.');
      return;
    }

    try {
      // Trigger Microsoft login
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['User.Read'], // Replace with the scopes your app requires
      });

      const email = loginResponse.account.username; // Get the user's email
      const username = email.substring(0, 6); // Extract username from email

      // Send only the username to the backend
      const response = await fetch('https://localhost:8070/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('token', data.token); // Ensure the token is stored

        setSuccess('Login successful');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during Azure login');
      console.error('Azure login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAzureLogin();
        }}
        style={styles.form}
      >
        <img
          src="Logo3.png"
          alt="Logo"
          style={{
            width: '300px',
            height: 'auto',
            display: 'block',
            margin: '20px auto 0',
            marginTop: '10px',
            marginBottom: '40px',
          }}
        />
        <h1 style={{ color: '#0055ab', fontSize: '25px' }}>Network KPI'S</h1>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button type="submit" style={styles.button}>
          Login with Microsoft
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    backgroundImage: "url('./background.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '60px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginBottom: '10px',
  },
  success: {
    color: 'green',
    fontSize: '0.9rem',
    marginBottom: '10px',
  },
};

export default LoginPage;
