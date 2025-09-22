// src/components/FormWithDropdowns4.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FormWithDropdowns4.css";
import ExcelJS from "exceljs";

/** Human labels for internal RTOM area keys shown in the dropdown & table headers */
const optionMapping = {
  cenhkmd: "CEN/HK/MD",
  cenhkmd1: "CEN/HK/MD",
  gqkintb: "GQ/KI/NTB",
  ndfrm: "ND/RM",
  awho: "AW/HO",
  konix: "KON/KX",
  ngivt: "NG/WT",
  kgkly: "KG/KLY",
  cwpx: "CW/PX",
  debkymt: "DB/KY/MT",
  gphtnw: "GP/HT/NW",
  adipr: "AD/PR",
  bddwmrg: "BD/BW/MRG",
  keirn: "KE/RN",
  embmbmh: "EMB/HB/MH",
  aggl: "AG/GL",
  hrktph: "HR/KT/PH",
  bcjrdkltc: "BC/AP/KL/TC",
  ja: "JA",
  komltmbva: "KO/MLT/MB/VA",
};

/** From an NW EE label, derive the base family used to map to area keys */
const getBaseCodeFromEngineer = (label) => {
  const s = String(label || "").trim();

  // special case "E/Fiber NW/WPC"
  if (/^E\/Fiber\s+NW\/WPC/i.test(s)) return "E/Fiber NW/WPC";

  // generic "NW/ABC" with optional "-n" and any suffix
  const m = s.match(/^(NW\/[A-Z0-9\-]+)(?:[\s(\-]|$)/i);
  if (m) return m[1].toUpperCase();

  return s;
};

/** Map engineer base → internal RTOM area keys used by Form6 data */
const engineerBaseToAreaKeys = {
  "NW/WPC": ["cenhkmd"],
  "E/Fiber NW/WPC": ["cenhkmd1"],
  "NW/WP N-E": ["gqkintb"],
  "NW/WP S-W": ["ndfrm"],
  "NW/WP S-E": ["awho"],
  "NW/WPE": ["konix"],
  "NW/WPN": ["ngivt"],
  "NW/NWP-E": ["kgkly"],
  "NW/NWP-W": ["cwpx"],
  "NW/CPN": ["debkymt"],
  "NW/CPS": ["gphtnw"],
  "NW/NCP": ["adipr"],
  "NW/UVA": ["bddwmrg"],
  "NW/SAB": ["keirn"],
  "NW/SPE": ["embmbmh"],
  "NW/SPW": ["aggl"],
  WPS: ["hrktph"],
  "NW/EP": ["bcjrdkltc"],
  "NW/NP-1": ["ja"],
  "NW/NP-2": ["komltmbva"],
};

const Form6Table = () => {
  const [data, setData] = useState([]);
  const [daysInMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  );
  const [editCell, setEditCell] = useState({ rowId: null, key: null, value: "" });
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState([]);

  // ----- Dynamic filter hierarchy (from DB) -----
  const [hierarchy, setHierarchy] = useState([]); // [{region, provinces:[{name, engineers:[]}] }]
  const [dropdown1Options, setDropdown1Options] = useState([]); // Regions
  const [dropdown2Options, setDropdown2Options] = useState([]); // Provinces
  const [dropdown3Options, setDropdown3Options] = useState([]); // NW EEs
  const [dropdown4Options, setDropdown4Options] = useState([]); // RTOM area internal keys

  // Current selections
  const [formValues, setFormValues] = useState({
    dropdown1: "",
    dropdown2: "",
    dropdown3: "",
    dropdown4: "",
  });

  // ----- Role fetch -----
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/auth/current-role", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRole(res.data.role))
      .catch((err) => {
        console.error("Error fetching role:", err);
        setError("Failed to fetch role. Please log in again.");
      });
  }, []);

  // ----- Edit permission (your logic can be re-enabled) -----
  const checkEditPermission = () => {
    setIsEditingAllowed(true);
  };

  // ----- Form6 data fetch -----
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/form6");
      setData(res.data || []);
    } catch (e) {
      console.error("Error fetching /form6:", e);
      setError("Failed to load table data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkEditPermission();
    const id = setInterval(checkEditPermission, 60000);
    return () => clearInterval(id);
  }, []);

  // ----- Region → Province → NW EE hierarchy from DB -----
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/region-table");
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

        const map = new Map();
        rows.forEach((r) => {
          const region = String(r.region || "").trim();
          const province = String(r.province || "").trim();
          const eng = String(r.networkEngineer || "").trim();
          if (!region || !province || !eng) return;

          if (!map.has(region)) map.set(region, new Map());
          const provMap = map.get(region);
          if (!provMap.has(province)) provMap.set(province, new Set());
          provMap.get(province).add(eng);
        });

        const h = [];
        const regions = [];
        map.forEach((provMap, regionName) => {
          regions.push(regionName);
          const provinces = [];
          provMap.forEach((engSet, provName) => {
            provinces.push({ name: provName, engineers: Array.from(engSet) });
          });
          h.push({ region: regionName, provinces });
        });

        setHierarchy(h);
        setDropdown1Options(regions.sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        console.error("Failed /api/region-table:", e);
        setHierarchy([]);
        setDropdown1Options([]);
      }
    })();
  }, []);

  // ----- Utils -----
  const calculatePercentage = (totalMinutes, unavailableMinutes, totalNodes) => {
    const totalAvailableMinutes = (totalMinutes || 0) - (unavailableMinutes || 0);
    const totalMin = 24 * 60 * daysInMonth * (totalNodes || 0);
    if (totalMin === 0) return 100;
    return (100 * totalAvailableMinutes) / totalMin;
  };

  // ----- Inline edit handlers -----
  const handleEditClick = (rowId, key, value) => {
    if (!isEditingAllowed) return;
    setEditCell({ rowId, key, value });
  };

  const handleInputChange = (e) =>
    setEditCell((prev) => ({ ...prev, value: e.target.value }));

  const handleInputBlur = () => {
    if (editCell.rowId !== null) {
      const updatedData = data.map((entry) => {
        if (entry._id === editCell.rowId) {
          return {
            ...entry,
            [editCell.key.split(".")[0]]: {
              ...entry[editCell.key.split(".")[0]],
              [editCell.key.split(".")[1]]: editCell.value,
            },
          };
        }
        return entry;
      });
      setData(updatedData);
      setEditCell({ rowId: null, key: null, value: "" });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleInputBlur();
    if (e.key === "Escape") setEditCell({ rowId: null, key: null, value: "" });
  };

  const handleSave = async () => {
    if (!isEditingAllowed) return;
    try {
      await Promise.all(
        data.map((entry) => axios.put(`/form6/update/${entry._id}`, entry))
      );
      fetchData();
    } catch (e) {
      console.error("Error saving data:", e);
    }
  };

  // ----- Dynamic filter handlers (no hard-coding) -----
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "dropdown1") {
      const region = hierarchy.find((r) => r.region === value);
      const provinces = region
        ? region.provinces.map((p) => p.name).sort((a, b) => a.localeCompare(b))
        : [];
      setDropdown2Options(provinces);
      setDropdown3Options([]);
      setDropdown4Options([]);
      setFormValues((prev) => ({ ...prev, dropdown2: "", dropdown3: "", dropdown4: "" }));
    }

    if (name === "dropdown2") {
      const region = hierarchy.find((r) => r.region === formValues.dropdown1);
      const province = region?.provinces.find((p) => p.name === value);
      const engineers = province
        ? province.engineers.slice().sort((a, b) => a.localeCompare(b))
        : [];
      setDropdown3Options(engineers);
      setDropdown4Options([]);
      setFormValues((prev) => ({ ...prev, dropdown3: "", dropdown4: "" }));
    }

    if (name === "dropdown3") {
      const base = getBaseCodeFromEngineer(value);
      const areaKeys = engineerBaseToAreaKeys[base] || [];
      setDropdown4Options(areaKeys);
      setFormValues((prev) => ({ ...prev, dropdown4: "" }));
    }
  };

  const handleDropdownSubmit = (e) => {
    e.preventDefault();
    // If you need to refetch filtered data, do it here
  };

  if (loading) return <div className="loader" style={{ color: "black" }}></div>;
  if (error) return <div className="error-message">{error}</div>;

  // ----- Excel helpers -----
  const applyBorderAndAlignment = (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Network Availability");

    // Build area list dynamically from data so new areas export automatically
    const areaKeys = Array.from(
      new Set(
        data.flatMap((entry) => Object.keys(entry?.total_minutes || {}))
      )
    );

    const currentDate = new Date().toISOString().split("T")[0];
    worksheet.addRow(["KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)"]);
    worksheet.addRow([`Generated Date: ${currentDate}`]);
    worksheet.addRow([]);

    const headers = [
      "No",
      "Network Engineer KPI",
      "Division",
      "Section",
      "KPI Percent",
      ...areaKeys.map((k) => optionMapping[k] || k),
    ];
    const headerRow = worksheet.addRow(headers);
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
      const rowData = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];

      areaKeys.forEach((k) => {
        let pct = "";
        if (entry.total_minutes?.[k] !== undefined) {
          pct =
            calculatePercentage(
              entry.total_minutes?.[k],
              entry.unavailable_minutes?.[k],
              entry.total_nodes?.[k]
            ).toFixed(2) + "%";
        }
        rowData.push(pct);
      });

      const row = worksheet.addRow(rowData);
      applyBorderAndAlignment(row);

      const tm = ["", "Total Minutes", "", "", ""];
      areaKeys.forEach((k) => tm.push(entry.total_minutes?.[k] ?? ""));
      applyBorderAndAlignment(worksheet.addRow(tm));

      const um = ["", "Unavailable Minutes", "", "", ""];
      areaKeys.forEach((k) => um.push(entry.unavailable_minutes?.[k] ?? ""));
      applyBorderAndAlignment(worksheet.addRow(um));

      const tn = ["", "Total Nodes", "", "", ""];
      areaKeys.forEach((k) => tn.push(entry.total_nodes?.[k] ?? ""));
      applyBorderAndAlignment(worksheet.addRow(tn));
    });

    worksheet.columns.forEach((c) => (c.width = 15));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${currentDate}.xlsx`;
    link.click();
  };

  return (
    <div className="page5-container">
      {/* Filters */}
      <form onSubmit={handleDropdownSubmit} className="filters">
        <div>
          <label htmlFor="dropdown1">R-GM:</label>
          <select
            name="dropdown1"
            value={formValues.dropdown1}
            onChange={handleDropdownChange}
          >
            <option value="">Select Region</option>
            {dropdown1Options.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown2">P-DGM:</label>
          <select
            name="dropdown2"
            value={formValues.dropdown2}
            onChange={handleDropdownChange}
            disabled={!dropdown2Options.length}
          >
            <option value="">Select Province</option>
            {dropdown2Options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown3">NW EE:</label>
          <select
            name="dropdown3"
            value={formValues.dropdown3}
            onChange={handleDropdownChange}
            disabled={!dropdown3Options.length}
          >
            <option value="">Select NW EE</option>
            {dropdown3Options.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown4">RTOM AREA:</label>
          <select
            name="dropdown4"
            value={formValues.dropdown4}
            onChange={handleDropdownChange}
            disabled={!dropdown4Options.length}
          >
            <option value="">Select Area</option>
            {dropdown4Options.map((key) => (
              <option key={key} value={key}>
                {optionMapping[key] || key}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Table */}
      <h1 className="h1name">
        KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)
      </h1>

      <table border="1" cellPadding="10" cellSpacing="0" className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Network Engineer KPI</th>
            <th>Division</th>
            <th>Section</th>
            <th>KPI Percent</th>
            {formValues.dropdown4 && (
              <th>
                {optionMapping[formValues.dropdown4] || formValues.dropdown4}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const percentages = {};
            Object.keys(entry.total_minutes || {}).forEach((k) => {
              percentages[k] = calculatePercentage(
                entry.total_minutes?.[k],
                entry.unavailable_minutes?.[k],
                entry.total_nodes?.[k]
              );
            });

            const sel = formValues.dropdown4; // internal key

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
                  {sel && <td>{((percentages[sel] ?? 0).toFixed(2))}%</td>}
                </tr>

                {sel && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                      Unavailable Minutes
                    </td>
                    <td>
                      {editCell.rowId === entry._id &&
                      editCell.key === `unavailable_minutes.${sel}` ? (
                        <div>
                          <input
                            type="text"
                            value={editCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className="table-button" onClick={handleInputBlur}>
                              Done
                            </button>
                            <button
                              className="table-button"
                              onClick={() =>
                                setEditCell({ rowId: null, key: null, value: "" })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {entry.unavailable_minutes?.[sel] ?? ""}
                          {role === "puser" && isEditingAllowed && (
                            <button
                              className="table-button"
                              onClick={() =>
                                handleEditClick(
                                  entry._id,
                                  `unavailable_minutes.${sel}`,
                                  entry.unavailable_minutes?.[sel] ?? ""
                                )
                              }
                              style={{ marginLeft: "auto" }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {sel && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                      Total Minutes
                    </td>
                    <td>
                      {editCell.rowId === entry._id &&
                      editCell.key === `total_minutes.${sel}` ? (
                        <div>
                          <input
                            type="text"
                            value={editCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className="table-button" onClick={handleInputBlur}>
                              Done
                            </button>
                            <button
                              className="table-button"
                              onClick={() =>
                                setEditCell({ rowId: null, key: null, value: "" })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {entry.total_minutes?.[sel] ?? ""}
                          {role === "puser" && isEditingAllowed && (
                            <button
                              className="table-button"
                              onClick={() =>
                                handleEditClick(
                                  entry._id,
                                  `total_minutes.${sel}`,
                                  entry.total_minutes?.[sel] ?? ""
                                )
                              }
                              style={{ marginLeft: "auto" }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {sel && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "left", paddingLeft: 150 }}>
                      Total Nodes
                    </td>
                    <td>
                      {editCell.rowId === entry._id &&
                      editCell.key === `total_nodes.${sel}` ? (
                        <div>
                          <input
                            type="text"
                            value={editCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className="table-button" onClick={handleInputBlur}>
                              Done
                            </button>
                            <button
                              className="table-button"
                              onClick={() =>
                                setEditCell({ rowId: null, key: null, value: "" })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {entry.total_nodes?.[sel] ?? ""}
                          {role === "puser" && isEditingAllowed && (
                            <button
                              className="table-button"
                              onClick={() =>
                                handleEditClick(
                                  entry._id,
                                  `total_nodes.${sel}`,
                                  entry.total_nodes?.[sel] ?? ""
                                )
                              }
                              style={{ marginLeft: "auto" }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <button className="savebtn1" onClick={handleSave}>
        Save all Changes
      </button>
      <button className="savebtn1" style={{ marginLeft: 10 }} onClick={handleExportToExcel}>
        Export to Excel
      </button>
    </div>
  );
};

export default Form6Table;
