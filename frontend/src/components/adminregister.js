import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './login.css';
import ProtectedComponent from './ProtectedComponent ';

const AdminManagement = () => {
  const [formData, setFormData] = useState({ username: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState([]);

  // Fetch all admins when the component mounts
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/auth/admins');
      setAdmins(response.data.admins); // Adjusted to match the backend response structure
    } catch (err) {
      console.error('Error fetching admins:', err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/auth/register-admin', formData);
      setSuccess(response.data.message);
      setFormData({ username: '', name: '' }); // Clear the form on success
      fetchAdmins(); // Refresh the list of admins
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await axios.delete(`/auth/admins/${id}`);
      alert(response.data.message);
      fetchAdmins(); // Refresh the list of admins after deletion
    } catch (err) {
      console.error('Error deleting admin:', err.response?.data?.message || err.message);
    }
  };

  return (
   
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h1 className="h1name">Admin Management</h1>
          <div style={styles.formGroup}>
            <input
              placeholder="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <input
              placeholder="Service Number"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <button type="submit" style={styles.button}>
            Create Admin
          </button>
        </form>
      </div>
      <div style={styles.adminListContainer}>
        <h2 style={styles.heading}>Admin List</h2>
        <ul style={styles.adminList}>
          {admins.map((admin) => (
            <li key={admin._id} style={styles.adminItem}>
              <div>
                <strong>Name:</strong> {admin.name}
                <br />
                <strong>Service Number:</strong> {admin.username}
                <br />
                <strong>Status:</strong> {admin.isActive ? 'Active' : 'Inactive'}
              </div>
              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(admin._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
    
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
    backgroundImage: "url('./background.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    
  },
  formContainer: {
    marginBottom: '20px',
    
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '90%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
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
  adminListContainer: {
    width: '80%',
    maxWidth: '800px',
  },
  heading: {
    marginBottom: '10px',
    color: 'black',
  },
  adminList: {
    listStyleType: 'none',
    padding: 0,
  },
  adminItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    color: 'black',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'red',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AdminManagement;
