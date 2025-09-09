import React from "react";
import { useNavigate } from "react-router-dom";

const DropdownMenu = () => {
  const navigate = useNavigate();

  // Options and their corresponding routes
  const options = [
    { label: "Home", value: "/" },
    { label: "KPI(Enterprise/ SME and Whole Sales Service Delivery - Fiber)", value: "/admin1" },
    { label: "KPI(NW Availability-IP Core NW/BSR NW/Service Edge NW)", value: "/admin2" },
    { label: "KPI(MSANN Power Failures Restoration,NW Availability-MSAN/OLT )", value: "/admin3" },
    { label: "KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH) form_01", value: "/admin4" },
    { label: "KPI(Fiber Failures Restoration,NW Availability-SLBN/SDH/FIBER NW/INTL BH) form_02", value: "/admin5" },
    { label: "Admin Registration", value: "/adminregister" },
    { label: "SERVICE FULFILMENT", value: "/form2" },
    { label: "IP NW OP", value: "/form5" },
    { label: "BB ANW", value: "/form6" },
    { label: "INT & NT OP", value: "/form8" },
    { label: "TM Activity Plan", value: "/maintenance-tables" },
    { label: "TOWER MTCE ACIEVEMENT", value: "/current-month-tab" },
    { label: "ROUTINE MTNC", value: "/multi-platform-tables" },
  ];

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    navigate(selectedValue); // Navigate to the selected route
  };

  return (
    <div style={styles.container}>
      <select onChange={handleChange} style={styles.select}>
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: "100px",
    right: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  select: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
};

export default DropdownMenu;
