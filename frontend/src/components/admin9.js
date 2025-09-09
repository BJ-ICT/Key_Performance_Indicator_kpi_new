import React, { useState, useEffect } from 'react';

const EmailManagementSystem = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    email: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/emails/recipients");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/emails/update-recipient/${editingId}`
        : '/api/emails/add-recipient';
      
      const formData = {
        email: form.email
      };

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        setForm({
          email: ""
        });
        setEditingId(null);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert('Failed to save data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('Failed to save data. Please check your connection.');
    }
  };

  const handleEdit = (item) => {
    setForm({
      email: item.email
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipient?')) {
      try {
        const response = await fetch(`/api/emails/delete-recipient/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          alert('Failed to delete recipient. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete data:', error);
        alert('Failed to delete data. Please check your connection.');
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundImage: 'url("./background.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginTop: '150px' }}>Email Recipients Management</h1>
        <form
          onSubmit={handleAddOrUpdate}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {editingId ? 'Update' : 'Add'}
          </button>
        </form>

        <table
          style={{
            marginTop: '20px',
            width: '90%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            color: 'black',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '90px'
          }}
        >
          <thead style={{ backgroundColor: '#007bff' }}>
            <tr>
              {['Email Address', 'Actions'].map((header) => (
                <th
                  key={header}
                  style={{
                    borderBottom: '2px solid #ddd',
                    padding: '10px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{item.email}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      padding: '5px 10px',
                      marginRight: '5px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailManagementSystem;