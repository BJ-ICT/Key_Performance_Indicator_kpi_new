// src/components/FinalTables.js

import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import React, { useEffect, useRef, useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import "./finalTables.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProtectedComponent from "./ProtectedComponent ";
import ExcelJS from "exceljs";
import MsanRow from "./MsanRow";

/* ------------------ Constants ------------------ */

const defaultColumns = [
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

const servFulOkRowMultipliers = [0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.05, 0.05];

/* ------------------ Helpers ------------------ */

const getBaseCodeFromLabel = (label) => {
  if (!label) return "";
  const s = String(label).trim();
  const m = s.match(/^(NW\/[A-Z0-9]+(?:-[0-9]+)?)/);
  return m ? m[1] : s;
};

const resolveDataKey = (label) => {
  const base = getBaseCodeFromLabel(label);
  return columnToKeyMap[base];
};

const getCanonicalDisplayForLookup = (label) => {
  const base = getBaseCodeFromLabel(label);
  for (let i = 0; i < defaultColumns.length; i++) {
    if (getBaseCodeFromLabel(defaultColumns[i]) === base) return defaultColumns[i];
  }
  return label;
};

const calcPct = (tm, um, tn) => {
  if (!tm && !um && !tn) return 100;
  const days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
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

const computePercentages = (f, s, cols) => {
  const p = {};
  (cols || defaultColumns).forEach((col) => {
    const k = columnToKeyMap[col],
      fv = parseFloat(f?.[k]) || 0,
      sv = parseFloat(s?.[k]) || 0;

    if (fv === 0 && sv === 0) {
      p[col] = "100.00";
    } else {
      p[col] = sv ? ((fv / sv) * 100).toFixed(2) : "0.00";
    }
  });
  return p;
};

// Main Component
export default function FinalTables({ showPeriodSelector = true }) {
  // States for data
  const [f6, setF6] = useState([]),
    [f7, setF7] = useState([]),
    [f8, setF8] = useState([]);
  // Period selection
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.toLocaleString("default", { month: "long" });
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  
  // Always use current year/month when showPeriodSelector is false
  useEffect(() => {
    if (!showPeriodSelector) {
      setSelectedYear(defaultYear);
      setSelectedMonth(defaultMonth);
    }
  }, [showPeriodSelector, defaultYear, defaultMonth]);
  // Dynamic columns built from Region→Province→Engineer hierarchy
  const [columns, setColumns] = useState(defaultColumns);
  const [regionHierarchy, setRegionHierarchy] = useState([]);
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

  // Thresholds
  const [threshold1, setThreshold1] = useState(null);
  const [threshold2, setThreshold2] = useState(null);
  const [threshold3, setThreshold3] = useState(null);
  const [threshold5, setThreshold5] = useState(99.899);
  const [threshold95, setThreshold95] = useState(95);
  const [threshold90, setThreshold90] = useState(90);

  // Only used for dashboard effects; Row 3 is driven via ref
  const [achievedKpiWithWeightage, setAchievedKpiWithWeightage] = useState({
    row1: 0,
    row2: 0,
    row3: 0,
    row5: 0,
    row6: 0,
    row7: 0,
    row10: 0,
  });

  // Per-column weighted values holder
  const columnsAchievedRef = useRef({
    row1: Array((columns || []).length).fill(0),
    row2: Array((columns || []).length).fill(0),
    row3: Array((columns || []).length).fill(0),
    row5: Array((columns || []).length).fill(0),
    row6: Array((columns || []).length).fill(0),
    row7: Array((columns || []).length).fill(0),
    row10: Array((columns || []).length).fill(0),
  });

  // Ref for table container to sync scrolling
  const tablesContainerRef = useRef(null);

  // Reinitialize when columns change
  useEffect(() => {
    const len = (columns || []).length;
    columnsAchievedRef.current = {
      row1: Array(len).fill(0),
      row2: Array(len).fill(0),
      row3: Array(len).fill(0),
      row5: Array(len).fill(0),
      row6: Array(len).fill(0),
      row7: Array(len).fill(0),
      row10: Array(len).fill(0),
    };
  }, [columns]);

  // ============= Region Table => dynamic columns =============
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/region-table");
        let rows = res?.data?.data || [];
        if (!Array.isArray(rows) || rows.length === 0) return;

        rows = rows.slice().sort((a, b) => {
          const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return da - db;
        });

        const regionMap = new Map();
        rows.forEach((r) => {
          const region = (r.region || "").trim();
          const province = (r.province || "").trim();
          const engineer = (r.networkEngineer || "").trim();
          if (!region || !province || !engineer) return;

          if (!regionMap.has(region)) regionMap.set(region, new Map());
          const provMap = regionMap.get(region);
          if (!provMap.has(province)) provMap.set(province, new Set());
          const engSet = provMap.get(province);
          engSet.add(engineer);
        });

        const hierarchy = [];
        const flatEngineers = [];
        regionMap.forEach((provMap, regionName) => {
          const provinces = [];
          let regionEngineerCount = 0;
          provMap.forEach((engSet, provName) => {
            const engineers = Array.from(engSet);
            engineers.forEach((e) => flatEngineers.push(e));
            provinces.push({ name: provName, engineers, totalEngineers: engineers.length });
            regionEngineerCount += engineers.length;
          });
          hierarchy.push({ name: regionName, provinces, totalEngineers: regionEngineerCount });
        });

        const baseOrder = defaultColumns.map((d) => getBaseCodeFromLabel(d));
        const baseToDisplay = new Map();
        defaultColumns.forEach((d) => {
          baseToDisplay.set(getBaseCodeFromLabel(d), d);
        });
        flatEngineers.forEach((label) => {
          const base = getBaseCodeFromLabel(label);
          if (baseToDisplay.has(base)) {
            baseToDisplay.set(base, label);
          }
        });
        const appended = [];
        flatEngineers.forEach((label) => {
          const base = getBaseCodeFromLabel(label);
          if (!baseToDisplay.has(base) && !appended.find((x) => getBaseCodeFromLabel(x) === base)) {
            appended.push(label);
          }
        });
        const dynamicCols = [
          ...baseOrder.map((b) => baseToDisplay.get(b)).filter(Boolean),
          ...appended,
        ];

        setColumns(dynamicCols.length ? dynamicCols : defaultColumns);
        setRegionHierarchy(hierarchy);
      } catch (e) {
        console.error("Error fetching Region Table:", e);
      }
    })();
  }, []);

  // ============= Load available years/months and keep selection valid =============
  useEffect(() => {
    (async () => {
      try {
        const yRes = await axios.get("/api/periods/years");
        const ys = Array.isArray(yRes.data) ? yRes.data : [];
        setYears(ys);
        const effectiveYear = ys.includes(selectedYear) ? selectedYear : (ys[ys.length - 1] || defaultYear);
        setSelectedYear(effectiveYear);

        if (effectiveYear) {
          const mRes = await axios.get("/api/periods/months", { params: { year: effectiveYear } });
          const ms = Array.isArray(mRes.data) ? mRes.data : [];
          setMonths(ms);
          if (!ms.includes(selectedMonth)) {
            const fallback = ms.includes(defaultMonth) ? defaultMonth : (ms[ms.length - 1] || selectedMonth);
            setSelectedMonth(fallback);
          }
        }
      } catch (e) {
        // ignore; dropdowns will fallback to current period
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============= form6,7,8 => subs =============
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [r6, r7, r8] = await Promise.all([
          axios.get("/form6", { params: { year: selectedYear, month: selectedMonth } }),
          axios.get("/form7", { params: { year: selectedYear, month: selectedMonth } }),
          axios.get("/form8", { params: { year: selectedYear, month: selectedMonth } }),
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
        setLoading(false);
      }
    })();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (!f6.length && !f7.length && !f8.length) return;
    const t6 = calcTotals(f6, [0.05, 0.05, 0.3]);
    const t7 = calcTotals(f7, [0.02, 0.01, 0.13, 0.17]);
    const t8 = calcTotals(f8, [0.2, 0.08, 0.3, 0.02]);
    const all = new Set([...Object.keys(t6), ...Object.keys(t7), ...Object.keys(t8)]);
    const tmp = {};
    all.forEach((k) => {
      const s = (t6[k] || 0) + (t7[k] || 0) + (t8[k] || 0);
      tmp[k] = s > threshold5 ? 100 : parseFloat(s.toFixed(2));
    });
    setSubs(tmp);
  }, [f6, f7, f8, threshold5]);

  // ============= form4 => ServFulOk row =============
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/form4");
        const rows = Array.isArray(data) ? data : [];

        // helper: convert various month representations to month number (1-12)
        const monthToNumber = (m) => {
          if (m === undefined || m === null) return null;
          if (typeof m === "number") return m;
          const s = String(m).trim();
          if (!s) return null;
          const n = parseInt(s, 10);
          if (!Number.isNaN(n) && n >= 1 && n <= 12) return n;
          // try parsing month name
          const dt = new Date(s + " 1, 2000");
          if (!Number.isNaN(dt.getTime())) return dt.getMonth() + 1;
          return null;
        };

        // If rows include year/month fields, prefer filtering by selectedYear/selectedMonth
        const hasYearMonth = rows.some((r) => r && (r.year !== undefined || r.month !== undefined));
        let sourceRows = rows;
        if (hasYearMonth) {
          const selMonthNum = monthToNumber(selectedMonth);
          sourceRows = rows.filter((r) => {
            try {
              const rowYear = r.year !== undefined && r.year !== null ? String(r.year).trim() : null;
              const selYearStr = selectedYear !== undefined && selectedYear !== null ? String(selectedYear).trim() : null;
              const yearMatch = !rowYear || !selYearStr ? true : rowYear === selYearStr;

              const rowMonthNum = monthToNumber(r.month);
              const monthMatch = rowMonthNum === null || selMonthNum === null ? true : rowMonthNum === selMonthNum;

              return yearMatch && monthMatch;
            } catch (e) {
              return false;
            }
          });
        }

        // Debug output for troubleshooting
        console.log('[ServiceFulfillment] All rows:', rows);
        console.log('[ServiceFulfillment] Filtered rows:', sourceRows);
        console.log('[ServiceFulfillment] selectedYear:', selectedYear, 'selectedMonth:', selectedMonth);

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
          // Use up to first 8 entries of the (possibly filtered) sourceRows
          totals[key] = (sourceRows.slice(0, 8)).reduce((sum, row, idx) => {
            const val = parseFloat(row[key]) || 0;
            return sum + val * servFulOkRowMultipliers[idx];
          }, 0);
        });

        console.log('[ServiceFulfillment] Computed totals:', totals);

        const adjustedMapped = {};
        Object.keys(totals).forEach((k) => {
          const mappedKey = servFulOkMap[k] || k.toLowerCase();
          const v = totals[k];
          adjustedMapped[mappedKey] = v > threshold90 ? "100%" : `${v.toFixed(2)}%`;
        });

        setServFulOkRow(adjustedMapped);
      } catch (err) {
        console.error("Error fetching form4:", err);
      }
    })();
  }, [threshold90, selectedYear, selectedMonth]);

  // ============= form9 + final-data => kpiRes + kpiData =============
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
              Links_SLA_Not_Violated,
              columns
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
              Links_SLA_Not_Violated,
              columns
            ),
          });
        }
        setKpiRes(arr);

        const sortedFinal = (final || []).sort((a, b) => {
          const aNum = a.rowNumber !== undefined ? a.rowNumber : Number.MAX_SAFE_INTEGER;
          const bNum = b.rowNumber !== undefined ? b.rowNumber : Number.MAX_SAFE_INTEGER;
          return aNum - bNum;
        });
        setKpiData(sortedFinal);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
      }
    })();
  }, []);

  // ============= parse weightages & thresholds + totalWeight =============
  useEffect(() => {
    if (!kpiData.length) return;

    // include Row 3 in total
    const rowsToSum = [1, 2, 3, 4, 5, 6, 7, 10];
    const totalWeightCalc = kpiData
      .filter((item) => rowsToSum.includes(item.rowNumber) || rowsToSum.includes(item.no))
      .reduce((acc, item) => {
        const rawStr = item.weightage || "0";
        const numeric = parseFloat(String(rawStr).replace("%", "")) || 0;
        return acc + numeric;
      }, 0);
    setTotalWeight(totalWeightCalc);

    const row10 = kpiData.find((o) => o.rowNumber === 10 || o.no === 10);
    if (row10) setSumRowWeightage((parseFloat(row10.weightage || "0") || 0) / 100);

    const row6 = kpiData.find((o) => o.rowNumber === 6 || o.no === 6);
    if (row6) setCurrentMonthWeightage((parseFloat(row6.weightage || "0") || 0) / 100);

    const row7 = kpiData.find((o) => o.rowNumber === 7 || o.no === 7);
    if (row7) {
      setServFulOkWeightage((parseFloat(row7.weightage || "0") || 0) / 100);
      if (row7.descriptionOfKPI) {
        const match90 = row7.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
        if (match90 && match90[1] && !isNaN(match90[1])) {
          setThreshold90(parseFloat(match90[1]));
        }
      }
    }

    const row5 = kpiData.find((o) => o.rowNumber === 5 || o.no === 5);
    if (row5) {
      setFinalDataRowWeightage((parseFloat(row5.weightage || "0") || 0) / 100);
      const match5 = row5.descriptionOfKPI?.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match5 && match5[1] && !isNaN(match5[1])) setThreshold5(parseFloat(match5[1]));
    }

    const row1 = kpiData.find((o) => o.rowNumber === 1 || o.no === 1);
    if (row1?.descriptionOfKPI) {
      const match1 = row1.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match1 && match1[1] && !isNaN(match1[1])) setThreshold1(parseFloat(match1[1]));
    }

    const row3 = kpiData.find((o) => o.rowNumber === 3 || o.no === 3);
    if (row3?.descriptionOfKPI) {
      const match3 = row3.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match3 && match3[1] && !isNaN(match3[1])) setThreshold3(parseFloat(match3[1]));
    }

    const row2 = kpiData.find((o) => o.rowNumber === 2 || o.no === 2);
    if (row2?.descriptionOfKPI) {
      const match2 = row2.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (match2 && match2[1] && !isNaN(match2[1])) setThreshold2(parseFloat(match2[1]));
    }
  }, [kpiData]);

  // ============= ProcessedData => columnSums (Row 10 base) =============
  useEffect(() => {
    (async () => {
      try {
        const [dynRes, kpiTowerRes] = await Promise.all([
          axios.get("/api/ProcessedDataFetch1", { params: { year: selectedYear, month: selectedMonth } }),
          axios.get("/api/kpi-tower"),
        ]);
        const dd = dynRes.data || [];
        if (!dd.length) return;

        const extractedHeaders = dd[0].details.map((d) => d.Column1);
        // Use the selectedMonth (not the current system month) so the UI shows
        // actual values for the user-selected period.
        const sel = selectedMonth;
        const specialMonths = ["March", "June", "September", "December"];

        // For quarter-ending months, compute the quarter (3 months) totals.
        const quarterMap = {
          March: ["January", "February", "March"],
          June: ["April", "May", "June"],
          September: ["July", "August", "September"],
          December: ["October", "November", "December"],
        };

        const calcVals = extractedHeaders.map((hdr) => {
          // If selectedMonth is a quarter month, aggregate over the quarter
          if (specialMonths.includes(sel)) {
            const selMonths = quarterMap[sel] || [sel];
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
            return totalDist > 0 ? ((totalAch / totalDist) * 100).toFixed(2) : "0.00";
          }

          // Non-quarter months: compute for the selectedMonth only (real value)
          let totalAch = 0,
            totalDist = 0;
          dd.forEach((m) => {
            if (m.month === sel) {
              const colItem = m.details.find((x) => x.Column1 === hdr);
              if (colItem) {
                totalAch += parseFloat(colItem.Column3) || 0;
                totalDist += parseFloat(colItem.Column2) || 0;
              }
            }
          });
          return totalDist > 0 ? ((totalAch / totalDist) * 100).toFixed(2) : "0.00";
        });

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
          const display = getCanonicalDisplayForLookup(col);
          const idx = headerMap[display];
          return typeof idx === "number" && idx >= 0 ? finalSum[idx] : "0.00";
        });

        const eFiberVal = finalSums[0];
        setColumnSums([...finalSums, eFiberVal]);
      } catch (err) {
        console.error("Error CurrentMonth data:", err);
      }
    })();
  }, [selectedYear, selectedMonth]);

  // ============= Multi-platform placeholders (not used in Row 3) =============
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
            const display = getCanonicalDisplayForLookup(col);
            months.forEach((mnth) => {
              const found = data.find((e) => e.month === mnth);
              if (found && found.details) {
                try {
                  const arr = found.details;
                  const cItem = arr.find((x) => x.Column1 === display);
                  if (cItem) {
                    totalAch += parseFloat(cItem.Column3) || 0;
                    totalDist += parseFloat(cItem.Column2) || 0;
                  }
                } catch (e) {
                  // ignore
                }
              }
            });
            res[col] = totalDist > 0 ? ((totalAch / totalDist) * 100).toFixed(2) : "0.00";
          });
          return res;
        };

        const msan = msanRes.data || [],
          vpn = vpnRes.data || [],
          slbn = slbnRes.data || [];

        const msanPl = calcPlaceholder(msan, ["March", "April"]);
        const vpnPl = calcPlaceholder(vpn, ["March", "April"]);
        const slbnPl = calcPlaceholder(slbn, ["March", "April"]);

        setMsanPlaceholders(msanPl);
        setVpnPlaceholders(vpnPl);
        setSlbnPlaceholders(slbnPl);

        const averagePl = {};
        columns.forEach((col) => {
          const display = getCanonicalDisplayForLookup(col);
          const mVal = parseFloat(msanPl[display]) || 0;
          const vVal = parseFloat(vpnPl[display]) || 0;
          const sVal = parseFloat(slbnPl[display]) || 0;
          if (mVal === 0 && vVal === 0 && sVal === 0) {
            averagePl[col] = "100.00";
          } else {
            const rawAvg = (mVal + vVal + sVal) / 3;
            averagePl[col] = rawAvg > threshold95 ? "100.00" : rawAvg.toFixed(2);
          }
        });
        setAveragePlaceholder(averagePl);
      } catch (e) {
        console.error("Error fetching MSAN/VPN/SLBN:", e);
      }
    })();
  }, [threshold95]);

  // ==================== KPI with Weightage (dashboard state) ====================
  useEffect(() => {
    if (!kpiRes.length || !subs || !averagePlaceholder || !servFulOkRow || !columnSums.length) return;

    const row1 = kpiRes[0]
      ? rAchievedW(
          kpiRes[0].percentages["NW/WPC"],
          threshold1,
          parseFloat(
            kpiData.find((item) => item.no === (kpiRes[0].no || kpiRes[0].rowNumber))?.weightage
          ) || 0
        )
      : 0;

    const row2 = kpiRes[1]
      ? rAchievedW(
          kpiRes[1].percentages["NW/WPC"],
          threshold2,
          parseFloat(
            kpiData.find((item) => item.no === (kpiRes[1].no || kpiRes[1].rowNumber))?.weightage
          ) || 0
        )
      : 0;

    // Row 3 handled via MsanRow (per-column). Keep dashboard total as 0 here.
    const row3 = 0;

    const row5 = rFinalDataRowWithWeightage(subs.cenhkmd ? parseFloat(subs.cenhkmd).toFixed(2) : 0);
    const row6 = rCurrentMonthWithWeightage(parseFloat(averagePlaceholder["NW/WPC"]) || 0);
    const row7 = rServFulOkWithWeightage(parseFloat(servFulOkRow["cenhkmd"]) || 0);
    const row10 = rSumRowWithWeightage(parseFloat(columnSums[columnSums.length - 1]) || 0);

    setAchievedKpiWithWeightage({
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
  ]);

  // ============= Render helpers =============
  const rAchieved = (val, threshold) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    if (threshold !== null && n > threshold) n = 100;
    return n.toFixed(2) + "%";
  };

  const rAchievedW = (val, threshold, wg) => {
    let n = parseFloat(val);
    if (isNaN(n)) n = 0;
    if (threshold !== null && n > threshold) n = 100;
    let c;
    if (threshold !== null && n < threshold) {
      c = (n / 100 / (threshold / 100)) * wg;
    } else {
      c = (n / 100) * wg;
    }
    return c.toFixed(2) + "%";
  };

  const rFinalDataRowWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    let result;
    if (n < threshold5 / 100) result = (n / (threshold5 / 100)) * finalDataRowWeightage;
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
    if (n < threshold90) result = (n / 100) * servFulOkWeightage * 100;
    else result = n * servFulOkWeightage;
    return result.toFixed(2) + "%";
  };

  const rSumRowWithWeightage = (val) => {
    const n = parseFloat(val) || 0;
    return (n * sumRowWeightage).toFixed(2) + "%";
  };

  // ============= Rows for the main table =============

  // Generic KPI rows (#1, #2)
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

    if ((rowIndex === 1 || rowIndex === 2 || rowIndex === 3) && threshold === null) {
      return null;
    }

    const wg =
      parseFloat(
        kpiData.find((item) => item.no === (kpiItem.no || kpiItem.rowNumber))?.weightage
      ) || 0;

    const colArr = columns.map((col) => {
      const display = getCanonicalDisplayForLookup(col);
      const val = kpiItem.percentages[display] || "0.00";
      return rAchievedW(val, threshold, wg);
    });

    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current[rowKey][i] = parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key={kpiItem.kpiName}>
        {columns.map((col, i) => {
          const display = getCanonicalDisplayForLookup(col);
          const val = kpiItem.percentages[display] || "0.00";
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

    const colArr = columns.map((col) => {
      const k = resolveDataKey(col);
      const val = (subs[k] || 0).toFixed(2);
      return rFinalDataRowWithWeightage(val);
    });

    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row5[i] = parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="final-data-row">
        {columns.map((col, i) => {
          const k = resolveDataKey(col);
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

    const colArr = columns.map((col) => {
      const display = getCanonicalDisplayForLookup(col);
      const val = averagePlaceholder[display] || "0.00";
      return rCurrentMonthWithWeightage(parseFloat(val) || 0);
    });

    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row6[i] = parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="average-row">
        {columns.map((col, i) => {
          const display = getCanonicalDisplayForLookup(col);
          const val = averagePlaceholder[display] || "0.00";
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

    const colArr = columns.map((col) => {
      const key = resolveDataKey(col);
      const val = servFulOkRow[key] ? parseFloat(servFulOkRow[key]) || 0 : 0;
      return rServFulOkWithWeightage(val);
    });

    colArr.forEach((strVal, i) => {
      columnsAchievedRef.current.row7[i] = parseFloat(strVal.replace("%", "")) || 0;
    });

    return (
      <tr key="servfulok-row">
        {columns.map((col, i) => {
          const key = resolveDataKey(col);
          const rawVal = servFulOkRow[key] ? parseFloat(servFulOkRow[key]) || 0 : 0;
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

    // Build the two-row representation for Current Month so it shows as two
    // physical rows in the final table while keeping header alignment:
    // - first TR: place Achieved KPI values into the LEFT cell of each pair
    // - second TR: place Achieved KPI with Weightage into the RIGHT cell of each pair
    const achievedVals = columns.map((c, i) => columnSums[i] || "0.00");
    const weightVals = columns.map((c, i) => rSumRowWithWeightage(parseFloat(columnSums[i]) || 0));

    // update per-column achieved-with-weightage ref (row10)
    weightVals.forEach((strVal, i) => {
      columnsAchievedRef.current.row10[i] = parseFloat(String(strVal).replace("%", "")) || 0;
    });

    return (
      <>
        <tr key="current-month-row-achieved">
          {columns.map((col, i) => (
            <React.Fragment key={col + "-ach"}>
              <td>{achievedVals[i] + "%"}</td>
              {/* empty right cell to keep pair alignment */}
              <td></td>
            </React.Fragment>
          ))}
        </tr>

        <tr key="current-month-row-weighted">
          {columns.map((col, i) => (
            <React.Fragment key={col + "-w"}>
              {/* empty left cell to keep pair alignment */}
              <td></td>
              <td>{weightVals[i]}</td>
            </React.Fragment>
          ))}
        </tr>
      </>
    );
  };

  // 11) Sum of all Achieved KPI with Weightage => PER COLUMN (include Row 3)
  const renderSumOfAchievedKpiWithWeightageRow = () => {
    const rowKeys = ["row1", "row2", "row3", "row5", "row6", "row7", "row10"];
    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach((rk) => {
        sum += columnsAchievedRef.current[rk][i] || 0;
      });
      return sum;
    });

    return (
      <tr key="sum-of-achievedKpiWithWeightage">
        {colSums.map((colVal, i) => (
          <React.Fragment key={columns[i]}>
            <td></td>
            <td style={{ fontWeight: "bold" }}>{colVal.toFixed(2) + "%"}</td>
          </React.Fragment>
        ))}
      </tr>
    );
  };

  // 12) (Sum from row #11 / totalWeight) * 100 (include Row 3)
  const render12thRowDividedByKpiWeightage = () => {
    const rowKeys = ["row1", "row2", "row3", "row5", "row6", "row7", "row10"];
    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach((rk) => {
        sum += columnsAchievedRef.current[rk][i] || 0;
      });
      return sum;
    });

    return (
      <tr key="12th-row-divided">
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

  // KPI Table helpers (left)
  const renderKpiWeightageSumRow = () => {
    if (!kpiData.length) return null;
    const rowsToSum = [1, 2, 3, 4, 5, 6, 7, 10]; // include Row 3
    const totalWeightCalc = kpiData
      .filter((item) => rowsToSum.includes(item.rowNumber) || rowsToSum.includes(item.no))
      .reduce((acc, item) => {
        const rawStr = item.weightage || "0";
        const numeric = parseFloat(String(rawStr).replace("%", "")) || 0;

        // include only if region has data – conservative check
        const hasData = columns.some((col) => {
          const key = resolveDataKey(col);
          return (item?.percentages && item.percentages[col] !== undefined) || (subs?.[key] !== undefined);
        });

        return hasData ? acc + numeric : acc;
      }, 0);

    return (
      <tr key="kpi-weightage-sum-row" style={{ backgroundColor: "#f5f5f5" }}>
        <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
          Weightage
        </td>
        <td style={{ fontWeight: "bold" }}>{totalWeightCalc.toFixed(2) + "%"}</td>
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
  // Speedometers for Row 12
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

    try {
      const columnsList = columns.slice();
      const valuesByMeter = {};
      columnsList.forEach((m, i) => {
        valuesByMeter[m] = parseFloat(finalValues[i]) || 0;
      });
      window.localStorage.setItem(
        "row12Payload",
        JSON.stringify({ columns: columnsList, values: finalValues, valuesByMeter })
      );
    } catch (e) {
      // ignore
    }
  }, [achievedKpiWithWeightage, totalWeight, columns]);

  /////////////////////////////////////////////////
  // Helper for Excel formatting
  const pct = (x) => {
    if (x === null || x === undefined || x === "") return "0.00%";
    const n = typeof x === "string" ? parseFloat(x.toString().replace("%", "")) : Number(x);
    if (Number.isNaN(n)) return "0.00%";
    return `${n.toFixed(2)}%`;
  };
  const num = (x) => {
    if (x === null || x === undefined || x === "") return 0;
    const n = typeof x === "string" ? parseFloat(x.toString().replace("%", "")) : Number(x);
    return Number.isNaN(n) ? 0 : n;
  };

  const exportToExcel = async () => {
    if (!kpiData?.length || !columns?.length) {
      alert("No data to export yet.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Overall KPI");

    const LEFT_COLS = [
      "#",
      "Perspectives",
      "Strategic Objectives (KRA)",
      "Key Performance Indicators (KPI)",
      "Unit",
      "Description of KPI",
      "Weightage",
    ];
    const leftColsCount = LEFT_COLS.length;

    const baseColsCount = columns.length;
    const rightLabelCols = 1;
    const leafColsCount = baseColsCount * 2;
    const rightTotalCols = rightLabelCols + leafColsCount;
    const RIGHT_START_COL = leftColsCount + 1;

    // header groups for regions/provinces
    const dynTopGroups = (regionHierarchy?.length
      ? regionHierarchy.map((rg) => ({
          title: rg.name,
          count: (rg.totalEngineers || 0) * 2,
        }))
      : [{ title: "Regions", count: leafColsCount }]);

    const dynChildGroups = (regionHierarchy?.length
      ? regionHierarchy.flatMap((rg) =>
          (rg.provinces || []).map((pv) => ({
            title: pv.name,
            count: (pv.totalEngineers || 0) * 2,
          }))
        )
      : []);

    const sumTop = dynTopGroups.reduce((a, b) => a + b.count, 0);
    const sumChild = dynChildGroups.reduce((a, b) => a + b.count, 0);
    const topGroups = sumTop === leafColsCount ? dynTopGroups : [{ title: "Regions", count: leafColsCount }];
    const childGroups = sumChild === leafColsCount ? dynChildGroups : [];

    // get weightage for a KPI rowNumber
    const getWeightage = (rowNo) => {
      const row = kpiData.find((r) => (r.rowNumber ?? r.no) === rowNo);
      return row ? num(row.weightage) : 0;
    };

    // Build rows for KPI 1/2 using kpiRes percentages
    const buildPairsForKpi = (kpiPercentages, threshold, wg) => {
      return columns.flatMap((col) => {
        const val = kpiPercentages?.[getCanonicalDisplayForLookup(col)] ?? "0.00";
        const ach = rAchieved(val, threshold);
        const achW = rAchievedW(val, threshold, wg);
        return [ach, achW];
      });
    };
    const buildRowForKpi = (kpiItem, threshold, rowNo) => {
      const wg = getWeightage(rowNo);
      return ["", ...buildPairsForKpi(kpiItem?.percentages, threshold, wg)];
    };

    // Row 3 from UI ref: AchW is stored; reconstruct Ach when possible
    const buildRowMsan = () => {
      const wg = getWeightage(3); // numeric e.g. 10
      const wgFrac = wg / 100; // e.g. 0.10
      return [
        "",
        ...columns.flatMap((_, i) => {
          const achWNum = columnsAchievedRef.current.row3[i] || 0; // e.g. 6.5
          const achW = achWNum ? `${achWNum.toFixed(2)}%` : "";
          let ach = "";
          if (wgFrac > 0 && achWNum > 0) {
            ach = `${(achWNum / wgFrac).toFixed(2)}%`;
          }
          return [ach, achW];
        }),
      ];
    };

    // Final data rows based on subs
    const buildRowFinalData = () => {
      return [
        "",
        ...columns
          .flatMap((col) => {
            const key = resolveDataKey(col);
            if (!key) return ["", ""];
            const raw = subs?.[key];
            if (raw === undefined || raw === null) return ["", ""];
            const val = num(raw);
            const ach = pct(val);
            const achW = rFinalDataRowWithWeightage(val);
            return [ach, achW];
          }),
      ];
    };

    const buildRowAverage = () => {
      return [
        "",
        ...columns
          .flatMap((col) => {
            const rawStr = averagePlaceholder?.[getCanonicalDisplayForLookup(col)];
            if (rawStr === undefined || rawStr === null || rawStr === "0.00") {
              return ["", ""];
            }
            const val = num(rawStr);
            const ach = pct(val);
            const achW = rCurrentMonthWithWeightage(val);
            return [ach, achW];
          }),
      ];
    };

    const buildRowServFulOk = () => {
      return [
        "",
        ...columns
          .flatMap((col) => {
            const key = resolveDataKey(col);
            if (!key) return ["", ""];
            const rawStr = servFulOkRow?.[key];
            if (rawStr === undefined || rawStr === null) return ["", ""];
            const val = num(rawStr);
            const ach = pct(val);
            const achW = rServFulOkWithWeightage(val);
            return [ach, achW];
          }),
      ];
    };

    const buildRowCurrentMonth = () => {
      return [
        "",
        ...columns
          .map((_, i) => {
            const rawStr = columnSums?.[i];
            if (rawStr === undefined || rawStr === null || rawStr === "0.00") {
              return ["", ""];
            }
            const val = num(rawStr);
            const ach = pct(val);
            const achW = rSumRowWithWeightage(val);
            return [ach, achW];
          })
          .flat(),
      ];
    };

    // Row 11: sum of Achieved-with-Weightage across rows 1,2,3,5,6,7,10
    const buildRowSumAchW = (rows) => {
      const sums = new Array(baseColsCount).fill(0);
      rows.forEach((r) => {
        for (let i = 0; i < baseColsCount; i++) {
          const achWIdx = 1 + i * 2 + 1; // second of pair
          sums[i] += num(r[achWIdx]);
        }
      });
      return ["", ...sums.map((v) => ["", v ? pct(v) : ""]).flat()];
    };

    // Row 12: (row11 / totalWeightLocal) * 100
    const buildRowPercOfWeight = (row11, totalWeightVal) => {
      const vals = [];
      for (let i = 0; i < baseColsCount; i++) {
        const idx = 1 + i * 2 + 1; // AchW cell
        const v = num(row11[idx]);
        const p = totalWeightVal ? (v / totalWeightVal) * 100 : 0;
        vals.push(["", p ? pct(p) : ""]);
      }
      return ["", ...vals.flat()];
    };

    // Left table
    const kpiLeftHeader = [...LEFT_COLS];
    const kpiLeftRows = kpiData
      .filter((o) => ![4, 8, 9].includes(o.rowNumber ?? o.no))
      .map((o) => [
        o.rowNumber ?? "-",
        o.perspectives ?? "-",
        o.strategicObjectives ?? "-",
        o.keyPerformanceIndicators ?? "-",
        o.unit ?? "-",
        o.descriptionOfKPI ?? "-",
        pct(o.weightage),
      ]);

    const rowsToSum = [1, 2, 3, 4, 5, 6, 7, 10]; // include Row 3
    const totalWeightLocal = kpiData
      .filter((item) => rowsToSum.includes(item.rowNumber ?? item.no))
      .reduce((acc, item) => acc + num(item.weightage), 0);

    const leftSumRow = ["", "", "", "", "", "Weightage", pct(totalWeightLocal)];
    const leftTotalRow = ["", "", "", "", "", "Total Weightage", "100.00%"];

    // Right table rows (include Row 3)
    const rightRows = [];
    if (kpiRes?.[0]) rightRows.push(buildRowForKpi(kpiRes[0], threshold1, 1)); // #1
    if (kpiRes?.[1]) rightRows.push(buildRowForKpi(kpiRes[1], threshold2, 2)); // #2
    rightRows.push(buildRowMsan()); // #3 (MSAN)
    rightRows.push(buildRowFinalData()); // #5
    rightRows.push(buildRowAverage()); // #6
    rightRows.push(buildRowServFulOk()); // #7
    rightRows.push(buildRowCurrentMonth()); // #10

    const row11 = buildRowSumAchW(
      rightRows.filter((_, idx) => [0, 1, 2, 3, 4, 5, 6].includes(idx))
    );
    rightRows.push(row11); // #11
    rightRows.push(buildRowPercOfWeight(row11, totalWeightLocal)); // #12

    // Header rows
    sheet.addRow([...Array(leftColsCount).fill(""), "R-GM", ...Array(leafColsCount).fill("")]);
    sheet.addRow([...Array(leftColsCount).fill(""), "P-DGM", ...Array(leafColsCount).fill("")]);
    sheet.addRow([...Array(leftColsCount).fill(""), "NW EE", ...Array(leafColsCount).fill("")]);
    const rightLeafHeader = [
      "RTOM AREA",
      ...columns.flatMap(() => ["Achieved KPI", "Achieved KPI with Weightage"]),
    ];
    sheet.addRow([...kpiLeftHeader, ...rightLeafHeader]);

    // Merge header groups
    let c = RIGHT_START_COL + 1;
    topGroups.forEach((g) => {
      const span = g.count;
      sheet.mergeCells(1, c, 1, c + span - 1);
      sheet.getCell(1, c).value = g.title;
      c += span;
    });

    c = RIGHT_START_COL + 1;
    if (childGroups.length) {
      childGroups.forEach((g) => {
        const span = g.count;
        sheet.mergeCells(2, c, 2, c + span - 1);
        sheet.getCell(2, c).value = g.title;
        c += span;
      });
    } else {
      sheet.mergeCells(2, RIGHT_START_COL + 1, 2, RIGHT_START_COL + leafColsCount);
      sheet.getCell(2, RIGHT_START_COL + 1).value = "Areas";
    }

    for (let i = 0; i < baseColsCount; i++) {
      const start = RIGHT_START_COL + 1 + i * 2;
      sheet.mergeCells(3, start, 3, start + 1);
      sheet.getCell(3, start).value = columns[i];
    }

    // Body rows (left + right)
    const maxBodyRows = Math.max(kpiLeftRows.length + 2, rightRows.length);
    for (let i = 0; i < maxBodyRows; i++) {
      let left;
      if (i < kpiLeftRows.length) {
        left = kpiLeftRows[i];
      } else if (i === kpiLeftRows.length) {
        left = leftSumRow;
      } else if (i === kpiLeftRows.length + 1) {
        left = leftTotalRow;
      } else {
        left = Array(leftColsCount).fill("");
      }

      const right = rightRows[i] ?? ["", ...Array(leafColsCount).fill("")];
      const addedRow = sheet.addRow([...left, ...right]);

      if (i === kpiLeftRows.length || i === kpiLeftRows.length + 1) {
        for (let col = 1; col <= leftColsCount; col++) {
          const cell = addedRow.getCell(col);
          cell.font = { ...(cell.font || {}), bold: true };
        }
      }

      if (i >= maxBodyRows - 2) {
        const fullWidth = leftColsCount + rightTotalCols;
        for (let col = 1; col <= fullWidth; col++) {
          const cell = addedRow.getCell(col);
          cell.font = { ...(cell.font || {}), bold: true };
        }
      }
    }

    // Styling
    const headerRows = [1, 2, 3, 4];
    headerRows.forEach((r) => {
      const row = sheet.getRow(r);
      row.eachCell((cell) => {
        if (cell.value !== undefined && cell.value !== "") {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0070C0" },
          };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }
      });
    });

    // Borders & widths
    const lastRow = sheet.lastRow.number;
    const lastCol = leftColsCount + rightTotalCols;
    for (let r = 1; r <= lastRow; r++) {
      for (let col = 1; col <= lastCol; col++) {
        const cell = sheet.getCell(r, col);
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        if (r >= 5) cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    }

    const widths = [6, 16, 22, 36, 10, 38, 12];
    for (let i = 0; i < leftColsCount; i++) {
      sheet.getColumn(i + 1).width = widths[i] || 14;
    }
    for (let i = RIGHT_START_COL; i <= lastCol; i++) {
      sheet.getColumn(i).width = 14;
    }

    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 4 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Overall_KPI.xlsx");
  };

  if (loading) {
    return <div className="loader" style={{ color: "black" }}></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Row #3 weightage from KPI table (number, e.g., 10)
  const row3Weightage =
    parseFloat(kpiData.find((o) => o.rowNumber === 3 || o.no === 3)?.weightage) || 0;

  return (
    <ProtectedComponent>
      <div className="final-tables-container">
        <h1 className="final-tables-title">
          Final KPI {!showPeriodSelector && `- ${selectedMonth} ${selectedYear}`}
        </h1>
        {showPeriodSelector && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <label>
              Year: {" "}
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {[...new Set([selectedYear, ...years])].sort((a,b)=>a-b).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
            <label>
              Month: {" "}
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {[...new Set([selectedMonth, ...months])].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="side-by-side-tables" ref={tablesContainerRef}>
          {/* Left KPI Table (fixed) */}
          <div className="kpi-table-wrapper">
            <div className="kpi-table-container">
              <table className="kpi-table">
                <thead>
                  <tr className="colSpan-header">
                    <th
                      colSpan="7"
                      style={{
                        textAlign: "right",
                        paddingLeft: "50px",
                        paddingRight: "20px",
                        backgroundColor: "#2b51baff",
                        color: "white",
                      }}
                    >
                      R-GM
                    </th>
                  </tr>
                  <tr className="colSpan-header">
                    <th
                      colSpan="7"
                      style={{
                        textAlign: "right",
                        paddingLeft: "50px",
                        paddingRight: "20px",
                        backgroundColor: "#2b51baff",
                        color: "white",
                      }}
                    >
                      P-DGM
                    </th>
                  </tr>
                  <tr className="colSpan-header">
                    <th
                      colSpan="7"
                      style={{
                        textAlign: "right",
                        paddingLeft: "50px",
                        paddingRight: "20px",
                        backgroundColor: "#2b51baff",
                        color: "white",
                      }}
                    >
                      NW EE/RTOM AREA
                    </th>
                  </tr>

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
          </div>

          {/* Right Final Table (scrollable) */}
          <div className="final-table-wrapper">
            <div className="final-table-container">
              <table className="final-distribution-table">
              <thead>
                <tr style={{ height: "1px" }}>
                  {regionHierarchy.length ? (
                    regionHierarchy.map((rg) => (
                      <th key={rg.name} colSpan={(rg.totalEngineers || 0) * 2}>
                        {rg.name}
                      </th>
                    ))
                  ) : (
                    <th colSpan={columns.length * 2}>Regions</th>
                  )}
                </tr>
                <tr>
                  {regionHierarchy.length
                    ? regionHierarchy.flatMap((rg) =>
                        rg.provinces.map((pv) => (
                          <th
                            key={`${rg.name}-${pv.name}`}
                            colSpan={(pv.totalEngineers || 0) * 2}
                          >
                            {pv.name}
                          </th>
                        ))
                      )
                    : null}
                </tr>
                <tr>
                  {columns.map((col) => (
                    <React.Fragment key={col}>
                      <th colSpan="2">{col}</th>
                    </React.Fragment>
                  ))}
                </tr>

                <tr>
                  {columns.map((col) => (
                    <React.Fragment key={col}>
                      <th>Achieved KPI</th>
                      <th>Achieved KPI with Weightage</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1) KPI row => row #1 */}
                {kpiRes[0] && renderKpiRow(kpiRes[0], 1)}

                {/* 2) KPI row => row #2 */}
                {kpiRes[1] && renderKpiRow(kpiRes[1], 2)}

                {/* 3) MSAN Row (Achieved = kpiachieved/nooffailure*100; Achieved with Wg = Achieved * row3Weightage/100) */}
                <MsanRow
                  columns={columns}
                  columnsAchievedRef={columnsAchievedRef}
                  row3Weightage={row3Weightage}
                />

                {/* 5) Final Data Row */}
                {renderFinalDataRow()}

                {/* 6) Average Row */}
                {renderAverageRow()}

                {/* 7) Service Fulfillment OK Row */}
                {renderServFulOkRow()}

                {/* 10) Current Month Row */}
                {/* {renderCurrentMonthRow()} */}
                {renderAverageRow()}

                {/* 11) Sum of all Achieved KPI with Weightage (includes Row 3) */}
                {renderSumOfAchievedKpiWithWeightageRow()}

                {/* 12) Normalized by total KPI weightage (includes Row 3) */}
                {render12thRowDividedByKpiWeightage()}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={exportToExcel}
          style={{
            padding: "12px 28px",
            backgroundColor: "#4A90E2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            margin: "20px 0 40px",
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s ease, transform 0.1s ease",
          }}
        >
          <b>Export to Excel</b>
        </button>
      </div>
    </ProtectedComponent>
  );
}
