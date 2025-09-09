import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";  // Import the xlsx package
import './home.css'; // Make sure your CSS is linked

function Homepage() {
  const [data, setData] = useState([]);
  const [editCell, setEditCell] = useState({ rowId: null, key: null });
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    axios.get('/form2')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleChange = (e, rowId = null) => {
    const { name, value } = e.target;
    if (rowId) {
      const updatedRow = data.map(item =>
        item._id === rowId ? { ...item, [name]: value } : item
      );
      setData(updatedRow);
    }
  };

  const handleSaveAll = () => {
    const updatePromises = data.map(item => {
      return axios.put(`/form2/update/${item._id}`, item)
        .catch(error => console.error('Error updating data:', error));
    });

    Promise.all(updatePromises)
      .then(() => {
        setEditCell({ rowId: null, key: null });
        setPopupMessage("All changes have been saved successfully!");
        setTimeout(() => setPopupMessage(""), 3000);
      })
      .catch(error => {
        console.error('Error saving data:', error);
        setPopupMessage("Error saving changes.");
        setTimeout(() => setPopupMessage(""), 3000);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`/form2/delete/${id}`)
      .then(() => {
        setData(data.filter(item => item._id !== id));
      })
      .catch(error => console.error('Error deleting data:', error));
  };

  const getColumnHeaders = () => {
    return Object.keys(data[0] || {}).filter(key => key !== '_id');
  };

  const handleCellClick = (rowId, key) => {
    setEditCell({ rowId, key });
  };

  const handleCellBlur = (rowId, key) => {
    setEditCell({ rowId: null, key: null });
  };

  const handleKeyPress = (e, rowId, key) => {
    if (e.key === 'Enter') {
      handleCellBlur(rowId, key);
    }
  };

  // Function to calculate the average of numeric values for a row
  const calculateAverage = (row) => {
    const numericColumns = getColumnHeaders().filter(key => {
      // Check if the value is a percentage and not an empty string
      return typeof row[key] === 'string' && row[key].includes('%') && row[key] !== "";
    });
  
    const total = numericColumns.reduce((sum, key) => {
      // Remove '%' symbol and convert to a float
      const numericValue = parseFloat(row[key].replace('%', ''));
      return sum + numericValue;
    }, 0);
  
    return numericColumns.length ? (total / numericColumns.length).toFixed(2) + "%" : "N/A"; // Add '%' back to the average
  };
  

  const generateExcelReport = () => {
    const headers = getColumnHeaders();
    const wb = XLSX.utils.book_new(); // Create a new workbook
    const ws = XLSX.utils.json_to_sheet(data, { header: headers }); // Create a worksheet with your data

    // Style the headers
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index }); // Header is in row 0
      ws[cellRef].s = { 
        font: { bold: true }, 
        fill: { fgColor: { rgb: "FF0000" } }  // Red background
      };
    });

    XLSX.utils.book_append_sheet(wb, ws, "Report"); // Append worksheet to workbook

    // Write the workbook and download it
    XLSX.writeFile(wb, "report.xlsx");
  };

  return (
    <div className="home-container">
      <h1>Excel-Like Data Table</h1>
      <table>
        <thead>
          <tr>
            {getColumnHeaders().map(key => (
              <th key={key}>{key}</th>
            ))}
            <th>Average</th> {/* New column header for the Average */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              {getColumnHeaders().map(key => (
                <td key={key} onClick={() => handleCellClick(item._id, key)}>
                  {editCell.rowId === item._id && editCell.key === key ? (
                    <input
                      type="text"
                      name={key}
                      value={item[key]}
                      onChange={(e) => handleChange(e, item._id)}
                      onBlur={() => handleCellBlur(item._id, key)}
                      onKeyPress={(e) => handleKeyPress(e, item._id, key)}
                      autoFocus
                    />
                  ) : (
                    item[key]
                  )}
                </td>
              ))}
              <td>{calculateAverage(item)}</td> {/* New cell for displaying the average */}
              <td>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button className="savebtn" onClick={handleSaveAll}>Save All Changes</button>
        <button className="reportbtn" onClick={generateExcelReport}>Generate Excel Report</button> {/* New button for report */} 
      </div>
      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
        </div>
      )}
    </div>
  );
}

export default Homepage;
