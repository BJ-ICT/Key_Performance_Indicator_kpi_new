import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './NewMaintenanceTables.css'; // Link to the new CSS file
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";

const NewMaintenanceTables = () => {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [towerSums, setTowerSums] = useState({});
  const [calculatedValues, setCalculatedValues] = useState([]);
  const [hardcodedTableData, setHardcodedTableData] = useState([]); // State for hardcoded table data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Function to process and fetch data
    const processAndFetchData = async () => {
      try {
        setLoading(true); // Start loading

        // Step 1: Fetch the processed data directly from the database
        const [processedResponse, hardcodedResponse] = await Promise.all([
          axios.get(`/api/ProcessedDataFetch1`), // Fetch dynamic data
          axios.get(`/api/repeated-hardcode-tab1`) // Fetch hardcoded table data
        ]);

        let fetchedData = processedResponse.data;

        if (fetchedData && fetchedData.length > 0) {
          // Define a fixed month order
          const monthOrder = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
          ];

          // Sort fetchedData by the defined month order
          fetchedData.sort((a, b) => {
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
          });

          // Extract unique headers from all records
          const uniqueHeaders = Array.from(new Set(fetchedData.flatMap(record => record.details.map(item => item.Column1))));
          setHeaders(uniqueHeaders);

          // Set the table data state
          setTableData(fetchedData);

          // Calculate tower sums for the first 3 months only
          const calculatedTowerSums = calculateTowerSums(fetchedData);
          setTowerSums(calculatedTowerSums);

          // Calculate values for the first table
          const computedValues = calculateFirstTableValues(fetchedData, uniqueHeaders);
          setCalculatedValues(computedValues);
        }

        // Set the hardcoded table data from the response
        setHardcodedTableData(hardcodedResponse.data || []);
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError('Failed to load table data. Please try again later.');
      } finally {
        setLoading(false); // End loading
      }
    };

    processAndFetchData();
  }, []);

  // Function to calculate tower sums (only for the first 3 months)
  const calculateTowerSums = (data) => {
    const sums = {};
    // We only consider the first 3 records from the sorted data
    const firstThreeMonths = data.slice(0, 3);

    firstThreeMonths.forEach((entry) => {
      entry.details.forEach((item) => {
        sums[item.Column1] = (sums[item.Column1] || 0) + (parseFloat(item.Column2) || 0);
      });
    });

    return sums;
  };

  // Function to calculate the values for the first dynamic table
  const calculateFirstTableValues = (data, headers) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const specialMonths = ['March', 'June', 'September', 'December'];
    let selectedMonths;

    // Determine the months for calculation based on the current month
    if (currentMonth === 'March') {
      selectedMonths = ['January', 'February', 'March'];
    } else if (currentMonth === 'June') {
      selectedMonths = ['April', 'May', 'June'];
    } else if (currentMonth === 'September') {
      selectedMonths = ['July', 'August', 'September'];
    } else if (currentMonth === 'December') {
      selectedMonths = ['October', 'November', 'December'];
    }

    const calculatedValues = [];

    headers.forEach((header) => {
      if (!specialMonths.includes(currentMonth)) {
        // Set all values to 100% for non-special months
        calculatedValues.push('100.00');
      } else {
        let totalAchievement = 0;
        let totalDistribution = 0;

        // Calculate based on selected months
        data.forEach((monthData) => {
          if (selectedMonths && selectedMonths.includes(monthData.month)) {
            const columnData = monthData.details.find((detail) => detail.Column1 === header);
            if (columnData) {
              totalAchievement += parseFloat(columnData.Column3) || 0;
              totalDistribution += parseFloat(columnData.Column2) || 0;
            }
          }
        });

        const percentage =
          totalDistribution > 0
            ? ((totalAchievement / totalDistribution) * 100).toFixed(2)
            : '0.00';
        calculatedValues.push(percentage);
      }
    });

    return calculatedValues;
  };

  if (loading) {
    return <div className="loader" style={{ color: "black" }}></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tower Maintenance Plan");
  
    const blueHeaderStyle = {
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "0070C0" } }, // Blue background
      font: { bold: true, color: { argb: "FFFFFF" } }, // White text
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    };
  
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  
    let rowOffset = 1;
  
    // **Add Title Row**
    sheet.mergeCells(`A${rowOffset}:I${rowOffset}`);
    const titleRow = sheet.getRow(rowOffset);
    titleRow.getCell(1).value = "Tower Maintenance Activity Plan";
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    rowOffset += 2;
  
    // **First Table: Hardcoded Data**
    const firstTableHeaders = [
      "No", "KPI", "Target", "Calculation", "Platform",
      "Responsible DGM", "Defined OLA Details", "Data Sources", ...headers
    ];
    sheet.addRow(firstTableHeaders).eachCell(cell => Object.assign(cell, blueHeaderStyle));
  
    hardcodedTableData.forEach(item => {
      const row = sheet.addRow([
        item.no || "-",
        item.kpi || "-",
        item.target || "-",
        item.calculation || "-",
        item.platform || "-",
        item.responsibleDGM || "-",
        item.definedOLADetails || "-",
        item.dataSources || "-",
        ...calculatedValues.map(value => `${value}%`)
      ]);
      row.eachCell(cell => (cell.border = borderStyle));
    });
  
    rowOffset += hardcodedTableData.length + 3;
  
    // **Dynamic Tables**
    const tableTitles = [
      "2. Proper maintaining and cleaning",
      "3. Visual inspection",
      "4. Measure earth readings"
    ];
  
    tableTitles.forEach((title, index) => {
      sheet.mergeCells(`A${rowOffset}:I${rowOffset}`);
      const titleRow = sheet.getRow(rowOffset);
      titleRow.getCell(1).value = title;
      titleRow.getCell(1).font = { bold: true, size: 12 };
      titleRow.getCell(1).alignment = { horizontal: "center" };
      rowOffset++;
  
      // Table Headers
      const mainHeaders = ["Month", ...headers.flatMap(header => [header + " Distribution", header + " Achievement"])];
      sheet.addRow(mainHeaders).eachCell(cell => Object.assign(cell, blueHeaderStyle));
  
      // # Towers row
      const towerRow = ["# Towers", ...headers.flatMap(header => [`${towerSums[header] || 0}`, ""])];
      const towerRowObj = sheet.addRow(towerRow);
      towerRowObj.eachCell(cell => (cell.border = borderStyle));
  
      // Data Rows
      tableData.forEach(entry => {
        const rowData = [
          entry.month,
          ...entry.details.flatMap(detail => [detail.Column2, detail.Column3])
        ];
        const dataRow = sheet.addRow(rowData);
        dataRow.eachCell(cell => (cell.border = borderStyle));
      });
  
      rowOffset += tableData.length + 4;
    });
  
    // **Auto-Adjust Column Widths**
    sheet.columns.forEach(col => (col.width = 15));
  
    // **Generate and Download File**
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Tower_Maintenance_Plan.xlsx";
    link.click();
  };
  
  if (loading) {
    return <div className="loader" style={{ color: "black" }}></div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  

  return (
    <div className="tables-container">
      <h1 className="table-title">Tower Maintenance Activity Plan</h1>

      {/* Updated Hardcoded Table as the 1st Table */}
      <div className="table-section">
        {/* <h2 className="table-subtitle">1. Customer Satisfaction Scores</h2> */}
        <table
          className="data-table"
          border="1"
          cellPadding="10"
          style={{ width: '100%', textAlign: 'center' }}
        >
          <thead>
            <tr>
              <th>No</th>
              <th>KPI</th>
              <th>Target</th>
              <th>Calculation</th>
              <th>Platform</th>
              <th>Responsible DGM</th>
              <th>Defined OLA Details</th>
              <th>Data Sources</th>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hardcodedTableData.map((item, index) => (
              <tr key={item._id || index}>
                <td>{item.no || '-'}</td>
                <td>{item.kpi || '-'}</td>
                <td>{item.target || '-'}</td>
                <td>{item.calculation || '-'}</td>
                <td>{item.platform || '-'}</td>
                <td>{item.responsibleDGM || '-'}</td>
                <td>{item.definedOLADetails || '-'}</td>
                <td>{item.dataSources || '-'}</td>
                {calculatedValues.map((value, idx) => (
                  <td key={idx}>{value}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Tables */}
      {[
        '2. Proper maintaining and cleaning of tower sites, access roads, tower leg bases, and guy bases.',
        '3. Visual inspection of tower condition, aviation lighting system, etc.',
        '4. Measure earth readings and inspect Earthing system.',
      ].map((title, index) => (
        <div key={index} className="table-section">
          <h2 className="table-subtitle">{title}</h2>
          <table
            className="data-table"
            border="1"
            cellPadding="10"
            style={{ width: '100%', textAlign: 'center' }}
          >
            <thead>
              <tr>
                <th rowSpan="2">Month</th>
                {headers.map((header, idx) => (
                  <th key={idx} colSpan="2">
                    {header}
                  </th>
                ))}
              </tr>
              <tr>
                {headers.map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th>Distribution</th>
                    <th>Achievement</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td># Towers</td>
                {headers.map((header, idx) => (
                  <td key={idx} colSpan="2">
                    <b>{towerSums[header] || 0}</b>
                  </td>
                ))}
              </tr>
              {tableData.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.month}</td>
                  {entry.details.map((detail, subIdx) => (
                    <React.Fragment key={subIdx}>
                      <td>{detail.Column2}</td> {/* Distribution */}
                      <td>{detail.Column3}</td> {/* Achievement */}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button 
          onClick={exportToExcel}
          className="savebtn1"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '40px',
            fontSize: '14px',
           
          }}
        >
          Export to Excel
        </button>
      
    </div>

    
  );
};

export default NewMaintenanceTables;
//fine!

