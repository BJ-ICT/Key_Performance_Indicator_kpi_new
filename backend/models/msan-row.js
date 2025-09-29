import mongoose from "mongoose";

const msanKpiSchema = new mongoose.Schema(
  {
    Year: String,
    Month: String,
    NWEng: String,
    Designation: String,
    nooffailure: Number,
    kpiacheived: Number,
  },
  { collection: "msankpi", timestamps: true }
);

const MsanKpi = mongoose.model("MsanKpi", msanKpiSchema);
export default MsanKpi;
