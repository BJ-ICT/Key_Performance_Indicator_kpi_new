import mongoose from 'mongoose';

const repeatedHardcodeTab1Schema = new mongoose.Schema(
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

const RepeatedHardcodeTab1 = mongoose.model('RepeatedHardcodeTab1', repeatedHardcodeTab1Schema);
export default RepeatedHardcodeTab1;
