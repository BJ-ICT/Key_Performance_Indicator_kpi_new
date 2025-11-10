// src/components/PreviousMonthsKPI.js
import React from "react";
import FinalTables from "./finalTables";
import Navbar from "./Navbar";
import Footer from "./Footer";

// This component inherits all functionality from FinalTables
// but is specifically for viewing previous months' data
const PreviousMonthsKPI = () => {
  return (
    <div>
      <Navbar />
      <FinalTables showPeriodSelector={true} />
      <br />
      <br />
      <Footer />
    </div>
  );
};

export default PreviousMonthsKPI;