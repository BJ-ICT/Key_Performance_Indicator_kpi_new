import React, { useState, useEffect } from 'react';

const KPIManagementSystem = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    no: "",
    kpi: "",
    target: "",
    calculation: "",
    platform: "",
    responsibledgm: "",
    definedoladetails: "",
    weightage: "",
    datasources: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/form4/");
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
        ? `/form4/update/${editingId}`
        : '/form4/add';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        await fetchData();
        setForm({
          no: "",
          kpi: "",
          target: "",
          calculation: "",
          platform: "",
          responsibledgm: "",
          definedoladetails: "",
          weightage: "",
          datasources: "",
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
      no: item.no,
      kpi: item.kpi,
      target: item.target,
      calculation: item.calculation,
      platform: item.platform,
      responsibledgm: item.responsibledgm,
      definedoladetails: item.definedoladetails,
      weightage: item.weightage,
      datasources: item.datasources
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/form4/delete/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          alert('Failed to delete item. Please try again.');
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
        <h1 style={{ textAlign: 'center', color: '#333', marginTop: '150px' }}>SERVICE FULFILMENT</h1>
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
              fontSize: '16px'
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
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="target"
            placeholder="Target"
            value={form.target}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="calculation"
            placeholder="Calculation"
            value={form.calculation}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="platform"
            placeholder="Platform"
            value={form.platform}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="responsibledgm"
            placeholder="Responsible DGM"
            value={form.responsibledgm}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="definedoladetails"
            placeholder="Defined OLA Details"
            value={form.definedoladetails}
            onChange={handleInputChange}
            required
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
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
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            name="datasources"
            placeholder="Data Sources"
            value={form.datasources}
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
              {['No', 'KPI', 'Target', 'Calculation', 'Platform', 'Responsible DGM', 'Defined OLA Details', 'Weightage', 'Data Sources', 'Actions'].map((header) => (
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
                <td style={{ padding: '10px' }}>{item.no}</td>
                <td style={{ padding: '10px' }}>{item.kpi}</td>
                <td style={{ padding: '10px' }}>{item.target}</td>
                <td style={{ padding: '10px' }}>{item.calculation}</td>
                <td style={{ padding: '10px' }}>{item.platform}</td>
                <td style={{ padding: '10px' }}>{item.responsibledgm}</td>
                <td style={{ padding: '10px' }}>{item.definedoladetails}</td>
                <td style={{ padding: '10px' }}>{item.weightage}</td>
                <td style={{ padding: '10px' }}>{item.datasources}</td>
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

export default KPIManagementSystem;