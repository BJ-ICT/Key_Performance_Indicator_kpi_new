// src/components/graph.js

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './finalTables.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// If you really have this file, fix the path and uncomment the next line.
// import ProtectedComponent from './ProtectedComponent';

// =============================
// Mapping column names => DB keys (used by several rows)
// =============================
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
  "CENHKMD": "cenhkmd",
  "CENHKMD1": "cenhkmd1",
  "GQKINTB": "gqkintb",
  "NDRM": "ndfrm",
  "AWHO": "awho",
  "KONKX": "konix",
  "NGWT": "ngivt",
  "KGKLY": "kgkly",
  "CWPX": "cwpx",
  "DBKYMT": "debkymt",
  "GPHTNW": "gphtnw",
  "ADPR": "adipr",
  "BDBWMRG": "bddwmrg",
  "KERN": "keirn",
  "EBMHMBH": "embmbmh",
  "AGGL": "aggl",
  "HRKTPH": "hrktph",
  "BCAPKLTC": "bcjrdkltc",
  "JA": "ja",
  "KOMLTMBVA": "komltmbva",
};

// Multipliers for ServFulOk rows
const servFulOkRowMultipliers = [0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.05, 0.05];

// =============================
// Helpers
// =============================

// Map `NW/WPC-1` or `NW/WPC-2` → base meter `NW/WPC` for lookups
const baseMeter = (col) => String(col || '').replace(/-\d+$/, '');

