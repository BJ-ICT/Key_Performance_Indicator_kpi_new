import React from 'react';
import FinalTables from './finalTables';

// Simple wrapper that renders the FinalTables component.
// If you want a different default period (previous month), we can add a prop
// to FinalTables or compute and pass down selectedYear/selectedMonth.
export default function PreviousMonthFinalTable() {
  return <FinalTables />;
}
