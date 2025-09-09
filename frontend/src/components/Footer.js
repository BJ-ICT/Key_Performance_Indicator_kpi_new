// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p>© 2025 KPI Monitor Website| SOC and SM. All rights reserved.</p>
      {/* <ul style={footerNavListStyle}>
        <li style={footerNavItemStyle}>
          <a href="/privacy" style={footerLinkStyle}>Privacy Policy</a>
        </li>
        <li style={footerNavItemStyle}>
          <a href="/terms" style={footerLinkStyle}>Terms of Service</a>
        </li>
        <li style={footerNavItemStyle}>
          <a href="/contact" style={footerLinkStyle}>Contact Us</a>
        </li>
      </ul> */}
    </footer>
  );
};

const footerStyle = {
    backgroundColor: '#51b848',
    color: 'white',
    padding: '0px',
    textAlign: 'center',
    position: 'fixed',      // Make footer fixed
    bottom: 0,              // Align it to the bottom of the viewport
    width: '100%',          // Ensure it spans the entire width
    zIndex: 1000,           // Ensure it's on top of other content if needed
  };

const footerNavListStyle = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px',
};

const footerNavItemStyle = {
  margin: '0 15px',
};

const footerLinkStyle = {
  color: 'white',
  textDecoration: 'none',
};

export default Footer;
