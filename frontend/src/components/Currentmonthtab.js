import React, { useEffect, useState } from 'react';
import './Currentmonthtab.css'; // Link to the CSS file
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";

const Currentmonthtab = () => {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [calculatedValues, setCalculatedValues] = useState([]);
  const [kpiTowerData, setKpiTowerData] = useState([]);
  const [weightedRows, setWeightedRows] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Function to calculate values for the table
  const calculateValues = (data, headers) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const specialMonths = ['March', 'June', 'September', 'December'];
    let selectedMonths;

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
        calculatedValues.push('100.00');
      } else {
        let totalAchievement = 0;
        let totalDistribution = 0;

        data.forEach((monthData) => {
          if (selectedMonths.includes(monthData.month)) {
            const columnData = monthData.details.find((detail) => detail.Column1 === header);
            if (columnData) {
              totalAchievement += parseFloat(columnData.Column3) || 0;
              totalDistribution += parseFloat(columnData.Column2) || 0;
            }
          }
        });

        const percentage = totalDistribution > 0 
          ? ((totalAchievement / totalDistribution) * 100).toFixed(2) 
          : '0.00';
        calculatedValues.push(percentage);
      }
    });

    return calculatedValues;
  };

  useEffect(() => {
    const fetchTableData = async () => {
      
      try {
        setLoading(true);
        const [dynamicResponse, kpiTowerResponse] = await Promise.all([
          fetch('/api/ProcessedDataFetch1').then(res => {
            if (!res.ok) throw new Error('Failed to fetch dynamic data');
            return res.json();
          }),
          fetch('/api/kpi-tower').then(res => {
            if (!res.ok) throw new Error('Failed to fetch KPI tower data');
           
            return res.json();
          })
        ]);

        const fetchedData = dynamicResponse;

        if (fetchedData && fetchedData.length > 0) {
          setTableData(fetchedData);
          const extractedHeaders = fetchedData[0].details.map((item) => item.Column1);
          setHeaders(extractedHeaders);
          const computedValues = calculateValues(fetchedData, extractedHeaders);
          setCalculatedValues(computedValues);

          const sortedKpiTowerData = (kpiTowerResponse || []).sort((a, b) => a.no - b.no);
          setKpiTowerData(sortedKpiTowerData);

          const kpiTowerWeightages = sortedKpiTowerData
            .slice(0, 3)
            .map((row) => parseFloat(row.weightage || 0));

          const weightedRowsData = kpiTowerWeightages.map((weightage) =>
            computedValues.map((value) => ((parseFloat(value) || 0) * weightage / 100).toFixed(2))
          );

          setWeightedRows(weightedRowsData);
        } else {
          setTableData([]);
          setHeaders([]);
          setCalculatedValues([]);
          setWeightedRows([]);
          setKpiTowerData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load table data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);


  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("KPI Tower Maintenance");
  
    const blueHeaderStyle = {
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1F4E79" } }, // Blue background
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
    sheet.mergeCells(`A${rowOffset}:I${rowOffset + 1}`);
    const titleRow = sheet.getRow(rowOffset);
    titleRow.getCell(1).value = "KPI (TOWER MAINTENANCE)";
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    rowOffset += 3;
  
    // **Table Headers**
    const tableHeaders = [
      "No",
      "Network Engineers Responsibility",
      "Frequency",
      "Weightage",
      "KPI (%)",
      ...headers
    ];
    sheet.addRow(tableHeaders).eachCell(cell => Object.assign(cell, blueHeaderStyle));
  
    // **Data Rows**
    kpiTowerData.forEach((item, rowIndex) => {
      const row = sheet.addRow([
        item.no || "-",
        item.responsibility || "-",
        item.frequency || "-",
        item.weightage || "-",
        item.kpi || "-",
        ...(weightedRows[rowIndex] || Array(headers.length).fill("-"))
      ]);
      row.eachCell(cell => (cell.border = borderStyle));
    });
  
    rowOffset += kpiTowerData.length + 3;
  
    // **Auto-Adjust Column Widths**
    sheet.columns.forEach(col => (col.width = 15));
  
    // **Generate and Download File**
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "KPI_Tower_Maintenance.xlsx";
    link.click();
  };
  
  if (loading) {
    return <div className="loader" style={{color:"black"}}></div>;
  }

  

  if (error) {
    return <div className="error-message">{error}</div>;
  }
 


  return (
    <div className="p-4 bg-gray-100 min-h-screen" style={{marginTop:'100px',marginLeft:'50px',marginRight:'50px'}}>
      <h1 className="text-2xl font-bold text-center mb-8 mt-8" style={{color:'black'}}>KPI(TOWER MAINTENANCE)</h1>

      
      <div className="max-w-[95%] mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{background:'#4a90e2'}}>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 border border-gray-300">No</th>
                  <th className="p-3 border border-gray-300">Network Engineers Responsibility</th>
                  <th className="p-3 border border-gray-300">Frequency</th>
                  <th className="p-3 border border-gray-300">Weightage</th>
                  <th className="p-3 border border-gray-300">KPI (%)</th>
                  {headers.map((header, idx) => (
                    <th key={idx} className="p-3 border border-gray-300 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{color:'black',backgroundColor:'#cad6dd'}}>
                {kpiTowerData.map((item, rowIndex) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">{item.no || '-'}</td>
                    <td className="p-3 border border-gray-300">{item.responsibility || '-'}</td>
                    <td className="p-3 border border-gray-300">{item.frequency || '-'}</td>
                    <td className="p-3 border border-gray-300">{item.weightage || '-'}</td>
                    <td className="p-3 border border-gray-300">{item.kpi || '-'}</td>
                    {weightedRows[rowIndex] ? 
                      weightedRows[rowIndex].map((value, colIndex) => (
                        <td key={colIndex} className="p-3 border border-gray-300">{value}%</td>
                      ))
                      :
                      headers.map((_, idx) => (
                        <td key={idx} className="p-3 border border-gray-300">-</td>
                      ))
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mt-4">
          {error}
        </div>
      )}

        <button 
          onClick={handleExport}
          disabled={loading || error}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '40px',
            fontSize: '14px',
            marginTop:'20px'
           
          }}
        >
          
          Export to Excel
        </button>
    </div>
    
  );
}


export default Currentmonthtab;