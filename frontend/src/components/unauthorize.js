import React, { useEffect } from 'react';

const AccessDenied = () => {
  const supportEmail = "Yamunas@slt.com.lk";
  const gifPath = "./animation1.gif";

  // Set body background color when component mounts
  useEffect(() => {
    // Store the original background color
    const originalColor = document.body.style.backgroundColor;
    
    // Set new background color
    document.body.style.backgroundColor = "white";
    
    // Reset to original color when component unmounts
    return () => {
      document.body.style.backgroundColor = originalColor;
    };
  }, []);

  return (
    <div style={styles.container}>
      <img src={gifPath} alt="Access Denied" style={styles.gif} />
      <h1 style={styles.title}>Access Denied</h1>
      <p style={styles.message}>
        You don't have access to this page. Please contact us at{" "}
        <a href={`mailto:${supportEmail}`} style={styles.email}>
          {supportEmail}
        </a>
        .
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    color: "#343a40",
    fontFamily: "Arial, sans-serif",
    // Removed backgroundColor from container since it's now on body
  },
  gif: {
    width: "300px",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.2rem",
  },
  email: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default AccessDenied;