import axios from "axios";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import './FormWithDropdowns1.css';
import ExcelJS from "exceljs";

function Dropdown1() {
 
  const [role, setRole] = useState([]); // State to hold roles
  const [data, setData] = useState([]);
  const [editCell, setEditCell] = useState({ rowId: null, key: null });
  const [popupMessage, setPopupMessage] = useState("");
  const [formValues, setFormValues] = useState({
    dropdown1: "",
    dropdown2: "",
    dropdown3: "",
    dropdown4: "",
  });
  const [dropdown2Options, setDropdown2Options] = useState([]);
  const [dropdown3Options, setDropdown3Options] = useState([]);
  const [dropdown4Options, setDropdown4Options] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [isEditingAllowed, setIsEditingAllowed] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  


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
    


   console.log(role)

  // Define non-editable columns
  const nonEditableColumns = [
    'no', 'kpi', 'target', 'calculation', 'platform',
    'responsibledgm', 'definedoladetails', 'weightage',
    'datasources'
  ];
 // Check if editing is allowed based on current date and time
 const checkEditPermission = () => {
  // const currentDate = new Date();
  // const currentDay = currentDate.getDate();
  // const currentHour = currentDate.getHours();
  // const currentMinutes = currentDate.getMinutes();
  
  // // Allow editing only up to 11th day 16:00 (4:00 PM)
  // if (currentDay < 15) {
  //   return true;
  // } else if (currentDay === 15) {
  //   // On the 11th day, check if time is before 16:00
  //   return (currentHour < 16) || (currentHour === 16 && currentMinutes === 0);
  // }
  // return false;
  return true;
};

// Format deadline time for display
const getNextDeadline = () => {
  const now = new Date();
  let deadline = new Date(now.getFullYear(), now.getMonth(), 15, 16, 0, 0); // 11th day at 16:00
  
  // If we've passed this month's deadline, show next month's
  if (now > deadline) {
    deadline = new Date(now.getFullYear(), now.getMonth() + 1, 15, 16, 0, 0);
  }
  
  return deadline.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

useEffect(() => {
  // Set initial editing permission
  setIsEditingAllowed(checkEditPermission());

  // Update editing permission every minute
  const updatePermission = () => {
    setIsEditingAllowed(checkEditPermission());
  };

  // Check permissions every minute
  const intervalId = setInterval(updatePermission, 60000); // 60000 ms = 1 minute

  return () => clearInterval(intervalId);
}, []);


useEffect(() => {
  setLoading(true); // Start loading
  axios.get('/form4')
    .then(response => {
      setData(response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setError('Failed to load table data. Please try again later.');
    })
    .finally(() => {
      setLoading(false); // End loading
    });

}, []);

const headerMapping = {
  no: "No",
  kpi: "KPI",
  target: "Target",
  calculation: "Calculation",
  platform: "Platform",
  responsibledgm: "Responsible DGM",
  definedoladetails: "Defined OLA Details",
  weightage: "Weightage",
  datasources: "Data Sources",
};



const handleChange = (e, rowId = null) => {
  if (!isEditingAllowed) {
    // setPopupMessage("Editing is disabled after 11th 4:00 PM of each month.");
    // alert("Editing is disabled after 11th 4:00 PM of each month.");
    // setTimeout(() => setPopupMessage(""), 3000);
    return;
  }

  const { name, value } = e.target;
  if (rowId && !nonEditableColumns.includes(name)) {
    const updatedRow = data.map(item =>
      item._id === rowId ? { ...item, [name]: value } : item
    );
    setData(updatedRow);
  }
};

const handleSaveAll = () => {
  if (!isEditingAllowed) {
    
    // alert("Saving is disabled after 11th 4:00 PM of each month.");
    // setTimeout(() => setPopupMessage(""), 3000);
    
    return;
  }

  const fieldsToUpdate = [
    'CENHKMD', 'CENHKMD1', 'GQKINTB', 'NDRM', 'AWHO', 'KONKX',
    'NGWT', 'KGKLY', 'CWPX', 'DBKYMT', 'GPHTNW', 'ADPR',
    'BDBWMRG', 'KERN', 'EBMHMBH', 'AGGL', 'HRKTPH', 'BCAPKLTC',
    'JA', 'KOMLTMBVA'
  ];

  const updatePromises = data.map(item => {
    const filteredData = {};
    fieldsToUpdate.forEach(field => {
      if (item[field] !== undefined) {
        filteredData[field] = item[field];
      }
    });

    return axios.put(`/form4/update/${item._id}`, filteredData)
      .catch(error => console.error('Error updating data:', error));
      
  });

  Promise.all(updatePromises)
  .then(() => {
    setEditCell({ rowId: null, key: null });
    window.location.reload();
    // setPopupMessage("All changes have been saved successfully!");
    // alert('All changes have been saved successfully!');
    // setTimeout(() => setPopupMessage(""), 3000);
  })
  .catch(error => {
    console.error('Error saving data:', error);
    // setPopupMessage("Error saving changes.");
    // alert('Error saving changes');
    // setTimeout(() => setPopupMessage(""), 3000);
  });
};

  const handleDelete = (id) => {
    axios.delete(`/form4/delete/${id}`)
      .then(() => {
        setData(data.filter(item => item._id !== id));
      })
      .catch(error => console.error('Error deleting data:', error));
  };

  const getColumnHeaders = () => {
    return Object.keys(data[0] || {}).filter(key => key !== '_id');
  };

  const handleCellClick = (rowId, key) => {
    if (!isEditingAllowed) {
      // setPopupMessage("Editing is disabled after 11th 4:00 PM of each month.");
      // alert("Editing is disabled after 11th 4:00 PM of each month.");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }

    if (!nonEditableColumns.includes(key)) {
      setEditCell({ rowId, key });
    }
  };

  const handleCellBlur = (rowId, key) => {
    setEditCell({ rowId: null, key: null });
  };

  const handleKeyPress = (e, rowId, key) => {
    if (e.key === 'Enter') {
      handleCellBlur(rowId, key);
    }
  };

  const calculateAverage = (row) => {
    const numericColumns = getColumnHeaders().filter(key => {
      return typeof row[key] === 'string' && row[key].includes('%') && row[key] !== "";
    });

    const total = numericColumns.reduce((sum, key) => {
      const numericValue = parseFloat(row[key].replace('%', ''));
      return sum + numericValue;
    }, 0);

    return numericColumns.length ? (total / numericColumns.length).toFixed(2) + "%" : "N/A";
  };


  
  const generateExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("KPI Report");
  
    // Define headers and map their display names
    const allColumns = Object.keys(data[0] || {}).filter((key) => key !== "_id");
  
    const headerMapping = {
      no: "No",
      kpi: "KPI",
      target: "Target",
      calculation: "Calculation",
      platform: "Platform",
      responsibledgm: "Responsible DGM",
      definedoladetails: "Defined OLA Details",
      weightage: "Weightage",
      datasources: "Data Sources",
      CENHKMD: "CEN/HK/MD",
      CENHKMD1: "CEN/HK/MD",
      GQKINTB: "GQ/KI/NTB",
      NDRM: "ND/RM",
      AWHO: "AW/HO",
      KONKX: "KON/KX",
      NGWT: "NG/WT",
      KGKLY: "KG/KLY",
      CWPX: "CW/PX",
      DBKYMT: "DB/KY/MT",
      GPHTNW: "GP/HT/NW",
      ADPR: "AD/PR",
      BDBWMRG: "BD/BW/MRG",
      KERN: "KE/RN",
      EMBHBMH: "EMB/HB/MH",
      AGGL: "AG/GL",
      HRKTPH: "HR/KT/PH",
      BCAPKLTC: "BC/AP/KL/TC",
      JA: "JA",
      KOMLTMBVA: "KO/MLT/MB/VA"
    };
  
    // Define column headers with width
    worksheet.columns = allColumns.map((key) => ({
      header: headerMapping[key] || key,
      key: key,
      width: 20,
    }));
  
    // Style Header Row (Only Header Cells)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
  
    headerRow.eachCell((cell) => {
      // Apply background color only to header cells
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, // Blue background
      };
  
      // Add Borders to Header Cells
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
  
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  
    // Add Data Rows with Borders
    data.forEach((item, rowIndex) => {
      const row = worksheet.addRow(item);
  
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });
  
    // Generate Excel file as Blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
  
    // Get current date for the filename
    const date = new Date().toISOString().split("T")[0];
    a.download = `KPI_Report_${date}.xlsx`;
  
    // Append to the document and trigger download
    document.body.appendChild(a);
    a.click();
  
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  
  const handleEditClick = (rowId, key) => {
    setEditCell({ rowId, key });
  };
  
  const handleCancelClick = () => {
    setEditCell({ rowId: null, key: null });
  };
  
  const handleSaveClick = (rowId, key, value) => {
    const updatedRow = data.map(item =>
      item._id === rowId ? { ...item, [key]: value } : item
    );
    setData(updatedRow);
    setEditCell({ rowId: null, key: null });
  };
  
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;

    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === 'dropdown1') {
      updateDropdown2Options(value);
      setFormValues(prevValues => ({
        ...prevValues,
        dropdown2: '',
        dropdown3: '',
        dropdown4: '',
      }));
      setVisibleColumns([]); // Reset visible columns when dropdown1 changes
    } else if (name === 'dropdown2') {
      updateDropdown3Options(value);
      setFormValues(prevValues => ({
        ...prevValues,
        dropdown3: '',
        dropdown4: '',
      }));
      setVisibleColumns([]); // Reset visible columns when dropdown2 changes
    } else if (name === 'dropdown3') {
      updateDropdown4Options(value);
    } else if (name === 'dropdown4') {
      const selectedValue = value;
      const defaultColumns = [
        'no', 'kpi', 'target', 'calculation', 'platform',
        'responsibledgm', 'definedoladetails', 'weightage',
        'datasources'
      ];
      if (selectedValue) {
        setVisibleColumns([...defaultColumns, selectedValue]);
      } else {
        setVisibleColumns(defaultColumns); // Show only default columns if no value is selected
      }
    }
  };

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
  };

  const optionMapping = {
    'CENHKMD': 'CEN/HK/MD',
    'CENHKMD1': 'CEN/HK/MD',
    'GQKINTB': 'GQ/KI/NTB',
    'NDRM': 'ND/RM',
    'AWHO': 'AW/HO',
    'KONKX': 'KON/KX',
    'NGWT': 'NG/WT',
    'KGKLY': 'KG/KLY',
    'CWPX': 'CW/PX',
    'DBKYMT': 'DB/KY/MT',
    'GPHTNW': 'GP/HT/NW',
    'ADPR': 'AD/PR',
    'BDBWMRG': 'BD/BW/MRG',
    'KERN': 'KE/RN',
    'EMBHBMH': 'EMB/HB/MH',
    'AGGL': 'AG/GL',
    'HRKTPH': 'HR/KT/PH',
    'BCAPKLTC': 'BC/AP/KL/TC',
    'JA': 'JA',
    'KOMLTMBVA': 'KO/MLT/MB/VA'
  };

  const updateDropdown4Options = (value) => {
    switch (value) {
      case 'NW/WPC':
        setDropdown4Options(['CENHKMD']);
        break;
      case 'E/Fiber NW/WPC':
        setDropdown4Options(['CENHKMD1']);
        break;
      case 'NW/WP N-E':
        setDropdown4Options(['GQKINTB']);
        break;
      case 'NW/WP S-W':
        setDropdown4Options(['NDRM']);
        break;
      case 'NW/WP S-E':
        setDropdown4Options(['AWHO']);
        break;
      case 'NW/WPE':
        setDropdown4Options(['KONKX']);
        break;
      case 'NW/WPN':
        setDropdown4Options(['NGWT']);
        break;
      case 'NW/NWP-E':
        setDropdown4Options(['KGKLY']);
        break;
      case 'NW/NWP-W':
        setDropdown4Options(['CWPX']);
        break;
      case 'NW/CPN':
        setDropdown4Options(['DBKYMT']);
        break;
      case 'NW/CPS':
        setDropdown4Options(['GPHTNW']);
        break;
      case 'NW/NCP':
        setDropdown4Options(['ADPR']);
        break;
      case 'NW/UVA':
        setDropdown4Options(['BDBWMRG']);
        break;
      case 'NW/SAB':
        setDropdown4Options(['KERN']);
        break;
      case 'NW/SPE':
        setDropdown4Options(['EMBHBMH']);
        break;
      case 'NW/SPW':
        setDropdown4Options(['AGGL']);
        break;
      case 'WPS':
        setDropdown4Options(['HRKTPH']);
        break;
      case 'NW/EP':
        setDropdown4Options(['BCAPKLTC']);
        break;
      case 'NW/NP-1':
        setDropdown4Options(['JA']);
        break;
      case 'NW/NP-2':
        setDropdown4Options(['KOMLTMBVA']);
        break;
      default:
        setDropdown4Options([]);
        break;
    }
  };

  const handleDropdownSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with values:", formValues);
    // Handle form submission logic here
  };

  if (loading) {
    return <div className="loader" style={{color:"black"}}></div>;
  }

  

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  console.log("Role:", role);

  return (
    <div className="page2-container" >
      
      {/* Dropdown Form */}
      <form onSubmit={handleDropdownSubmit}>
        <div>
          <label htmlFor="dropdown1">R-GM:</label>
          <select name="dropdown1" value={formValues.dropdown1} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            <option value="metro">Metro</option>
            <option value="Region01">REGION 1</option>
            <option value="Region02">REGION 2</option>
            <option value="Region03">REGION 3</option>
          </select>
        </div>

        <div>
          <label htmlFor="dropdown2">P-DGM:</label>
          <select name="dropdown2" value={formValues.dropdown2} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            {dropdown2Options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown3">NW EE:</label>
          <select name="dropdown3" value={formValues.dropdown3} onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            {dropdown3Options.map(option => (
              <option key={option} value={option}>{option}</option>
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

        {/* <button type="submit">Refresh</button> */}
      </form>

      {/* Data Table */}
      <h1 className="h1name">KPI (Enterprise/ SME and Whole Sales Service Delivery - Fiber)</h1>
      <table className="data-table" border="1" cellPadding="10">
      <thead>
  <tr>
    {[
      'no', 
      'kpi', 
      'target', 
      'calculation', 
      'platform',
      'responsibledgm', 
      'definedoladetails', 
      'weightage', 
      'datasources',
      ...visibleColumns
    ]
      .filter((key, index, self) => key && self.indexOf(key) === index) // Filter out undefined or duplicate keys
      .map(key => (
        <th key={key}>{optionMapping[key] || headerMapping[key] || key}</th> // Use `optionMapping` or fallback to `headerMapping` or key
      ))}
  </tr>
</thead>


        <tbody>
  {data.map((item) => (
    <tr key={item._id}>
      {['no', 'kpi', 'target', 'calculation', 'platform',
        'responsibledgm', 'definedoladetails', 'weightage', 'datasources',
        ...visibleColumns].filter((key, index, self) => self.indexOf(key) === index).map((key) => (
          <td key={key} >
            {editCell.rowId === item._id && editCell.key === key ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name={key}
                  value={item[key] || ''}
                  onChange={(e) => handleChange(e, item._id)}
                  autoFocus
                />
                <button
                className="table-button"
                  onClick={() => handleSaveClick(item._id, key, item[key])}
                  style={{ marginLeft: '5px' }}
                >
                  Done
                </button>
                <button
                 className="table-button"
                  onClick={handleCancelClick}
                  tyle={{ marginLeft: '5px' }}s
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {item[key] || ''}
                {role == "puser" && // Only show edit button for non-users (admin)
                  !nonEditableColumns.includes(key) && isEditingAllowed && (
                    <button
                      className="table-button"
                      onClick={() => handleEditClick(item._id, key)}
                      style={{
                        marginLeft: 'auto',  
                      }}
                    >
                      Edit
                    </button>
                  )}
              </div>
            )}
          </td>
        ))}
    </tr>
  ))}
</tbody>
      </table>

      <div>
        <button className="savebtn1" onClick={handleSaveAll}>Save All Changes</button>
        <button className="savebtn1" style={{marginLeft:'10px'}} onClick={generateExcelReport}>Generate Excel Report</button>
      </div>

      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
        </div>
      )}
    </div>
  );
 
}

export default Dropdown1;
