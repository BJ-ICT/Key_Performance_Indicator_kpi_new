//It is created for some testing purpose only for dev

// // src/components/dashboard.js
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";

// // -------- helpers ----------
// const baseMeter = (col) => String(col || "").replace(/-\d+$/, "");
// const normalizeEngineer = (str = "") => String(str).split("(")[0].trim();
// const sortRegionNames = (a, b) => {
//   if (a === "Metro" && b !== "Metro") return -1;
//   if (b === "Metro" && a !== "Metro") return 1;
//   const ra = a.match(/Region\s*(\d+)/i);
//   const rb = b.match(/Region\s*(\d+)/i);
//   if (ra && rb) return Number(ra[1]) - Number(rb[1]);
//   return a.localeCompare(b);
// };

// function readRow12FromLocalStorage() {
//   if (typeof window === "undefined") return null;
//   try {
//     const raw = window.localStorage.getItem("row12Payload");
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);

//     // Accept either {valuesByMeter:{...}} or {columns:[...], values:[...]}
//     if (parsed?.valuesByMeter && typeof parsed.valuesByMeter === "object") {
//       return parsed.valuesByMeter;
//     }
//     if (Array.isArray(parsed?.columns) && Array.isArray(parsed?.values)) {
//       const map = {};
//       parsed.columns.forEach((m, i) => {
//         const v = parseFloat(parsed.values[i]);
//         map[m] = Number.isFinite(v) ? v : 0;
//       });
//       return map;
//     }
//   } catch (e) {
//     console.warn("localStorage row12Payload parse error", e);
//   }
//   return null;
// }

// async function fetchRow12MapFromApi() {
//   try {
//     // Accept a few shapes to make it robust
//     const { data } = await axios.get("/api/finaltable/row12");
//     if (!data) return null;

//     // Common shapes:
//     // 1) { valuesByMeter: { 'NW/WPE': 69.82, ... } }
//     // 2) { columns: [...], values: [...] }
//     // 3) [ { meter: 'NW/WPE', value: 69.82 }, ... ]
//     if (data.valuesByMeter) return data.valuesByMeter;

//     if (Array.isArray(data?.columns) && Array.isArray(data?.values)) {
//       const map = {};
//       data.columns.forEach((m, i) => {
//         const v = parseFloat(data.values[i]);
//         map[m] = Number.isFinite(v) ? v : 0;
//       });
//       return map;
//     }

//     if (Array.isArray(data)) {
//       const map = {};
//       data.forEach((row) => {
//         const key = row?.meter ?? row?.name ?? row?.column;
//         const val = parseFloat(row?.value);
//         if (key) map[key] = Number.isFinite(val) ? val : 0;
//       });
//       return Object.keys(map).length ? map : null;
//     }
//     return null;
//   } catch (e) {
//     // 404 or any other error -> tell caller to try localStorage
//     return null;
//   }
// }

// export default function Dashboard() {
//   const [regions, setRegions] = useState([]); // [{ title, meters: [] }]
//   const [totals, setTotals] = useState({});   // { 'NW/WPE': 69.82, ... }
//   const [loading, setLoading] = useState(true);

//   // load regions dynamically
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get("/api/region-table");
//         const items = res?.data?.data || [];
//         const byRegion = new Map();
//         items.forEach(({ region, networkEngineer }) => {
//           const code = normalizeEngineer(networkEngineer);
//           if (!byRegion.has(region)) byRegion.set(region, new Set());
//           byRegion.get(region).add(code);
//         });
//         const payload = Array.from(byRegion.entries())
//           .sort((a, b) => sortRegionNames(a[0], b[0]))
//           .map(([title, set]) => ({ title, meters: Array.from(set) }));
//         setRegions(payload);
//       } catch (e) {
//         console.error("Failed to load region table", e);
//         setRegions([]);
//       }
//     })();
//   }, []);

//   // load totals from API then fall back to localStorage
//   useEffect(() => {
//     (async () => {
//       const api = await fetchRow12MapFromApi();
//       if (api) {
//         setTotals(api);
//         setLoading(false);
//         return;
//       }
//       const ls = readRow12FromLocalStorage();
//       setTotals(ls || {}); // if null -> empty object
//       setLoading(false);
//     })();
//   }, []);

//   // update on storage changes (if FinalTables updates while Dashboard is open)
//   useEffect(() => {
//     const onStorage = (ev) => {
//       if (ev.key === "row12Payload") {
//         const map = readRow12FromLocalStorage();
//         if (map) setTotals(map);
//       }
//     };
//     if (typeof window !== "undefined") {
//       window.addEventListener("storage", onStorage);
//       return () => window.removeEventListener("storage", onStorage);
//     }
//   }, []);

//   const hasTotals = useMemo(() => Object.keys(totals || {}).length > 0, [totals]);

//   const valueForMeter = (meter) => {
//     // exact match or base match (e.g., NW/WPC-1 -> NW/WPC)
//     const exact = totals[meter];
//     if (Number.isFinite(exact)) return exact;
//     const base = totals[baseMeter(meter)];
//     if (Number.isFinite(base)) return base;
//     return 0; // missing -> 0%
//   };

//   if (loading) return <div>Loading…</div>;

//   if (!hasTotals) {
//     return (
//       <div style={{ padding: 24 }}>
//         <h2>Dashboard</h2>
//         <p>No totals available yet. Make sure <code>FinalTables</code> publishes Row-12
//            to <code>localStorage</code> or expose an API at <code>/api/finaltable/row12</code>.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         padding: "20px",
//         fontFamily: "Arial, sans-serif",
//         minHeight: "100vh",
//         backgroundImage: 'url("./background.jpg")',
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <div className="final-tables-container">
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "20px",
//             marginBottom: "90px",
//             padding: "0 20px",
//             marginTop: "30px",
//           }}
//         >
//           {regions.map((category, idx) => {
//             const values = (category.meters || []).map((m) => valueForMeter(m));
//             const max = values.length ? Math.max(...values) : 0;

//             return (
//               <div
//                 key={`${category.title}-${idx}`}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   border: "1px solid #ccc",
//                   borderRadius: "8px",
//                   padding: "15px",
//                   backgroundColor: "rgba(255, 255, 255, 0.7)",
//                 }}
//               >
//                 {/* Region name */}
//                 <div style={{ width: 150, textAlign: "left", fontWeight: "bold", color: "black" }}>
//                   <h3 style={{ margin: 0 }}>{category.title}</h3>
//                 </div>

//                 {/* Gauges */}
//                 <div
//                   style={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     gap: "65px",
//                     justifyContent: "flex-start",
//                   }}
//                 >
//                   {(category.meters || []).map((meter, mIdx) => {
//                     const val = valueForMeter(meter);
//                     const isMax = Math.abs(val - max) < 0.0001 && max > 0;
//                     const text = `${val.toFixed(2)}%`;

//                     return (
//                       <div key={`${meter}-${mIdx}`} style={{ width: 120, textAlign: "center" }}>
//                         <CircularProgressbar
//                           value={val}
//                           maxValue={100}
//                           text={text}
//                           styles={buildStyles({
//                             pathColor: isMax ? "green" : `rgba(62, 152, 199, ${val / 100})`,
//                             textColor: isMax ? "green" : "#000",
//                             trailColor: "#d6d6d6",
//                             backgroundColor: "#f3f3f3",
//                           })}
//                         />
//                         <p
//                           style={{
//                             marginTop: 10,
//                             color: "black",
//                             fontWeight: isMax ? "bold" : "normal",
//                           }}
//                         >
//                           {meter}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
