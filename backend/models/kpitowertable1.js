import mongoose from 'mongoose';

const kpiTowerTable1Schema = new mongoose.Schema(
  {
    no: { type: Number, required: true },
    responsibility: { type: String, required: true },
    frequency: { type: String, required: true },
    weightage: { type: String, required: true },
    kpi: { type: String, required: true },
  },
  { timestamps: true }
);

const kpiTowerTable1 = mongoose.model('kpiTowerTable1', kpiTowerTable1Schema);
export default kpiTowerTable1;
