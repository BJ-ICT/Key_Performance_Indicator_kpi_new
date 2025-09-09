import mongoose from 'mongoose';

const finalDataTableSchema = new mongoose.Schema(
  {
    rowNumber: Number,
    perspectives: String,
    strategicObjectives: String,
    keyPerformanceIndicators: String,
    unit: String,
    descriptionOfKPI: String,
    weightage: Number,
  },
  { timestamps: true }
);

const FinalDataTable = mongoose.model('FinalDataTable', finalDataTableSchema);
export default FinalDataTable;
