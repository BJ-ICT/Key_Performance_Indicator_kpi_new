import mongoose from "mongoose";
const currentYear = new Date().getFullYear();  
const msan="msankpi_"+currentYear;

const msanKpiSchema = new mongoose.Schema(
  {
    Year: String,
    Month: String,
    NWEng: String,
    Designation: String,
    nooffailure: Number,
    kpiacheived: Number,
  },
  { collection: msan, timestamps: true }
);

const MsanKpi = mongoose.model("MsanKpi", msanKpiSchema);
export default MsanKpi;
