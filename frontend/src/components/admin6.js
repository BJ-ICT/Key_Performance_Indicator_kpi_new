import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    no: '',
    responsibility: '',
    frequency: '',
    weightage: '',
    kpi: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/kpi-tower');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing record
        await axios.put(`/api/kpi-tower/update/${editingId}`, form);
      } else {
        // Add new record
        await axios.post('/api/kpi-tower/add', form);
      }
      fetchData();
      setForm({ no: '', responsibility: '', frequency: '', weightage: '', kpi: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/kpi-tower/delete/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete data:', error);
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
      <h1 style={{ textAlign: 'center', color: '#333',marginTop:'150px' }}>TOWER MTCE ACIEVEMENT</h1>
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
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="number"
          name="no"
          placeholder="No"
          value={form.no}
          onChange={handleInputChange}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          name="responsibility"
          placeholder="Responsibility"
          value={form.responsibility}
          onChange={handleInputChange}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          name="frequency"
          placeholder="Frequency"
          value={form.frequency}
          onChange={handleInputChange}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          name="weightage"
          placeholder="Weightage"
          value={form.weightage}
          onChange={handleInputChange}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          name="kpi"
          placeholder="KPI"
          value={form.kpi}
          onChange={handleInputChange}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
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
            cursor: 'pointer',
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
          color:'black',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom:'90px'
         
        }}
      >
        <thead style={{backgroundColor:'#007bff'}}>
          <tr>
            {['No', 'Responsibility', 'Frequency', 'Weightage', 'KPI', 'Actions'].map((header) => (
              <th
                key={header}
                style={{
                  borderBottom: '2px solid #ddd',
                  padding: '10px',
                  color:'white',
                  fontWeight: 'bold',
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
              <td style={{ padding: '10px' }}>{item.no}</td>
              <td style={{ padding: '10px' }}>{item.responsibility}</td>
              <td style={{ padding: '10px' }}>{item.frequency}</td>
              <td style={{ padding: '10px' }}>{item.weightage}</td>
              <td style={{ padding: '10px' }}>{item.kpi}</td>
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
                    cursor: 'pointer',
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
                    cursor: 'pointer',
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

export default App;
