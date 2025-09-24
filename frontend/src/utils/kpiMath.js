// src/utils/kpiMath.js

// =============================
// Shared maps
// =============================
export const columnToKeyMap = {
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

export const servFulOkMap = {
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

export const servFulOkRowMultipliers = [0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.05, 0.05];

// =============================
// Pure helpers (no side effects)
// =============================
export const baseMeter = (col) => String(col || '').replace(/-\d+$/, '');

export const lookupKeyForMeter = (col) => {
  const base = baseMeter(col);
  return columnToKeyMap[col] || columnToKeyMap[base]; // prefer exact, fallback base
};

export const calcPct = (tm, um, tn) => {
  if (!tm && !um && !tn) return 100;
  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const total = 24 * 60 * days * (tn || 0);
  const avail = (tm || 0) - (um || 0);
  return total ? (100 * avail) / total : 0;
};

export const calcTotals = (data, mult) => {
  const t = {};
  (data || []).forEach((e, i) => {
    if (e?.total_minutes && e?.unavailable_minutes && e?.total_nodes) {
      const m = mult[i] || 1;
      Object.keys(e.total_minutes).forEach(k => {
        const pct = calcPct(e.total_minutes[k], e.unavailable_minutes[k], e.total_nodes[k]);
        t[k] = (t[k] || 0) + pct * m;
      });
    }
  });
  return t;
};

// KPI percentages for dynamic columns; “no data” => 0.00
export const computePercentagesForColumns = (f, s, cols) => {
  const p = {};
  (cols || []).forEach(col => {
    const key = lookupKeyForMeter(col);
    const fv = key ? (parseFloat(f?.[key]) || 0) : 0;
    const sv = key ? (parseFloat(s?.[key]) || 0) : 0;
    p[col] = (fv === 0 && sv === 0) ? "0.00" : (sv ? ((fv / sv) * 100).toFixed(2) : "0.00");
  });
  return p;
};

export const normalizeEngineer = (str = '') => String(str).split('(')[0].trim();

export const sortRegionNames = (a, b) => {
  if (a === 'Metro' && b !== 'Metro') return -1;
  if (b === 'Metro' && a !== 'Metro') return 1;
  const ra = a.match(/Region\s*(\d+)/i);
  const rb = b.match(/Region\s*(\d+)/i);
  if (ra && rb) return Number(ra[1]) - Number(rb[1]);
  return a.localeCompare(b);
};

// Row12 = sum(contributions) / effectiveWeight * 100 (per meter)
export const computeRow12Values = ({
  columns,
  columnsAchievedRef,          // {row1,row2,row5,row6,row7,row10} each: number[]
  kpiRes,
  row6Has,                      // {col: boolean}
  row10Has,                     // boolean[]
  weightsPct                    // { w1,w2,w5,w6,w7,w10 } as % numbers
}) => {
  if (!Array.isArray(columns) || !columns.length) return [];

  const rowKeys = ['row1', 'row2', 'row5', 'row6', 'row7', 'row10'];
  const colSums = columns.map((_, i) =>
    rowKeys.reduce((acc, rk) => acc + (columnsAchievedRef.current?.[rk]?.[i] || 0), 0)
  );

  const { w1, w2, w5, w6, w7, w10 } = weightsPct;

  return columns.map((col, i) => {
    const has1  = !!kpiRes?.[0]?.percentages?.hasOwnProperty(col);
    const has2  = !!kpiRes?.[1]?.percentages?.hasOwnProperty(col);
    const has5  = !!lookupKeyForMeter(col);
    const has6  = !!row6Has?.[col];
    const has7  = !!lookupKeyForMeter(col);
    const has10 = !!row10Has?.[i];

    const denom =
      (has1  ? w1  : 0) +
      (has2  ? w2  : 0) +
      (has5  ? w5  : 0) +
      (has6  ? w6  : 0) +
      (has7  ? w7  : 0) +
      (has10 ? w10 : 0);

    if (!denom) return '0.00';
    return ((colSums[i] / denom) * 100).toFixed(2);
  });
};
