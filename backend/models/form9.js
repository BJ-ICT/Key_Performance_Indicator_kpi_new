import mongoose from "mongoose";

// Get current year for dynamic collection naming
const currentYear = new Date().getFullYear();
const form9Collection = `form9_${currentYear}`;

// Define the schema for sub-rows
const subRowSchema = new mongoose.Schema({
  cenhkmd: { type: String },
  cenhkmd1: { type: String },
  gqkintb: { type: String },
  ndfrm: { type: String },
  awho: { type: String },
  konix: { type: String },
  ngivt: { type: String },
  kgkly: { type: String },
  cwpx: { type: String },
  debkymt: { type: String },
  gphtnw: { type: String },
  adipr: { type: String },
  bddwmrg: { type: String },
  keirn: { type: String },
  embmbmh: { type: String },
  aggl: { type: String },
  hrktph: { type: String },
  bcjrdkltc: { type: String },
  ja: { type: String },
  komltmbva: { type: String }
});

// Define the main form schema
const form9Schema = new mongoose.Schema(
  {
    no: { type: Number, required: false },
    network_engineer_kpi: { type: String, required: false },
    division: { type: String, required: false },
    section: { type: String, required: false },
    kpi_percent: { type: Number, required: false },
    Total_Failed_Links: subRowSchema,
    Links_SLA_Not_Violated: subRowSchema,
    year: { type: String},
    month: { type: Number}
  },
  { 
    collection: form9Collection, // Dynamic collection name
    timestamps: true             // ✅ Enables createdAt and updatedAt
  }
);

// ✅ Dynamic model name to prevent model caching issues
const Form9 = mongoose.model(`Form9_${currentYear}`, form9Schema);

export default Form9;
