// src/components/CurrentMonthKPI.js
import React from "react";
import FinalTables from "./finalTables";
import Navbar from "./Navbar";
import Footer from "./Footer";

// This component shows only the current month's data
const CurrentMonthKPI = () => {
  return (
    <div>
      <Navbar />
      <FinalTables showPeriodSelector={false} />
      <br />
      <br />
      <Footer />
    </div>
  );
};

export default CurrentMonthKPI;