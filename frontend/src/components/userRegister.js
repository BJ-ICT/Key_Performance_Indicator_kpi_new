import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [formData, setFormData] = useState({ username: '', name: '', pages: [], role: 'user' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const availablePages = [
    'SERVICE FULFILMENT',
    'IP NW OP',
    'BB ANW',
    'OTN OP',
    'TM Activity Plan',
    'ROUTINE MTNC',
    'TOWER MTCE ACIEVEMENT'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/auth/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePageChange = (page) => {
    const updatedPages = formData.pages.includes(page)
      ? formData.pages.filter(p => p !== page)
      : [...formData.pages, page];
    setFormData({ ...formData, pages: updatedPages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Ensure role is included during updates
        await axios.put(`/auth/users/${editingUser.id}`, {
          ...formData,
          role: formData.role, // Ensure role is passed
        });
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await axios.post('/auth/register', formData);
        setSuccess('User created successfully');
      }

      setFormData({ username: '', name: '', pages: [], role: 'user' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      pages: user.pages,
      role: user.role
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/auth/users/${id}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', name: '', pages: [], role: 'user' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h1 style={styles.heading}>{editingUser ? 'Edit User' : 'Create User'}</h1>

          <div style={styles.formGroup}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Service Number"
              style={styles.input}
              required
            />
          </div>



          <div style={styles.formGroup}>
            <p style={styles.label}><b>Assign Pages</b></p>
            <div style={{ ...styles.checkboxGrid, display: 'flex', flexDirection: 'column' }}>
              {availablePages.map(page => (
                <label
                  key={page}
                  style={{ ...styles.checkboxLabel, textAlign: 'left' }}
                >
                  <input
                    type="checkbox"
                    checked={formData.pages.includes(page)}
                    onChange={() => handlePageChange(page)}
                    style={styles.checkbox}
                  />
                  <span>{page}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <p style={styles.label}><b>User Role</b></p>
            <div style={{ display: 'flex', gap: '20px',marginTop:'20px' }}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                />
                User(Region)
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="puser"
                  checked={formData.role === 'puser'}
                  onChange={handleChange}
                />
                Platform Admin
              </label>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button}>
            {editingUser ? 'Update User' : 'Create User'}
          </button>

          {editingUser && (
            <button
              type="button"
              onClick={cancelEdit}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      

      <div style={styles.userListContainer}>
        <h2 style={styles.heading}>User List</h2>
        <div style={styles.userList}>
          {users.map((user) => (
            <div key={user.id} style={styles.userItem}>
              <div>
                <strong>Name:</strong> {user.name}
                <br />
                <strong>Service Number:</strong> {user.username}
                <br />
                <strong>Role:</strong> {user.role === 'user' ? 'User(Region)' : 'Platform Admin'}
                <br />
                <strong>Pages:</strong>
                <ul style={styles.pagesList}>
                  {user.pages.map(page => (
                    <li key={page}>{page}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleEdit(user)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
    marginTop: '120px',
  },
  heading: {
    marginBottom: '20px',
    color: 'black',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  formGroup: {
   
    marginBottom: '15px',
  },
  label: {
    marginBottom: '8px',
    fontWeight: '500',
    color: 'black',
  },
  radioLabel: {
    display: 'block',
    color: 'black',
  },
  input: {
    width: '90%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    color: 'black',
    marginTop: '40px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    margin: 0,
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  cancelButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#6c757d',
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
  userListContainer: {
    width: '80%',
    maxWidth: '800px',
    marginBottom: '80px',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    color: 'black',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
  },
  pagesList: {
    listStyleType: 'disc',
    marginLeft: '20px',
    marginTop: '5px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default UserManagement;