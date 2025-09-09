import axios from "axios";
import React, { useEffect, useState } from "react";
import "./FormWithDropdowns4.css";

const ServFulOk = () => {
  const [form4Data, setForm4Data] = useState([]);

  const columnHeaders = [
    { key: "CENHKMD", label: "NW/WPC", subLabel: "CEN/HK/MD" },
    { key: "CENHKMD1", label: "E/Fiber NW/WPC", subLabel: "CEN/HK/MD" },
    { key: "GQKINTB", label: "NW/WP N-E", subLabel: "GQ/KI/NTB" },
    { key: "NDRM", label: "NW/WP S-W", subLabel: "ND/RM" },
    { key: "AWHO", label: "NW/WP S-E", subLabel: "AW/HO" },
    { key: "KONKX", label: "NW/WPE", subLabel: "KON/KX" },
    { key: "NGWT", label: "NW/WPN", subLabel: "NG/WT" },
    { key: "KGKLY", label: "NW/NWP-E", subLabel: "KG/KLY" },
    { key: "CWPX", label: "NW/NWP-W", subLabel: "CW/PX" },
    { key: "DBKYMT", label: "NW/CPN", subLabel: "DB/KY/MT" },
    { key: "GPHTNW", label: "NW/CPS", subLabel: "GP/HT/NW" },
    { key: "ADPR", label: "NW/NCP", subLabel: "AD/PR" },
    { key: "BDBWMRG", label: "NW/UVA", subLabel: "BD/BW/MRG" },
    { key: "KERN", label: "NW/SAB", subLabel: "KE/RN" },
    { key: "EBMHMBH", label: "NW/SPE", subLabel: "EMB/HB/MH" },
    { key: "AGGL", label: "NW/SPW", subLabel: "AG/GL" },
    { key: "HRKTPH", label: "WPS", subLabel: "HR/KT/PH" },
    { key: "BCAPKLTC", label: "NW/EP", subLabel: "BC/AP/KL/TC" },
    { key: "JA", label: "NW/NP-1", subLabel: "JA" },
    { key: "KOMLTMBVA", label: "NW/NP-2", subLabel: "KO/MLT/MB/VA" },
  ];

  const rowMultipliers = [0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.05, 0.05];

  const fetchData = async () => {
    try {
      const response = await axios.get("/form4");
      setForm4Data(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateTotal = () => {
    const totals = {};
    columnHeaders.forEach((col) => {
      totals[col.key] = form4Data.slice(0, 8).reduce((sum, row, rowIndex) => {
        const value = parseFloat(row[col.key]) || 0;
        return sum + value * rowMultipliers[rowIndex];
      }, 0);
    });
    return totals;
  };

  const calculateAdjustedTotal = () => {
    const totals = calculateTotal();
    const adjustedTotals = {};
    Object.keys(totals).forEach((key) => {
      const value = totals[key] || 0;
      adjustedTotals[key] = value > 90 ? "100%" : `${value.toFixed(2)}%`; // Convert to percentage strings
    });
    return adjustedTotals;
  };

  const adjustedTotalRow = calculateAdjustedTotal();

  return (
    <div>
      <h3>Form 4 Data Total Row</h3>
      <table border="1" cellPadding="10" cellSpacing="0" className="data-table">
        <thead>
          <tr>
            {columnHeaders.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
          <tr>
            {columnHeaders.map((col) => (
              <th key={col.key}>{col.subLabel}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columnHeaders.map((col) => (
              <td key={col.key}>{adjustedTotalRow[col.key]}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ServFulOk;
//fine code.
