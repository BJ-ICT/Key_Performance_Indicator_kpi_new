// excel ek dala .wde goda
// src/components/FinalTables.js

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import ReactSpeedometer from "react-d3-speedometer"; // Single Speedometer import
import "./finalTables.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProtectedComponent from "./ProtectedComponent ";
import ExcelJS from "exceljs";

// Columns for Platform Distribution & Achievements
const columns = [
  "NW/WPC-1(CEN/HK/MD)",
  "NW/WPC-2 (CEN/HK/MD)",
  "NW/WPNE",
  "NW/WPSW",
  "NW/WPSE",
  "NW/WPE",
  "NW/WPN",
  "NW/NWPE",
  "NW/NWPW",
  "NW/CPN",
  "NW/CPS",
  "NW/NCP",
  "NW/UVA",
  "NW/SAB",
  "NW/SPE",
  "NW/SPW",
  "NW/WPS",
  "NW/EP",
  "NW/NP-1",
  "NW/NP-2",
];

// Mapping column names => DB keys
const columnToKeyMap = {
  "NW/WPC": "cenhkmd",
  "NW/WPNE": "gqkintb",
  "NW/WPSW": "ndfrm",
  "NW/WPSE": "awho",
  "NW/WPE": "konix",
  "NW/WPN": "ngivt",
  "NW/NWPE": "kgkly",
  "NW/NWPW": "cwpx",
  "NW/CPN": "debkymt",
  "NW/CPS": "gphtnw",
  "NW/NCP": "adipr",
  "NW/UVA": "bddwmrg",
  "NW/SAB": "keirn",
  "NW/SPE": "embmbmh",
  "NW/SPW": "aggl",
  "NW/WPS": "hrktph",
  "NW/EP": "bcjrdkltc",
  "NW/NP-1": "ja",
  "NW/NP-2": "komltmbva",
};

// Mapping for ServFulOk keys => final keys
const servFulOkMap = {
  CENHKMD: "cenhkmd",
  CENHKMD1: "cenhkmd1",
  GQKINTB: "gqkintb",
  NDRM: "ndfrm",
  AWHO: "awho",
  KONKX: "konix",
  NGWT: "ngivt",
  KGKLY: "kgkly",
  CWPX: "cwpx",
  DBKYMT: "debkymt",
  GPHTNW: "gphtnw",
  ADPR: "adipr",
  BDBWMRG: "bddwmrg",
  KERN: "keirn",
  EBMHMBH: "embmbmh",
  AGGL: "aggl",
  HRKTPH: "hrktph",
  BCAPKLTC: "bcjrdkltc",
  JA: "ja",
  KOMLTMBVA: "komltmbva",
};

// Multipliers for ServFulOk rows
const servFulOkRowMultipliers = [0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.05, 0.05];

// Helper to parse "12.34%" => 12.34
function parsePct(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace("%", "")) || 0;
}

// Utility Functions
const calcPct = (tm, um, tn) => {
  if (!tm && !um && !tn) return 100;
  const days = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const total = 24 * 60 * days * tn;
  const avail = tm - um;
  return total ? (100 * avail) / total : 0;
};

const calcTotals = (data, mult) => {
  const t = {};
  data.forEach((e, i) => {
    if (e.total_minutes && e.unavailable_minutes && e.total_nodes) {
      const m = mult[i] || 1;
      Object.keys(e.total_minutes).forEach((k) => {
        const pct = calcPct(
          e.total_minutes[k] || 0,
          e.unavailable_minutes[k] || 0,
          e.total_nodes[k] || 0
        );
        t[k] = (t[k] || 0) + pct * m;
      });
    }
  });
  return t;
};

const computePercentages = (f, s) => {
  const p = {};
  columns.forEach((col) => {
    const k = columnToKeyMap[col],
      fv = parseFloat(f?.[k]) || 0,
      sv = parseFloat(s?.[k]) || 0;

    // If both values are 0, set percentage to 100
    if (fv === 0 && sv === 0) {
      p[col] = "100.00";
    } else {
      p[col] = sv ? ((fv / sv) * 100).toFixed(2) : "0.00";
    }
  });
  return p;
};

