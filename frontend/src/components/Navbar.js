import React, { useState, useEffect } from "react";
import "./navbar.css";
import { msalInstance, clearAllAuthState } from "../utils/msalConfig";
import { useAuth } from "../hooks/useAuth";

const TopNav = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);
  const { user, logout: authLogout } = useAuth();

  const [activePage, setActivePage] = useState(window.location.pathname);

  useEffect(() => {
    setActivePage(window.location.pathname);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
    setAdminDropdownOpen(false);
  };

  const toggleAdminDropdown = (e) => {
    e.stopPropagation();
    setAdminDropdownOpen(!adminDropdownOpen);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const closeDropdowns = () => {
      setDropdownOpen(false);
      setAdminDropdownOpen(false);
    };

    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      const currentAccount = msalInstance.getActiveAccount();
      if (currentAccount) {
        await msalInstance.logoutRedirect({
          account: currentAccount,
          onRedirectNavigate: () => true,
          postLogoutRedirectUri: "http://localhost:3000/",
        });
        return; // navigation will happen via redirect
      }
    } catch (error) {
      console.error("MSAL logout error:", error);
    } finally {
      // Fall back to local cleanup
      try {
        clearAllAuthState();
      } catch {}
      authLogout();
      window.location.href = "/";
    }
  };

  const isActiveRoute = (path) => activePage === path;

  const toggleResponsive = () => {
    setIsResponsive(!isResponsive);
    setDropdownOpen(false);
    setAdminDropdownOpen(false);
  };

  return (
    <div className="nav-container">
      <div
        className={`topnav ${isResponsive ? "responsive" : ""}`}
        id="myTopnav"
      >
        <div className="nav-left">
          <a href="/home" className="logo-link">
            <img src="./Logo1.png" alt="Logo" className="nav-logo" />
          </a>
          <p className="brand-text">
            <b>Network KPI Monitoring</b>
          </p>
        </div>
        <div className={`nav-center ${isResponsive ? "responsive-menu" : ""}`}>
          <a
            href="/home"
            className={`nav-link ${activePage === "/home" ? "active" : ""}`}
          >
            Dashboard
          </a>
          <a
            href="/final-tables"
            className={`nav-link ${
              activePage === "/final-tables" ? "active" : ""
            }`}
          >
            Overall KPI
          </a>
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleDropdown}>
              <span>Platform KPI</span>
              <i className="dropdown-icon">&#9660;</i>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content show">
                <a
                  href="/service_fulfilment"
                  className={
                    isActiveRoute("/service_fulfilment") ? "active" : ""
                  }
                >
                  SERVICE FULFILMENT
                </a>
                <a
                  href="/ip_nw_op"
                  className={isActiveRoute("/ip_nw_op") ? "active" : ""}
                >
                  IP NW OP
                </a>
                <a
                  href="/bb_anw"
                  className={isActiveRoute("/bb_anw") ? "active" : ""}
                >
                  BB ANW
                </a>
                <a
                  href="/int_&_nt_op"
                  className={isActiveRoute("/int_&_nt_op") ? "active" : ""}
                >
                  OTN OP
                </a>
                <a
                  href="/tm_activity_plan"
                  className={isActiveRoute("/tm_activity_plan") ? "active" : ""}
                >
                  TM Activity Plan
                </a>
                <a
                  href="/routine_mtnc"
                  className={isActiveRoute("/routine_mtnc") ? "active" : ""}
                >
                  ROUTINE MTNC
                </a>
                <a
                  href="/tower_mtce_acievement"
                  className={
                    isActiveRoute("/tower_mtce_acievement") ? "active" : ""
                  }
                >
                  TOWER MTCE ACIEVEMENT
                </a>
              </div>
            )}
          </div>
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleAdminDropdown}>
              <span>Admin</span>
              <i className="dropdown-icon">&#9660;</i>
            </button>
            {adminDropdownOpen && (
              <div className="dropdown-content show">
                <a
                  href="/adminregister"
                  className={isActiveRoute("/adminregister") ? "active" : ""}
                >
                  Admin Registration
                </a>
                <a
                  href="/userRegister"
                  className={isActiveRoute("/userRegister") ? "active" : ""}
                >
                  User Registration
                </a>
                <a
                  href="/service_fulfilment_form"
                  className={
                    isActiveRoute("/service_fulfilment_form") ? "active" : ""
                  }
                >
                  SERVICE FULFILMENT
                </a>
                <a
                  href="/region-management"
                  className={
                    isActiveRoute("/region-management") ? "active" : ""
                  }
                >
                  Region Management
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="nav-right">
          {user && (
            <span className="user-name">
              Welcome,
              <br /> {user.name}
            </span>
          )}
          <button className="new-logout-btn" onClick={handleLogout}>
            ⏻ Logout
          </button>
        </div>
        <button
          className="toggle-btn"
          onClick={toggleResponsive}
          aria-label="Toggle navigation"
        >
          &#9776;
        </button>
      </div>
    </div>
  );
};

export default TopNav;
