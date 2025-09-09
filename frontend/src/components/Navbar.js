import React, { useState, useEffect } from "react";
import "./navbar.css";

const TopNav = () => {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleAdminDropdown = () => setAdminDropdownOpen(!adminDropdownOpen);
  const toggleResponsive = () => setIsResponsive(!isResponsive);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  /*return (
    <div className="nav-container">
      <div className={`topnav ${isResponsive ? "responsive" : ""}`} id="myTopnav">
        <div className="nav-left">
          <a href="/home" className="logo-link">
            <img src="./Logo1.png" alt="Logo" className="nav-logo" />
          </a>
          <p className="brand-text"><b>Network KPI Monitoring</b></p>
        </div>

        <div className={`nav-center ${isResponsive ? "responsive-menu" : ""}`} style={{marginLeft:'240px'}}>
          <a href="/home" className="active">Dashboard</a>
          <a href="/final-tables" className="active">Overall KPI</a>

          <div
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="dropbtn">
              <span>Platform KPI</span>
              <i className="dropdown-icon">&#9660;</i>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content" >
                <a href="/service_fulfilment">SERVICE FULFILMENT</a>
                <a href="/ip_nw_op">IP NW OP</a>
                <a href="/bb_anw">BB ANW</a>
                <a href="/int_&_nt_op">OTN OP</a>  
                <a href="/tm_activity_plan">TM Activity Plan</a>
                <a href="/routine_mtnc">ROUTINE MTNC</a>
                <a href="/tower_mtce_acievement">TOWER MTCE ACIEVEMENT</a>
              </div>
            )}
          </div>

          <div
            className="dropdown"
            onMouseEnter={() => setAdminDropdownOpen(true)}
            onMouseLeave={() => setAdminDropdownOpen(false)}
          >
            <button className="dropbtn">
              <span>Admin</span>
              <i className="dropdown-icon">&#9660;</i>
            </button>
            {adminDropdownOpen && (
              <div className="dropdown-content">
                <a href="/adminregister">Admin Registration</a>
                <a href="/userRegister">User Registration</a>
                <a href="/service_fulfilment_form">SERVICE FULFILMENT</a>
                <a href="/ip_nw_op_form">IP NW OP</a>
                <a href="/bb_anw_form">BB ANW</a>
                <a href="/int_&_nt_op_form1">OTN OP_1</a>
                <a href="/int_&_nt_op_form2">OTN OP_2</a>
                <a href="/tower_mtce_acievement_form">TOWER MTCE ACIEVEMENT</a>
                <a href="/tm_activity_plan_form">TM Activity Plan</a>
                <a href="/routine_mtnc_form">ROUTINE MTNC</a>
                <a href="/email">E-mail Service</a>
                <a href="/Final_table_Frm">Final Table</a>
              </div>
            )}
          </div>
        </div>

        <div className="nav-right">
          {userName && <span className="user-name">Welcome,<br></br> {userName}</span>}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <button className="toggle-btn" onClick={toggleResponsive}>
          &#9776;
        </button>
      </div>
    </div>
  );*/

  return (
    <div className="nav-container">
      <div className={`topnav ${isResponsive ? "responsive" : ""}`} id="myTopnav">
        {/* Left Section - Logo and Brand Name */}
        <div className="nav-left">
          <a href="/home" className="logo-link">
            <img src="./Logo1.png" alt="Logo" className="nav-logo" />
          </a>
          <p className="brand-text"><b>Network KPI Monitoring</b></p>
        </div>

        {/* Center Section - Navigation Links */}
        <div className={`nav-center ${isResponsive ? "responsive-menu" : ""}`}>
          <a href="/home" className="active">Dashboard</a>
          <a href="/final-tables" className="active">Overall KPI</a>

          {/* Dropdown - Platform KPI */}
      <div
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
  <button className="dropbtn">
    Platform KPI <span className="dropdown-icon">▼</span>
  </button>
  {dropdownOpen && (
              <div className="dropdown-content" >
                <a href="/service_fulfilment">SERVICE FULFILMENT</a>
                <a href="/ip_nw_op">IP NW OP</a>
                <a href="/bb_anw">BB ANW</a>
                <a href="/int_&_nt_op">OTN OP</a>  
                <a href="/tm_activity_plan">TM Activity Plan</a>
                <a href="/routine_mtnc">ROUTINE MTNC</a>
                <a href="/tower_mtce_acievement">TOWER MTCE ACIEVEMENT</a>
              </div>
            )}
</div>

          {/* Dropdown - Admin */}
          <div className="dropdown"  onMouseEnter={() => setAdminDropdownOpen(true)}
            onMouseLeave={() => setAdminDropdownOpen(false)}
			>
            <button className="dropbtn">
              Admin <span className="dropdown-icon">▼</span>
            </button>
            {adminDropdownOpen && (
              <div className="dropdown-content">
                <a href="/adminregister">Admin Registration</a>
                <a href="/userRegister">User Registration</a>
                <a href="/service_fulfilment_form">SERVICE FULFILMENT</a>
                <a href="/ip_nw_op_form">IP NW OP</a>
                <a href="/bb_anw_form">BB ANW</a>
                <a href="/int_&_nt_op_form1">OTN OP_1</a>
                <a href="/int_&_nt_op_form2">OTN OP_2</a>
                <a href="/tower_mtce_acievement_form">TOWER MTCE ACIEVEMENT</a>
                <a href="/tm_activity_plan_form">TM Activity Plan</a>
                <a href="/routine_mtnc_form">ROUTINE MTNC</a>
                <a href="/email">E-mail Service</a>
                <a href="/Final_table_Frm">Final Table</a>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - User Info and Logout */}
        <div className="nav-right">
          {userName && <span className="user-name">Welcome,<br /> {userName}</span>}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* Toggle Button for Mobile */}
        <button className="toggle-btn" onClick={toggleResponsive}>
          ☰
        </button>
      </div>
    </div>
  );

};

export default TopNav;
