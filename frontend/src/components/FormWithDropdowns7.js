// table eki , form eki. thama table eki dropdown form eki link karala neeeee (Friday)

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './FormWithDropdowns7.css';
import * as XLSX from 'xlsx'; // (kept as in your original file)
import ExcelJS from 'exceljs';

const Form6Table = () => {
  const [form8Data, setForm8Data] = useState([]);
  const [form9Data, setForm9Data] = useState([]);
  const [daysInMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
  const [editCell, setEditCell] = useState({ rowId: null, parentKey: null, childKey: null, value: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);
  const [role, setRole] = useState([]);

  // ⬇️ NEW: Region table data for dynamic dropdowns
  const [regionData, setRegionData] = useState([]);

  // Mapping for RTOM code → label (kept from your old code)
  const optionMapping = {
    cenhkmd: 'CEN/HK/MD',
    cenhkmd1: 'CEN/HK/MD',
    gqkintb: 'GQ/KI/NTB',
    ndfrm: 'ND/RM',
    awho: 'AW/HO',
    konix: 'KON/KX',
    ngivt: 'NG/WT',
    kgkly: 'KG/KLY',
    cwpx: 'CW/PX',
    debkymt: 'DB/KY/MT',
    gphtnw: 'GP/HT/NW',
    adipr: 'AD/PR',
    bddwmrg: 'BD/BW/MRG',
    keirn: 'KE/RN',
    embmbmh: 'EMB/HB/MH',
    aggl: 'AG/GL',
    hrktph: 'HR/KT/PH',
    bcjrdkltc: 'BC/AP/KL/TC',
    ja: 'JA',
    komltmbva: 'KO/MLT/MB/VA',
  };

  // ---------------- Permissions & Role ----------------
  useEffect(() => {
    // time-gated edit: currently allowed (kept behavior)
    const checkEditPermission = () => setIsEditingAllowed(true);
    checkEditPermission();
    const t = setInterval(checkEditPermission, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios
      .get('/auth/current-role', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setRole(response.data.role))
      .catch(() => setError('Failed to fetch role. Please log in again.'));
  }, []);

  // ---------------- Fetch KPI data ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const [res8, res9] = await Promise.all([
        axios.get('/form8', { params: { year: "2025", month: "11" }}),
        axios.get('/form9', { params: { year: "2025", month: "11" }})
      ]);
      // Filter data for current month (November 2025)
      const enrichedForm8 = (res8.data || [])
        .filter(item => item.Year === "2025" && item.Month === "11")
        .map((e) => ({ ...e, formType: 'form8' }));
      const enrichedForm9 = (res9.data || [])
        .filter(item => item.Year === "2025" && item.Month === "11")
        .map((e) => ({ ...e, formType: 'form9' }));
      setForm8Data(enrichedForm8);
      setForm9Data(enrichedForm9);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load table data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- Fetch Region Table (dynamic dropdowns) ----------------
  useEffect(() => {
    axios
      .get('/api/region-table')
      .then((res) => {
        // supports res.data or res.data.data shape
        const incoming = Array.isArray(res.data?.data) ? res.data.data : res.data;
        setRegionData(incoming || []);
      })
      .catch((err) => {
        console.error('Error fetching region data:', err);
        setError('Failed to load region data.');
      });
  }, []);

  // ---------------- Dropdown state (R-GM, P-DGM, NW EE, RTOM AREA) ----------------
  const [formValues, setFormValues] = useState({
    dropdown1: '', // region
    dropdown2: '', // province
    dropdown3: '', // networkEngineer
    dropdown4: '', // lea (RTOM area code)
  });

  // Helpers to dedupe values
  const uniq = (arr) => Array.from(new Set(arr.filter((v) => v !== undefined && v !== null)));

  // Dynamic options derived from Region Table
  const dropdown1Options = useMemo(
    () => uniq(regionData.map((r) => r.region)),
    [regionData]
  );
  const dropdown2Options = useMemo(
    () => uniq(regionData.filter((r) => r.region === formValues.dropdown1).map((r) => r.province)),
    [regionData, formValues.dropdown1]
  );
  const dropdown3Options = useMemo(
    () =>
      uniq(
        regionData
          .filter((r) => r.region === formValues.dropdown1 && r.province === formValues.dropdown2)
          .map((r) => r.networkEngineer)
      ),
    [regionData, formValues.dropdown1, formValues.dropdown2]
  );
  const dropdown4Options = useMemo(
    () =>
      uniq(
        regionData
          .filter(
            (r) =>
              r.region === formValues.dropdown1 &&
              r.province === formValues.dropdown2 &&
              r.networkEngineer === formValues.dropdown3
          )
          .map((r) => r.lea)
      ),
    [regionData, formValues.dropdown1, formValues.dropdown2, formValues.dropdown3]
  );

  // Normalize key for RTOM area if needed (kept from your dynamic example)
  const normalizeKey = (val) =>
    val ? String(val).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';
  // Robust resolver: match the dropdown value to the actual key used in stored data.
  // This allows labels like "KON/KX" or keys like "konix" to both map to the stored key.
  const resolveAreaKey = (val) => {
    if (!val) return '';
    const raw = String(val).trim();
    const normVal = normalizeKey(raw);

    // Try direct matches against known optionMapping keys first
    for (const key of Object.keys(optionMapping)) {
      if (key === raw || key === raw.toLowerCase() || key === normVal) return key;
    }

    // Try matching against mapped labels (optionMapping values)
    for (const [key, label] of Object.entries(optionMapping)) {
      if (!label) continue;
      const normLabel = normalizeKey(label);
      if (label.toLowerCase() === raw.toLowerCase() || normLabel === normVal) return key;
    }

    // Fallback: return normalized input (may match stored key naming in some cases)
    return normVal;
  };

  const selectedKeyRaw = formValues.dropdown4 || '';
  const selectedKey = resolveAreaKey(selectedKeyRaw);

  // ---------------- KPI Calculations ----------------
  const calculatePercentageForm8 = (totalMinutes, unavailableMinutes, totalNodes) => {
    const minutes = Number(totalMinutes) || 0;
    const unavailable = Number(unavailableMinutes) || 0;
    const nodes = Number(totalNodes) || 0;
    const totalAvailableMinutes = minutes - unavailable;
    const totalMin = 24 * 60 * daysInMonth * nodes;
    if (totalMin <= 0) return 100;
    const raw = (100 * totalAvailableMinutes) / totalMin;
    return Math.max(0, Math.min(100, raw));
  };

  const calculatePercentageForm9 = (Total_Failed_Links, Links_SLA_Not_Violated) => {
    const totalFailed = Number(Total_Failed_Links) || 0;
    const slaNotViolated = Number(Links_SLA_Not_Violated) || 0;
    if (totalFailed === 0) return 100;
    const raw = (100 * slaNotViolated) / totalFailed;
    return Math.max(0, Math.min(100, raw));
  };

  // ---------------- Editing ----------------
  const handleEditClick = (rowId, parentKey, childKey, value) => {
    if (!isEditingAllowed) return;
    setEditCell({ rowId, parentKey, childKey, value });
  };

  const handleInputChange = (event) => {
    setEditCell((prev) => ({ ...prev, value: event.target.value }));
  };

  const handleInputBlur = () => {
    if (editCell.rowId === null) return;
    const combined = [...form8Data, ...form9Data];

    const updated = combined.map((entry) => {
      if (entry._id === editCell.rowId) {
        const updatedEntry = { ...entry };
        if (editCell.parentKey && editCell.childKey) {
          const parentKey = editCell.parentKey;
          const childKey = editCell.childKey;
          const newValue = editCell.value;

          updatedEntry[parentKey] = {
            ...updatedEntry[parentKey],
            [childKey]: newValue,
          };

          // if total_nodes edited for form8 → recompute total_minutes
          if (entry.formType === 'form8' && parentKey === 'total_nodes') {
            const nodes = Number(newValue) || 0;
            const computedTotal = 24 * 60 * daysInMonth * nodes;
            updatedEntry.total_minutes = {
              ...updatedEntry.total_minutes,
              [childKey]: computedTotal,
            };
          }
        } else {
          updatedEntry[editCell.parentKey] = editCell.value;
        }
        updatedEntry.isModified = true;
        return updatedEntry;
      }
      return entry;
    });

    setForm8Data(updated.filter((e) => e.formType === 'form8'));
    setForm9Data(updated.filter((e) => e.formType === 'form9'));
    setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleInputBlur();
    else if (e.key === 'Escape') setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' });
  };

  const handleSave = async () => {
    if (!isEditingAllowed) return;
    try {
      const combined = [...form8Data, ...form9Data];
      const updatePromises = combined.map((entry) => {
        if (!entry.isModified) return Promise.resolve();
        if (entry.formType === 'form8') return axios.put(`/form8/update/${entry._id}`, entry);
        if (entry.formType === 'form9') return axios.put(`/form9/update/${entry._id}`, entry);
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
      fetchData();
      window.alert('All changes have been saved successfully!');
    } catch (err) {
      console.error('Error saving data:', err);
      window.alert('Failed to save changes. Please try again.');
    }
  };

  // ---------------- Dropdown handlers (cascade resets) ----------------
  const handleDropdownChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dropdown1') {
      // region changed → reset province, engineer, lea
      setFormValues({ dropdown1: value, dropdown2: '', dropdown3: '', dropdown4: '' });
      return;
    }
    if (name === 'dropdown2') {
      // province changed → reset engineer, lea
      setFormValues((p) => ({ ...p, dropdown2: value, dropdown3: '', dropdown4: '' }));
      return;
    }
    if (name === 'dropdown3') {
      // engineer changed → reset lea
      setFormValues((p) => ({ ...p, dropdown3: value, dropdown4: '' }));
      return;
    }
    // dropdown4 (lea)
    setFormValues((p) => ({ ...p, dropdown4: value }));
  };

  // ---------------- Excel Export (dynamic areas) ----------------
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('KPI Data');

    // Dynamically collect all possible area keys from available data
    const areaSet = new Set();
    form8Data.forEach((e) => {
      Object.keys(e.total_minutes || {}).forEach((k) => k !== '_id' && areaSet.add(k));
      Object.keys(e.unavailable_minutes || {}).forEach((k) => k !== '_id' && areaSet.add(k));
      Object.keys(e.total_nodes || {}).forEach((k) => k !== '_id' && areaSet.add(k));
    });
    form9Data.forEach((e) => {
      Object.keys(e.Total_Failed_Links || {}).forEach((k) => k !== '_id' && areaSet.add(k));
      Object.keys(e.Links_SLA_Not_Violated || {}).forEach((k) => k !== '_id' && areaSet.add(k));
    });
    const areas = Array.from(areaSet);

    const currentDate = new Date().toISOString().split('T')[0];
    worksheet.addRow(['KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH)']);
    worksheet.addRow([`Generated Date: ${currentDate}`]);
    worksheet.addRow([]);

    const headers = [
      'No',
      'Network Engineer KPI',
      'Division',
      'Section',
      'KPI Percent',
      ...areas.map((area) => optionMapping[area] || area),
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const combinedData = [...form8Data, ...form9Data];

    combinedData.forEach((entry) => {
      const rowData = [
        entry.no,
        entry.network_engineer_kpi,
        entry.division,
        entry.section,
        entry.kpi_percent,
      ];

      areas.forEach((area) => {
        let percentage = '';
        if (entry.formType === 'form8' && entry.total_minutes?.[area] !== undefined) {
          const nodesVal = Number(entry.total_nodes?.[area]) || 0;
          const manualTotal = Number(entry.total_minutes?.[area]) || 0;
          const computedTotal = 24 * 60 * daysInMonth * nodesVal;
          const totalForCalc = manualTotal !== 0 ? manualTotal : computedTotal;
          percentage =
            calculatePercentageForm8(totalForCalc, entry.unavailable_minutes?.[area], nodesVal).toFixed(2) + '%';
        } else if (entry.formType === 'form9' && entry.Total_Failed_Links?.[area] !== undefined) {
          percentage =
            calculatePercentageForm9(
              entry.Total_Failed_Links?.[area],
              entry.Links_SLA_Not_Violated?.[area]
            ).toFixed(2) + '%';
        }
        rowData.push(percentage);
      });

      const row = worksheet.addRow(rowData);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      if (entry.formType === 'form8') {
        const totalMinutesRow = ['', 'Total Minutes', '', '', ''];
        areas.forEach((area) => {
          const nodesVal = Number(entry.total_nodes?.[area]) || 0;
          const manualTotal = Number(entry.total_minutes?.[area]) || 0;
          const computedTotal = 24 * 60 * daysInMonth * nodesVal;
          totalMinutesRow.push(manualTotal !== 0 ? manualTotal : computedTotal);
        });
        const tmRow = worksheet.addRow(totalMinutesRow);
        tmRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const unavailableMinutesRow = ['', 'Unavailable Minutes', '', '', ''];
        areas.forEach((area) => unavailableMinutesRow.push(entry.unavailable_minutes?.[area] || ''));
        const umRow = worksheet.addRow(unavailableMinutesRow);
        umRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const totalNodesRow = ['', 'Total Nodes', '', '', ''];
        areas.forEach((area) => totalNodesRow.push(entry.total_nodes?.[area] || ''));
        const tnRow = worksheet.addRow(totalNodesRow);
        tnRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }

      if (entry.formType === 'form9') {
        const totalFailedRow = ['', 'Total Failed Links', '', '', ''];
        areas.forEach((area) => totalFailedRow.push(entry.Total_Failed_Links?.[area] || ''));
        const tfRow = worksheet.addRow(totalFailedRow);
        tfRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const slaNotViolatedRow = ['', 'Links SLA Not Violated', '', '', ''];
        areas.forEach((area) => slaNotViolatedRow.push(entry.Links_SLA_Not_Violated?.[area] || ''));
        const snvRow = worksheet.addRow(slaNotViolatedRow);
        snvRow.eachCell((cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }
    });

    worksheet.columns.forEach((col) => (col.width = 15));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
  };

  // Combined data for render
  const combinedData = useMemo(() => [...form8Data, ...form9Data], [form8Data, form9Data]);

  if (loading) return <div className="loader" style={{ color: 'black' }}></div>;
  if (error) return <div className="error-message">{error}</div>;

  // ---------------- UI --
  return (
    <div className="page8-container">
      {/* Dropdowns (now fully dynamic from region table) */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="dropdown1">R-GM:</label>
          <select name="dropdown1" value={formValues.dropdown1} onChange={handleDropdownChange}>
            <option value="">Select Region</option>
            {dropdown1Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown2">P-DGM:</label>
          <select name="dropdown2" value={formValues.dropdown2} onChange={handleDropdownChange} disabled={!formValues.dropdown1}>
            <option value="">Select Province</option>
            {dropdown2Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown3">NW EE:</label>
          <select name="dropdown3" value={formValues.dropdown3} onChange={handleDropdownChange} disabled={!formValues.dropdown2}>
            <option value="">Select Engineer</option>
            {dropdown3Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dropdown4">RTOM AREA:</label>
          <select name="dropdown4" value={formValues.dropdown4} onChange={handleDropdownChange} disabled={!formValues.dropdown3}>
            <option value="">Select RTOM</option>
            {dropdown4Options.map((opt) => (
              <option key={opt} value={opt}>
                {/* If your LEA is already a code like 'ngivt', you can map to label for readability */}
                {optionMapping[normalizeKey(opt)] || opt}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Table to display merged data */}
      <h1 className="h1name">KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH)</h1>
      <table border="1" cellPadding="10" cellSpacing="0" className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Network Engineer KPI</th>
            <th>Division</th>
            <th>Section</th>
            <th>KPI Percent</th>
            {/* Show selected area column */}
            {selectedKey && <th>{optionMapping[selectedKey] || formValues.dropdown4}</th>}
          </tr>
        </thead>

        <tbody onKeyDown={handleKeyDown}>
          {combinedData.map((entry) => {
            let pct;
            if (selectedKey) {
              if (entry.formType === 'form8') {
                const nodesVal = Number(entry.total_nodes?.[selectedKey]) || 0;
                const manualTotal = Number(entry.total_minutes?.[selectedKey]) || 0;
                const computedTotal = 24 * 60 * daysInMonth * nodesVal;
                const totalForCalc = manualTotal !== 0 ? manualTotal : computedTotal;
                pct =
                  entry.total_minutes && selectedKey in (entry.total_minutes || {})
                    ? calculatePercentageForm8(totalForCalc, entry.unavailable_minutes?.[selectedKey], nodesVal)
                    : undefined;
              } else {
                pct =
                  entry.Total_Failed_Links && selectedKey in (entry.Total_Failed_Links || {})
                    ? calculatePercentageForm9(entry.Total_Failed_Links?.[selectedKey], entry.Links_SLA_Not_Violated?.[selectedKey])
                    : undefined;
              }
            }

            return (
              <React.Fragment key={entry._id}>
                <tr>
                  <td>{entry.no}</td>
                  <td><b>{entry.network_engineer_kpi}</b></td>
                  <td>{entry.division}</td>
                  <td>{entry.section}</td>
                  <td>{entry.kpi_percent}</td>
                  {selectedKey && <td>{pct !== undefined ? `${pct.toFixed(2)}%` : ''}</td>}
                </tr>

                {/* Sub-rows (kept, but only for the selected RTOM area) */}
                {entry.formType === 'form8' && selectedKey && (
                  <>
                    {/* Total Minutes */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Minutes</td>
                      <td colSpan="3"></td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'total_minutes' &&
                        editCell.childKey === selectedKey ? (
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
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {(() => {
                              const manual = Number(entry.total_minutes?.[selectedKey]) || 0;
                              const nodes = Number(entry.total_nodes?.[selectedKey]) || 0;
                              const computed = 24 * 60 * daysInMonth * nodes;
                              return manual !== 0 ? manual : computed;
                            })()}
                            {role === 'padmin' && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(entry._id, 'total_minutes', selectedKey, entry.total_minutes?.[selectedKey])
                                }
                                style={{ marginLeft: 'auto' }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Unavailable Minutes */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Unavailable Minutes</td>
                      <td colSpan="3"></td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'unavailable_minutes' &&
                        editCell.childKey === selectedKey ? (
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
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.unavailable_minutes?.[selectedKey] ?? ''}
                            {role === 'padmin' && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    'unavailable_minutes',
                                    selectedKey,
                                    entry.unavailable_minutes?.[selectedKey]
                                  )
                                }
                                style={{ marginLeft: 'auto' }}
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
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Nodes</td>
                      <td colSpan="3"></td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'total_nodes' &&
                        editCell.childKey === selectedKey ? (
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
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.total_nodes?.[selectedKey] ?? ''}
                            {role === 'padmin' && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(entry._id, 'total_nodes', selectedKey, entry.total_nodes?.[selectedKey])
                                }
                                style={{ marginLeft: 'auto' }}
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

                {/* Form9 sub-rows */}
                {entry.formType === 'form9' && selectedKey && (
                  <>
                    {/* Total Failed Links */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Total Failed Links</td>
                      <td colSpan="3"></td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'Total_Failed_Links' &&
                        editCell.childKey === selectedKey ? (
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
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.Total_Failed_Links?.[selectedKey] ?? ''}
                            {role === 'padmin' && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    'Total_Failed_Links',
                                    selectedKey,
                                    entry.Total_Failed_Links?.[selectedKey]
                                  )
                                }
                                style={{ marginLeft: 'auto' }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Links SLA Not Violated */}
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left', paddingLeft: '100px' }}>Links SLA Not Violated</td>
                      <td colSpan="3"></td>
                      <td>
                        {editCell.rowId === entry._id &&
                        editCell.parentKey === 'Links_SLA_Not_Violated' &&
                        editCell.childKey === selectedKey ? (
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
                              onClick={() => setEditCell({ rowId: null, parentKey: null, childKey: null, value: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {entry.Links_SLA_Not_Violated?.[selectedKey] ?? ''}
                            {role === 'padmin' && isEditingAllowed && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  handleEditClick(
                                    entry._id,
                                    'Links_SLA_Not_Violated',
                                    selectedKey,
                                    entry.Links_SLA_Not_Violated?.[selectedKey]
                                  )
                                }
                                style={{ marginLeft: 'auto' }}
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
        style={{
          marginLeft: '10px',
          padding: '8px 16px',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: '#2563eb',
        }}
        onClick={handleSave}
      >
        Save all Changes
      </button>

      <button
        className="exportbtn"
        onClick={exportToExcel}
        style={{
          marginLeft: '10px',
          padding: '8px 16px',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: '#28a745',
        }}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default Form6Table;
