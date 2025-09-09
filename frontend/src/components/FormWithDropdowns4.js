// table eki , form eki. thama table eki dropdown form eki link karala neeeee (Friday)

// /form5 edit karann kalin 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FormWithDropdowns4.css';
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";

const Form6Table = () => {
  const [data, setData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
  const [editCell, setEditCell] = useState({ rowId: null, key: null, value: '' });
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
   const [role, setRole] = useState([]); // State to hold roles


   // Fetch roles dynamically
   useEffect(() => {
    const token = localStorage.getItem("token"); // Get the token from localStorage or a similar storage mechanism
  
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
  
    axios
      .get("/auth/current-role", {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure proper Bearer token format
        },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        setRole(response.data.role); // Update the role state
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
        setError("Failed to fetch role. Please log in again.");
      });
  }, []);

  // State for dropdown values
  const [formValues, setFormValues] = useState({
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: '',
  });

  // State for dynamic dropdown options
  const [dropdown2Options, setDropdown2Options] = useState([]);
  const [dropdown3Options, setDropdown3Options] = useState([]);
  const [dropdown4Options, setDropdown4Options] = useState([]);


    // Function to check if editing is allowed based on current date and time
    const checkEditPermission = () => {
      // const now = new Date();
      // const currentDay = now.getDate();
      // const currentHour = now.getHours();
      // const currentMinute = now.getMinutes();
      
      // // Allow editing only before 11th 4:30 PM of each month
      // const isAllowed = currentDay < 15 || (currentDay === 15 && (currentHour < 16 || (currentHour === 16 && currentMinute < 30)));
      const isAllowed = true;
      setIsEditingAllowed(isAllowed);
    };


  // Fetch data from the backend
  const fetchData = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios.get('/form6');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load table data. Please try again later.');
    }
    finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchData();
    checkEditPermission();
    
    // Set up an interval to check permission every minute
    const intervalId = setInterval(checkEditPermission, 60000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); 

  const calculatePercentage = (totalMinutes, unavailableMinutes, totalNodes) => {
    const totalAvailableMinutes = totalMinutes - unavailableMinutes;
    const totalMin = 24 * 60 * daysInMonth * totalNodes;

    if (totalMin === 0) return 100; // Avoid division by zero
    return (100 * totalAvailableMinutes) / totalMin;
  };

  // Modified handleEditClick to check permission
  const handleEditClick = (rowId, key, value) => {
    if (!isEditingAllowed) {
      // alert('Editing is not allowed after the 11th of the month at 4:30 PM');
      return;
    }
    setEditCell({ rowId, key, value });
  };


  const handleInputChange = (e) => {
    setEditCell((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleInputBlur = () => {
    if (editCell.rowId !== null) {
      const updatedData = data.map((entry) => {
        if (entry._id === editCell.rowId) {
          return {
            ...entry,
            [editCell.key.split('.')[0]]: {
              ...entry[editCell.key.split('.')[0]],
              [editCell.key.split('.')[1]]: editCell.value,
            },
          };
        }
        return entry;
      });
      setData(updatedData); // Update state to immediately reflect changes
      setEditCell({ rowId: null, key: null, value: '' }); // Reset edit cell
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditCell({ rowId: null, key: null, value: '' }); // Cancel editing
    }
  };

  // Modified handleSave to check permission
  const handleSave = async () => {
    if (!isEditingAllowed) {
      // alert('Saving is not allowed after the 11th of the month at 4:30 PM');
      return;
    }
    
    try {
      const updatePromises = data.map(async (entry) => {
        const response = await axios.put(`/form6/update/${entry._id}`, entry);
        console.log('Update response:', response.data);
      });

      await Promise.all(updatePromises);
      // alert('Data saved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      // alert('Failed to save data.');
    }
  };

  // Handle dropdown value changes
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));

    // Update dropdown options based on selection...........................................
    if (name === 'dropdown1') {
      updateDropdown2Options(value);
    } else if (name === 'dropdown2') {
      updateDropdown3Options(value);
    } else if (name === 'dropdown3') {
      updateDropdown4Options(value);
    }
  };

  // Dropdown update functions
  const updateDropdown2Options = (value) => {
    switch (value) {
      case 'metro':
        setDropdown2Options(['metro 1', 'metro 2']);
        break;
      case 'Region01':
        setDropdown2Options(['WPN & NWP', 'CP & NCP']);
        break;
      case 'Region02':
        setDropdown2Options(['SAB & UVA', 'WPS & SP']);
        break;
      case 'Region03':
        setDropdown2Options(['EP', 'NP']);
        break;
      default:
        setDropdown2Options([]);
        break;
    }
    // Reset dropdown3 and dropdown4 when dropdown1 changes
    setDropdown3Options([]);
    setDropdown4Options([]);
  };

  const updateDropdown3Options = (value) => {
    switch (value) {
      case 'metro 1':
        setDropdown3Options(['NW/WPC', 'E/Fiber NW/WPC', 'NW/WP N-E']);
        break;
      case 'metro 2':
        setDropdown3Options(['NW/WP S-W', 'NW/WP S-E', 'NW/WPE']);
        break;
      case 'WPN & NWP':
        setDropdown3Options(['NW/WPN', 'NW/NWP-E', 'NW/NWP-W']);
        break;
      case 'CP & NCP':
        setDropdown3Options(['NW/CPN', 'NW/CPS', 'NW/NCP']);
        break;
      case 'SAB & UVA':
        setDropdown3Options(['NW/UVA', 'NW/SAB']);
        break;
      case 'WPS & SP':
        setDropdown3Options(['NW/SPE', 'NW/SPW', 'WPS']);
        break;
      case 'EP':
        setDropdown3Options(['NW/EP']);
        break;
      case 'NP':
        setDropdown3Options(['NW/NP-1', 'NW/NP-2']);
        break;
      default:
        setDropdown3Options([]);
        break;
    }
    // Reset dropdown4 when dropdown2 changes
    setDropdown4Options([]);
  };

  const optionMapping = {
    'cenhkmd': 'CEN/HK/MD',
    'cenhkmd1': 'CEN/HK/MD',
    'gqkintb': 'GQ/KI/NTB',
    'ndfrm': 'ND/RM',
    'awho': 'AW/HO',
    'konix': 'KON/KX',
    'ngivt': 'NG/WT',
    'kgkly': 'KG/KLY',
    'cwpx': 'CW/PX',
    'debkymt': 'DB/KY/MT',
    'gphtnw': 'GP/HT/NW',
    'adipr': 'AD/PR',
    'bddwmrg': 'BD/BW/MRG',
    'keirn': 'KE/RN',
    'embmbmh': 'EMB/HB/MH',
    'aggl': 'AG/GL',
    'hrktph': 'HR/KT/PH',
    'bcjrdkltc': 'BC/AP/KL/TC',
    'ja': 'JA',
    'komltmbva': 'KO/MLT/MB/VA'
  };

  const updateDropdown4Options = (value) => {
    switch (value) {
      case 'NW/WPC':
        setDropdown4Options(['cenhkmd']);
        break;
      case 'E/Fiber NW/WPC':
        setDropdown4Options(['cenhkmd1']);
        break;
      case 'NW/WP N-E':
        setDropdown4Options(['gqkintb']);
        break;
      case 'NW/WP S-W':
        setDropdown4Options(['ndfrm']);
        break;
      case 'NW/WP S-E':
        setDropdown4Options(['awho']);
        break;
      case 'NW/WPE':
        setDropdown4Options(['konix']);
        break;
      case 'NW/WPN':
        setDropdown4Options(['ngivt']);
        break;
      case 'NW/NWP-E':
        setDropdown4Options(['kgkly']);
        break;
      case 'NW/NWP-W':
        setDropdown4Options(['cwpx']);
        break;
      case 'NW/CPN':
        setDropdown4Options(['debkymt']);
        break;
      case 'NW/CPS':
        setDropdown4Options(['gphtnw']);
        break;
      case 'NW/NCP':
        setDropdown4Options(['adipr']);
        break;
      case 'NW/UVA':
        setDropdown4Options(['bddwmrg']);
        break;
      case 'NW/SAB':
        setDropdown4Options(['keirn']);
        break;
      case 'NW/SPE':
        setDropdown4Options(['embmbmh']);
        break;
      case 'NW/SPW':
        setDropdown4Options(['aggl']);
        break;
      case 'WPS':
        setDropdown4Options(['hrktph']);
        break;
      case 'NW/EP':
        setDropdown4Options(['bcjrdkltc']);
        break;
      case 'NW/NP-1':
        setDropdown4Options(['ja']);
        break;
      case 'NW/NP-2':
        setDropdown4Options(['komltmbva']);
        break;
      default:
        setDropdown4Options([]);
        break;
    }
  };

  // Handle dropdown form submission
  const handleDropdownSubmit = (e) => {
    e.preventDefault();
    console.log('Dropdown Values:', formValues);
    // Here you can implement any logic to filter or refresh your data based on dropdown selections
    fetchData(); // Example: re-fetch data when dropdown is submitted
  };

  if (loading) {
    return <div className="loader" style={{color:"black"}}></div>;
  }

  

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const formatDataForExcel = () => {
    const excelData = [];
  
    // Add title row first
    excelData.push(['KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)']); 
    excelData.push([]); // Add empty row for spacing
  
    // Define areas
    const areas = [
      'CEN/HK/MD', 'cenhkmd1', 'gqkintb', 'ndfrm', 'awho', 'konix', 'ngivt', 
      'kgkly', 'cwpx', 'debkymt', 'gphtnw', 'adipr', 'bddwmrg', 'keirn', 
      'embmbmh', 'aggl', 'hrktph', 'bcjrdkltc', 'ja', 'komltmbva'
    ];
  
    // Define headers
    const headers = {
      'No': 'No',
      'Network Engineer KPI': 'Network Engineer KPI',
      'Division': 'Division',
      'Section': 'Section',
      'KPI Percent': 'KPI Percent',
    };
  
    // Add area headers
    areas.forEach(area => {
      headers[`${area} Availability`] = `${area} Availability`;
    });
  
    // Add headers to Excel data
    excelData.push(headers);
  
    // Process data entries
    data.forEach((entry) => {
      // Create the main row for each entry
      const mainRow = {
        'No': entry.no,
        'Network Engineer KPI': entry.network_engineer_kpi,
        'Division': entry.division,
        'Section': entry.section,
        'KPI Percent': entry.kpi_percent,
      };
  
      // Add percentage for each area
      areas.forEach(area => {
        if (entry.total_minutes[area] !== undefined) {
          const percentage = calculatePercentage(
            entry.total_minutes[area],
            entry.unavailable_minutes[area],
            entry.total_nodes[area]
          );
          mainRow[`${area} Availability`] = `${percentage.toFixed(2)}%`;
        }
      });
  
      excelData.push(mainRow);
  
      // Add Unavailable Minutes row
      const unavailableRow = {
        'No': '',
        'Network Engineer KPI': 'Unavailable Minutes',
        'Division': '',
        'Section': '',
        'KPI Percent': '',
      };
      areas.forEach(area => {
        if (entry.unavailable_minutes[area] !== undefined) {
          unavailableRow[`${area} Availability`] = entry.unavailable_minutes[area];
        }
      });
      excelData.push(unavailableRow);
  
      // Add Total Minutes row
      const totalMinutesRow = {
        'No': '',
        'Network Engineer KPI': 'Total Minutes',
        'Division': '',
        'Section': '',
        'KPI Percent': '',
      };
      areas.forEach(area => {
        if (entry.total_minutes[area] !== undefined) {
          totalMinutesRow[`${area} Availability`] = entry.total_minutes[area];
        }
      });
      excelData.push(totalMinutesRow);
  
      // Add Total Nodes row
      const totalNodesRow = {
        'No': '',
        'Network Engineer KPI': 'Total Nodes',
        'Division': '',
        'Section': '',
        'KPI Percent': '',
      };
      areas.forEach(area => {
        if (entry.total_nodes[area] !== undefined) {
          totalNodesRow[`${area} Availability`] = entry.total_nodes[area];
        }
      });
      excelData.push(totalNodesRow);
  
      // Add a blank row for better readability
      excelData.push({
        'No': '',
        'Network Engineer KPI': '',
        'Division': '',
        'Section': '',
        'KPI Percent': '',
      });
    });
  
    return excelData;
  };
  
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Network Availability");
  
    const areas = [
      "cenhkmd", "cenhkmd1", "gqkintb", "ndfrm", "awho", "konix", "ngivt",
      "kgkly", "cwpx", "debkymt", "gphtnw", "adipr", "bddwmrg", "keirn",
      "embmbmh", "aggl", "hrktph", "bcjrdkltc", "ja", "komltmbva"
    ];
  
    // Add title
    const currentDate = new Date().toISOString().split("T")[0];
    worksheet.addRow(["KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)"]);
    worksheet.addRow([`Generated Date: ${currentDate}`]);
    worksheet.addRow([]); // Empty row for spacing
  
    // Define headers
    const headers = [
      "No",
      "Network Engineer KPI",
      "Division",
      "Section",
      "KPI Percent",
      ...areas.map(area => optionMapping[area] || area),
    ];
  
    // Insert headers into the worksheet
    const headerRow = worksheet.addRow(headers);
  
    // Style headers
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0070C0" }, // Blue background
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }, // White text
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  
    // Add data rows
    data.forEach((entry) => {
      const rowData = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];
  
      // Add percentages for each area
      areas.forEach((area) => {
        let percentage = "";
        if (entry.total_minutes?.[area] !== undefined) {
          percentage = calculatePercentage(
            entry.total_minutes[area],
            entry.unavailable_minutes[area],
            entry.total_nodes[area]
          ).toFixed(2) + "%";
        }
        rowData.push(percentage);
      });
  
      // Add the main row
      const row = worksheet.addRow(rowData);
      applyBorderAndAlignment(row);
  
      // Add sub-rows for Form6
      // Total Minutes
      const totalMinutesRow = ["", "Total Minutes", "", "", ""];
      areas.forEach(area => {
        totalMinutesRow.push(entry.total_minutes?.[area] || "");
      });
      const tmRow = worksheet.addRow(totalMinutesRow);
      applyBorderAndAlignment(tmRow);
  
      // Unavailable Minutes
      const unavailableMinutesRow = ["", "Unavailable Minutes", "", "", ""];
      areas.forEach(area => {
        unavailableMinutesRow.push(entry.unavailable_minutes?.[area] || "");
      });
      const umRow = worksheet.addRow(unavailableMinutesRow);
      applyBorderAndAlignment(umRow);
  
      // Total Nodes
      const totalNodesRow = ["", "Total Nodes", "", "", ""];
      areas.forEach(area => {
        totalNodesRow.push(entry.total_nodes?.[area] || "");
      });
      const tnRow = worksheet.addRow(totalNodesRow);
      applyBorderAndAlignment(tnRow);
    });
  
    // Set column widths
    worksheet.columns.forEach((column) => {
      column.width = 15; // Adjust column width for better readability
    });
  
    // Generate the Excel file and download it
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${currentDate}.xlsx`;
    link.click();
  };
  
  // Function to apply border and alignment
  const applyBorderAndAlignment = (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  };
  
  // Function to apply border and alignment
 
  return (
    <div className="page5-container">
      {/* Dropdown Form */}
      <form onSubmit={handleDropdownSubmit}>
        <div>
          <label htmlFor="dropdown1">R-GM:</label>
          <select name="dropdown1" value={formValues.dropdown1} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            <option value="metro">Metro</option>
            <option value="Region01">Region 01</option>
            <option value="Region02">Region 02</option>
            <option value="Region03">Region 03</option>
          </select>
        </div>

        <div>
          <label htmlFor="dropdown2">P-DGM:</label>
          <select name="dropdown2" value={formValues.dropdown2} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            {dropdown2Options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown3">NW EE:</label>
          <select name="dropdown3" value={formValues.dropdown3} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            {dropdown3Options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

              <div>
        <label htmlFor="dropdown4">RTOM AREA:</label>
        <select name="dropdown4" value={formValues.dropdown4} onChange={handleDropdownChange}>
          <option value="">Select an option</option>
          {dropdown4Options.map(option => (
            <option key={option} value={option}>{optionMapping[option] || option}</option>
          ))}
        </select>
      </div>



        {/* <button type="submit">Submit</button> */}
      </form>

      {/* Table to display data */}
      <h1 className="h1name">KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)</h1>
      <table  border="1" cellPadding="10" cellSpacing="0" className="data-table">
      <thead>
    <tr>
      <th>No</th>
      <th>Network Engineer KPI</th>
      <th>Division</th>
      <th>Section</th>
      <th>KPI Percent</th>
      {/* Conditionally render the column when Dropdown 4 is selected */}
      {formValues.dropdown4 && (
        <th>{optionMapping[formValues.dropdown4] || formValues.dropdown4}</th>
      )}
    </tr>
  </thead>
  <tbody>
    {data.map((entry) => {
      const percentages = {};

      for (const key of Object.keys(entry.total_minutes)) {
        const totalMinutes = entry.total_minutes[key];
        const unavailableMinutes = entry.unavailable_minutes[key];
        const totalNodes = entry.total_nodes[key];

        percentages[key] = calculatePercentage(totalMinutes, unavailableMinutes, totalNodes);
      }

      return (
        <React.Fragment key={entry._id}>
          <tr>
            <td>{entry.no}</td>
            <td><b>{entry.network_engineer_kpi}</b></td>
            <td>{entry.division}</td>
            <td>{entry.section}</td>
            <td>{entry.kpi_percent}</td>
            {formValues.dropdown4 === 'cenhkmd' && <td>{percentages.cenhkmd.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'cenhkmd1' && <td>{percentages.cenhkmd1.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'gqkintb' && <td>{percentages.gqkintb.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'ndfrm' && <td>{percentages.ndfrm.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'awho' && <td>{percentages.awho.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'konix' && <td>{percentages.konix.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'ngivt' && <td>{percentages.ngivt.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'kgkly' && <td>{percentages.kgkly.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'cwpx' && <td>{percentages.cwpx.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'debkymt' && <td>{percentages.debkymt.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'gphtnw' && <td>{percentages.gphtnw.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'adipr' && <td>{percentages.adipr.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'bddwmrg' && <td>{percentages.bddwmrg.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'keirn' && <td>{percentages.keirn.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'embmbmh' && <td>{percentages.embmbmh.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'aggl' && <td>{percentages.aggl.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'hrktph' && <td>{percentages.hrktph.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'bcjrdkltc' && <td>{percentages.bcjrdkltc.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'ja' && <td>{percentages.ja.toFixed(2)}%</td>}
            {formValues.dropdown4 === 'komltmbva' && <td>{percentages.komltmbva.toFixed(2)}%</td>}
            {/* Add more conditions for other dropdown4 values */}
          </tr>

          {/* Unavailable Minutes Row */}
          {formValues.dropdown4 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'left', paddingLeft: '150px' }}>Unavailable Minutes</td>
              {Object.keys(entry.unavailable_minutes).map((key) => (
                  formValues.dropdown4 === key && (
                    <td key={key}>
                      {editCell.rowId === entry._id && editCell.key === `unavailable_minutes.${key}` ? (
                        // Edit mode with input, Save, and Cancel buttons
                        <div   >
                          <input
                            type="text"
                            value={editCell.value}
                            onChange={handleInputChange}
                            autoFocus
                          />
                         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0px" }}>
                          <button className="table-button" 
                          onClick={handleInputBlur}>Done</button>
                          <button className="table-button" 
                          onClick={() => setEditCell({ rowId: null, key: null, value: "" })} >
                            Cancel
                          </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode with Edit button
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {entry.unavailable_minutes[key]}
                          { role == "puser" && isEditingAllowed && (
                           
                              <button className="table-button"
                              onClick={() => handleEditClick(entry._id, `unavailable_minutes.${key}`, entry.unavailable_minutes[key])} style={{
                      
                                marginLeft: 'auto',  
                                
                              }}>
                                Edit
                              </button>
                              
                            )}

                        </div>
                      )}
                    </td>
                  )
                ))}
            </tr>
          )}

          {/* Total Minutes Row */}
          {formValues.dropdown4 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'left', paddingLeft: '150px' }}>Total Minutes</td>
              {Object.keys(entry.total_minutes).map((key) => (
                  formValues.dropdown4 === key && (
                    <td key={key}>
                      {editCell.rowId === entry._id && editCell.key === `total_minutes.${key}` ? (
                        <div>
                          <input
                            type="text"
                            value={editCell.value}
                            onChange={handleInputChange}
                            autoFocus
                          />
                         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0px" }}>
                          <button className="table-button" 
                          onClick={handleInputBlur}>Done</button>
                          <button className="table-button" 
                          onClick={() => setEditCell({ rowId: null, key: null, value: "" })} >
                            Cancel
                          </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {entry.total_minutes[key]}
                          {role == "puser" && isEditingAllowed && (
                             
                            <button className="table-button"
                            onClick={() => handleEditClick(entry._id, `total_minutes.${key}`, entry.total_minutes[key])} style={{
                      
                              marginLeft: 'auto',  
                              
                            }}>
                              Edit
                            </button>
                           
                          )}

                        </div>
                      )}
                    </td>
                  )
                ))}

            </tr>
          )}

          {/* Total Nodes Row */}
            {formValues.dropdown4 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'left', paddingLeft: '150px' }}>Total Nodes</td>
                {Object.keys(entry.total_nodes).map((key) => (
                    formValues.dropdown4 === key && (
                      <td key={key}>
                        {editCell.rowId === entry._id && editCell.key === `total_nodes.${key}` ? (
                          // Edit mode with input and Cancel button
                          <div>
                            <input
                              type="text"
                              value={editCell.value}
                              onChange={handleInputChange}
                              autoFocus
                            />
                         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0px" }}>
                          <button className="table-button" 
                          onClick={handleInputBlur}>Done</button>
                          <button className="table-button" 
                          onClick={() => setEditCell({ rowId: null, key: null, value: "" })} >
                            Cancel
                          </button>
                          </div>
                          </div>
                        ) : (
                          // Display mode with Edit button
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.total_nodes[key]}
                            {role == "puser" && isEditingAllowed && (
                              
                              <button className="table-button"
                               onClick={() => handleEditClick(entry._id, `total_nodes.${key}`, entry.total_nodes[key])} style={{
                      
                                marginLeft: 'auto',  
                                
                              }}>
                                Edit
                              </button>
                              
                            )}
                          </div>
                        )}
                      </td>
                    )
                  ))}

              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>



      <button className="savebtn1" onClick={handleSave}>Save all Changes</button>
      <button 
          className="savebtn1"  style={{marginLeft:'10px'}}
          onClick={handleExportToExcel}
        >
          Export to Excel
        </button>
      
    </div>
  );
};

export default Form6Table;
