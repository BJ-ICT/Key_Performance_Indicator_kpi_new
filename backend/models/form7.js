import mongoose from "mongoose";

const currentYear = new Date().getFullYear();
const form7Collection = `form7_${currentYear}`;

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
const form7Schema = new mongoose.Schema({
  no: { type: Number, required: false },                  // Field for 'no' is required
  network_engineer_kpi: { type: String, required: false  }, // Field for 'network_engineer_kpi' is required
  division: { type: String, required: false  },             // Field for 'division' is required
  section: { type: String, required: false  },              // Field for 'section' is required
  kpi_percent: { type: Number, required: false  },          // Field for 'kpi_percent' is required
  unavailable_minutes: subRowSchema,                      // Sub-row for unavailable_minutes
  total_minutes: subRowSchema,                            // Sub-row for total_minutes
  total_nodes: subRowSchema,                               // Sub-row for total_nodes
  year:{ type: String, required: false  },
  month:{ type: String, required: false  },
}
,
{ 
    collection: form7Collection, // Dynamic collection name
    timestamps: true             // ✅ Enables createdAt and updatedAt
  }

);

// Create the model from the schema

const Form7 = mongoose.model(`Form7_${currentYear}`, form7Schema);

export default Form7;
