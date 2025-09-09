import mongoose from 'mongoose';

const MTNCRoutineTable1Schema = new mongoose.Schema(
  {
    no: { type: Number, required: true },
    kpi: { type: String, required: true },
    target: { type: String, required: true },
    calculation: { type: String, required: true },
    platform: { type: String, required: true },
    responsibleDGM: { type: String, required: true },
    definedOLADetails: { type: String, required: true },
    dataSources: { type: String, required: true },
  },
  { timestamps: true }
);

const MTNCRoutineTable1 = mongoose.model('MTNCRoutineTable1', MTNCRoutineTable1Schema);
export default MTNCRoutineTable1;