const lookupKeyForMeter = (col) => {
  const base = baseMeter(col);
  return columnToKeyMap[col] || columnToKeyMap[base]; // prefer exact, fall back to base
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
      Object.keys(e.total_minutes).forEach(k => {
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

// Compute KPI column percentages using a dynamic columns list
const computePercentagesForColumns = (f, s, cols) => {
  const p = {};
  cols.forEach(col => {
    const key = lookupKeyForMeter(col);
    const fv = key ? (parseFloat(f?.[key]) || 0) : 0;
    const sv = key ? (parseFloat(s?.[key]) || 0) : 0;

    if (fv === 0 && sv === 0) p[col] = "100.00";
    else p[col] = sv ? ((fv / sv) * 100).toFixed(2) : "0.00";
  });
  return p;
};

// Normalize "NW/WPC-1 (CEN/HK/MD)" => "NW/WPC-1"
const normalizeEngineer = (str = '') => String(str).split('(')[0].trim();

// Region sorter: "Metro" first, then "Region 1", "Region 2", …
const sortRegionNames = (a, b) => {
  if (a === 'Metro' && b !== 'Metro') return -1;
  if (b === 'Metro' && a !== 'Metro') return 1;
  const ra = a.match(/Region\s*(\d+)/i);
  const rb = b.match(/Region\s*(\d+)/i);
  if (ra && rb) return Number(ra[1]) - Number(rb[1]);
  return a.localeCompare(b);
};

// =============================
// Component
// =============================
export default function FinalTables() {
  // Dynamic meters (flattened) and categories (Region → meters)
  const [columns, setColumns] = useState([]); // <-- replaces hardcoded list
  const [categories, setCategories] = useState([]);

  // Data buckets
  const [f6, setF6] = useState([]), [f7, setF7] = useState([]), [f8, setF8] = useState([]);
  const [subs, setSubs] = useState({});
  const [servFulOkRow, setServFulOkRow] = useState({});
  const [kpiRes, setKpiRes] = useState([]), [kpiData, setKpiData] = useState([]);
  const [columnSums, setColumnSums] = useState([]);
  const [averagePlaceholder, setAveragePlaceholder] = useState({});

  // Weightages & thresholds
  const [sumRowWeightage, setSumRowWeightage] = useState(0);
  const [currentMonthWeightage, setCurrentMonthWeightage] = useState(0);
  const [servFulOkWeightage, setServFulOkWeightage] = useState(0);
  const [finalDataRowWeightage, setFinalDataRowWeightage] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [threshold1, setThreshold1] = useState(null);
  const [threshold2, setThreshold2] = useState(null);
  const [threshold5, setThreshold5] = useState(99.899);
  const threshold95 = 95;
  const [threshold90, setThreshold90] = useState(90);

  // Storage for per-column achieved-with-weightage (rows 1,2,5,6,7,10)
  const columnsAchievedRef = useRef({
    row1: [],
    row2: [],
    row5: [],
    row6: [],
    row7: [],
    row10: [],
  });

  // Reset achieved arrays when columns change
  useEffect(() => {
    const zeros = Array(columns.length).fill(0);
    columnsAchievedRef.current = {
      row1: [...zeros],
      row2: [...zeros],
      row5: [...zeros],
      row6: [...zeros],
      row7: [...zeros],
      row10: [...zeros],
    };
  }, [columns]);

  // ========== Load RegionTable → dynamic categories + meters ==========
  useEffect(() => {
    (async () => {
      try {
        // Expect RegionTable rows with fields: region, province, networkEngineer, lea
        const res = await axios.get('/api/region-table');
        const items = res?.data?.data || [];

        // Group by region, collect distinct normalized engineer codes
        const byRegion = new Map();
        items.forEach(({ region, networkEngineer }) => {
          const code = normalizeEngineer(networkEngineer); // e.g., "NW/WPC-1"
          if (!byRegion.has(region)) byRegion.set(region, new Set());
          byRegion.get(region).add(code);
        });

        // Build sorted categories and flattened columns (meters)
        const payload = Array.from(byRegion.entries())
          .sort((a, b) => sortRegionNames(a[0], b[0]))
          .map(([title, set]) => ({
            title,
            meters: Array.from(set),
          }));

        const flattened = payload.flatMap(p => p.meters);

        setCategories(payload);
        setColumns(flattened); // global meter order used everywhere
      } catch (e) {
        console.error('Failed to load region table for gauges:', e);
        setCategories([]);
        setColumns([]); // stay consistent
      }
    })();
  }, []);

  // ========== form6/7/8 → subTotals ==========
  useEffect(() => {
    (async () => {
      try {
        const [r6, r7, r8] = await Promise.all([
          axios.get("/form6"),
          axios.get("/form7"),
          axios.get("/form8"),
        ]);
        const d6 = r6.data, d7 = r7.data, d8 = r8.data;

        // normalize cenhkmd vs cenhkmd1
        d6.forEach(e => {
          ["total_minutes", "unavailable_minutes", "total_nodes"].forEach(f => {
            if (e[f]) {
              if (!e[f].cenhkmd || e[f].cenhkmd === 0) e[f].cenhkmd = e[f].cenhkmd1 || e[f].cenhkmd;
              if (!e[f].cenhkmd1 || e[f].cenhkmd1 === 0) e[f].cenhkmd1 = e[f].cenhkmd;
            }
          });
        });

        setF6(d6); setF7(d7); setF8(d8);
      } catch (err) {
        console.error("Error fetching form6/7/8:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!f6.length && !f7.length && !f8.length) return;
    const t6 = calcTotals(f6, [0.05, 0.05, 0.3]);
    const t7 = calcTotals(f7, [0.02, 0.01, 0.13, 0.17]);
    const t8 = calcTotals(f8, [0.2, 0.08, 0.3, 0.02]);
    const all = new Set([...Object.keys(t6), ...Object.keys(t7), ...Object.keys(t8)]);
    const tmp = {};
    all.forEach(k => {
      const s = (t6[k] || 0) + (t7[k] || 0) + (t8[k] || 0);
      tmp[k] = s > threshold5 ? 100 : parseFloat(s.toFixed(2));
    });
    setSubs(tmp);
  }, [f6, f7, f8, threshold5]);

  // ========== form4 → ServFulOk row ==========
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/form4");
        const totals = {};
        [
          "CENHKMD","CENHKMD1","GQKINTB","NDRM","AWHO","KONKX","NGWT","KGKLY","CWPX","DBKYMT",
          "GPHTNW","ADPR","BDBWMRG","KERN","EBMHMBH","AGGL","HRKTPH","BCAPKLTC","JA","KOMLTMBVA"
        ].forEach((key) => {
          totals[key] = data.slice(0, 8).reduce((sum, row, idx) => {
            const val = parseFloat(row[key]) || 0;
            return sum + (val * servFulOkRowMultipliers[idx]);
          }, 0);
        });

        const adjustedMapped = {};
        Object.keys(totals).forEach(k => {
          const mappedKey = servFulOkMap[k] || k.toLowerCase();
          const v = totals[k];
          adjustedMapped[mappedKey] = v > threshold90 ? "100%" : `${v.toFixed(2)}%`;
        });

        setServFulOkRow(adjustedMapped);
      } catch (err) {
        console.error("Error fetching form4:", err);
      }
    })();
  }, [threshold90]);

  // ========== form9 + final-data (needs columns) ==========
  useEffect(() => {
    if (!columns.length) return;
    (async () => {
      try {
        const [form9Res, finalRes] = await Promise.all([
          axios.get('/form9'),
          axios.get('/api/final-data'),
        ]);
        const form9 = form9Res.data;
        const final = finalRes.data;

        const findK = (n, k) =>
          (Array.isArray(form9)
            ? form9.find(x => x.no === n && x.network_engineer_kpi === k)
            : Object.values(form9).find(x => x.no === n && x.network_engineer_kpi === k)
          ) || null;

        const k12 = findK(12, "Fiber Failures Restoration(General): <4 Hrs");
        const k13 = findK(13, "Fiber Failures Restoration(Large scale< Pole damages etc>): <8 Hrs");
        const arr = [];

        if (k12) {
          const { Total_Failed_Links, Links_SLA_Not_Violated, kpi_percent } = k12;
          arr.push({
            kpiName: k12.network_engineer_kpi,
            kpiPercent: kpi_percent,
            percentages: computePercentagesForColumns(Total_Failed_Links, Links_SLA_Not_Violated, columns),
          });
        }
        if (k13) {
          const { Total_Failed_Links, Links_SLA_Not_Violated, kpi_percent } = k13;
          arr.push({
            kpiName: k13.network_engineer_kpi,
            kpiPercent: kpi_percent,
            percentages: computePercentagesForColumns(Total_Failed_Links, Links_SLA_Not_Violated, columns),
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
  }, [columns]);

  // ========== parse weightages & thresholds ==========
  useEffect(() => {
    if (!kpiData.length) return;
    const rowsToSum = [1, 2, 5, 6, 7, 10];
    const totalWeightCalc = kpiData
      .filter(item => rowsToSum.includes(item.rowNumber) || rowsToSum.includes(item.no))
      .reduce((acc, item) => {
        const rawStr = item.weightage || '0';
        const numeric = parseFloat(String(rawStr).replace('%', '')) || 0;
        return acc + numeric;
      }, 0);
    setTotalWeight(totalWeightCalc);

    const row10 = kpiData.find(o => o.rowNumber === 10 || o.no === 10);
    if (row10) setSumRowWeightage((parseFloat(row10.weightage || '0') || 0) / 100);

    const row6 = kpiData.find(o => o.rowNumber === 6 || o.no === 6);
    if (row6) setCurrentMonthWeightage((parseFloat(row6.weightage || '0') || 0) / 100);

    const row7 = kpiData.find(o => o.rowNumber === 7 || o.no === 7);
    if (row7) {
      setServFulOkWeightage((parseFloat(row7.weightage || '0') || 0) / 100);
      if (row7.descriptionOfKPI) {
        const match90 = row7.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
        if (match90 && match90[1]) setThreshold90(parseFloat(match90[1]));
      }
    }

    const row5 = kpiData.find(o => o.rowNumber === 5 || o.no === 5);
    if (row5) {
      setFinalDataRowWeightage((parseFloat(row5.weightage || '0') || 0) / 100);
      if (row5.descriptionOfKPI) {
        const m = row5.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
        if (m && m[1]) setThreshold5(parseFloat(m[1]));
      }
    }

    const r1 = kpiData.find(o => o.rowNumber === 1 || o.no === 1);
    if (r1?.descriptionOfKPI) {
      const m1 = r1.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (m1 && m1[1]) setThreshold1(parseFloat(m1[1]));
    }

    const r2 = kpiData.find(o => o.rowNumber === 2 || o.no === 2);
    if (r2?.descriptionOfKPI) {
      const m2 = r2.descriptionOfKPI.match(/Above\s+(\d+(\.\d+)?)%/i);
      if (m2 && m2[1]) setThreshold2(parseFloat(m2[1]));
    }
  }, [kpiData]);

  // ========== ProcessedDataFetch1 → columnSums (needs columns) ==========
  useEffect(() => {
    if (!columns.length) return;
    (async () => {
      try {
        const [dynRes, kpiTowerRes] = await Promise.all([
          axios.get("/api/ProcessedDataFetch1"),
          axios.get("/api/kpi-tower"),
        ]);
        const dd = dynRes.data || [];
        if (!dd.length) return;

        const extractedHeaders = dd[0].details.map(d => d.Column1);
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const specialMonths = ['March', 'June', 'September', 'December'];
        let selMonths = [];
        if (currentMonth === 'March') selMonths = ['January', 'February', 'March'];
        else if (currentMonth === 'June') selMonths = ['April', 'May', 'June'];
        else if (currentMonth === 'September') selMonths = ['July', 'August', 'September'];
        else if (currentMonth === 'December') selMonths = ['October', 'November', 'December'];

        const calcVals = [];
        extractedHeaders.forEach(hdr => {
          if (!specialMonths.includes(currentMonth)) {
            calcVals.push("100.00");
          } else {
            let totalAch = 0, totalDist = 0;
            dd.forEach(m => {
              if (selMonths.includes(m.month)) {
                const colItem = m.details.find(x => x.Column1 === hdr);
                if (colItem) {
                  totalAch += parseFloat(colItem.Column3) || 0;
                  totalDist += parseFloat(colItem.Column2) || 0;
                }
              }
            });
            const pct = totalDist > 0 ? ((totalAch / totalDist) * 100).toFixed(2) : '0.00';
            calcVals.push(pct);
          }
        });

        const allK = kpiTowerRes.data || [];
        const wArr = allK.slice(0, 3).map(o => parseFloat(o.weightage || 0));
        const weightedRows = wArr.map(wg => calcVals.map(cv => ((parseFloat(cv) || 0) * wg / 100).toFixed(2)));

        const numCols = calcVals.length, sumArr = new Array(numCols).fill(0);
        weightedRows.forEach(row => {
          row.forEach((val, i) => { sumArr[i] += parseFloat(val) || 0; });
        });
        const finalSum = sumArr.map(sum => sum.toFixed(2));

        // Map headers → our columns (try exact + base fallback)
        const headerMap = {};
        extractedHeaders.forEach((h, i) => { headerMap[h] = i; });

        const finalSums = columns.map(col => {
          const idxExact = headerMap[col];
          const idxBase = headerMap[baseMeter(col)];
          const idx = (typeof idxExact === 'number') ? idxExact :
                      (typeof idxBase === 'number') ? idxBase : -1;
          return idx >= 0 ? finalSum[idx] : "0.00";
        });

        // E/Fiber duplication (kept from your logic)
        const eFiberVal = finalSums[0] || "0.00";
        setColumnSums([...finalSums, eFiberVal]);
      } catch (err) {
        console.error("Error CurrentMonth data:", err);
      }
    })();
  }, [columns]);

  // ========== msan/vpn/slbn → averagePlaceholder (needs columns) ==========
  useEffect(() => {
    if (!columns.length) return;
    (async () => {
      try {
        const [msanRes, vpnRes, slbnRes] = await Promise.all([
          axios.get('/api/multi-table/fetchMsan'),
          axios.get('/api/multi-table/fetchVpn'),
          axios.get('/api/multi-table/fetchSlbn'),
        ]);

        const calcPlaceholder = (data, months) => {
          const res = {};
          columns.forEach(col => {
            let totalAch = 0, totalDist = 0;
            months.forEach(mnth => {
              const found = (data || []).find(e => e.month === mnth);
              if (found?.details) {
                const cItem = found.details.find(x => x.Column1 === col || x.Column1 === baseMeter(col));
                if (cItem) {
                  totalAch += parseFloat(cItem.Column3) || 0;
                  totalDist += parseFloat(cItem.Column2) || 0;
                }
              }
            });
            res[col] = totalDist > 0 ? ((totalAch / totalDist) * 100).toFixed(2) : '0.00';
          });
          return res;
        };

        const msanPl = calcPlaceholder(msanRes.data || [], ['March', 'April']);
        const vpnPl  = calcPlaceholder(vpnRes.data  || [], ['March', 'April']);
        const slbnPl = calcPlaceholder(slbnRes.data || [], ['March', 'April']);

        const averagePl = {};
        columns.forEach(col => {
          const mVal = parseFloat(msanPl[col]) || 0;
          const vVal = parseFloat(vpnPl[col])  || 0;
          const sVal = parseFloat(slbnPl[col]) || 0;

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
  }, [columns]);

  // ========== Per-column achieved-with-weightage (rows 1,2,5,6,7,10) ==========
  useEffect(() => {
    if (
      !columns.length ||
      !kpiRes.length ||
      !Object.keys(subs).length ||
      !Object.keys(averagePlaceholder).length ||
      !Object.keys(servFulOkRow).length ||
      !columnSums.length ||
      !kpiData.length
    ) {
      return;
    }

    const calcAchievedW = (val, threshold, wg) => {
      let n = parseFloat(val);
      if (isNaN(n)) n = 0;
      if (threshold !== null && n > threshold) n = 100;
      const c = (threshold !== null && n < threshold)
        ? ((n / 100) / (threshold / 100)) * wg
        : (n / 100) * wg;
      return +c.toFixed(2);
    };

    const calcFinalDataRowW = (val) => {
      const n = parseFloat(val) || 0;
      const result = (n < (threshold5 / 100))
        ? (n / (threshold5 / 100)) * finalDataRowWeightage
        : n * finalDataRowWeightage;
      return +result.toFixed(2);
    };

    const calcCurrentMonthW = (val) => +(((parseFloat(val) || 0) * currentMonthWeightage).toFixed(2));

    const calcServFulOkW = (val) => {
      const n = parseFloat(val) || 0;
      const result = (n < threshold90)
        ? (n / 100) * servFulOkWeightage * 100
        : n * servFulOkWeightage;
      return +result.toFixed(2);
    };

    const calcSumRowW = (val) => +(((parseFloat(val) || 0) * sumRowWeightage).toFixed(2));

    const wgRow1 = parseFloat(kpiData.find(item => item.no === (kpiRes[0]?.no || kpiRes[0]?.rowNumber))?.weightage) || 0;
    const wgRow2 = parseFloat(kpiData.find(item => item.no === (kpiRes[1]?.no || kpiRes[1]?.rowNumber))?.weightage) || 0;

    // Row 1 & 2 (from kpiRes)
    columnsAchievedRef.current.row1 = columns.map(col =>
      calcAchievedW(kpiRes[0]?.percentages[col] || '0.00', threshold1, wgRow1)
    );
    columnsAchievedRef.current.row2 = columns.map(col =>
      calcAchievedW(kpiRes[1]?.percentages[col] || '0.00', threshold2, wgRow2)
    );

    // Row 5 (Final Data Row) from subs + mapping
    columnsAchievedRef.current.row5 = columns.map(col => {
      const key = lookupKeyForMeter(col);
      const v = key ? (subs[key] || 0).toFixed(2) : "0.00";
      return calcFinalDataRowW(v);
    });

    // Row 6 (Average)
    columnsAchievedRef.current.row6 = columns.map(col =>
      calcCurrentMonthW(averagePlaceholder[col] || '0.00')
    );

    // Row 7 (ServFulOk)
    columnsAchievedRef.current.row7 = columns.map(col => {
      const key = lookupKeyForMeter(col);
      // servFulOkRow[key] is a string with '%', e.g. "99.12%"
      const rawStr = key ? servFulOkRow[key] : '0';
      const raw = parseFloat(String(rawStr).replace('%', '')) || 0;
      return calcServFulOkW(raw);
    });

    // Row 10 (CurrentMonth sums)
    columnsAchievedRef.current.row10 = columns.map((_, i) =>
      calcSumRowW(columnSums[i] || '0.00')
    );
  }, [
    columns,
    kpiRes,
    subs,
    averagePlaceholder,
    servFulOkRow,
    columnSums,
    kpiData,
    threshold1,
    threshold2,
    threshold5,
    threshold90,
    currentMonthWeightage,
    servFulOkWeightage,
    finalDataRowWeightage,
    sumRowWeightage,
  ]);

  // ========== Row 12 values (Sum/TotalWeight * 100) ==========
  const [row12Data, setRow12Data] = useState([]);
  useEffect(() => {
    if (!columns.length) {
      setRow12Data([]);
      return;
    }
    const rowKeys = ['row1', 'row2', 'row5', 'row6', 'row7', 'row10'];
    const colSums = columns.map((_, i) => {
      let sum = 0;
      rowKeys.forEach(rk => { sum += columnsAchievedRef.current[rk][i] || 0; });
      return sum;
    });
    const finalValues = colSums.map((val) => {
      if (totalWeight) return ((val / totalWeight) * 100).toFixed(2);
      return '0.00';
    });
    setRow12Data(finalValues);
  }, [columns, totalWeight, kpiRes, subs, averagePlaceholder, servFulOkRow, columnSums]);

  // ============================= RENDER =============================

  // If you want to wrap with ProtectedComponent and you have it, uncomment lines below:
  // const Wrapper = ({ children }) => <ProtectedComponent>{children}</ProtectedComponent>;
  // Otherwise, use a no-op wrapper:
  const Wrapper = ({ children }) => <>{children}</>;

  return (
    <Wrapper>
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        backgroundImage: 'url("./background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="final-tables-container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '90px',
              padding: '0 20px',
              marginTop: '30px',
            }}
          >
            {categories.map((category, categoryIdx) => {
              if (!row12Data.length || !Array.isArray(category.meters) || !category.meters.length) return null;

              const meterValues = category.meters.map(meter => {
                const meterIndex = columns.indexOf(meter);
                return meterIndex !== -1 ? Number(row12Data[meterIndex]) : NaN;
              });

              const numericValues = meterValues.map(v => (Number.isFinite(v) ? v : 0));
              const maxMeterValue = numericValues.length ? Math.max(...numericValues) : 0;

              return (
                <div
                  key={`${category.title}-${categoryIdx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {/* Region name */}
                  <div style={{ width: '150px', textAlign: 'left', fontWeight: 'bold', color: 'black' }}>
                    <h3 style={{ margin: 0 }}>{category.title}</h3>
                  </div>

                  {/* Meters */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '65px',
                      justifyContent: 'flex-start',
                    }}
                  >
                    {category.meters.map((meter, idx) => {
                      const meterIndex = columns.indexOf(meter);
                      const rawVal = meterIndex !== -1 ? Number(row12Data[meterIndex]) : NaN;
                      const isNA = !Number.isFinite(rawVal);
                      const val = isNA ? 0 : rawVal;
                      const isMax = !isNA && Math.abs(val - maxMeterValue) < 0.01;

                      return (
                        <div key={`${meter}-${idx}`} style={{ width: '120px', textAlign: 'center' }}>
                          <CircularProgressbar
                            value={val}
                            maxValue={102}
                            text={isNA ? 'N/A' : `${val.toFixed(2)}%`}
                            styles={buildStyles({
                              pathColor: isNA ? '#bbb' : (isMax ? 'green' : `rgba(62, 152, 199, ${val / 100})`),
                              textColor: isNA ? '#888' : (isMax ? 'green' : '#000'),
                              trailColor: '#d6d6d6',
                              backgroundColor: '#f3f3f3',
                            })}
                          />
                          <p style={{ marginTop: '10px', color: 'black', fontWeight: isMax ? 'bold' : 'normal' }}>
                            {meter}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
