import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./RegionTable.css";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const RegionTable = () => {
  const [formData, setFormData] = useState({
    region: "",
    province: "",
    networkEngineer: "",
    lea: "",
  });
  const [regionData, setRegionData] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [moveLeaData, setMoveLeaData] = useState({
    lea: "",
    newNetworkEngineer: "",
    newRegion: "",
    newProvince: "",
  });
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [networkEngineers, setNetworkEngineers] = useState([]);
  const [leas, setLeas] = useState([]);

  useEffect(() => {
    fetchRegionData();
    fetchNetworkEngineers();
    fetchLeas();
  }, []);

  const fetchRegionData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/region-table/");
      setRegionData(response.data.data);
    } catch (err) {
      console.error(
        "Error fetching region data:",
        err.response?.data?.message || err.message
      );
      setError("Failed to fetch region data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validation
    if (
      !formData.region ||
      !formData.province ||
      !formData.networkEngineer ||
      !formData.lea
    ) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingEntry) {
        await axios.put(
          `/api/region-table/update/${editingEntry._id}`,
          formData
        );
        setSuccess("Region data updated successfully");
      } else {
        await axios.post("/api/region-table/add", formData);
        setSuccess("Region data added successfully");
      }

      setFormData({ region: "", province: "", networkEngineer: "", lea: "" });
      setEditingEntry(null);
      fetchRegionData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      region: entry.region,
      province: entry.province,
      networkEngineer: entry.networkEngineer,
      lea: entry.lea,
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await axios.delete(`/api/region-table/delete/${id}`);
      setSuccess("Region data deleted successfully");
      fetchRegionData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete entry");
    }
  };

  const fetchNetworkEngineers = async () => {
    try {
      const response = await axios.get("/api/region-table/network-engineers");
      setNetworkEngineers(response.data.data);
    } catch (err) {
      console.error("Error fetching network engineers:", err);
    }
  };

  const fetchLeas = async () => {
    try {
      const response = await axios.get("/api/region-table/leas");
      setLeas(response.data.data);
    } catch (err) {
      console.error("Error fetching LEAs:", err);
    }
  };

  const handleMoveLeaChange = (e) => {
    const { name, value } = e.target;
    setMoveLeaData({ ...moveLeaData, [name]: value });
    if (error) setError("");
  };

  const handleMoveLea = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !moveLeaData.lea ||
      !moveLeaData.newNetworkEngineer ||
      !moveLeaData.newRegion ||
      !moveLeaData.newProvince
    ) {
      setError("All fields are required");
      return;
    }

    try {
      await axios.post("/api/region-table/move-lea", moveLeaData);
      setSuccess(`LEA "${moveLeaData.lea}" moved successfully`);
      setMoveLeaData({
        lea: "",
        newNetworkEngineer: "",
        newRegion: "",
        newProvince: "",
      });
      setShowMoveForm(false);
      fetchRegionData();
      fetchNetworkEngineers();
      fetchLeas();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move LEA");
    }
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setFormData({ region: "", province: "", networkEngineer: "", lea: "" });
    setError("");
    setSuccess("");
  };

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return regionData;
    const dataCopy = [...regionData];
    const { key, direction } = sortConfig;
    dataCopy.sort((a, b) => {
      const aVal = (a[key] ?? "").toString().toLowerCase();
      const bVal = (b[key] ?? "").toString().toLowerCase();
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return dataCopy;
  }, [regionData, sortConfig]);

  // Function to handle inline editing for Network Engineer and LEA only
  const handleInlineEdit = async (id, field, value) => {
    if (field !== "networkEngineer" && field !== "lea" && field !== "region" && field !== "province") {
      return; // Only allow editing of Network Engineer and LEA
    }

    try {
      await axios.patch(`/api/region-table/update-fields/${id}`, {
        [field]: value,
      });
      fetchRegionData();
      const labelMap = {
        networkEngineer: "Network Engineer",
        lea: "LEA",
        region: "Region",
        province: "Province",
      };
      setSuccess(`${labelMap[field] || field} updated successfully`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update field");
    }
  };

  return (
    <div className="region-table-container">
      <div className="region-table-header">
        <h1>Region Management</h1>
        <p>Manage Region, Province, Network Engineer and LEA information </p>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <div className="form-header">
          <h2>{editingEntry ? "Edit Region Data" : "Add New Region Data"}</h2>
          <button
            type="button"
            onClick={() => setShowMoveForm(true)}
            className="move-lea-btn"
            title="Move LEA to different Network Engineer"
            
          >
            📦 Move LEA
          </button>
        </div>
        <form onSubmit={handleSubmit} className="region-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region">Region *</label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Enter region"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="province">Province *</label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Enter province"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="networkEngineer">Network Engineer *</label>
              <input
                type="text"
                id="networkEngineer"
                name="networkEngineer"
                value={formData.networkEngineer}
                onChange={handleChange}
                placeholder="Enter network engineer name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lea">LEA *</label>
              <input
                type="text"
                id="lea"
                name="lea"
                value={formData.lea}
                onChange={handleChange}
                placeholder="Enter LEA name"
                required
              />
            </div>
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? "Processing..." : editingEntry ? "Update" : "Add"}
            </button>
            {editingEntry && (
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Move LEA Form */}
      {showMoveForm && (
        <div className="form-section">
          <h2>Move LEA to Different Network Engineer</h2>
          <form onSubmit={handleMoveLea} className="region-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="move-lea">Select LEA to Move *</label>
                <select
                  id="move-lea"
                  name="lea"
                  value={moveLeaData.lea}
                  onChange={handleMoveLeaChange}
                  required
                  className="form-control"
                >
                  <option value="">Select LEA</option>
                  {leas.map((lea) => (
                    <option key={lea} value={lea}>
                      {lea}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="new-network-engineer">
                  New Network Engineer *
                </label>
                <select
                  id="new-network-engineer"
                  name="newNetworkEngineer"
                  value={moveLeaData.newNetworkEngineer}
                  onChange={handleMoveLeaChange}
                  required
                  className="form-control"
                >
                  <option value="">Select Network Engineer</option>
                  {networkEngineers.map((engineer) => (
                    <option key={engineer} value={engineer}>
                      {engineer}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="new-region">New Region *</label>
                <input
                  type="text"
                  id="new-region"
                  name="newRegion"
                  value={moveLeaData.newRegion}
                  onChange={handleMoveLeaChange}
                  placeholder="Enter new region"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-province">New Province *</label>
                <input
                  type="text"
                  id="new-province"
                  name="newProvince"
                  value={moveLeaData.newProvince}
                  onChange={handleMoveLeaChange}
                  placeholder="Enter new province"
                  required
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Move LEA
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMoveForm(false);
                  setMoveLeaData({
                    lea: "",
                    newNetworkEngineer: "",
                    newRegion: "",
                    newProvince: "",
                  });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <h2>Region Data</h2>
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-wrapper">
            <table className="region-data-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("region")}>
                    Region {getSortIndicator("region")}
                  </th>
                  <th onClick={() => requestSort("province")}>
                    Province {getSortIndicator("province")}
                  </th>
                  <th onClick={() => requestSort("networkEngineer")}>
                    Network Engineer {getSortIndicator("networkEngineer")}
                  </th>
                  <th onClick={() => requestSort("lea")}>
                    LEA {getSortIndicator("lea")}
                  </th>
                  <th style={{ width: "100px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No region data available
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item) => (
                    <tr key={item._id}>
                      {/* Region editable */}
                      <td className="region-name">
                        <EditableCell
                          value={item.region ?? ""}
                          onSave={(val) =>
                            handleInlineEdit(item._id, "region", val)
                          }
                        />
                      </td>
                      {/* Province editable */}
                      <td className="province-name">
                        <EditableCell
                          value={item.province ?? ""}
                          onSave={(val) =>
                            handleInlineEdit(item._id, "province", val)
                          }
                        />
                      </td>

                      {/* Inline editable cells for Network Engineer and LEA */}
                      <td className="engineer-name">
                        <EditableCell
                          value={item.networkEngineer ?? ""}
                          onSave={(val) =>
                            handleInlineEdit(item._id, "networkEngineer", val)
                          }
                        />
                      </td>
                      <td className="lea-name">
                        <EditableCell
                          value={item.lea ?? ""}
                          onSave={(val) =>
                            handleInlineEdit(item._id, "lea", val)
                          }
                        />
                      </td>

                      <td className="actions-cell">
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="delete-btn"
                          title="Delete this region data entry"
                          aria-label="Delete"
                        >
                          <FiTrash2 className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Editable Cell Component for inline editing
const EditableCell = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
      ///
      //  return (
      //     <div className="editable-cell">
      //       {isEditing ? (
      //         <div className="edit-mode">
      //           <input
      //             type="text"
      //             value={editValue}
      //             onChange={(e) => setEditValue(e.target.value)}
      //             onKeyDown={handleKeyPress}
      //             onBlur={handleSave}
      //             autoFocus
      //             className="edit-input"
      //           />
      //         </div>
      //       ) : (
      //         <div
      //           className="view-mode"
      //           onClick={() => setIsEditing(true)}
      //           title="Click to edit"
      //         >
      //           {value}
      //           <span className="edit-icon">✏️ Edit</span>
      //         </div>
      //       )}
      //     </div>
      //   );  
  return (
  <div className="editable-cell">
    {isEditing ? (
      <div className="edit-mode">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          className="edit-input"
          aria-label="Editing cell"
        />
      </div>
    ) : (
      <div
        className="view-mode"
        role="button"
        tabIndex={0}
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsEditing(true)}
        title="Click to edit"
        aria-label="Edit cell"
      >
        {value || <span className="placeholder">—</span>}
        <button
          type="button"
          className="edit-btn"
          aria-label="Edit"
          onClick={(e) => {
            e.stopPropagation(); // don't bubble to parent
            setIsEditing(true);
          }}
        >
          <FiEdit2 className="icon" />
        </button>
      </div>
    )}
  </div>
);

};


export default RegionTable;