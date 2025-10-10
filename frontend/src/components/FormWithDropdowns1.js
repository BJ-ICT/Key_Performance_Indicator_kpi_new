import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./FormWithDropdowns1.css";
import ExcelJS from "exceljs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dropdown1() {
  const [role, setRole] = useState([]); // user role
  const [data, setData] = useState([]); // table rows
  const [regionTable, setRegionTable] = useState([]); // hierarchy for filters
  const [editCell, setEditCell] = useState({ rowId: null, key: null });
  const [popupMessage, setPopupMessage] = useState("");

  const [formValues, setFormValues] = useState({
    dropdown1: "",
    dropdown2: "",
    dropdown3: "",
    dropdown4: "",
  });

  const [dropdown2Options, setDropdown2Options] = useState([]);
  const [dropdown3Options, setDropdown3Options] = useState([]);
  const [dropdown4Options, setDropdown4Options] = useState([]);

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [isEditingAllowed, setIsEditingAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----- constants -----
  const nonEditableColumns = [
    "no",
    "kpi",
    "target",
    "calculation",
    "platform",
    "responsibledgm",
    "definedoladetails",
    "weightage",
    "datasources",
  ];

  const baseColumns = [
    "no",
    "kpi",
    "target",
    "calculation",
    "platform",
    "responsibledgm",
    "definedoladetails",
    "weightage",
    "datasources",
  ];

  const headerMapping = {
    no: "No",
    kpi: "KPI",
    target: "Target",
    calculation: "Calculation",
    platform: "Platform",
    responsibledgm: "Responsible DGM",
    definedoladetails: "Defined OLA Details",
    weightage: "Weightage",
    datasources: "Data Sources",
  };

  const optionMapping = {
    CENHKMD: "CEN/HK/MD",
    CENHKMD1: "CEN/HK/MD",
    GQKINTB: "GQ/KI/NTB",
    NDRM: "ND/RM",
    AWHO: "AW/HO",
    KONKX: "KON/KX",
    NGWT: "NG/WT",
    KGKLY: "KG/KLY",
    CWPX: "CW/PX",
    DBKYMT: "DB/KY/MT",
    GPHTNW: "GP/HT/NW",
    ADPR: "AD/PR",
    BDBWMRG: "BD/BW/MRG",
    KERN: "KE/RN",
    EMBHBMH: "EMB/HB/MH",
    AGGL: "AG/GL",
    HRKTPH: "HR/KT/PH",
    BCAPKLTC: "BC/AP/KL/TC",
    JA: "JA",
    KOMLTMBVA: "KO/MLT/MB/VA",
  };

  const formatPercent = (val) => {
    if (val === undefined || val === null || val === "") return "-";
    if (typeof val === "number") return `${val}%`;
    const s = String(val);
    return s.trim().endsWith("%") ? s : `${s}%`;
  };

  const checkEditPermission = () => true;

  // ----- fetch data -----
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/auth/current-role", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRole(res.data.role))
      .catch(() => setError("Failed to fetch role. Please log in again."));
  }, []);

  useEffect(() => {
    axios
      .get("/api/region-table")
      .then((res) => {
        if (res.data && res.data.data) setRegionTable(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch region table:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/form4")
      .then((response) => setData(response.data))
      .catch(() => setError("Failed to load table data. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsEditingAllowed(checkEditPermission());
    const id = setInterval(() => setIsEditingAllowed(checkEditPermission()), 60000);
    return () => clearInterval(id);
  }, []);

  // ----- dropdown cascade -----
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
    const leas = Array.from(
      new Set(
        regionTable
          .filter(
            (x) =>
              x.region === formValues.dropdown1 &&
              x.province === formValues.dropdown2 &&
              x.networkEngineer === engineer
          )
          .map((x) => {
            const dbKey = Object.keys(optionMapping).find(
              (key) => optionMapping[key] === x.lea || key === x.lea
            );
            return dbKey || x.lea;
          })
      )
    ).filter(Boolean);
    setDropdown4Options(leas);
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    if (name === "dropdown1") {
      setFormValues({ dropdown1: value, dropdown2: "", dropdown3: "", dropdown4: "" });
      updateDropdown2Options(value);
      setDropdown3Options([]);
      setDropdown4Options([]);
      setVisibleColumns([]);
      return;
    }
    if (name === "dropdown2") {
      setFormValues((prev) => ({ ...prev, dropdown2: value, dropdown3: "", dropdown4: "" }));
      updateDropdown3Options(value);
      setDropdown4Options([]);
      setVisibleColumns([]);
      return;
    }
    if (name === "dropdown3") {
      setFormValues((prev) => ({ ...prev, dropdown3: value, dropdown4: "" }));
      updateDropdown4Options(value);
      setVisibleColumns([]);
      return;
    }
    if (name === "dropdown4") {
      const selectedKey = value;
      setFormValues((prev) => ({ ...prev, dropdown4: selectedKey }));
      if (selectedKey) setVisibleColumns([...baseColumns, selectedKey]);
      else setVisibleColumns(baseColumns);
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // ----- editing -----
  const handleEditClick = (rowId, key) => setEditCell({ rowId, key });
  const handleCancelClick = () => setEditCell({ rowId: null, key: null });

  const handleFieldChange = (e, rowId) => {
    if (!isEditingAllowed) return;
    const { name, value } = e.target;
    setData((prev) =>
      prev.map((item) => {
        if (item._id !== rowId) return item;
        const updatedItem = { ...item };
        updatedItem[name] = value;
        if (updatedItem.areas && typeof updatedItem.areas === "object") {
          updatedItem.areas = { ...updatedItem.areas, [name]: parseFloat(value) || 0 };
        }
        return updatedItem;
      })
    );
  };

  const handleSaveClick = (rowId, key, value) => {
    setData((prev) =>
      prev.map((item) => (item._id === rowId ? { ...item, [key]: value } : item))
    );
    setEditCell({ rowId: null, key: null });
  };

  const areaKeys = useMemo(() => {
    const fromMapping = Object.keys(optionMapping);
    const fromData = data.flatMap((row) => Object.keys(row.areas || {}));
    const fromFlat = data.flatMap((row) =>
      Object.keys(row || {}).filter((k) => /^[A-Z]+/.test(k) && k.length <= 12)
    );
    return Array.from(new Set([...fromMapping, ...fromData, ...fromFlat]));
  }, [data]);

  // ----- save all -----
  const handleSaveAll = () => {
    if (!isEditingAllowed) return;

    const updatePromises = data.map((item) => {
      const filtered = { areas: { ...(item.areas || {}) } };
      areaKeys.forEach((k) => {
        if (item[k] !== undefined && item[k] !== null) {
          filtered[k] = item[k];
          filtered.areas[k] = parseFloat(item[k]) || 0;
        }
      });

      return axios
        .put(`/form4/update/${item._id}`, filtered)
        .then((res) => ({ ...item, ...filtered }))
        .catch((error) => {
          console.error("Error updating data:", error);
          throw error;
        });
    });

    Promise.all(updatePromises)
      .then((updatedItems) => {
        setEditCell({ rowId: null, key: null });
        setData(updatedItems);
        toast.success("✅ All changes have been saved successfully!", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      })
      .catch((err) => {
        console.error("Error saving data:", err);
        toast.error("❌ Failed to save changes. Please try again.", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      });
  };

  // ----- Excel export -----
  const generateExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("KPI Report");
    const allColumns = Object.keys(data[0] || {}).filter((k) => k !== "_id");
    const headerMap = {
      ...headerMapping,
      ...Object.fromEntries(Object.keys(optionMapping).map((k) => [k, optionMapping[k]])),
    };
    worksheet.columns = allColumns.map((key) => ({
      header: headerMap[key] || key,
      key,
      width: 24,
    }));
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    data.forEach((rowObj) => {
      const row = worksheet.addRow(rowObj);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().split("T")[0];
    a.download = `KPI_Report_${date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // ----- UI -----
  if (loading) return <div className="loader" style={{ color: "black" }}></div>;
  if (error) return <div className="error-message">{error}</div>;

  const columnsToRender =
    visibleColumns.length === 0 ? baseColumns : Array.from(new Set(visibleColumns));

  return (
    <div className="page2-container">
      <form onSubmit={(e) => e.preventDefault()} className="filters">
        <div>
          <label htmlFor="dropdown1">R-GM:</label>
          <select
            name="dropdown1"
            id="dropdown1"
            value={formValues.dropdown1}
            onChange={handleDropdownChange}
          >
            <option value="">Select an option</option>
            {regions.map((r) => (
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
            id="dropdown2"
            value={formValues.dropdown2}
            onChange={handleDropdownChange}
          >
            <option value="">Select an option</option>
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
            id="dropdown3"
            value={formValues.dropdown3}
            onChange={handleDropdownChange}
          >
            <option value="">Select an option</option>
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
            id="dropdown4"
            value={formValues.dropdown4}
            onChange={handleDropdownChange}
          >
            <option value="">Select an option</option>
            {dropdown4Options.map((leaKey) => (
              <option key={leaKey} value={leaKey}>
                {optionMapping[leaKey] || leaKey}
              </option>
            ))}
          </select>
        </div>
      </form>

      <h1 className="h1name">
        KPI (Enterprise/ SME and Whole Sales Service Delivery - Fiber)
      </h1>

      <table className="data-table" border="1" cellPadding="10">
        <thead>
          <tr>
            {columnsToRender.map((key) => (
              <th key={key}>{optionMapping[key] || headerMapping[key] || key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              {columnsToRender.map((key) => {
                const isEditing = editCell.rowId === item._id && editCell.key === key;
                const showEditButton =
                  role === "padmin" && !nonEditableColumns.includes(key) && isEditingAllowed;

                let rawVal = "-";
                if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
                  rawVal = item[key];
                } else if (item.areas && typeof item.areas === "object") {
                  const normalizedKey = key.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                  if (item.areas[key] !== undefined) rawVal = item.areas[key];
                  else if (item.areas[normalizedKey] !== undefined)
                    rawVal = item.areas[normalizedKey];
                }

                return (
                  <td key={key}>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          name={key}
                          value={(() => {
                            if (item[key] !== undefined && item[key] !== null && item[key] !== "")
                              return item[key];
                            if (item.areas && typeof item.areas === "object") {
                              const normalizedKey = key.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                              if (item.areas[key] !== undefined) return item.areas[key];
                              if (item.areas[normalizedKey] !== undefined)
                                return item.areas[normalizedKey];
                            }
                            return "";
                          })()}
                          onChange={(e) => handleFieldChange(e, item._id)}
                          autoFocus
                        />
                        <button
                          className="table-button"
                          onClick={() => handleSaveClick(item._id, key, item[key])}
                          style={{ marginLeft: 6 }}
                        >
                          Done
                        </button>
                        <button
                          className="table-button"
                          onClick={handleCancelClick}
                          style={{ marginLeft: 6 }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {nonEditableColumns.includes(key)
                          ? item[key] ?? "-"
                          : formatPercent(rawVal)}
                        {showEditButton && (
                          <button
                            className="table-button"
                            onClick={() => handleEditClick(item._id, key)}
                            style={{ marginLeft: "auto" }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button
          className="savebtn1"
          onClick={handleSaveAll}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            marginRight: 10,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save All Changes
        </button>
        <button
          className="savebtn1"
          onClick={generateExcelReport}
          style={{
            background: "#10B981",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Generate Excel Report
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}

export default Dropdown1;
