import mongoose from 'mongoose';
const currentYear = new Date().getFullYear();
const finaldatatables = `finaldatatables`;

const finalDataTableSchema = new mongoose.Schema(
  {
    rowNumber: Number,
    perspectives: String,
    strategicObjectives: String,
    keyPerformanceIndicators: String,
    unit: String,
    descriptionOfKPI: String,
    weightage: Number,
    year:String,
    month:String,
  },
  { collection: finaldatatables,
    timestamps: true }
);

const FinalDataTable = mongoose.model('FinalDataTable', finalDataTableSchema);
export default FinalDataTable;
