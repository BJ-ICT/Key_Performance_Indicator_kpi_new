import mongoose from "mongoose";

// Define the schema for sub-rows
const subRowSchema = new mongoose.Schema({
  cenhkmd: { type: String },     // No default values, will store provided values or leave undefined
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
const form9Schema = new mongoose.Schema({
  no: { type: Number, required: false },                  // Field for 'no' is required
  network_engineer_kpi: { type: String, required: false  }, // Field for 'network_engineer_kpi' is required
  division: { type: String, required: false  },             // Field for 'division' is required
  section: { type: String, required: false  },              // Field for 'section' is required
  kpi_percent: { type: Number, required: false  },          // Field for 'kpi_percent' is required
  Total_Failed_Links: subRowSchema,                      // Sub-row for Total_Failed_Links
  Links_SLA_Not_Violated: subRowSchema                            // Sub-row for Links_SLA_Not_Violated
                            
});

// Create the model from the schema
const Form9 = mongoose.model("Form9", form9Schema);

export default Form9;
