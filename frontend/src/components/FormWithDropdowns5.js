import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FormWithDropdowns5.css";
import ExcelJS from "exceljs";

const Form6Table = () => {
  const [data, setData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [daysInMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  );
  const [editCell, setEditCell] = useState({ rowId: null, key: null, value: "" });
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState([]);

  // ✅ Fetch user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/auth/current-role", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRole(res.data.role))
      .catch(() => setError("Failed to fetch role. Please log in again."));
  }, []);

  // ✅ Fetch KPI data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/form7");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load table data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setIsEditingAllowed(true);
  }, []);

  // ✅ Fetch Region Table for dynamic dropdowns
  useEffect(() => {
    axios
      .get("/api/region-table")
      .then((res) => {
        setRegionData(res.data.data || res.data); // handle both {data:[]} and []
      })
      .catch((err) => {
        console.error("Error fetching region data:", err);
        setError("Failed to load region data.");
      });
  }, []);

  // ------------------ DROPDOWNS ------------------
  const [formValues, setFormValues] = useState({
    dropdown1: "",
    dropdown2: "",
    dropdown3: "",
    dropdown4: "",
  });

  // Derive options dynamically from regionData
  const uniqueRegions = [...new Set(regionData.map((r) => r.region))];
  const provinces = regionData
    .filter((r) => r.region === formValues.dropdown1)
    .map((r) => r.province)
    .filter((v, i, a) => a.indexOf(v) === i);
  const networkEngineers = regionData
    .filter(
      (r) => r.region === formValues.dropdown1 && r.province === formValues.dropdown2
    )
    .map((r) => r.networkEngineer)
    .filter((v, i, a) => a.indexOf(v) === i);
  const leas = regionData
    .filter(
      (r) =>
        r.region === formValues.dropdown1 &&
        r.province === formValues.dropdown2 &&
        r.networkEngineer === formValues.dropdown3
    )
    .map((r) => r.lea)
    .filter((v, i, a) => a.indexOf(v) === i);

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "dropdown1"
        ? { dropdown2: "", dropdown3: "", dropdown4: "" }
        : name === "dropdown2"
        ? { dropdown3: "", dropdown4: "" }
        : name === "dropdown3"
        ? { dropdown4: "" }
        : {}),
    }));
  };

  // Normalize RTOM key (e.g., "CEN / HK / MD" → "cenhkmd")
  const normalizeKey = (val) => (val ? val.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "");

  const selectedKey = normalizeKey(formValues.dropdown4);

  // ------------------ EDITING LOGIC ------------------
  const handleEditClick = (rowId, key, value) => {
    if (!isEditingAllowed) return;
    setEditCell({ rowId, key, value });
  };

  const handleInputChange = (e) => setEditCell((prev) => ({ ...prev, value: e.target.value }));

  const handleInputBlur = () => {
    if (editCell.rowId !== null) {
      const updatedData = data.map((entry) => {
        if (entry._id === editCell.rowId) {
          const [parentKey, childKey] = editCell.key.split(".");
          const newValue = editCell.value;

          const updatedEntry = {
            ...entry,
            [parentKey]: {
              ...entry[parentKey],
              [childKey]: newValue,
            },
          };

          if (parentKey === "total_nodes") {
            const nodes = Number(newValue) || 0;
            const computedTotalMinutes = 24 * 60 * daysInMonth * nodes;
            updatedEntry.total_minutes = {
              ...entry.total_minutes,
              [childKey]: computedTotalMinutes,
            };
          }

          return updatedEntry;
        }
        return entry;
      });
      setData(updatedData);
      setEditCell({ rowId: null, key: null, value: "" });
    }
  };

  const handleSave = async () => {
    if (!isEditingAllowed) return;
    try {
      const updatePromises = data.map((entry) =>
        axios.put(`/form7/update/${entry._id}`, entry)
      );
      await Promise.all(updatePromises);
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const calculatePercentage = (totalMinutes, unavailableMinutes, totalNodes) => {
    const minutes = Number(totalMinutes) || 0;
    const unavailable = Number(unavailableMinutes) || 0;
    const nodes = Number(totalNodes) || 0;
    const totalAvailableMinutes = minutes - unavailable;
    const totalMin = 24 * 60 * daysInMonth * nodes;
    if (totalMin <= 0) return 100;
    const raw = (100 * totalAvailableMinutes) / totalMin;
    return Math.max(0, Math.min(100, raw));
  };

  // ------------------ EXPORT TO EXCEL ------------------
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("KPI Data");

    worksheet.addRow(["KPI (Network Availability Summary)"]);
    worksheet.addRow([]);

    const allAreas = Object.keys(data[0]?.total_minutes || {}).filter(
      (area) => area !== "_id"
    );

    const headers = [
      "No",
      "Network Engineer KPI",
      "Division",
      "Section",
      "KPI Percent",
      ...allAreas,
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0070C0" } };
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    data.forEach((entry) => {
      const row = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];

      allAreas.forEach((area) => {
        const totalMinutes = entry.total_minutes?.[area];
        const unavailableMinutes = entry.unavailable_minutes?.[area];
        const totalNodes = entry.total_nodes?.[area];
        const percentage = calculatePercentage(
          totalMinutes,
          unavailableMinutes,
          totalNodes
        );
        row.push(`${percentage.toFixed(2)}%`);
      });

      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();
  };

  if (loading) return <div className="loader" style={{ color: "black" }}></div>;
  if (error) return <div className="error-message">{error}</div>;

  // ------------------ RENDER ------------------
  return (
    <div className="page6-container">
      <form>
        <div>
          <label>R-GM:</label>
          <select name="dropdown1" value={formValues.dropdown1} onChange={handleDropdownChange}>
            <option value="">Select Region</option>
            {uniqueRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>P-DGM:</label>
          <select name="dropdown2" value={formValues.dropdown2} onChange={handleDropdownChange}>
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>NW EE:</label>
          <select name="dropdown3" value={formValues.dropdown3} onChange={handleDropdownChange}>
            <option value="">Select Engineer</option>
            {networkEngineers.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>RTOM AREA:</label>
          <select name="dropdown4" value={formValues.dropdown4} onChange={handleDropdownChange}>
            <option value="">Select RTOM</option>
            {leas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </form>

      <h1 className="h1name">
        KPI (MSAN / OLT / IP Core - Network Availability)
      </h1>

      <table border="1" cellPadding="10" cellSpacing="0" className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Network Engineer KPI</th>
            <th>Division</th>
            <th>Section</th>
            <th>KPI Percent</th>
            {selectedKey && <th>{formValues.dropdown4}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const tm = entry.total_minutes?.[selectedKey];
            const um = entry.unavailable_minutes?.[selectedKey];
            const tn = entry.total_nodes?.[selectedKey];
            const pct = selectedKey
              ? calculatePercentage(tm, um, tn).toFixed(2)
              : null;

            return (
              <React.Fragment key={entry._id}>
                <tr>
                  <td>{entry.no}</td>
                  <td><b>{entry.network_engineer_kpi}</b></td>
                  <td>{entry.division}</td>
                  <td>{entry.section}</td>
                  <td>{entry.kpi_percent}</td>
                  {selectedKey && <td>{pct}%</td>}
                </tr>

                {selectedKey &&
                  ["unavailable_minutes", "total_minutes", "total_nodes"].map((type) => (
                    <tr key={type}>
                      <td colSpan="5" style={{ textAlign: "left", paddingLeft: "150px" }}>
                        {type === "unavailable_minutes"
                          ? "Unavailable Minutes"
                          : type === "total_minutes"
                          ? "Total Minutes"
                          : "Total Nodes"}
                      </td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.key === `${type}.${selectedKey}` ? (
                          <div>
                            <input
                              type="text"
                              value={editCell.value}
                              onChange={handleInputChange}
                              autoFocus
                            />
                            <button
                              className="table-button"
                              onClick={handleInputBlur}
                              style={{ marginLeft: '10px' }}
                            >
                              Done
                            </button>
                            <button
                              className="table-button"
                              onClick={() =>
                                setEditCell({ rowId: null, key: null, value: "" })
                              }
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {entry[type]?.[selectedKey] ?? "-"}
                            {role === "puser" && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    `${type}.${selectedKey}`,
                                    entry[type]?.[selectedKey] ?? ""
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
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <button className="savebtn1" style={{ marginLeft: "10px" }} onClick={handleSave}>
        Save All Changes
      </button>
      <button
        className="savebtn1"
        style={{ marginLeft: "10px" }}
        onClick={handleExportToExcel}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default Form6Table;
