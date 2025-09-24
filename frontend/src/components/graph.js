// src/components/Dashboard.js

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";


// ==============================
// Helpers
// ==============================

const baseMeter = (col) => String(col || "").replace(/-\d+$/, "");
const normalizeEngineer = (str = "") => String(str).split("(")[0].trim();
const sortRegionNames = (a, b) => {
  if (a === "Metro" && b !== "Metro") return -1;
  if (b === "Metro" && a !== "Metro") return 1;

  const ra = a.match(/Region\s*(\d+)/i);
  const rb = b.match(/Region\s*(\d+)/i);
  if (ra && rb) return Number(ra[1]) - Number(rb[1]);

  return a.localeCompare(b);
};

function readRow12FromLocalStorage() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("row12Payload");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (parsed?.valuesByMeter && typeof parsed.valuesByMeter === "object") {
      return parsed.valuesByMeter;
    }

    if (Array.isArray(parsed?.columns) && Array.isArray(parsed?.values)) {
      const map = {};
      parsed.columns.forEach((m, i) => {
        const v = parseFloat(parsed.values[i]);
        map[m] = Number.isFinite(v) ? v : 0;
      });
      return map;
    }
  } catch (e) {
    console.warn("Failed to parse localStorage row12Payload", e);
  }

  return null;
}

async function fetchRow12MapFromApi() {
  try {
    const { data } = await axios.get("/api/finaltable/row12");
    if (!data) return null;

    if (data.valuesByMeter) return data.valuesByMeter;

    if (Array.isArray(data?.columns) && Array.isArray(data?.values)) {
      const map = {};
      data.columns.forEach((m, i) => {
        const v = parseFloat(data.values[i]);
        map[m] = Number.isFinite(v) ? v : 0;
      });
      return map;
    }

    if (Array.isArray(data)) {
      const map = {};
      data.forEach(({ meter, name, column, value }) => {
        const key = meter ?? name ?? column;
        const val = parseFloat(value);
        if (key) map[key] = Number.isFinite(val) ? val : 0;
      });
      return Object.keys(map).length ? map : null;
    }

    return null;
  } catch(err) {
    console.error("Failed to fetch Row 12 map from API", err);
    return null;
  }
}


// ==============================
// Dashboard Component
// ==============================

export default function Dashboard() {
  const [regions, setRegions] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/region-table");
        const items = data?.data || [];

        const byRegion = new Map();
        items.forEach(({ region, networkEngineer }) => {
          const code = normalizeEngineer(networkEngineer);
          if (!byRegion.has(region)) byRegion.set(region, new Set());
          byRegion.get(region).add(code);
        });

        const payload = Array.from(byRegion.entries())
          .sort(([a], [b]) => sortRegionNames(a, b))
          .map(([title, set]) => ({ title, meters: Array.from(set) }));

        setRegions(payload);
      } catch (e) {
        console.error("Failed to load region table", e);
        setRegions([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const api = await fetchRow12MapFromApi();
      if (api) {
        setTotals(api);
        setLoading(false);
        return;
      }
      setTotals(readRow12FromLocalStorage() || {});
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const onStorage = (ev) => {
      if (ev.key === "row12Payload") {
        const map = readRow12FromLocalStorage();
        if (map) setTotals(map);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, []);

  const hasTotals = useMemo(() => Object.keys(totals || {}).length > 0, [totals]);

  const valueForMeter = (meter) => {
    const exact = totals[meter];
    if (Number.isFinite(exact)) return exact;

    const base = totals[baseMeter(meter)];
    if (Number.isFinite(base)) return base;

    return 0;
  };

  // ==============================
  // Render
  // ==============================

  if (loading) return <div className="loading">Loading…</div>;

  if (!hasTotals) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Dashboard</h2>
        <p>
          No totals available yet. Ensure <code>FinalTables</code> publishes Row-12
          to <code>localStorage</code> or provide an API at <code>/api/finaltable/row12</code>.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Poppins, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2f3, #dfe9f3)",
      }}
    >
      <motion.div
        className="final-tables-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            marginBottom: 90,
            padding: "0 20px",
            marginTop: 30,
          }}
        >
          {regions.map(({ title, meters }, idx) => {
            const values = meters.map((m) => valueForMeter(m));
            const max = values.length ? Math.max(...values) : 0;

            return (
              <motion.div
                key={`${title}-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 16,
                  padding: 20,
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}
              >
                {/* Region title */}
                <div
                  style={{
                    width: 150,
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{title}</h3>
                </div>

                {/* Meters */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 50,
                    justifyContent: "flex-start",
                  }}
                >
                  {meters.map((meter, mIdx) => {
                    const val = valueForMeter(meter);
                    const isMax = Math.abs(val - max) < 0.0001 && max > 0;

                    return (
                      <motion.div
                        key={`${meter}-${mIdx}`}
                        style={{ width: 120, textAlign: "center" }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (idx * 0.15) + (mIdx * 0.1), duration: 0.4 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <CircularProgressbar
                          value={val}
                          maxValue={100}
                          text={`${val.toFixed(2)}%`}
                          styles={buildStyles({
                            pathTransitionDuration: 1.5,
                            pathColor: isMax
                              ? "limegreen"
                              : `rgba(62, 152, 199, ${val / 100})`,
                            textColor: isMax ? "limegreen" : "#222",
                            trailColor: "#eee",
                          })}
                        />
                        <p
                          style={{
                            marginTop: 12,
                            color: isMax ? "limegreen" : "#444",
                            fontWeight: isMax ? "bold" : "normal",
                            fontSize: "0.9rem",
                          }}
                        >
                          {meter}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
