import React, { useState, useEffect } from 'react';

const App = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    rowNumber: '',
    perspectives: '',
    strategicObjectives: '',
    keyPerformanceIndicators: '',
    unit: '',
    descriptionOfKPI: '',
    weightage: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/final-data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
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
        const response = await fetch(`/api/final-data/update/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to update data');
      } else {
        const response = await fetch('/api/final-data/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to add data');
      }
      fetchData();
      setForm({
        rowNumber: '',
        perspectives: '',
        strategicObjectives: '',
        keyPerformanceIndicators: '',
        unit: '',
        descriptionOfKPI: '',
        weightage: '',
      });
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
      const response = await fetch(`/api/final-data/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete data');
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
      <h1 style={{ textAlign: 'center', color: '#333', marginTop: '150px' }}>Strategic KPI Management</h1>
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
          name="rowNumber"
          placeholder="Row Number"
          value={form.rowNumber}
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
          name="perspectives"
          placeholder="Perspectives"
          value={form.perspectives}
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
          name="strategicObjectives"
          placeholder="Strategic Objectives"
          value={form.strategicObjectives}
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
          name="keyPerformanceIndicators"
          placeholder="Key Performance Indicators"
          value={form.keyPerformanceIndicators}
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
          name="unit"
          placeholder="Unit"
          value={form.unit}
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
          name="descriptionOfKPI"
          placeholder="Description of KPI"
          value={form.descriptionOfKPI}
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
          type="number"
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
          color: 'black',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '90px'
        }}
      >
        <thead style={{ backgroundColor: '#007bff' }}>
          <tr>
            {[
              'Row Number',
              'Perspectives',
              'Strategic Objectives',
              'KPIs',
              'Unit',
              'Description',
              'Weightage',
              'Actions'
            ].map((header) => (
              <th
                key={header}
                style={{
                  borderBottom: '2px solid #ddd',
                  padding: '10px',
                  color: 'white',
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
              <td style={{ padding: '10px' }}>{item.rowNumber}</td>
              <td style={{ padding: '10px' }}>{item.perspectives}</td>
              <td style={{ padding: '10px' }}>{item.strategicObjectives}</td>
              <td style={{ padding: '10px' }}>{item.keyPerformanceIndicators}</td>
              <td style={{ padding: '10px' }}>{item.unit}</td>
              <td style={{ padding: '10px' }}>{item.descriptionOfKPI}</td>
              <td style={{ padding: '10px' }}>{item.weightage}</td>
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
  );
};

export default App;