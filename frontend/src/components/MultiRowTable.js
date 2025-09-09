import axios from "axios";
import React, { useEffect, useState } from "react";
import "./FormWithDropdowns4.css";

const MultiRowTable = () => {
  const [form6Data, setForm6Data] = useState([]);
  const [form7Data, setForm7Data] = useState([]);
  const [form8Data, setForm8Data] = useState([]);

  const columnHeaders = [
    { key: "cenhkmd", label: "NW/WPC", subLabel: "CEN/HK/MD" },
    { key: "cenhkmd1", label: "E/Fiber NW/WPC", subLabel: "CEN/HK/MD" },
    { key: "gqkintb", label: "NW/WP N-E", subLabel: "GQ/KI/NTB" },
    { key: "ndfrm", label: "NW/WP S-W", subLabel: "ND/RM" },
    { key: "awho", label: "NW/WP S-E", subLabel: "AW/HO" },
    { key: "konix", label: "NW/WPE", subLabel: "KON/KX" },
    { key: "ngivt", label: "NW/WPN", subLabel: "NG/WT" },
    { key: "kgkly", label: "NW/NWP-E", subLabel: "KG/KLY" },
    { key: "cwpx", label: "NW/NWP-W", subLabel: "CW/PX" },
    { key: "debkymt", label: "NW/CPN", subLabel: "DB/KY/MT" },
    { key: "gphtnw", label: "NW/CPS", subLabel: "GP/HT/NW" },
    { key: "adipr", label: "NW/NCP", subLabel: "AD/PR" },
    { key: "bddwmrg", label: "NW/UVA", subLabel: "BD/BW/MRG" },
    { key: "keirn", label: "NW/SAB", subLabel: "KE/RN" },
    { key: "embmbmh", label: "NW/SPE", subLabel: "EMB/HB/MH" },
    { key: "aggl", label: "NW/SPW", subLabel: "AG/GL" },
    { key: "hrktph", label: "WPS", subLabel: "HR/KT/PH" },
    { key: "bcjrdkltc", label: "NW/EP", subLabel: "BC/AP/KL/TC" },
    { key: "ja", label: "NW/NP-1", subLabel: "JA" },
    { key: "komltmbva", label: "NW/NP-2", subLabel: "KO/MLT/MB/VA" },
  ];

  const fetchData = async () => {
    try {
      const [form6Response, form7Response, form8Response] = await Promise.all([
        axios.get("/form6"),
        axios.get("/form7"),
        axios.get("/form8"),
      ]);

      const fetchedForm6Data = form6Response.data;
      const fetchedForm7Data = form7Response.data;
      const fetchedForm8Data = form8Response.data;

      fetchedForm6Data.forEach((entry) => {
        ["total_minutes", "unavailable_minutes", "total_nodes"].forEach((field) => {
          if (entry[field]) {
            if (entry[field].cenhkmd1 === undefined || entry[field].cenhkmd1 === 0) {
              entry[field].cenhkmd1 = entry[field].cenhkmd;
            }
            if (entry[field].cenhkmd === undefined || entry[field].cenhkmd === 0) {
              entry[field].cenhkmd = entry[field].cenhkmd1;
            }
          }
        });
      });

      setForm6Data(fetchedForm6Data);
      setForm7Data(fetchedForm7Data);
      setForm8Data(fetchedForm8Data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculatePercentage = (totalMinutes, unavailableMinutes, totalNodes) => {
    if (totalMinutes === 0 && unavailableMinutes === 0 && totalNodes === 0) return 100; // Handle special case
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const totalAvailableMinutes = totalMinutes - unavailableMinutes;
    const totalMinutesInMonth = 24 * 60 * daysInMonth * totalNodes;

    if (totalMinutesInMonth === 0) return 0;
    return (100 * totalAvailableMinutes) / totalMinutesInMonth;
  };

  const calculateTotals = (entries, multipliers) => {
    const totals = {};
    columnHeaders.forEach(({ key }) => {
      totals[key] = entries.reduce((sum, entry, index) => {
        const multiplier = multipliers[index] || 1;
        const totalMinutes = entry.total_minutes[key] || 0;
        const unavailableMinutes = entry.unavailable_minutes[key] || 0;
        const totalNodes = entry.total_nodes[key] || 0;
        return sum + calculatePercentage(totalMinutes, unavailableMinutes, totalNodes) * multiplier;
      }, 0);
    });
    return totals;
  };

  const form6Totals = form6Data.length ? calculateTotals(form6Data, [0.05, 0.05, 0.3]) : {};
  const form7Totals = form7Data.length ? calculateTotals(form7Data, [0.02, 0.01, 0.13, 0.17]) : {};
  const form8Totals = form8Data.length ? calculateTotals(form8Data, [0.2, 0.08, 0.3, 0.02]) : {};

  const subTotals = {};
  columnHeaders.forEach(({ key }) => {
    const total = (form6Totals[key] || 0) + (form7Totals[key] || 0) + (form8Totals[key] || 0);
    subTotals[key] = total > 99.899 ? 100 : total.toFixed(2); // Apply threshold logic
  });

  return (
    <div>
      <h3>Final Data Table</h3>
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
              <td key={col.key}>{subTotals[col.key]}%</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MultiRowTable;
//fine code.
