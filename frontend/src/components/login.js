import React, { useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import './login.css';

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: '882b0135-bd0b-4ce6-8bef-c4f66ad3d0cc', // Replace with your Azure AD App's Client ID
    authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee', // Replace with your Azure AD Tenant ID
    redirectUri: 'http://localhost:3000/', // Replace with your redirect URI
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) console.log(`[MSAL] ${message}`);
      },
      logLevel: 2, // Error = 0, Info = 2, Verbose = 3
    },
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
      //const response = await fetch('https://localhost:8070/auth/login', {
        const response = await fetch('/auth/login',{//'https://localhost:8070/auth/login', {
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
      setError('An error occurred during Azure login-'+err.message);
      console.error('Azure login error:', err.message);
    }
  };

  /*return (
    <div style={styles.container}>
       <header style={{
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: '#0055ab',  // Set background color
    padding: '20px 0',            // Add some padding for spacing
    borderRadius: '8px'           // Optional: rounded corners for a softer look
  }}>
    <h2 style={{ color: 'white', fontSize: '25px', fontWeight: 'bold' }}>
      Welcome to the Network KPI Monitoring
    </h2>
    <p style={{ color: 'white', fontSize: '15px' }}>
      Login to access your network KPIs
    </p>
    </header>
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
        
        <div>
        <button type="submit" style={styles.button}>
          Login
        </button>
                        </div>
      </form>
    </div>

    
  );*/

  return (
    <div style={mainContainerStyle}>
      {/* Outer Container for White Background */}
      <div style={formWrapperStyle}>
        {/* Login Form Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAzureLogin();
          }}
          style={formStyle}
        >
          {/* Form with White Background, Blue Border for Logo and App Name */}
          <div style={loginBoxStyle}>
            {/* Logo and App Name (Flexbox for side by side) */}
            <div style={logoContainerStyle}>
              <img
                src="Logo1.png"
                alt="Logo"
                style={logoStyle}
              />
              <div style={appNameStyle}>
                <h2 style={appTitleStyle}>Network KPI Monitoring</h2>
              </div>
            </div>
          </div>

          
          {/* Error or Success Messages */}
          {error && <p style={errorStyle}>{error}</p>}
          {success && <p style={successStyle}>{success}</p>}

          {/* Submit Button with Green Border */}
          <div style={submitButtonContainer}>
            <button type="submit" style={submitButtonStyle}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const mainContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#f0f0f0",
  backgroundImage: "url('./Background_login.jpg')",
 // Light gray background for the page
};

const formWrapperStyle = {
  backgroundColor: "white", // White background for the entire form container
  borderRadius: "8px", // Optional: rounded corners for the form wrapper
  padding: "40px", // Padding to give space around the form
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Optional: Add a shadow for depth
  width: "100%",
  maxWidth: "500px", // Adjust width as needed
};

const formStyle = {
  width: "100%",
};

const loginBoxStyle = {
  backgroundColor: "#0056a4", // White background for the login box
  border: "2px solid #0055ab", // Blue border for the login box
  padding: "10px",
  borderRadius: "8px", // Rounded corners
  textAlign: "center",
  marginBottom: "20px",
};

const logoContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "20px",
};

const logoStyle = {
  width: "150px", // Logo size
  height: "auto",
  marginRight: "20px", // Space between logo and text
};

const appNameStyle = {
  textAlign: "left",
  
};

const appTitleStyle = {
  color: "#FFFFFF",
  fontSize: "24px",
  fontWeight: "bold",
};

/*const appSubtitleStyle = {
  color: "#555",
  fontSize: "16px",
};

const formTitleStyle = {
  color: "#0055ab",
  fontSize: "25px",
};*/

const submitButtonContainer = {
  marginTop: "20px",
};

const submitButtonStyle = {
  backgroundColor: "#4CAF50", // Green color for the submit button
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  width: "100%", // Full width button
};

const errorStyle = {
  color: "red",
  fontSize: "14px",
};

const successStyle = {
  color: "green",
  fontSize: "14px",
};


export default LoginPage;