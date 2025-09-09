import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './FormWithDropdowns8.css'; // Make sure your CSS is linked

const MaintenanceTable = () => {
  const [data, setData] = useState([]);
  const [columnSums, setColumnSums] = useState({});
  const [form10Data, setForm10Data] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [towerSums, setTowerSums] = useState({}); // New state for total # Towers

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data directly from the database
        const response = await axios.get('/data-fetch1/data'); // Replace with your backend endpoint
        const parsedData = response.data.map((entry) => ({
          month: entry.month,
          details: entry.details, // Assuming `details` is already in JSON format
        }));

        setData(parsedData);
        calculateSums(parsedData);
        calculateTowerSums(parsedData);
        setCurrentMonth(new Date().toLocaleString('default', { month: 'long' })); // Set current month here
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const calculateSums = (parsedData) => {
      const sums = {};

      parsedData.forEach((entry) => {
        entry.details.forEach((item) => {
          sums[item.Column1] = (sums[item.Column1] || 0) + (parseFloat(item.Column4) || 0);
        });
      });

      setColumnSums(sums);
    };

    // Calculate the total # Towers for each header based on the sum of distributions for the first three months
    const calculateTowerSums = (parsedData) => {
      const towerSums = {};
      parsedData.forEach((entry, index) => {
        if (index < 3) {
          entry.details.forEach((item) => {
            towerSums[item.Column1] = (towerSums[item.Column1] || 0) + (parseFloat(item.Column2) || 0);
          });
        }
      });

      setTowerSums(towerSums);
    };

    fetchData(); // Fetch data directly from the database when the component mounts
  }, []);

  const headers = data.length > 0 ? data[0].details.map(item => item.Column1) : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/form10"); // Update URL as per your backend
        setForm10Data(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const isSpecialMonth = (month) => {
    return ['January', 'February', 'April', 'May', 'July', 'August', 'October', 'November'].includes(month);
  };

  const isTotalTowersMonth = (month) => {
    return ['March', 'June', 'September', 'December'].includes(month);
  };

  // Calculate current month data for percentage calculation
  const getCurrentMonthData = () => {
    const currentMonthData = {};

    data.forEach((entry) => {
      if (entry.month === currentMonth) {
        entry.details.forEach((item) => {
          currentMonthData[item.Column1] = {
            distribution: parseFloat(item.Column2) || 0, // Use Column2 for distribution
            achievement: parseFloat(item.Column3) || 0  // Use Column3 for achievement
          };
        });
      }
    });

    return currentMonthData;
  };

  const currentMonthData = getCurrentMonthData(); // Get current month data for percentage calculation

  // Save data when all values are set and page is refreshed
  useEffect(() => {
    if (data.length && form10Data.length && currentMonth && Object.keys(columnSums).length) {
      const handleSave = async () => {
        // Process the final calculated table data
        const calculatedTableData = form10Data.map((item) => {
          const row = {
            no: item.no,
            KPI: item.KPI,
            Target: item.Target,
            Calculation: item.Calculation,
            Platform: item.Platform,
            Responsible_DGM: item.Responsible_DGM,
            Defined_OLA_Details: item.Defined_OLA_Details,
            Data_Sources: item.Data_Sources,
          };

          // Process each header column and add the corresponding calculated value
          headers.forEach((header) => {
            if (isSpecialMonth(currentMonth)) {
              row[header] = '100%';
            } else if (isTotalTowersMonth(currentMonth) && currentMonthData[header]?.achievement && columnSums[header]) {
              let totalAchievement = currentMonthData[header]?.achievement || 0;
              const currentIndex = data.findIndex((entry) => entry.month === currentMonth);
              const prevAchievements = [1, 2].reduce((acc, offset) => {
                const prevMonthData = data[currentIndex - offset]?.details.find((item) => item.Column1 === header);
                return acc + (prevMonthData ? parseFloat(prevMonthData.Column3) || 0 : 0);
              }, 0);

              const percentage = ((totalAchievement + prevAchievements) / columnSums[header]) * 100;
              row[header] = `${percentage.toFixed(2)}%`;
            } else {
              row[header] = '0%';
            }
          });

          return row;
        });

        // Prepare data for saving to the backend
        const tableData = {
          mainTable: calculatedTableData, // This now contains the fully processed data
          columnSums: headers.reduce((acc, header) => {
            if (isSpecialMonth(currentMonth)) {
              acc[header] = '100%';
            } else if (isTotalTowersMonth(currentMonth) && currentMonthData[header]?.achievement && columnSums[header]) {
              let totalAchievement = currentMonthData[header]?.achievement || 0;
              const currentIndex = data.findIndex((entry) => entry.month === currentMonth);
              const prevAchievements = [1, 2].reduce((acc, offset) => {
                const prevMonthData = data[currentIndex - offset]?.details.find((item) => item.Column1 === header);
                return acc + (prevMonthData ? parseFloat(prevMonthData.Column3) || 0 : 0);
              }, 0);

              const percentage = ((totalAchievement + prevAchievements) / columnSums[header]) * 100;
              acc[header] = `${percentage.toFixed(2)}%`;
            } else {
              acc[header] = '0%';
            }
            return acc;
          }, {}),
          currentMonth: currentMonth,
          towerSums: towerSums, // Include tower sums in saved data
        };

        try {
          await axios.post('/api/main-table/save', tableData);
          console.log('Table data saved successfully.');
        } catch (error) {
          console.error('Error saving table data:', error);
        }
      };

      handleSave();
    }
  }, [data, form10Data, currentMonth, columnSums]);

  return (
    <div className="page9-container">
      <br />
      <h1 className="h1name">TM Activity Plan</h1>
      <div>
        {/* Main Table */}
        <table className="data-table" border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center', marginLeft: '20px', marginBottom: '80px' }}>  
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
                <th key={idx} colSpan="1">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {form10Data.map((item, index) => (
              <tr key={index}>
                <td>{item.no}</td>
                <td>{item.KPI}</td>
                <td>{item.Target}</td>
                <td>{item.Calculation}</td>
                <td>{item.Platform}</td>
                <td>{item.Responsible_DGM}</td>
                <td>{item.Defined_OLA_Details}</td>
                <td>{item.Data_Sources}</td>
                {headers.map((header, idx) => (
                  <td key={idx}>
                    <b>
                      {isSpecialMonth(currentMonth)
                        ? '100%'
                        : (isTotalTowersMonth(currentMonth) && currentMonthData[header]?.achievement && columnSums[header]
                          ? (() => {
                              let totalAchievement = currentMonthData[header]?.achievement || 0;
                              const currentIndex = data.findIndex((entry) => entry.month === currentMonth);
                              const prevAchievements = [1, 2].reduce((acc, offset) => {
                                const prevMonthData = data[currentIndex - offset]?.details.find((item) => item.Column1 === header);
                                return acc + (prevMonthData ? parseFloat(prevMonthData.Column3) || 0 : 0);
                              }, 0);
                              const percentage = ((totalAchievement + prevAchievements) / columnSums[header]) * 100;
                              return `${percentage.toFixed(2)}%`;
                            })()
                          : '0%')}
                    </b>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{/* Additional Tables */}
      {["1. Proper maintaining and cleaning of tower site, access roads, tower leg bases and guy bases.", "2. Visual inspection of tower condition, aviation lighting system etc.", "3. Measure earth readings and inspect Earthing system."].map((title, i) => (
        <div key={i}>
          <h1 className="h1name">{title}</h1>
          <table className="data-table" border="1" style={{ width: '100%', textAlign: 'center', marginLeft: '20px', marginBottom: '80px' }}>
            <thead>
              <tr>
                <th rowSpan="2">Month</th>
                {headers.map((header, idx) => (
                  <th key={idx} colSpan="2">{header}</th>
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
                  <td key={idx} colSpan="2"><b>{towerSums[header]}</b></td>
                ))}
              </tr>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.month}</td>
                  {entry.details.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <td>{item.Column2}</td> {/* Distribution */}
                      <td>{item.Column3}</td> {/* Achievement */}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
{/* Additional Tables */}
      {["1. Proper maintaining and cleaning of tower site, access roads, tower leg bases and guy bases.", "2. Visual inspection of tower condition, aviation lighting system etc.", "3. Measure earth readings and inspect Earthing system."].map((title, i) => (
        <div key={i}>
          <h1 className="h1name">{title}</h1>
          <table className="data-table" border="1" style={{ width: '100%', textAlign: 'center', marginLeft: '20px', marginBottom: '80px' }}>
            <thead>
              <tr>
                <th rowSpan="2">Month</th>
                {headers.map((header, idx) => (
                  <th key={idx} colSpan="2">{header}</th>
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
                  <td key={idx} colSpan="2"><b>{towerSums[header]}</b></td>
                ))}
              </tr>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.month}</td>
                  {entry.details.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <td>{item.Column2}</td> {/* Distribution */}
                      <td>{item.Column3}</td> {/* Achievement */}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceTable;
