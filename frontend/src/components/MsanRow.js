import React, { useEffect, useState } from "react";
import axios from "axios";

const designationMap = {
  "NW/WPC-1(CEN/HK/MD)": "Eng-NW/WPC-1",
  "NW/WPC-2 (CEN/HK/MD)": "Eng-NW/WPC-2",
  "NW/WPNE": "Eng-NW/WPNE",
  "NW/WPSW": "Eng-NW/WPSW",
  "NW/WPSE": "Eng-NW/WPSE",
  "NW/WPE": "Eng-NW/WPE",
  "NW/WPN": "Eng-NW/WPN",
  "NW/NWPE": "Eng-NW/NWPE",
  "NW/NWPW": "Eng-NW/NWPW",
  "NW/CPN": "Eng-NW/CPN",
  "NW/CPS": "Eng-NW/CPS",
  "NW/NCP": "Eng-NW/NCP",
  "NW/UVA": "Eng-NW/UVA",
  "NW/SAB": "Eng-NW/SAB",
  "NW/SPE": "Eng-NW/SPE",
  "NW/SPW": "Eng-NW/SPW",
  "NW/WPS": "Eng-NW/WPS",
  "NW/EP": "Eng-NW/EP",
  "NW/NP-1": "Eng-NW/NP-1",
  "NW/NP-2": "Eng-NW/NP-2",
};

function pickNumber(obj, keys, fallback = 0) {
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
      const v = parseFloat(obj[k]);
      if (!Number.isNaN(v)) return v;
    }
  }
  return fallback;
}

const MsanRow = ({ columns, columnsAchievedRef, row3Weightage }) => {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/msan-row");
        const data = res?.data || [];
        
        // Filter valid records
        const validRecords = data.filter(
          (x) => x && x.Designation && x.nooffailure !== undefined && x.kpiacheived !== undefined
        );
        
        if (!validRecords.length) {
          console.warn("⚠️ No valid MSAN records found in response");
          setDetails([]);
          return;
        }

        // Try to use current Year/Month if present
        const now = new Date();
        const y = now.getFullYear().toString();
        const m = (now.getMonth() + 1).toString();

        const exact = validRecords.find(
          (x) => (x.Year?.toString?.() === y) && (x.Month?.toString?.() === m)
        );
        
        // If exact match found, get all records from that month; otherwise use all valid records
        const recordsToUse = exact 
          ? validRecords.filter((x) => (x.Year?.toString?.() === y) && (x.Month?.toString?.() === m))
          : validRecords;
        
        setDetails(recordsToUse);
      } catch (err) {
        console.error("❌ Error fetching MSAN row data:", err);
        setDetails([]);
      }
    })();
  }, []);

  if (!details.length) {
    return (
      <tr>
        {columns.map((_, i) => (
          <React.Fragment key={`no-msan-${i}`}>
            <td style={{ textAlign: "center", color: "red" }}>-</td>
            <td></td>
          </React.Fragment>
        ))}
      </tr>
    );
  }

  const wg = typeof row3Weightage === "number" ? row3Weightage : parseFloat(row3Weightage) || 0;
  const wgFrac = wg / 100;

  return (
    <tr key="msan-row">
      {columns.map((col, i) => {
        const designation = designationMap[col];
        const found = details.find((d) => d?.Designation === designation);

        let achieved = 0;
        let achievedWithWg = 0;

        if (found) {
          // Accept common server field spellings
          const failures = pickNumber(found, ["nooffailure", "numoffailure", "no_of_failure"], 0);
          const success  = pickNumber(found, ["kpiacheived", "kpi_achieved", "kpiachieved"], 0);

          if (failures > 0 && success >= 0) {
            achieved = (success / failures) * 100;
            achievedWithWg = achieved * wgFrac;
          }
        }

        // Publish numeric value for Row 11/12
        columnsAchievedRef.current.row3[i] = achievedWithWg || 0;

        return (
          <React.Fragment key={col}>
            <td>{achieved.toFixed(2)}%</td>
            <td>{achievedWithWg.toFixed(2)}%</td>
          </React.Fragment>
        );
      })}
    </tr>
  );
};

export default MsanRow;
