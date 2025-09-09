// /form8 edit karann kalin 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FormWithDropdowns7.css';
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";

const Form6Table = () => {
  const [form8Data, setForm8Data] = useState([]);
  const [form9Data, setForm9Data] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
  const [editCell, setEditCell] = useState({ rowId: null, key: null, value: '' });
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
    const [isEditingAllowed, setIsEditingAllowed] = useState(true);
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

  // Function to check if editing is allowed based on current date and time
  const checkEditPermission = () => {
    // const now = new Date();
    // const currentDay = now.getDate();
    // const currentHour = now.getHours();
    // const currentMinute = now.getMinutes();
    
    // // Allow editing only before 11th 5:30 PM of each month
    // const isAllowed = currentDay < 15 || (currentDay === 15 && (currentHour < 17 || (currentHour === 17 && currentMinute < 30)));
    const isAllowed = true;
    setIsEditingAllowed(isAllowed);
  };


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

   // Initial permission check and periodic update
 useEffect(() => {
  checkEditPermission();
  const interval = setInterval(checkEditPermission, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      setLoading(true); // Start loading
      const responseForm8 = await axios.get('/form8');
      const responseForm9 = await axios.get('/form9');
      
      const enrichedForm8Data = responseForm8.data.map(entry => ({ ...entry, formType: 'form8' }));
      const enrichedForm9Data = responseForm9.data.map(entry => ({ ...entry, formType: 'form9' }));
      
      setForm8Data(enrichedForm8Data);
      setForm9Data(enrichedForm9Data);
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
  }, []);



  // Calculate percentage for both forms
  const calculatePercentageForm8 = (totalMinutes, unavailableMinutes, totalNodes) => {
    const totalAvailableMinutes = totalMinutes - unavailableMinutes;
    const totalMin = 24 * 60 * daysInMonth * totalNodes;

    if (totalMin === 0) return 100;
    return (100 * totalAvailableMinutes) / totalMin;
  };

  const calculatePercentageForm9 = (Total_Failed_Links, Links_SLA_Not_Violated) => {
    if (Total_Failed_Links === 0) return 100;
    return (100 * Links_SLA_Not_Violated) / Total_Failed_Links;
  };

 // Handle cell editing with permission check
 const handleEditClick = (rowId, parentKey, childKey, value) => {
  if (!isEditingAllowed) {
    // alert('Editing is not allowed after the 11th of the month at 5:30 PM');
    return;
  }
  setEditCell({ rowId, parentKey, childKey, value });
};

const handleInputChange = (event) => {
  setEditCell((prev) => ({ ...prev, value: event.target.value }));
};

const handleInputBlur = () => {
  if (editCell.rowId === null) return;

  const combinedData = [...form8Data, ...form9Data];

  const updatedData = combinedData.map((entry) => {
    if (entry._id === editCell.rowId) {
      const updatedEntry = { ...entry };

      if (editCell.parentKey && editCell.childKey) {
        updatedEntry[editCell.parentKey] = {
          ...updatedEntry[editCell.parentKey],
          [editCell.childKey]: editCell.value,
        };
      } else {
        updatedEntry[editCell.parentKey] = editCell.value;
      }

      updatedEntry.isModified = true;
      return updatedEntry;
    }
    return entry;
  });

  // Split updated data back into form8 and form9
  const updatedForm8Data = updatedData.filter((entry) => entry.formType === 'form8');
  const updatedForm9Data = updatedData.filter((entry) => entry.formType === 'form9');

  setForm8Data(updatedForm8Data);
  setForm9Data(updatedForm9Data);
  setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' });
};


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditCell({ rowId: null, key: null, value: '' });
    }
  };

   // Save updates with permission check
   const handleSave = async () => {
    if (!isEditingAllowed) {
      // alert('Saving is not allowed after the 11th of the month at 5:30 PM');
      return;
    }

    try {
      const combinedData = [...form8Data, ...form9Data];
      const updatePromises = combinedData.map(async (entry) => {
        if (entry.isModified) {
          if (entry.formType === 'form8') {
            return await axios.put(`/form8/update/${entry._id}`, entry);
          } else if (entry.formType === 'form9') {
            return await axios.put(`/form9/update/${entry._id}`, entry);
          }
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      fetchData();
      // alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      // alert('Failed to save data.');
    }
  };

  // Handle dropdown value changes
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));

    if (name === 'dropdown1') updateDropdown2Options(value);
    if (name === 'dropdown2') updateDropdown3Options(value);
    if (name === 'dropdown3') updateDropdown4Options(value);
  };

  // Update dropdown options logic
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
  // Dropdown form submission
  const handleDropdownSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Combine data for rendering
  const combinedData = [...form8Data, ...form9Data];
  
  if (loading) {
    return <div className="loader" style={{color:"black"}}></div>;
  }

  

  if (error) {
    return <div className="error-message">{error}</div>;
  }


  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("KPI Data");
  
    const areas = [
      "cenhkmd", "cenhkmd1", "gqkintb", "ndfrm", "awho", "konix", "ngivt",
      "kgkly", "cwpx", "debkymt", "gphtnw", "adipr", "bddwmrg", "keirn",
      "embmbmh", "aggl", "hrktph", "bcjrdkltc", "ja", "komltmbva"
    ];
  
    // Add title
    const currentDate = new Date().toISOString().split("T")[0];
    worksheet.addRow(["KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH)"]);
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
    combinedData.forEach((entry) => {
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
        if (entry.formType === "form8" && entry.total_minutes?.[area] !== undefined) {
          percentage = calculatePercentageForm8(
            entry.total_minutes[area],
            entry.unavailable_minutes[area],
            entry.total_nodes[area]
          ).toFixed(2) + "%";
        } else if (entry.formType === "form9" && entry.Total_Failed_Links?.[area] !== undefined) {
          percentage = calculatePercentageForm9(
            entry.Total_Failed_Links[area],
            entry.Links_SLA_Not_Violated[area]
          ).toFixed(2) + "%";
        }
        rowData.push(percentage);
      });
  
      // Add the main row
      const row = worksheet.addRow(rowData);
      applyBorderAndAlignment(row);
  
      // Add sub-rows for Form8
      if (entry.formType === "form8") {
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
      }
  
      // Add sub-rows for Form9
      if (entry.formType === "form9") {
        // Total Failed Links
        const totalFailedRow = ["", "Total Failed Links", "", "", ""];
        areas.forEach(area => {
          totalFailedRow.push(entry.Total_Failed_Links?.[area] || "");
        });
        const tfRow = worksheet.addRow(totalFailedRow);
        applyBorderAndAlignment(tfRow);
  
        // Links SLA Not Violated
        const slaNotViolatedRow = ["", "Links SLA Not Violated", "", "", ""];
        areas.forEach(area => {
          slaNotViolatedRow.push(entry.Links_SLA_Not_Violated?.[area] || "");
        });
        const snvRow = worksheet.addRow(slaNotViolatedRow);
        applyBorderAndAlignment(snvRow);
      }
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

  
  return (
    <div className="page8-container">
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
      </form>

      {/* Table to display merged data */}
      <h1 className="h1name">KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH)</h1>
      <table border="1" cellPadding="10" cellSpacing="0" className="data-table" >
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
          {combinedData.map((entry) => {
            const percentages = {};
            if (entry.total_minutes) {
              for (const key of Object.keys(entry.total_minutes)) {
                percentages[key] = calculatePercentageForm8(
                  entry.total_minutes[key],
                  entry.unavailable_minutes[key],
                  entry.total_nodes[key]
                );
              }
            } else if (entry.Total_Failed_Links) {
              for (const key of Object.keys(entry.Total_Failed_Links)) {
                percentages[key] = calculatePercentageForm9(
                  entry.Total_Failed_Links[key],
                  entry.Links_SLA_Not_Violated[key]
                );
              }
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
             </tr>

                {/* Conditional Rendering Based on Form Type */}
                {entry.formType === 'form8' && entry.total_minutes && (
                  <>
                    {/* Total Minutes */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Minutes</td>
                      <td colSpan="3"></td>
                  {Object.keys(entry.total_minutes).map((key) => (
                    formValues.dropdown4 === key && (
                      <td key={key}>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'total_minutes' &&
                        editCell.childKey === key ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <button className="table-button" onClick={handleInputBlur} style={{marginLeft:'30px'}}>Done</button>
                            <button
                              className="table-button"
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.total_minutes[key]}
                            {role == "puser" && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(entry._id, 'total_minutes', key, entry.total_minutes[key])
                                }
                                style={{ marginLeft: 'auto' }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                     </td>
                    )
                  ))}
                    </tr>


                    {/* Unavailable Minutes */}
                           <tr>
                             <td></td>
                             <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Unavailable Minutes</td>
                             <td colSpan="3"></td>
                             {Object.keys(entry.unavailable_minutes).map((key) => (
                        formValues.dropdown4 === key && (
                          <td key={key}>
                            {editCell.rowId === entry._id &&
                            editCell.parentKey === 'unavailable_minutes' &&
                            editCell.childKey === key ? (
                              <div>
                                <input
                                  type="text"
                                  value={editCell.value}
                                  onChange={handleInputChange}
                                  autoFocus
                                />
                                <button className="table-button" onClick={handleInputBlur}  style={{marginLeft:'30px'}}>Done</button>
                                <button
                                  className="table-button"
                                  onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {entry.unavailable_minutes[key]}
                                { role == "puser" && isEditingAllowed && (
                                  <button
                                    className="table-button"
                                    onClick={() =>
                                      handleEditClick(entry._id, 'unavailable_minutes', key, entry.unavailable_minutes[key])
                                    }
                                    style={{ marginLeft: 'auto' }}
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            )}
                         </td>
                        )
                      ))}

                      </tr>




                    {/* Total Nodes */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Nodes</td>
                      <td colSpan="3"></td>
                      {Object.keys(entry.total_nodes).map((key) => (
                      formValues.dropdown4 === key && (
                        <td key={key}>
                          {editCell.rowId === entry._id &&
                          editCell.parentKey === 'total_nodes' &&
                          editCell.childKey === key ? (
                            <div>
                              <input
                                type="text"
                                value={editCell.value}
                                onChange={handleInputChange}
                                autoFocus
                              />
                              <button className="table-button" onClick={handleInputBlur}  style={{marginLeft:'30px'}}>Done</button>
                              <button
                                className="table-button"
                                onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {entry.total_nodes[key]}
                              {role == "puser" && isEditingAllowed && (
                                <button
                                  className="table-button"
                                  onClick={() =>
                                    handleEditClick(entry._id, 'total_nodes', key, entry.total_nodes[key])
                                  }
                                  style={{ marginLeft: 'auto' }}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                       </td>
                      )
                    ))}


                  </tr>
                  </>
                )}

                {entry.formType === 'form9' && entry.Total_Failed_Links && (
                  <>
                    {/* Total Failed Links */}
                        <tr>
                        <td></td>
                         <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Failed Links</td>
                         <td colSpan="3"></td>
                        {Object.keys(entry.Total_Failed_Links).map((key) => (
                        formValues.dropdown4 === key && (
                          <td key={key}>
                            {editCell.rowId === entry._id &&
                            editCell.parentKey === 'Total_Failed_Links' &&
                            editCell.childKey === key ? (
                              <div>
                                <input
                                type="text"
                                value={editCell.value}
                                onChange={handleInputChange}
                                autoFocus
                              />
                      <button className="table-button" onClick={handleInputBlur}  style={{marginLeft:'30px'}}>Done</button>
                      <button
                        className="table-button"
                        onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {entry.Total_Failed_Links[key]}
                      {role == "puser" && isEditingAllowed && (
                        <button
                          className="table-button"
                          onClick={() =>
                            handleEditClick(entry._id, 'Total_Failed_Links', key, entry.Total_Failed_Links[key])
                          }
                          style={{ marginLeft: 'auto' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
               </td>
              )
            ))}

            </tr>


               {/* Links SLA Not Violated */}
                <tr>
                <td></td>
                 <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Links SLA Not Violated</td>
                   <td colSpan="3"></td>
                   {Object.keys(entry.Links_SLA_Not_Violated).map((key) => (
                    formValues.dropdown4 === key && (
                      <td key={key}>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'Links_SLA_Not_Violated' &&
                        editCell.childKey === key ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <button className="table-button" onClick={handleInputBlur}  style={{marginLeft:'30px'}}>Done</button>
                            <button
                              className="table-button"
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.Links_SLA_Not_Violated[key]}
                            {role == "puser" && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(entry._id, 'Links_SLA_Not_Violated', key, entry.Links_SLA_Not_Violated[key])
                                }
                                style={{ marginLeft: 'auto' }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                     </td>
                    )
                  ))}

                    </tr>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <button className="savebtn1"  style={{
            marginLeft: '10px',
            padding: '8px 16px',
           
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }} onClick={handleSave}>Save all Changes</button>
      <button 
          className="exportbtn" 
          onClick={exportToExcel}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
           
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to Excel
        </button>
    </div>
  );
};

export default Form6Table;
