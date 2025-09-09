import mongoose from "mongoose";
const { Schema } = mongoose;

// Define a schema for the metrics associated with each percentage subcategory
const MetricsSchema = new Schema({
  region: { type: String},
  totalMinutes: { type: Number }, 
  totalNodes: { type: Number }, 
  unavailableNE: { type: Number } 
});



const RegionSchema = new Schema({
  name : { type: String, required: true },
  percentages: {
    CENHKMD: { metrics: MetricsSchema },
    CENHKMD1: { metrics: MetricsSchema },
    GQKINTB: { metrics: MetricsSchema },
    NDRM: { metrics: MetricsSchema },
    AWHO: { metrics: MetricsSchema },
    KONKX: { metrics: MetricsSchema },
    NGWT: { metrics: MetricsSchema },
    KGKLY: { metrics: MetricsSchema },
    CWPX: { metrics: MetricsSchema },
    DBKYMT: { metrics: MetricsSchema },
    GPHTNW: { metrics: MetricsSchema },
    ADPR: { metrics: MetricsSchema },
    BDBWMRG: { metrics: MetricsSchema },
    KERN: { metrics: MetricsSchema },
    EBMHMBH: { metrics: MetricsSchema },
    AGGL: { metrics: MetricsSchema },
    HRKTPH: { metrics: MetricsSchema },
    BCAPKLTC: { metrics: MetricsSchema },
    JA: { metrics: MetricsSchema },
    KOMLTMBVA: { metrics: MetricsSchema },	
  },
})

// Define the overall form schema
const Form5Schema = new Schema({
  networkEngineersKPI: { type: String, required: true }, // Main KPI name
  division: { type: String, required: true},
  section : { type: String, required: true},
  kpi : {type: Number, required: true},
  regionalData : [RegionSchema],
});

// Create and export the Mongoose model
const Form5 = mongoose.model("Form5", Form5Schema);
export default Form5;
