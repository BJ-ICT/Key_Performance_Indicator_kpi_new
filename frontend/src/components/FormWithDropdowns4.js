import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "./FormWithDropdowns4.css";
import ExcelJS from "exceljs";

const Form6Table = () => {
  const [data, setData] = useState([]);
  const [regionTable, setRegionTable] = useState([]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const [daysInMonth] = useState(new Date(currentYear, now.getMonth() + 1, 0).getDate());

  const [editCell, setEditCell] = useState({ rowId: null, key: null, value: "" });
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState([]);

  const [formValues, setFormValues] = useState({
    dropdown1: "", // Region
    dropdown2: "", // Province
    dropdown3: "", // Engineer
    dropdown4: "", // RTOM area DB key (lowercase)
  });

  const [dropdown2Options, setDropdown2Options] = useState([]);
  const [dropdown3Options, setDropdown3Options] = useState([]);
  const [dropdown4Options, setDropdown4Options] = useState([]);

  // ---- Form6 mapping (DB keys are LOWERCASE) ----
  const optionMapping = {
    cenhkmd: "CEN/HK/MD",
    cenhkmd1: "CEN/HK/MD",
    gqkintb: "GQ / KI / NTB",
    ndfrm: "ND / RM",
    awho: "AW / HO",
    konix: "KON / KX",
    ngivt: "NG / WT",
    kgkly: "KG / KLY",
    cwpx: "CW / PX",
    debkymt: "DB / KY / MT",
    gphtnw: "GP / HT / NW",
    adipr: "AD / PR",
    bddwmrg: "BD / BW / MRG",
    keirn: "KE / RN",
    embmbmh: "EMB / HB / MH",
    aggl: "AG / GL",
    hrktph: "HR / KT / PH",
    bcjrdkltc: "BC / AP / KL / TC",
    ja: "JA",
    komltmbva: "KO / MLT / MB / VA",
  };

  // Normalizer: strip non-alphanum & lowercase
  const norm = (s) => (s ? String(s).replace(/[^A-Za-z0-9]/g, "").toLowerCase() : "");

  // Reverse map (normalized friendly → dbKey)
  const friendlyToDbKey = useMemo(() => {
    const out = {};
    Object.keys(optionMapping).forEach((dbKey) => {
      out[norm(optionMapping[dbKey])] = dbKey;
      out[norm(dbKey)] = dbKey; // also accept dbKey itself
    });
    return out;
  }, [optionMapping]);

  // ---- Auth role ----
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/auth/current-role", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRole(res.data.role))
      .catch(() => setError("Failed to fetch role. Please log in again."));
  }, []);

  // ---- Region table (dynamic) ----
  useEffect(() => {
    axios
      .get("/api/region-table")
      .then((res) => {
        if (res.data && res.data.data) setRegionTable(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch region table:", err));
  }, []);

  // ---- KPI data ----
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/form6", { params: { year: String(currentYear), month: currentMonth } });
      // filter returned entries to current year/month (backend may already do this)
      const entries = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const filtered = entries.filter((item) => String(item.year) === String(currentYear) && String(item.month) === currentMonth);
      setData(filtered);
    } catch (e) {
      console.error(e);
      setError("Failed to load table data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // keep permission check alive if you later time-bound it
    const id = setInterval(() => setIsEditingAllowed(true), 60000);
    return () => clearInterval(id);
  }, []);

  // ---- Cascading dropdowns (dynamic from regionTable) ----
  const regions = useMemo(
    () => Array.from(new Set(regionTable.map((r) => r.region))).filter(Boolean),
    [regionTable]
  );

  const updateDropdown2Options = (region) => {
    if (!region) return setDropdown2Options([]);
    const provinces = Array.from(
      new Set(regionTable.filter((x) => x.region === region).map((x) => x.province))
    ).filter(Boolean);
    setDropdown2Options(provinces);
  };

  const updateDropdown3Options = (province) => {
    if (!province || !formValues.dropdown1) return setDropdown3Options([]);
    const engineers = Array.from(
      new Set(
        regionTable
          .filter((x) => x.region === formValues.dropdown1 && x.province === province)
          .map((x) => x.networkEngineer)
      )
    ).filter(Boolean);
    setDropdown3Options(engineers);
  };

  const updateDropdown4Options = (engineer) => {
    if (!engineer || !formValues.dropdown1 || !formValues.dropdown2)
      return setDropdown4Options([]);

    // Map any label ("AD / PR", "ad/pr", "ADPR") → lowercase DB key "adipr"
    const leas = Array.from(
      new Set(
        regionTable
          .filter(
            (x) =>
              x.region === formValues.dropdown1 &&
              x.province === formValues.dropdown2 &&
              x.networkEngineer === engineer
          )
          .map((x) => friendlyToDbKey[norm(x.lea)] || norm(x.lea))
      )
    ).filter(Boolean);

    setDropdown4Options(leas);
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => {
      const u = { ...prev, [name]: value };
      if (name === "dropdown1") {
        updateDropdown2Options(value);
        u.dropdown2 = "";
        u.dropdown3 = "";
        u.dropdown4 = "";
        setDropdown3Options([]);
        setDropdown4Options([]);
      } else if (name === "dropdown2") {
        updateDropdown3Options(value);
        u.dropdown3 = "";
        u.dropdown4 = "";
        setDropdown4Options([]);
      } else if (name === "dropdown3") {
        updateDropdown4Options(value);
        u.dropdown4 = "";
      }
      return u;
    });
  };

  // ---- Edit logic ----
  const handleEditClick = (rowId, key, value) => {
    if (!isEditingAllowed) return;
    setEditCell({ rowId, key, value: value === undefined || value === null ? "" : String(value) });
  };

  const handleInputChange = (e) => {
    setEditCell((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleInputBlur = () => {
    if (editCell.rowId !== null) {
      const updated = data.map((entry) => {
        if (entry._id === editCell.rowId) {
          const [parentKey, childKey] = editCell.key.split(".");
          const newValue = editCell.value;

          const next = {
            ...entry,
            [parentKey]: {
              ...(entry[parentKey] || {}),
              [childKey]: newValue,
            },
          };

          // If total_nodes was edited, keep total_minutes in sync
          if (parentKey === "total_nodes") {
            const nodes = Number(newValue) || 0;
            next.total_minutes = {
              ...(entry.total_minutes || {}),
              [childKey]: 24 * 60 * daysInMonth * nodes,
            };
          }
          return next;
        }
        return entry;
      });
      setData(updated);
      setEditCell({ rowId: null, key: null, value: "" });
    }
  };

  const handleSave = async () => {
    if (!isEditingAllowed) return;
    try {
      await Promise.all(data.map((entry) => axios.put(`/form6/update/${entry._id}`, entry)));
      fetchData();
      toast.success('All changes have been saved successfully!', {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e) {
      console.error("Error saving data:", e);
      toast.error('Failed to save changes. Please try again.', {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const calculatePercentage = (totalMinutes, unavailableMinutes, totalNodes) => {
    // all values stored as strings in DB → coerce to numbers
    const tm = Number(totalMinutes) || 0;
    const um = Number(unavailableMinutes) || 0;
    const tn = Number(totalNodes) || 0;

    const totalAvailableMinutes = tm - um;
    const totalMin = 24 * 60 * daysInMonth * tn;
    if (totalMin === 0) return 100;
    return (100 * totalAvailableMinutes) / totalMin;
  };

  // Selected RTOM area DB key (lowercase); keep rows always visible
  const selectedKey = formValues.dropdown4 ? norm(formValues.dropdown4) : "";

  // ---- Excel export ----
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Network Availability");

    const areas = Object.keys(optionMapping);

    ws.addRow(["KPI (NW Availability - IP Core NW / BSR NW / Service Edge NW)"]);
    ws.addRow([`Generated Date: ${new Date().toISOString().split("T")[0]}`]);
    ws.addRow([]);

    const headers = [
      "No",
      "Network Engineer KPI",
      "Division",
      "Section",
      "KPI Percent",
      ...areas.map((a) => optionMapping[a] || a),
    ];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0070C0" } };
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    data.forEach((entry) => {
      const row = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];
      areas.forEach((a) => {
        const k = norm(a); // a is already db key; norm is safe
        let pct = "";
        if (
          entry.total_minutes?.[k] !== undefined ||
          entry.unavailable_minutes?.[k] !== undefined ||
          entry.total_nodes?.[k] !== undefined
        ) {
          pct =
            calculatePercentage(
              entry.total_minutes?.[k],
              entry.unavailable_minutes?.[k],
              entry.total_nodes?.[k]
            ).toFixed(2) + "%";
        }
        row.push(pct);
      });
      const r = ws.addRow(row);
      r.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Sub-rows: Total Minutes, Unavailable Minutes, Total Nodes
      const tm = ["", "Total Minutes", "", "", ""];
      const um = ["", "Unavailable Minutes", "", "", ""];
      const tn = ["", "Total Nodes", "", "", ""];
      areas.forEach((a) => {
        const k = norm(a);
        tm.push(entry.total_minutes?.[k] ?? "");
        um.push(entry.unavailable_minutes?.[k] ?? "");
        tn.push(entry.total_nodes?.[k] ?? "");
      });
      [tm, um, tn].forEach((arr) => {
        const rr = ws.addRow(arr);
        rr.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });
    });

    ws.columns.forEach((c) => (c.width = 15));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();
  };

  // ---- UI 
  if (loading) return <div className="loader" style={{ color: "black" }}></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page5-container">
      <ToastContainer />
      {/* Filters */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>R-GM:</label>
          <select name="dropdown1" value={formValues.dropdown1} onChange={handleDropdownChange}>
            <option value="">Select</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>P-DGM:</label>
          <select name="dropdown2" value={formValues.dropdown2} onChange={handleDropdownChange}>
            <option value="">Select</option>
            {dropdown2Options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>NW EE:</label>
          <select name="dropdown3" value={formValues.dropdown3} onChange={handleDropdownChange}>
            <option value="">Select</option>
            {dropdown3Options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>RTOM AREA:</label>
          <select name="dropdown4" value={formValues.dropdown4} onChange={handleDropdownChange}>
            <option value="">Select</option>
            {dropdown4Options.map((dbKey) => (
              <option key={dbKey} value={dbKey}>
                {optionMapping[dbKey] || dbKey}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Table */}
      <h1 className="h1name">
        KPI (NW Availability - IP Core NW / BSR NW / Service Edge NW)
      </h1>

      <table className="data-table" border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>No</th>
            <th>Network Engineer KPI</th>
            <th>Division</th>
            <th>Section</th>
            <th>KPI Percent</th>
            {selectedKey && <th>{optionMapping[selectedKey] || selectedKey}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const k = selectedKey;
            const percent =
              k && (entry.total_minutes?.[k] || entry.unavailable_minutes?.[k] || entry.total_nodes?.[k])
                ? calculatePercentage(
                    entry.total_minutes?.[k],
                    entry.unavailable_minutes?.[k],
                    entry.total_nodes?.[k]
                  ).toFixed(2)
                : "";

            return (
              <React.Fragment key={entry._id}>
                <tr>
                  <td>{entry.no}</td>
                  <td>
                    <b>{entry.network_engineer_kpi}</b>
                  </td>
                  <td>{entry.division}</td>
                  <td>{entry.section}</td>
                  <td>{entry.kpi_percent}</td>
                  {selectedKey ? <td>{percent ? `${percent}%` : ""}</td> : null}
                </tr>

                {/* Sub rows only when an RTOM area is selected */}
                {selectedKey && (
                  <>
                    {/* Unavailable Minutes */}
                    <tr>
                      <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                        Unavailable Minutes
                      </td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.key === `unavailable_minutes.${selectedKey}` ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value === undefined || editCell.value === null ? "" : String(editCell.value)}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 0 }}>
                              <button className="table-button" onClick={handleInputBlur}>
                                Done
                              </button>
                              <button
                                className="table-button"
                                onClick={() => setEditCell({ rowId: null, key: null, value: "" })}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {entry.unavailable_minutes?.[selectedKey] ?? ""}
                            {role === "padmin" && isEditingAllowed && (
                              <button
                                className="table-button"
                                style={{ marginLeft: "auto" }}
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    `unavailable_minutes.${selectedKey}`,
                                    entry.unavailable_minutes?.[selectedKey] ?? ""
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Total Minutes */}
                    <tr>
                      <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                        Total Minutes
                      </td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.key === `total_minutes.${selectedKey}` ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value === undefined || editCell.value === null ? "" : String(editCell.value)}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 0 }}>
                              <button className="table-button" onClick={handleInputBlur}>
                                Done
                              </button>
                              <button
                                className="table-button"
                                onClick={() => setEditCell({ rowId: null, key: null, value: "" })}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {entry.total_minutes?.[selectedKey] ?? ""}
                            {role === "padmin" && isEditingAllowed && (
                              <button
                                className="table-button"
                                style={{ marginLeft: "auto" }}
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    `total_minutes.${selectedKey}`,
                                    entry.total_minutes?.[selectedKey] ?? ""
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Total Nodes */}
                    <tr>
                      <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                        Total Nodes
                      </td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.key === `total_nodes.${selectedKey}` ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value === undefined || editCell.value === null ? "" : String(editCell.value)}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 0 }}>
                              <button className="table-button" onClick={handleInputBlur}>
                                Done
                              </button>
                              <button
                                className="table-button"
                                onClick={() => setEditCell({ rowId: null, key: null, value: "" })}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {entry.total_nodes?.[selectedKey] ?? ""}
                            {role === "padmin" && isEditingAllowed && (
                              <button
                                className="table-button"
                                style={{ marginLeft: "auto" }}
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    `total_nodes.${selectedKey}`,
                                    entry.total_nodes?.[selectedKey] ?? ""
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <button
        className="savebtn1"
        onClick={handleSave}
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '8px 16px',
          marginRight: 10,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Save All Changes
      </button>
      <button
        className="savebtn1"
        onClick={handleExportToExcel}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default Form6Table;
