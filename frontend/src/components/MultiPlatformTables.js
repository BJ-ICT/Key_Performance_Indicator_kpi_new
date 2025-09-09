// src/components/MultiPlatformTables.js

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './MultiPlatformTables.css';
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";

const MultiPlatformTables = () => {
  const [msanData, setMsanData] = useState([]);
  const [vpnData, setVpnData] = useState([]);
  const [slbnData, setSlbnData] = useState([]);
  const [routineData, setRoutineData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const columns = [
    'NW/WPC','NW/WPNE','NW/WPSW','NW/WPSE','NW/WPE','NW/WPN','NW/NWPE','NW/NWPW',
    'NW/CPN','NW/CPS','NW/NCP','NW/UVA','NW/SAB','NW/SPE','NW/SPW','NW/WPS',
    'NW/EP','NW/NP-1','NW/NP-2'
  ];

  // Helper to map month index to name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Retrieves the actual current month name.
   * @returns {string} - Current month name.
   */
  const getCurrentMonthName = () => {
    const now = new Date();
    return monthNames[now.getMonth()];
  };

  const currentMonth = getCurrentMonthName();
  console.log(`Current Month: ${currentMonth}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        setError(null);   // Reset error state

        // **Step 1: Send POST request to trigger SOAP data fetch**
        // Uncomment if needed
        // const soapPostResponse = await axios.post('/data-fetch2/soap-request');
        // console.log('POST /data-fetch2/soap-request response:', soapPostResponse.data);

        // **Step 2: Send POST request to process and update data**
        // const processPostResponse = await axios.post('/api/multi-table/ProcessedDataFetch2');
        // console.log('POST /ProcessedDataFetch2 response:', processPostResponse.data);

        // **Step 3: Fetch updated data after POST requests complete**
        const [msanResponse, vpnResponse, slbnResponse, routineResponse] = await Promise.all([
          axios.get('/api/multi-table/fetchMsan'),
          axios.get('/api/multi-table/fetchVpn'),
          axios.get('/api/multi-table/fetchSlbn'),
          axios.get('/api/mtnc-routine'),
        ]);

        setMsanData(msanResponse.data || []);
        setVpnData(vpnResponse.data || []);
        setSlbnData(slbnResponse.data || []);
        setRoutineData(routineResponse.data || []);

        console.log('Data fetched successfully for all platforms.');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data. Please try again later.');
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, []);

  /**
   * Calculates placeholder percentages for KPIs based on achievement and distribution or #Towers.
   * @param {Array} data - Array of data entries for a platform.
   * @param {string} platform - The platform type ('msan', 'vpn', 'slbn').
   * @param {string} currentMonth - The current month name.
   * @returns {Object} - Placeholder percentages for each KPI.
   */
  const calculatePlaceholderValues = (data, platform, currentMonth) => {
    const result = {};

    // Define specific months for calculation
    let calculate = false;
    let sumMonths = [];

    if (platform === 'msan') {
      if (currentMonth === 'June') {
        sumMonths = ['January', 'February', 'March', 'April', 'May', 'June'];
        calculate = true;
      } else if (currentMonth === 'December') {
        sumMonths = ['June', 'July', 'August', 'September', 'October', 'November', 'December'];
        calculate = true;
      }
    } else if (platform === 'vpn' || platform === 'slbn') {
      const calculationMonths = ['February', 'April', 'June', 'August', 'October', 'December'];
      if (calculationMonths.includes(currentMonth)) {
        const currentIndex = monthNames.indexOf(currentMonth);
        const previousMonth = currentIndex === 0 ? 'December' : monthNames[currentIndex - 1];
        sumMonths = [previousMonth, currentMonth];
        calculate = true;
      }
    }

    columns.forEach((col) => {
      if (calculate) {
        // Sum Achievement values for the specified months
        const sumAchievement = sumMonths.reduce((acc, month) => {
          const monthData = data.find(entry => entry.month === month);
          if (monthData && monthData.details) {
            const item = monthData.details.find(detail => detail.Column1 === col);
            if (item && item.Column3) {
              acc += parseFloat(item.Column3) || 0;
            }
          }
          return acc;
        }, 0);

        let denominator = 0;

        if (platform === 'msan') {
          // Sum of Column4 (Distribution) over sumMonths
          denominator = sumMonths.reduce((acc, month) => {
            const monthData = data.find(entry => entry.month === month);
            if (monthData && monthData.details) {
              const item = monthData.details.find(detail => detail.Column1 === col);
              if (item && item.Column4) {
                acc += parseFloat(item.Column4) || 0;
              }
            }
            return acc;
          }, 0);
        } else if (platform === 'vpn' || platform === 'slbn') {
          // Sum of Column2 (#Towers) over sumMonths
          denominator = sumMonths.reduce((acc, month) => {
            const monthData = data.find(entry => entry.month === month);
            if (monthData && monthData.details) {
              const item = monthData.details.find(detail => detail.Column1 === col);
              if (item && item.Column2) {
                acc += parseFloat(item.Column2) || 0;
              }
            }
            return acc;
          }, 0);
        }

        // Debugging logs
        console.log(`Platform: ${platform}, Column: ${col}`);
        console.log(`Sum Achievement: ${sumAchievement}, Denominator: ${denominator}`);

        // Calculate the percentage
        if (denominator > 0) {
          const percentage = ((sumAchievement / denominator) * 100).toFixed(2);
          result[col] = percentage;
        } else {
          result[col] = "0.00"; // Avoid division by zero
        }
      } else {
        // Default placeholder value
        result[col] = "100.00";
      }
    });

    return result;
  };

  // Compute placeholders for each platform
  const msanPlaceholders = calculatePlaceholderValues(msanData, 'msan', currentMonth);
  const vpnPlaceholders  = calculatePlaceholderValues(vpnData,  'vpn',  currentMonth);
  const slbnPlaceholders = calculatePlaceholderValues(slbnData, 'slbn', currentMonth);

  // Compute the Average Row (MSAN, VPN, SLBN) for each column
  const averagePlaceholder = {};
  columns.forEach((col) => {
    const mVal = parseFloat(msanPlaceholders[col]) || 0;
    const vVal = parseFloat(vpnPlaceholders[col])  || 0;
    const sVal = parseFloat(slbnPlaceholders[col]) || 0;

    // Check if all three values are zero
    if (mVal === 0 && vVal === 0 && sVal === 0) {
      averagePlaceholder[col] = "100.00";
    } else {
      // Calculate average
      const rawAvg = (mVal + vVal + sVal) / 3;

      // If average > 95 => "100.00", else rawAvg.toFixed(2)
      averagePlaceholder[col] = rawAvg > 95 ? "100.00" : rawAvg.toFixed(2);
    }
  });

  /**
   * Renders MSAN/VPN/SLBN detail tables.
   * @param {string} title - The title of the table.
   * @param {Array} data - The data to display in the table.
   * @returns JSX Element
   */
  const renderDataTable = (title, data) => {
    let monthsCount = 0;
    if (title === 'MSAN Data Table')      monthsCount = 6;
    else if (title === 'VPN Data Table' ||
             title === 'SLBN Data Table') monthsCount = 2;

    // Calculate #Towers sums
    const sums = {};
    columns.forEach((col) => { sums[col] = 0; });

    data.slice(0, monthsCount).forEach((entry) => {
      if (entry.details) {
        entry.details.forEach((item) => {
          if (columns.includes(item.Column1) && item.Column2) {
            sums[item.Column1] += parseFloat(item.Column2) || 0;
          }
        });
      }
    });

    //////////////////////


    //////////////////////

    return (
      <div className="multi-platform-table-section" key={title}>
        <h2 className="multi-platform-table-subtitle">{title}</h2>
        <table className="multi-platform-data-table">
          <thead>
            <tr>
              <th rowSpan="2">Month</th>
              {columns.map((column, idx) => (
                <th key={idx} colSpan="2">{column}</th>
              ))}
            </tr>
            <tr>
              {columns.map((column, idx) => (
                <React.Fragment key={idx}>
                  <th>Distribution</th>
                  <th>Achievement</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              <>
                {/* #Towers Row */}
                <tr>
                  <td>#Towers</td>
                  {columns.map((col, idx) => (
                    <React.Fragment key={idx}>
                      <td>{sums[col]}</td>
                      <td></td> {/* Empty Achievement cell */}
                    </React.Fragment>
                  ))}
                </tr>
                {/* Data Rows for Each Month */}
                {data.map((entry, i) => {
                  const rowData = columns.map((col) => {
                    const d = entry.details.find((item) => item.Column1 === col);
                    return {
                      dist: d ? (d.Column2 ?? '-') : '-',
                      achi: d ? (d.Column3 ?? '-') : '-'
                    };
                  });

                  return (
                    <tr key={i}>
                      <td>{entry.month}</td>
                      {rowData.map((val, subIdx) => (
                        <React.Fragment key={subIdx}>
                          <td>{val.dist}</td>
                          <td>{val.achi}</td>
                        </React.Fragment>
                      ))}
                    </tr>
                  );
                })}
              </>
            ) : (
              <tr>
                <td colSpan={columns.length * 2 + 1}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h3>Loading data...</h3>
        <div className="progress-bar">
          <div className="progress-bar-fill"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Multi-Platform Data');
  
    // Define styling for headers
    const headerStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } },
      font: { color: { argb: 'FFFFFF' }, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      }
    };
  
    // Define styling for table data
    const dataStyle = {
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
  
    const routineTableStartCol = 1;
    const platformTableStartCol = 9;
  
    // Add Routine Data Table headers
    const routineHeaders = ['No', 'KPI', 'Target', 'Calculation', 'Platform', 'Responsible DGM', 'Defined OLA Details', 'Data Sources'];
    const routineHeaderRow = worksheet.addRow([]);
    routineHeaders.forEach((header, index) => {
      const cell = routineHeaderRow.getCell(routineTableStartCol + index);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
  
    // Add Routine Data
    routineData.forEach(item => {
      const row = worksheet.addRow([]);
      const rowData = [
        item.no || 0, 
        item.kpi || '-', 
        item.target || 0,
        item.calculation || '-', 
        item.platform || '-', 
        item.responsibleDGM || '-',
        item.definedOLADetails || '-', 
        item.dataSources || '-'
      ];
      rowData.forEach((value, index) => {
        const cell = row.getCell(routineTableStartCol + index);
        cell.value = value;
        Object.assign(cell, dataStyle);
      });
    });
  
   // Add the platform table headers
   const platformHeaders = ['E/Fiber', ...columns];
   const platformHeaderRow = worksheet.getRow(1);
   platformHeaders.forEach((header, index) => {
     const cell = platformHeaderRow.getCell(platformTableStartCol + index);
     cell.value = header;
     Object.assign(cell, headerStyle);
   });
 
   // Add platform rows with proper platform values for each column
   const platformData = [
     { name: 'MSAN', values: msanPlaceholders },
     { name: 'VPN', values: vpnPlaceholders },
     { name: 'SLBN', values: slbnPlaceholders }
   ];
 
   platformData.forEach((platform, rowIndex) => {
     const row = worksheet.getRow(rowIndex + 2);

     // First, set E/Fiber value (gets the first property value from the placeholders object)
     const eFiberCell = row.getCell(platformTableStartCol);
     const eFiberValue = Object.values(platform.values)[0] || '-';
     eFiberCell.value = eFiberValue;
     Object.assign(eFiberCell, dataStyle);
     if (eFiberValue !== '100.00') {
       eFiberCell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FFE6E6' }
       };
     }

     // Then handle the rest of the columns
     columns.forEach((col, colIndex) => {
       const cell = row.getCell(platformTableStartCol + colIndex + 1);
       let value = platform.values[col] || '-';
       cell.value = value;
       Object.assign(cell, dataStyle);
       
       if (value !== '100.00') {
         cell.fill = {
           type: 'pattern',
           pattern: 'solid',
           fgColor: { argb: 'FFE6E6' }
         };
       }
     });
   });

  
    // Add space before the next tables
    worksheet.addRow([]);
    worksheet.addRow([]);
  
    // Function to add remaining tables
    const processData = (title, data) => {
      const headers = ['Month'];
      columns.forEach(col => {
        headers.push(`${col} Distribution`);
        headers.push(`${col} Achievement`);
      });
  
      const titleRow = worksheet.addRow([title]);
      titleRow.font = { bold: true, size: 14 };
      worksheet.addRow(headers).eachCell(cell => Object.assign(cell, headerStyle));
  
      const processedData = data.map(entry => {
        const row = [entry.month];
        columns.forEach(col => {
          const detail = entry.details.find(d => d.Column1 === col);
          const dist = detail?.Column2 || 0;
          const achi = detail?.Column3 || 0;
          row.push(dist, achi);
        });
        return row;
      });
  
      processedData.forEach(row => {
        const excelRow = worksheet.addRow(row);
        excelRow.eachCell(cell => Object.assign(cell, dataStyle));
      });
  
      worksheet.addRow([]);
    };
  
    // Process remaining tables
    processData('MSAN Data Table', msanData);
    processData('VPN Data Table', vpnData);
    processData('SLBN Data Table', slbnData);
  
    // Adjust column widths dynamically
    worksheet.columns.forEach((column, index) => {
      let maxLength = 10;
      worksheet.eachRow((row) => {
        const cellValue = row.getCell(index + 1).value;
        if (cellValue) {
          maxLength = Math.max(maxLength, cellValue.toString().length + 5);
        }
      });
      column.width = maxLength > 50 ? 50 : maxLength;
    });
  
    // Write file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MultiPlatformData.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="multi-platform-tables-container">
      <h1 className="multi-platform-title">Multi-Platform Maintenance Tables</h1>

      {/* Dynamic routine data */}
      <div className="multi-platform-first-table-container">
        <table className="multi-platform-current-month-table">
        <thead style={{ height: '61.5px' }}>

            <tr>
              <th>No</th>
              <th>KPI</th>
              <th>Target</th>
              <th>Calculation</th>
              <th>Platform</th>
              <th>Responsible DGM</th>
              <th>Defined OLA Details</th>
              <th>Data Sources</th>
            </tr>
          </thead>
          <tbody>
            {routineData.length ? routineData.map((item) => (
              <tr key={item._id}>
                <td>{item.no || '-'}</td>
                <td>{item.kpi || '-'}</td>
                <td>{item.target || '-'}</td>
                <td>{item.calculation || '-'}</td>
                <td>{item.platform || '-'}</td>
                <td>{item.responsibleDGM || '-'}</td>
                <td>{item.definedOLADetails || '-'}</td>
                <td>{item.dataSources || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan="8">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Main table with MSAN, VPN, SLBN placeholders */}
      <div className="multi-platform-second-table-container">
        <table className="multi-platform-data-table">
          <thead >
            {/* Simplified Header: Removed R-GM, P-DGM */}
            <tr>
              {/* <th>NW EE</th> */}
              <th>E/Fiber</th>
              {columns.map((col, i) => <th key={i}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* Removed RTOM AREA and asterisks rows */}

            {/* Placeholder Rows */}
            {/* MSAN Placeholder Row */}
            <tr>
              {/* <th>MSAN</th> */}
              
              {/* E/Fiber NW/WPC Column - same as NW/WPC */}
              <td className={msanPlaceholders['NW/WPC'] !== '100.00' ? 'calculated-value' : 'default-value'}>
                {msanPlaceholders['NW/WPC']}
              </td>
              {columns.map((col, i) => (
                <td key={i} className={msanPlaceholders[col] !== '100.00' ? 'calculated-value' : 'default-value'}>
                  {msanPlaceholders[col]}
                </td>
              ))}
            </tr>
            {/* VPN Placeholder Row */}
            <tr>
              {/* <th>VPN</th> */}
              
              {/* E/Fiber NW/WPNE Column - same as NW/WPNE */}
              <td className={vpnPlaceholders['NW/WPNE'] !== '100.00' ? 'calculated-value' : 'default-value'}>
                {vpnPlaceholders['NW/WPNE']}
              </td>
              {columns.map((col, i) => (
                <td key={i} className={vpnPlaceholders[col] !== '100.00' ? 'calculated-value' : 'default-value'}>
                  {vpnPlaceholders[col]}
                </td>
              ))}
            </tr>
            {/* SLBN Placeholder Row */}
            <tr>
              {/* <th>SLBN</th> */}
              
              {/* E/Fiber NW/WPNE Column - same as NW/WPNE */}
              <td className={slbnPlaceholders['NW/WPNE'] !== '100.00' ? 'calculated-value' : 'default-value'}>
                {slbnPlaceholders['NW/WPNE']}
              </td>
              {columns.map((col, i) => (
                <td key={i} className={slbnPlaceholders[col] !== '100.00' ? 'calculated-value' : 'default-value'}>
                  {slbnPlaceholders[col]}
                </td>
              ))}
            </tr>
            {/* Average Row */}
            {/*
            <tr>
              <th>Average Row</th>
              
              <td className={averagePlaceholder['NW/WPC'] !== '100.00' ? 'calculated-value' : 'default-value'}>
                {averagePlaceholder['NW/WPC']}
              </td>
              {columns.map((col, i) => (
                <td key={i} className={averagePlaceholder[col] !== '100.00' ? 'calculated-value' : 'default-value'}>
                  {averagePlaceholder[col]}
                </td>
              ))}
            </tr>
            */}
          </tbody>
        </table>
       
      </div>

      {/* Detailed platform data tables */}
      {renderDataTable('MSAN Data Table', msanData)}
      {renderDataTable('VPN Data Table', vpnData)}
      {renderDataTable('SLBN Data Table', slbnData)}

      <button  style={{
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '40px',
            fontSize: '14px',
           
          }} className="export-button" onClick={exportToExcel}>Export to Excel</button>
    </div>
  );
};

export default MultiPlatformTables;