// Main Component
export default function FinalTables() {
  // States for data
  const [f6, setF6] = useState([]),
    [f7, setF7] = useState([]),
    [f8, setF8] = useState([]);
  const [subs, setSubs] = useState({});
  const [servFulOkRow, setServFulOkRow] = useState({});
  const [kpiRes, setKpiRes] = useState([]),
    [kpiData, setKpiData] = useState([]);
  const [columnSums, setColumnSums] = useState([]);
  const [msanPlaceholders, setMsanPlaceholders] = useState({});
  const [vpnPlaceholders, setVpnPlaceholders] = useState({});
  const [slbnPlaceholders, setSlbnPlaceholders] = useState({});
  const [averagePlaceholder, setAveragePlaceholder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state

  // States for row #5, #6, #7, #10 weightages
  const [sumRowWeightage, setSumRowWeightage] = useState(0);
  const [currentMonthWeightage, setCurrentMonthWeightage] = useState(0);
  const [servFulOkWeightage, setServFulOkWeightage] = useState(0);
  const [finalDataRowWeightage, setFinalDataRowWeightage] = useState(0);

  // State for Total Weightage from KPI Table
  const [totalWeight, setTotalWeight] = useState(0);

  // States for Threshold Values
  const [threshold1, setThreshold1] = useState(null); // For Row 1
  const [threshold2, setThreshold2] = useState(null); // For Row 2
  const [threshold3, setThreshold3] = useState(null); // For Row 3
  const [threshold5, setThreshold5] = useState(99.899); // For Row 5
  const [threshold95, setThreshold95] = useState(95); // For Row 10
  const [threshold90, setThreshold90] = useState(90); // For Row 7

  // New State: Achieved KPI with Weightage
  const [achievedKpiWithWeightage, setAchievedKpiWithWeightage] = useState({
    row1: 0,
    row2: 0,
    row3: 0,
    row5: 0,
    row6: 0,
    row7: 0,
    row10: 0,
  });

  /**
   * We'll track the "Achieved KPI with Weightage" for each column of rows #1, #2, #5, #6, #7, #10.
   * columnsAchievedRef.current will be an object like:
   * {
   *   row1: [12.3, 45.6, ...],   // length = columns.length
   *   row2: [...],
   *   row5: [...],
   *   row6: [...],
   *   row7: [...],
   *   row10: [...]
   * }
   */
  const columnsAchievedRef = useRef({
    row1: Array(columns.length).fill(0),
    row2: Array(columns.length).fill(0),
    row3: Array(columns.length).fill(0),
    row5: Array(columns.length).fill(0),
    row6: Array(columns.length).fill(0),
    row7: Array(columns.length).fill(0),
    row10: Array(columns.length).fill(0),
  });

  // ============= Fetching form6, form7, form8 => subTotals =============
  useEffect(() => {
    setLoading(true); // Start loading
    (async () => {
      try {
        const [r6, r7, r8] = await Promise.all([
          axios.get("/form6"),
          axios.get("/form7"),
          axios.get("/form8"),
        ]);
        const d6 = r6.data,
          d7 = r7.data,
          d8 = r8.data;
        d6.forEach((e) => {
          ["total_minutes", "unavailable_minutes", "total_nodes"].forEach(
            (f) => {
              if (e[f]) {
                if (!e[f].cenhkmd || e[f].cenhkmd === 0)
                  e[f].cenhkmd = e[f].cenhkmd1 || e[f].cenhkmd;
                if (!e[f].cenhkmd1 || e[f].cenhkmd1 === 0)
                  e[f].cenhkmd1 = e[f].cenhkmd;
              }
            }
          );
        });
        setF6(d6);
        setF7(d7);
        setF8(d8);
      } catch (err) {
        console.error("Error fetching f6,7,8:", err);
        setError("Failed to load table data. Please try again later.");
      } finally {
        setLoading(false); // End loading
      }
    })(); // Note the () here to call the async function
  }, []);

  useEffect(() => {
    if (!f6.length && !f7.length && !f8.length) return;
    const t6 = calcTotals(f6, [0.05, 0.05, 0.3]);
    const t7 = calcTotals(f7, [0.02, 0.01, 0.13, 0.17]);
    const t8 = calcTotals(f8, [0.2, 0.08, 0.3, 0.02]);
    const all = new Set([
      ...Object.keys(t6),
      ...Object.keys(t7),
      ...Object.keys(t8),
    ]);
    const tmp = {};
    all.forEach((k) => {
      const s = (t6[k] || 0) + (t7[k] || 0) + (t8[k] || 0);
      tmp[k] = s > threshold5 ? 100 : parseFloat(s.toFixed(2));
    });
    setSubs(tmp);
    console.log("Subs calculated:", tmp);
  }, [f6, f7, f8, threshold5]);

  // ============= Fetching form4 => ServFulOk row =============
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/form4");
        const totals = {};
        [
          "CENHKMD",
          "CENHKMD1",
          "GQKINTB",
          "NDRM",
          "AWHO",
          "KONKX",
          "NGWT",
          "KGKLY",
          "CWPX",
          "DBKYMT",
          "GPHTNW",
          "ADPR",
          "BDBWMRG",
          "KERN",
          "EBMHMBH",
          "AGGL",
          "HRKTPH",
          "BCAPKLTC",
          "JA",
          "KOMLTMBVA",
        ].forEach((key, i) => {
          totals[key] = data.slice(0, 8).reduce((sum, row, idx) => {
            const val = parseFloat(row[key]) || 0;
            return sum + val * servFulOkRowMultipliers[idx];
          }, 0);
        });

        // **Map the keys to lowercase using servFulOkMap**
        const adjustedMapped = {};
        Object.keys(totals).forEach((k) => {
          const mappedKey = servFulOkMap[k] || k.toLowerCase();
          const v = totals[k];
          adjustedMapped[mappedKey] =
            v > threshold90 ? "100%" : `${v.toFixed(2)}%`;
        });

        setServFulOkRow(adjustedMapped);

        console.log("Adjusted ServFulOkRow:", adjustedMapped);
      } catch (err) {
        console.error("Error fetching form4:", err);
      }
    })();
  }, [threshold90]);

  // ============= Fetching form9 => kpiRes & final-data => kpiData =============
  useEffect(() => {
    (async () => {
      try {
        const [form9Res, finalRes] = await Promise.all([
          axios.get("/form9"),
          axios.get("/api/final-data"),
        ]);
        const form9 = form9Res.data;
        const final = finalRes.data;

        const findK = (n, k) =>
          (Array.isArray(form9)
            ? form9.find((x) => x.no === n && x.network_engineer_kpi === k)
            : Object.values(form9).find(
                (x) => x.no === n && x.network_engineer_kpi === k
              )) || null;

        const k12 = findK(12, "Fiber Failures Restoration(General): <4 Hrs");
        const k13 = findK(
          13,
          "Fiber Failures Restoration(Large scale< Pole damages etc>): <8 Hrs"
        );
        const arr = [];

        if (k12) {
          const { Total_Failed_Links, Links_SLA_Not_Violated, kpi_percent } =
            k12;
          arr.push({
            kpiName: k12.network_engineer_kpi,
            kpiPercent: kpi_percent,
            percentages: computePercentages(
              Total_Failed_Links,
              Links_SLA_Not_Violated
            ),
          });
        }
        if (k13) {
          const { Total_Failed_Links, Links_SLA_Not_Violated, kpi_percent } =
            k13;
          arr.push({
            kpiName: k13.network_engineer_kpi,
            kpiPercent: kpi_percent,
            percentages: computePercentages(
              Total_Failed_Links,
              Links_SLA_Not_Violated
            ),
          });
        }
        setKpiRes(arr);
        console.log("KPI Results:", arr);

        // ======== SORT kpiData BY rowNumber ASC ========
        const sortedFinal = (final || []).sort((a, b) => {
          const aNum =
            a.rowNumber !== undefined ? a.rowNumber : Number.MAX_SAFE_INTEGER;
          const bNum =
            b.rowNumber !== undefined ? b.rowNumber : Number.MAX_SAFE_INTEGER;
          return aNum - bNum;
        });
        setKpiData(sortedFinal);
        console.log("KPI Data:", sortedFinal);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
      }
    })();
  }, []);

  // Once kpiData is in => parse row#1,2,5,6,7,10 weightages and calculate totalWeight
  useEffect(() => {
    if (!kpiData.length) return;
    // Define which rows to sum (only rows #1,2,5,6,7,10)
    const rowsToSum = [1, 2, 4, 5, 6, 7, 10];
    const totalWeightCalc = kpiData
      .filter(
        (item) =>
          rowsToSum.includes(item.rowNumber) || rowsToSum.includes(item.no)
      )
      .reduce((acc, item) => {
        const rawStr = item.weightage || "0";
        const numeric = parseFloat(String(rawStr).replace("%", "")) || 0;
        return acc + numeric;
      }, 0);
    setTotalWeight(totalWeightCalc);
    console.log("Total Weightage:", totalWeightCalc);

    // Extract individual row weightages
    const row10 = kpiData.find((o) => o.rowNumber === 10 || o.no === 10);
    if (row10) {
      const w10 = parseFloat(row10.weightage || "0") / 100;
      setSumRowWeightage(w10);
    }
    const row6 = kpiData.find((o) => o.rowNumber === 6 || o.no === 6);
    if (row6) {
      const w6 = parseFloat(row6.weightage || "0") / 100;
      setCurrentMonthWeightage(w6);
    }
    const row7 = kpiData.find((o) => o.rowNumber === 7 || o.no === 7);
    if (row7) {
      const w7 = parseFloat(row7.weightage || "0") / 100;
      setServFulOkWeightage(w7);

      // **Extract threshold90 from row #7's descriptionOfKPI**
      if (row7.descriptionOfKPI) {
        const match90 = row7.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
        if (match90 && match90[1] && !isNaN(match90[1])) {
          const extractedThreshold90 = parseFloat(match90[1]);
          setThreshold90(extractedThreshold90);
          console.log("Extracted threshold90:", extractedThreshold90);
        } else {
          console.warn(
            "Failed to extract threshold90 from Row #7's descriptionOfKPI"
          );
        }
      }
    }
    const row5 = kpiData.find((o) => o.rowNumber === 5 || o.no === 5);
    if (row5) {
      const w5 = parseFloat(row5.weightage || "0") / 100;
      setFinalDataRowWeightage(w5);

      // **Extract threshold5 from Row #5's descriptionOfKPI**
      const match5 = row5.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match5 && match5[1] && !isNaN(match5[1])) {
        const extractedThreshold5 = parseFloat(match5[1]);
        setThreshold5(extractedThreshold5);
        console.log("Extracted threshold5:", extractedThreshold5);
      } else {
        console.warn(
          "Failed to extract threshold5 from Row #5's descriptionOfKPI"
        );
      }
    }

    // **Extract threshold1 from Row #1's descriptionOfKPI**
    const row1 = kpiData.find((o) => o.rowNumber === 1 || o.no === 1);
    if (row1 && row1.descriptionOfKPI) {
      const match1 = row1.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match1 && match1[1] && !isNaN(match1[1])) {
        const extractedThreshold1 = parseFloat(match1[1]);
        setThreshold1(extractedThreshold1);
        console.log("Extracted threshold1:", extractedThreshold1);
      } else {
        console.warn(
          "Failed to extract threshold1 from Row #1's descriptionOfKPI"
        );
      }
    }

    // **Extract threshold3 from Row #3's descriptionOfKPI**
    const row3 = kpiData.find((o) => o.rowNumber === 3 || o.no === 3);
    if (row3 && row3.descriptionOfKPI) {
      const match3= row3.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match3&& match3[1] && !isNaN(match3[1])) {
        const extractedThreshold3 = parseFloat(match3[1]);
        setThreshold3(extractedThreshold3);
        console.log("Extracted threshold3:", extractedThreshold3);
      } else {
        console.warn(
          "Failed to extract threshold3 from Row #3's descriptionOfKPI"
        );
      }
    }

    // **Extract threshold2 from Row #2's descriptionOfKPI**
    const row2 = kpiData.find((o) => o.rowNumber === 2 || o.no === 2);
    if (row2 && row2.descriptionOfKPI) {
      const match2 = row2.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match2 && match2[1] && !isNaN(match2[1])) {
        const extractedThreshold2 = parseFloat(match2[1]);
        setThreshold2(extractedThreshold2);
        console.log("Extracted threshold2:", extractedThreshold2);
      } else {
        console.warn(
          "Failed to extract threshold2 from Row #2's descriptionOfKPI"
        );
      }
    }
  }, [kpiData]);

  // ============= ProcessedData => columnSums => CurrentMonth row =============
  useEffect(() => {
    (async () => {
      try {
        const [dynRes, kpiTowerRes] = await Promise.all([
          axios.get("/api/ProcessedDataFetch1"),
          axios.get("/api/kpi-tower"),
        ]);
        const dd = dynRes.data || [];
        if (!dd.length) return;

        const extractedHeaders = dd[0].details.map((d) => d.Column1),
          currentMonth = new Date().toLocaleString("default", {
            month: "long",
          }),
          specialMonths = ["March", "June", "September", "December"];
        let selMonths = [];
        if (currentMonth === "March")
          selMonths = ["January", "February", "March"];
        else if (currentMonth === "June") selMonths = ["April", "May", "June"];
        else if (currentMonth === "September")
          selMonths = ["July", "August", "September"];
        else if (currentMonth === "December")
          selMonths = ["October", "November", "December"];

        const calcVals = [];
        extractedHeaders.forEach((hdr) => {
          if (!specialMonths.includes(currentMonth)) {
            // If not one of those special months, default to 100.00
            calcVals.push("100.00");
          } else {
            let totalAch = 0,
              totalDist = 0;
            dd.forEach((m) => {
              if (selMonths.includes(m.month)) {
                const colItem = m.details.find((x) => x.Column1 === hdr);
                if (colItem) {
                  totalAch += parseFloat(colItem.Column3) || 0;
                  totalDist += parseFloat(colItem.Column2) || 0;
                }
              }
            });
            const pct =
              totalDist > 0
                ? ((totalAch / totalDist) * 100).toFixed(2)
                : "0.00";
            calcVals.push(pct);
          }
        });

        // WeightedRows => optional logic
        const allK = kpiTowerRes.data || [];
        const wArr = allK.slice(0, 3).map((o) => parseFloat(o.weightage || 0));
        const weightedRows = wArr.map((wg) =>
          calcVals.map((cv) => (((parseFloat(cv) || 0) * wg) / 100).toFixed(2))
        );

        const numCols = calcVals.length,
          sumArr = new Array(numCols).fill(0);
        weightedRows.forEach((row) => {
          row.forEach((val, i) => {
            sumArr[i] += parseFloat(val) || 0;
          });
        });
        const finalSum = sumArr.map((sum) => sum.toFixed(2));

        const headerMap = {};
        extractedHeaders.forEach((h, i) => {
          headerMap[h] = i;
        });
        const finalSums = columns.map((col) => {
          const idx = headerMap[col];
          return typeof idx === "number" && idx >= 0 ? finalSum[idx] : "0.00";
        });

        // For eFiberVal, we just re-use finalSums[0] for display duplication
        const eFiberVal = finalSums[0];
        setColumnSums([...finalSums, eFiberVal]);
        console.log("Column Sums:", finalSums, eFiberVal);
      } catch (err) {
        console.error("Error CurrentMonth data:", err);
      }
    })();
  }, []);

  // ============= msan/vpn/slbn => averagePlaceholder =============
  useEffect(() => {
    (async () => {
      try {
        const [msanRes, vpnRes, slbnRes] = await Promise.all([
          axios.get("/api/multi-table/fetchMsan"),
          axios.get("/api/multi-table/fetchVpn"),
          axios.get("/api/multi-table/fetchSlbn"),
        ]);

        const calcPlaceholder = (data, months) => {
          const res = {};
          columns.forEach((col) => {
            let totalAch = 0,
              totalDist = 0;
            months.forEach((mnth) => {
              const found = data.find((e) => e.month === mnth);
              if (found && found.details) {
                try {
                  const arr = found.details;
                  const cItem = arr.find((x) => x.Column1 === col);
                  if (cItem) {
                    totalAch += parseFloat(cItem.Column3) || 0;
                    totalDist += parseFloat(cItem.Column2) || 0;
                  }
                } catch (e) {
                  console.warn("Error parse:", e);
                }
              }
            });
            res[col] =
              totalDist > 0
                ? ((totalAch / totalDist) * 100).toFixed(2)
                : "0.00";
          });
          return res;
        };

        const msan = msanRes.data || [],
          vpn = vpnRes.data || [],
          slbn = slbnRes.data || [];

        // Here, you can tweak months as needed. For example:
        const msanPl = calcPlaceholder(msan, ["March", "April"]);
        const vpnPl = calcPlaceholder(vpn, ["March", "April"]);
        const slbnPl = calcPlaceholder(slbn, ["March", "April"]);

        console.log("MSAN Placeholders:", msanPl);
        console.log("VPN Placeholders:", vpnPl);
        console.log("SLBN Placeholders:", slbnPl);

        setMsanPlaceholders(msanPl);
        setVpnPlaceholders(vpnPl);
        setSlbnPlaceholders(slbnPl);

        // Compute final averagePlaceholder
        const averagePl = {};
        columns.forEach((col) => {
          const mVal = parseFloat(msanPl[col]) || 0;
          const vVal = parseFloat(vpnPl[col]) || 0;
          const sVal = parseFloat(slbnPl[col]) || 0;

          // If all three are zero, default to "100.00"
          if (mVal === 0 && vVal === 0 && sVal === 0) {
            averagePl[col] = "100.00";
          } else {
            const rawAvg = (mVal + vVal + sVal) / 3;
            // If > 95 => "100.00", else rawAvg.toFixed(2)
            averagePl[col] =
              rawAvg > threshold95 ? "100.00" : rawAvg.toFixed(2);
          }
        });
        setAveragePlaceholder(averagePl);
        console.log("Average Placeholder:", averagePl);
      } catch (e) {
        console.error("Error fetching MSAN/VPN/SLBN:", e);
      }
    })();
  }, [threshold95]);

  // ==================== Compute Achieved KPI with Weightage ====================
  useEffect(() => {
    if (
      !kpiRes.length ||
      !subs ||
      !averagePlaceholder ||
      !servFulOkRow ||
      !columnSums.length
    )
      return;

    // Row #1 and #2: KPI Rows with dynamic thresholds
    const row1 = kpiRes[0]
      ? rAchievedW(
          kpiRes[0].percentages["NW/WPC"],
          threshold1,
          parseFloat(
            kpiData.find(
              (item) => item.no === (kpiRes[0].no || kpiRes[0].rowNumber)
            )?.weightage
          ) || 0
        )
      : 0;

    const row2 = kpiRes[1]
      ? rAchievedW(
          kpiRes[1].percentages["NW/WPC"],
          threshold2,
          parseFloat(
            kpiData.find(
              (item) => item.no === (kpiRes[1].no || kpiRes[1].rowNumber)
            )?.weightage
          ) || 0
        )
      : 0;

    const row3 = kpiRes[3]
      ? rAchievedW(
          kpiRes[3].percentages["NW/WPC"],
          threshold3,
          parseFloat(
            kpiData.find(
              (item) => item.no === (kpiRes[3].no || kpiRes[3].rowNumber)
            )?.weightage
          ) || 0
        )
      : 0;

    // Row #5
    const row5 = rFinalDataRowWithWeightage(
      subs.cenhkmd ? parseFloat(subs.cenhkmd).toFixed(2) : 0
    );

    // Row #6 => Using the averagePlaceholder
    const row6 = rCurrentMonthWithWeightage(
      parseFloat(averagePlaceholder["NW/WPC"]) || 0
    );

    // Row #7
    const row7 = rServFulOkWithWeightage(
      parseFloat(servFulOkRow["cenhkmd"]) || 0
    );

    // Row #10
    const row10 = rSumRowWithWeightage(
      parseFloat(columnSums[columnSums.length - 1]) || 0
    );

    setAchievedKpiWithWeightage({
      row1: parseFloat(row1),
      row2: parseFloat(row2),
      row3: parseFloat(row3),
      row5: parseFloat(row5),
      row6: parseFloat(row6),
      row7: parseFloat(row7),
      row10: parseFloat(row10),
    });
    console.log("Achieved KPI with Weightage:", {
      row1: parseFloat(row1),
      row2: parseFloat(row2),
      row3: parseFloat(row3),
      row5: parseFloat(row5),
      row6: parseFloat(row6),
      row7: parseFloat(row7),
      row10: parseFloat(row10),
    });
  }, [
    kpiRes,
    subs,
    averagePlaceholder,
    servFulOkRow,
    columnSums,
    kpiData,
    threshold1,
    threshold2,
    threshold3,
  ]);

  // ============= Render Helpers for Achieved KPI calculations =============
  const rAchieved = (val, threshold) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    if (threshold !== null && n > threshold) {
      n = 100;
    }
    return n.toFixed(2) + "%";
  };

  const rAchievedW = (val, threshold, wg) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    if (threshold !== null && n > threshold) {
      n = 100;
    }
    let c;
    if (threshold !== null && n < threshold) {
      // partial weighting if not meeting threshold
      c = (n / 100 / (threshold / 100)) * wg;
    } else {
      c = (n / 100) * wg;
    }
    return c.toFixed(2) + "%";
  };

  const rFinalDataRowWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    let result;
    if (n < threshold5 / 100)
      result = (n / (threshold5 / 100)) * finalDataRowWeightage;
    else result = n * finalDataRowWeightage;
    return result.toFixed(2) + "%";
  };

  const rCurrentMonthWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    return (n * currentMonthWeightage).toFixed(2) + "%";
  };

  const rServFulOkWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    let result;
    // If it's below threshold90, partial weighting
    if (n < threshold90) result = (n / 100) * servFulOkWeightage * 100;
    else result = n * servFulOkWeightage;
    return result.toFixed(2) + "%";
  };

  const rSumRowWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    return (n * sumRowWeightage).toFixed(2) + "%";
  };

  // ============= Rows for the main table =============

  // 1) KPI Rows (#1, #2,#3)
  const renderKpiRow = (kpiItem, rowIndex) => {
    if (!kpiItem) return null;

    let threshold;
    let rowKey = "";
    if (rowIndex === 1) {
      threshold = threshold1;
      rowKey = "row1";
    } else if (rowIndex === 2) {
      threshold = threshold2;
      rowKey = "row2";
    } else if (rowIndex === 3) {
      threshold = threshold3;
      rowKey = "row3";
    } else {
      threshold = null;
    }

    if (
      (rowIndex === 1 || rowIndex === 2 || rowIndex === 3) &&
      threshold === null
    ) {
      return null;
    }

    const wpcVal = kpiItem.percentages["NW/WPC"] || "0.00";
    const wg =
      parseFloat(
        kpiData.find((item) => item.no === (kpiItem.no || kpiItem.rowNumber))
          ?.weightage
      ) || 0;
    const achWpc = rAchievedW(wpcVal, threshold, wg);

    // Compute per-column "Achieved KPI with Weightage"
    const colArr = columns.map((col) => {
      const val = kpiItem.percentages[col] || "0.00";
      return rAchievedW(val, threshold, wg);
    });

    // Also store these per-column numeric values into columnsAchievedRef
    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current[rowKey][i] =
        parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key={kpiItem.kpiName}>
        <td></td>

        {columns.map((col, i) => {
          const val = kpiItem.percentages[col] || "0.00";
          return (
            <React.Fragment key={col}>
              <td>{rAchieved(val, threshold)}</td>
              <td>{colArr[i]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // Row #5 => Final Data Row
  const renderFinalDataRow = () => {
    if (!Object.keys(subs).length) return null;

    // E/Fiber NW/WPC's Achieved KPI with Weightage
    const eFiberAch = rFinalDataRowWithWeightage(
      subs.cenhkmd ? parseFloat(subs.cenhkmd).toFixed(2) : 0
    );

    // Per-column "Achieved KPI with Weightage"
    const colArr = columns.map((col) => {
      const k = columnToKeyMap[col];
      const val = (subs[k] || 0).toFixed(2);
      return rFinalDataRowWithWeightage(val);
    });

    // Store in columnsAchievedRef => row5
    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row5[i] =
        parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="final-data-row">
        <td></td>

        {columns.map((col, i) => {
          const k = columnToKeyMap[col];
          const numericVal = subs[k] || 0;
          const strVal = numericVal.toFixed(2);
          return (
            <React.Fragment key={col}>
              <td>{strVal + "%"}</td>
              <td>{colArr[i]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // Row #6 => Average Row
  const renderAverageRow = () => {
    if (!Object.keys(averagePlaceholder).length) return null;

    const nwWpcAverage = averagePlaceholder["NW/WPC"] || "0.00";
    const nwWpcAchieved = rCurrentMonthWithWeightage(
      parseFloat(nwWpcAverage) || 0
    );

    // Per-column "Achieved KPI with Weightage"
    const colArr = columns.map((col) => {
      const val = averagePlaceholder[col] || "0.00";
      return rCurrentMonthWithWeightage(parseFloat(val) || 0);
    });

    // Store in columnsAchievedRef => row6
    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row6[i] =
        parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="average-row">
        <td></td>

        {columns.map((col, i) => {
          const val = averagePlaceholder[col] || "0.00";
          return (
            <React.Fragment key={col}>
              <td>{val + "%"}</td>
              <td>{colArr[i]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // Row #7 => ServFulOk Row
  const renderServFulOkRow = () => {
    if (!Object.keys(servFulOkRow).length) return null;

    console.log("Rendering ServFulOk Row with servFulOkRow:", servFulOkRow);

    const eFiberRaw = servFulOkRow["cenhkmd"]
      ? parseFloat(servFulOkRow["cenhkmd"]) || 0
      : 0;
    const eFiberAch = rServFulOkWithWeightage(eFiberRaw);

    // Per-column
    const colArr = columns.map((col) => {
      const key = columnToKeyMap[col];
      const val = servFulOkRow[key] ? parseFloat(servFulOkRow[key]) || 0 : 0;
      return rServFulOkWithWeightage(val);
    });

    // Store in columnsAchievedRef => row7
    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row7[i] =
        parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="servfulok-row">
        <td></td>

        {columns.map((col, i) => {
          const key = columnToKeyMap[col];
          const rawVal = servFulOkRow[key]
            ? parseFloat(servFulOkRow[key]) || 0
            : 0;
          console.log(`Column: ${col}, Key: ${key}, Value: ${rawVal}`);
          return (
            <React.Fragment key={col}>
              <td>{rawVal.toFixed(2) + "%"}</td>
              <td>{colArr[i]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // Row #10 => CurrentMonth Row
  const renderCurrentMonthRow = () => {
    if (!columnSums.length) return null;
    const eFiberVal = columnSums[columnSums.length - 1] || "0.00";
    const eFiberAch = rSumRowWithWeightage(parseFloat(eFiberVal) || 0);

    // Per-column
    const colArr = columns.map((c, i) => {
      const val = columnSums[i] || "0.00";
      return rSumRowWithWeightage(parseFloat(val) || 0);
    });

    // Store in columnsAchievedRef => row10
    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row10[i] =
        parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="current-month-row">
        <td></td>

        {columns.map((col, i) => {
          const val = columnSums[i] || "0.00";
          return (
            <React.Fragment key={col}>
              <td>{val + "%"}</td>
              <td>{colArr[i]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // 11) Sum of all Achieved KPI with Weightage => PER COLUMN
  const renderSumOfAchievedKpiWithWeightageRow = () => {
    // We'll sum per column across rows #1, #2, #5, #6, #7, #10
    const rowKeys = ["row1", "row2", "row5", "row6", "row7", "row10"];

    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach((rk) => {
        sum += columnsAchievedRef.current[rk][i] || 0;
      });
      return sum;
    });

    const eFiberSum = colSums[0].toFixed(2) + "%";

    return (
      <tr key="sum-of-achievedKpiWithWeightage">
        <td></td>

        {colSums.map((colVal, i) => (
          <React.Fragment key={columns[i]}>
            <td></td>
            <td style={{ fontWeight: "bold" }}>{colVal.toFixed(2) + "%"}</td>
          </React.Fragment>
        ))}
      </tr>
    );
  };

  // 12) (Sum from row #11 / totalWeight) * 100
  const render12thRowDividedByKpiWeightage = () => {
    const rowKeys = ["row1", "row2", "row5", "row6", "row7", "row10"];

    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach((rk) => {
        sum += columnsAchievedRef.current[rk][i] || 0;
      });
      return sum;
    });

    const efVal = totalWeight
      ? ((colSums[0] / totalWeight) * 100).toFixed(2) + "%"
      : "0.00%";

    return (
      <tr key="12th-row-divided">
        <td></td>

        {colSums.map((val, i) => {
          let finalVal = "0.00%";
          if (totalWeight) {
            finalVal = ((val / totalWeight) * 100).toFixed(2) + "%";
          }
          return (
            <React.Fragment key={columns[i]}>
              <td></td>
              <td style={{ fontWeight: "bold" }}>{finalVal}</td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  // KPI Table helpers
  const renderKpiWeightageSumRow = () => {
    if (!kpiData.length) return null;
    const rowsToSum = [1, 2, 4, 5, 6, 7, 10];
    const totalWeightCalc = kpiData
      .filter(
        (item) =>
          rowsToSum.includes(item.rowNumber) || rowsToSum.includes(item.no)
      )
      .reduce((acc, item) => {
        const rawStr = item.weightage || "0";
        const numeric = parseFloat(String(rawStr).replace("%", "")) || 0;
        return acc + numeric;
      }, 0);
    return (
      <tr key="kpi-weightage-sum-row" style={{ backgroundColor: "#f5f5f5" }}>
        <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
          Weightage
        </td>
        <td style={{ fontWeight: "bold" }}>
          {totalWeightCalc.toFixed(2) + "%"}
        </td>
      </tr>
    );
  };

  const renderKpiSubWeightageSumRow = () => {
    return (
      <tr key="kpi-sub-weightage-row" style={{ backgroundColor: "#f5f5f5" }}>
        <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
          Total Weightage
        </td>
        <td style={{ fontWeight: "bold" }}>100%</td>
      </tr>
    );
  };

  // =====================
  // Speedometers for 12th row
  // =====================
  const [row12Data, setRow12Data] = useState([]);
  useEffect(() => {
    const rowKeys = ["row1", "row2", "row3", "row5", "row6", "row7", "row10"];
    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach((rk) => {
        sum += columnsAchievedRef.current[rk][i] || 0;
      });
      return sum;
    });
    const finalValues = colSums.map((val) => {
      if (totalWeight) {
        return ((val / totalWeight) * 100).toFixed(2);
      }
      return "0.00";
    });
    setRow12Data(finalValues);
    console.log("Row12 Data for Speedometers:", finalValues);
  }, [achievedKpiWithWeightage, totalWeight]);

  /////////////////////////////////////////////////

  // Convert a KPI row to an array
  const renderKpiRowAsArray = (row, index) => {
    return [
      index,
      row.perspectives || "-",
      row.strategicObjectives || "-",
      row.keyPerformanceIndicators || "-",
      row.unit || "-",
      row.descriptionOfKPI || "-",
      `${row.weightage || "-"}%`,
    ];
  };

  // Final Data Row as Array
  const renderFinalDataRowAsArray = () => {
    return [
      "Final Data",
      "Value1",
      "Value2",
      "Value3",
      "Value4",
      "Value5",
      "Value6",
    ];
  };

  // Average Row as Array
  const renderAverageRowAsArray = () => {
    return ["Average Row", "Avg1", "Avg2", "Avg3", "Avg4", "Avg5", "Avg6"];
  };

  // Service Fulfillment OK Row
  const renderServFulOkRowAsArray = () => {
    return [
      "Service Fulfillment OK",
      "Val1",
      "Val2",
      "Val3",
      "Val4",
      "Val5",
      "Val6",
    ];
  };

  // Current Month Row as Array
  const renderCurrentMonthRowAsArray = () => {
    return [
      "Current Month",
      "Curr1",
      "Curr2",
      "Curr3",
      "Curr4",
      "Curr5",
      "Curr6",
    ];
  };

  // Sum of Achieved KPI Row
  const renderSumOfAchievedKpiWithWeightageRowAsArray = () => {
    return [
      "Sum of Achieved KPI",
      "Sum1",
      "Sum2",
      "Sum3",
      "Sum4",
      "Sum5",
      "Sum6",
    ];
  };

  // 12th Row Divided by KPI Weightage
  const render12thRowDividedByKpiWeightageAsArray = () => {
    return ["12th Row Divided", "Div1", "Div2", "Div3", "Div4", "Div5", "Div6"];
  };

  // const exportToExcel = () => {
  //   // Create a new workbook
  //   const workbook = XLSX.utils.book_new();

  //   // Prepare data for KPI Table
  //   const kpiTableData = [
  //     ["#", "Perspectives", "Strategic Objectives (KRA)", "Key Performance Indicators (KPI)", "Unit", "Description of KPI", "Weightage"],
  //     ...kpiData.map((row) => [
  //       row.rowNumber || "-",
  //       row.perspectives || "-",
  //       row.strategicObjectives || "-",
  //       row.keyPerformanceIndicators || "-",
  //       row.unit || "-",
  //       row.descriptionOfKPI || "-",
  //       `${row.weightage || "-"}%`,
  //     ]),
  //   ];

  //   // Add KPI Table to the workbook
  //   const kpiSheet = XLSX.utils.aoa_to_sheet(kpiTableData);
  //   XLSX.utils.book_append_sheet(workbook, kpiSheet, "KPI Table");

  //   // Prepare data for Final Distribution Table
  //   const finalTableHeader = [
  //     ["R-GM", "Metro", "Metro", "Region 1", "Region 1", "Region 2", "Region 2", "Region 3"],
  //     ["P-DGM", "Metro 1", "Metro 2", "WPN & NWP", "CP & NCP", "SAB & UVA", "WPS & SP", "EP"],
  //     ["NW EE", "E/Fiber NW/WPC", ...columns.flatMap((col) => [col, col])],
  //     ["RTOM AREA", "Achieved KPI", "Achieved KPI with Weightage", ...columns.flatMap(() => ["Achieved KPI", "Achieved KPI with Weightage"])],
  //   ];

  //   const finalTableData = [
  //     ...finalTableHeader,
  //     // Add dynamic rows here based on your frontend rendering logic
  //     ...kpiRes.map((res, index) => renderKpiRowAsArray(res, index + 1)), // Ensure `renderKpiRowAsArray` converts your row data to an array
  //     [], // Empty rows for spacing
  //     renderFinalDataRowAsArray(),
  //     renderAverageRowAsArray(),
  //     renderServFulOkRowAsArray(),
  //     renderCurrentMonthRowAsArray(),
  //     renderSumOfAchievedKpiWithWeightageRowAsArray(),
  //     render12thRowDividedByKpiWeightageAsArray(),
  //   ];

  //   // Add Final Distribution Table to the workbook
  //   const finalTableSheet = XLSX.utils.aoa_to_sheet(finalTableData);
  //   XLSX.utils.book_append_sheet(workbook, finalTableSheet, "Final Distribution Table");

  //   // Save the workbook
  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "Maintenance_Tables.xlsx");
  // };

  // Helper function to clean percentage values
  // Helper function to clean percentage values
  const cleanPercentageValue = (value) => {
    if (!value) return "-";
    const numValue = parseFloat(String(value).replace("%", ""));
    return isNaN(numValue) ? "-" : `${numValue.toFixed(2)}%`;
  };



  const exportToExcel = () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Prepare static KPI Table data
    const kpiTableHeader = [
      [
        "#",
        "Perspectives",
        "Strategic Objectives (KRA)",
        "Key Performance Indicators (KPI)",
        "Unit",
        "Description of KPI",
        "Weightage",
      ],
    ];
    const kpiTableRows = [
      ...kpiData
        .filter((row) => ![4, 8, 9].includes(row.rowNumber || row.no))
        .map((row) => [
        row.rowNumber || "-",
        row.perspectives || "-",
        row.strategicObjectives || "-",
        row.keyPerformanceIndicators || "-",
        row.unit || "-",
        row.descriptionOfKPI || "-",
        cleanPercentageValue(row.weightage),
      ]),
      ["", "", "", "", "", "Weigh", cleanPercentageValue(totalWeight)],
      ["", "", "", "", "", "Total Weightage", "100%"],
    ];

    // Prepare headers for the dynamic table (right side)
    const dynamicTableHeader = [
      [
        "R-GM",
        "Metro",
        ...Array(12).fill("Metro"),
        "Region 1",
        ...Array(12).fill("Region 1"),
        "Region 2",
        ...Array(10).fill("Region 2"),
        "Region 3",
        ...Array(2).fill("Region 3"),
      ],
      [
        "P-DGM",
        ...Array(6).fill("Metro 1"),
        ...Array(6).fill("Metro 2"),
        ...Array(6).fill("WPN & NWP"),
        ...Array(6).fill("CP & NCP"),
        ...Array(4).fill("SAB & UVA"),
        ...Array(6).fill("WPS & SP"),
        ...Array(2).fill("EP"),
        ...Array(4).fill("NP"),
      ],
      ["NW EE", ...columns.flatMap((col) => [col, col])],
      [
        "RTOM AREA",
        ...columns.flatMap(() => [
          "Achieved KPI",
          "Achieved KPI with Weightage",
        ]),
      ],
    ];

    // Prepare dynamic rows to match static table row indices
    const staticRowNumbers = kpiData
      .filter((row) => ![4, 8, 9].includes(row.rowNumber || row.no))
      .map((row) => row.rowNumber || row.no);

    // Build dynamicTableRows with correct alignment
    const dynamicTableRows = staticRowNumbers.map((rowNum, idx) => {
      // Row 1 and 2: KPI rows
      if (rowNum === 1 || rowNum === 2) {
        const kpiItem = kpiRes[rowNum - 1];
        if (!kpiItem) return [];
        const threshold = rowNum === 1 ? threshold1 : rowNum === 2 ? threshold2 : rowNum === 3 ? threshold3 : null;
        const wpcVal = kpiItem.percentages["NW/WPC"] || "0.00";
        const wg =
          parseFloat(
            kpiData.find((item) => item.no === (kpiItem.no || kpiItem.rowNumber))
              ?.weightage
          ) || 0;
        // Use columnsAchievedRef for Achieved KPI with Weightage
        return [
          rowNum,
          cleanPercentageValue(rAchieved(wpcVal, threshold)),
          cleanPercentageValue(columnsAchievedRef.current[`row${rowNum}`][0]),
          ...columns.flatMap((col, colIdx) => [
            cleanPercentageValue(rAchieved(kpiItem.percentages[col] || "0.00", threshold)),
            cleanPercentageValue(columnsAchievedRef.current[`row${rowNum}`][colIdx]),
          ]),
        ];
      }
      // Row 5: Final Data Row
      if (rowNum === 5) {
        return [
          "5",
          cleanPercentageValue(subs?.cenhkmd || "0"),
          cleanPercentageValue(columnsAchievedRef.current.row5[0]),
          ...columns.flatMap((col, colIdx) => {
            const key = columnToKeyMap[col];
            const val = subs?.[key] || 0;
            return [
              cleanPercentageValue(val),
              cleanPercentageValue(columnsAchievedRef.current.row5[colIdx]),
            ];
          }),
        ];
      }
      // Row 6: Average Row
      if (rowNum === 6) {
        return [
          "6",
          cleanPercentageValue(averagePlaceholder?.["NW/WPC"] || "0"),
          cleanPercentageValue(columnsAchievedRef.current.row6[0]),
          ...columns.flatMap((col, colIdx) => [
            cleanPercentageValue(averagePlaceholder?.[col] || "0"),
            cleanPercentageValue(columnsAchievedRef.current.row6[colIdx]),
          ]),
        ];
      }
      // Row 7: ServFulOk Row
      if (rowNum === 7) {
        return [
          "7",
          cleanPercentageValue(servFulOkRow?.["cenhkmd"] || "0"),
          cleanPercentageValue(columnsAchievedRef.current.row7[0]),
          ...columns.flatMap((col, colIdx) => {
            const key = columnToKeyMap[col];
            const val = servFulOkRow?.[key] || 0;
            return [
              cleanPercentageValue(val),
              cleanPercentageValue(columnsAchievedRef.current.row7[colIdx]),
            ];
          }),
        ];
      }
      // Row 10: Current Month Row
      if (rowNum === 10) {
        return [
          "10",
          cleanPercentageValue(columnSums[columnSums.length - 1] || "0"),
          cleanPercentageValue(columnsAchievedRef.current.row10[0]),
          ...columns.flatMap((_, colIdx) => [
            cleanPercentageValue(columnSums[colIdx] || "0"),
            cleanPercentageValue(columnsAchievedRef.current.row10[colIdx]),
          ]),
        ];
      }
      // Otherwise, empty row
      return [];
    });

    // Add Total Row (row 11)
    dynamicTableRows.push([
      "11",
      "",
      (() => {
        const targetRows = [1, 2, 5, 6, 7, 10];
        const sum = targetRows.reduce((total, rowNum) => {
          const idx = staticRowNumbers.indexOf(rowNum);
          const rowValue = dynamicTableRows[idx]?.[2] || "0";
          const numericValue =
            parseFloat(rowValue.toString().replace("%", "")) || 0;
          return total + numericValue;
        }, 0);
        return cleanPercentageValue(sum);
      })(),
      ...columns.flatMap((_, colIndex) => {
        const targetRows = [1, 2, 5, 6, 7, 10];
        const withWeightageIndex = colIndex * 2 + 4;
        const sum = targetRows.reduce((total, rowNum) => {
          const idx = staticRowNumbers.indexOf(rowNum);
          const rowValue =
            dynamicTableRows[idx]?.[withWeightageIndex] || "0";
          const numericValue =
            parseFloat(rowValue.toString().replace("%", "")) || 0;
          return total + numericValue;
        }, 0);
        return ["", cleanPercentageValue(sum)];
      }),
    ]);

    // Add Percentage Row (row 12)
    dynamicTableRows.push([
      "12",
      "",
      (() => {
        const sumValue =
          parseFloat(
            (dynamicTableRows[dynamicTableRows.length - 1][2] || "0")
              .toString()
              .replace("%", "")
          ) || 0;
        const weightage =
          parseFloat(totalWeight?.toString().replace("%", "")) || 0;
        const percentage = (sumValue / weightage) * 100;
        return cleanPercentageValue(percentage);
      })(),
      ...columns.flatMap((_, colIndex) => {
        const withWeightageIndex = colIndex * 2 + 4;
        const sumValue =
          parseFloat(
            (dynamicTableRows[dynamicTableRows.length - 2][withWeightageIndex] ||
              "0"
            )
              .toString()
              .replace("%", "")
          ) || 0;
        const weightage =
          parseFloat(totalWeight?.toString().replace("%", "")) || 0;
        const percentage = (sumValue / weightage) * 100;
        return ["", cleanPercentageValue(percentage)];
      }),
    ]);

    // Combine static and dynamic tables row-by-row
    const mergedTableData = kpiTableRows.map((staticRow, i) => {
      let dynamicRow = dynamicTableRows[i] || Array(dynamicTableHeader[3].length).fill("");
      // Remove the first RTOM area's Achieved KPI and Achieved KPI with Weightage (columns 1 and 2 after RTOM AREA)
      // That means: remove dynamicRow[1] and dynamicRow[2]
      if (dynamicRow.length > 3) {
        dynamicRow = [
          dynamicRow[0], // rowNum
          // skip dynamicRow[1] and dynamicRow[2]
          ...dynamicRow.slice(3)
        ];
      }
      return [...staticRow, ...dynamicRow];
    });

    // Create worksheet
    const worksheet = workbook.addWorksheet("Merged Table");

    // Add the headers and merged data
    const finalData = [
      ["", "", "", "", "", "", "", ...dynamicTableHeader[0]], // First row of dynamic header
      ["", "", "", "", "", "", "", ...dynamicTableHeader[1]], // Second row of dynamic header
      ["", "", "", "", "", "", "", ...dynamicTableHeader[2]], // Third row of dynamic header
      [
        "#",
        "Perspectives",
        "Strategic Objectives (KRA)",
        "Key Performance Indicators (KPI)",
        "Unit",
        "Description of KPI",
        "Weightage",
        "RTOM AREA",
        // Remove the first two headers for the first RTOM area
        ...columns.slice(0).flatMap(() => [
          "Achieved KPI",
          "Achieved KPI with Weightage",
        ]),
      ], // Static table header merged with RTOM AREA row
      ...mergedTableData, // Rest of the table data
    ];

    // Add rows to the worksheet
    finalData.forEach((row, rowIndex) => {
      const addedRow = worksheet.addRow(row);
      // Apply borders to each cell in the row
      addedRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      });
    });

    // Define the style for the header
    const headerRows = [1, 2, 3, 4]; // The header row indexes

    headerRows.forEach((rowIndex) => {
      const row = worksheet.getRow(rowIndex);
      row.eachCell((cell, colNumber) => {
        if (cell.value) {
          // Ensures only header cells are styled
          cell.font = { bold: true, color: { argb: "FFFFFF" } }; // White font
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "0070C0" },
          }; // Blue background
        }
      });
    });

    // Set column widths
    worksheet.columns = Array.from({ length: finalData[0].length }, () => ({
      width: 15,
    }));

    // Save the workbook as a file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const data = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(data, "Maintenance_Tables_Aligned.xlsx");
    });
  };

// ...existing code...
  if (loading) {
    return <div className="loader" style={{ color: "black" }}></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  ///////////////////////////////////////

  return (
    <ProtectedComponent>
      <div className="final-tables-container">
        {/* <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '65px',
        marginBottom: '15px',
        justifyContent: 'flex-start',
        padding: '0 20px',
        marginTop: '30px',
      }}
    >
      {row12Data.map((val, idx) => (
        <div key={idx} style={{ width: '120px', textAlign: 'center' }}>
          <CircularProgressbar
            value={val}
            maxValue={100}
            text={`${val}%`}
            styles={buildStyles({
              pathColor: `rgba(62, 152, 199, ${val / 100})`,
              textColor: '#000',
              trailColor: '#d6d6d6',
              backgroundColor: '#f3f3f3',
            })}
          />
          <p style={{ marginTop: '10px' ,color: 'black'  }}>{columns[idx]}</p>
        </div>
      ))}
    </div> */}

        {/* Title */}
        <h1 className="final-tables-title">Final KPI</h1>

        {/* side-by-side-tables */}
        <div className="side-by-side-tables">
          {/* LEFT: KPI Table */}
          <div className="kpi-table-container">
            {/* <h2 className="kpi-table-subtitle">Key Performance Indicators (KPI) Table</h2> */}
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Perspectives</th>
                  <th>Strategic Objectives (KRA)</th>
                  <th>Key Performance Indicators (KPI)</th>
                  <th>Unit</th>
                  <th>Description of KPI</th>
                  <th>Weightage</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.length ? (
                  <>
                    {kpiData
                      .filter((o) => ![4, 8, 9].includes(o.rowNumber || o.no))
                      .map((o) => (
                      <tr key={o._id}>
                        <td>{o.rowNumber || "-"}</td>
                        <td>{o.perspectives || "-"}</td>
                        <td>{o.strategicObjectives || "-"}</td>
                        <td style={{ textAlign: "left" }}>
                          <b>{o.keyPerformanceIndicators || "-"}</b>
                        </td>
                        <td>{o.unit || "-"}</td>
                        <td>{o.descriptionOfKPI || "-"}</td>
                        <td>{(o.weightage || "-") + "%"}</td>
                      </tr>
                    ))}

                    {/* 11) Sum of Weightage Row */}
                    {renderKpiWeightageSumRow()}

                    {/* 12) Sub Weightage Row */}
                    {renderKpiSubWeightageSumRow()}
                  </>
                ) : (
                  <tr>
                    <th colSpan="7">No data available</th>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT: Platform Distribution Table */}
          <div className="final-table-container">
            {/* <h2 className="final-table-subtitle">Platform Distribution and Achievements</h2> */}
            <table className="final-distribution-table">
              <thead>
                <tr style={{ height: "1px" }}>
                  <th>R-GM</th>
                  <th colSpan="12">Metro</th>
                  <th colSpan="12">Region 1</th>
                  <th colSpan="10">Region 2</th>
                  <th colSpan="6">Region 3</th>
                </tr>
                <tr>
                  <th>P-DGM</th>
                  <th colSpan="6">Metro 1</th>
                  <th colSpan="6">Metro 2</th>
                  <th colSpan="6">WPN & NWP</th>
                  <th colSpan="6">CP & NCP</th>
                  <th colSpan="4">SAB & UVA</th>
                  <th colSpan="6">WPS & SP</th>
                  <th colSpan="2">EP</th>
                  <th colSpan="4">NP</th>
                </tr>
                <tr>
                  <th>NW EE</th>

                  {columns.map((col) => (
                    <React.Fragment key={col}>
                      <th colSpan="2">{col}</th>
                    </React.Fragment>
                  ))}
                </tr>

                <tr>
                  <th>RTOM AREA</th>

                  {columns.map((col) => (
                    <React.Fragment key={col}>
                      <th>Achieved KPI</th>
                      <th>Achieved KPI with Weightage</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1) KPI row => kpiRes[0] (row #1) */}
                {kpiRes[0] && renderKpiRow(kpiRes[0], 1)}

                {/* 2) KPI row => kpiRes[1] (row #2) */}
                {kpiRes[1] && renderKpiRow(kpiRes[1], 2)}

                {/* 3) empty row */}
                <tr key="empty-row-3">
                  <td></td>
                </tr>
               

                {/* 5) Final Data Row (row #5) */}
                {renderFinalDataRow()}

                {/* 6) Average Row (row #6) - fetched from MultiPlatformTables logic */}
                {renderAverageRow()}

                {/* ServFulkOk Row (row #07)*/}
                {renderServFulOkRow()}

                {/* 10) Current Month Row */}
                {renderCurrentMonthRow()}

                {/* 11) Sum of all Achieved KPI with Weightage => PER COLUMN */}
                {renderSumOfAchievedKpiWithWeightageRow()}

                {/* 12) (row #11 values / totalWeight) * 100 */}
                {render12thRowDividedByKpiWeightage()}
              </tbody>
            </table>
          </div>
        </div>
        <button
          onClick={exportToExcel}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "40px",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          <b>Export to Excel</b>
        </button>
      </div>
    </ProtectedComponent>
  );
}

// ==================== End of FinalTables.js ====================