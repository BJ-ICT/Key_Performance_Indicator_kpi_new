import mongoose from 'mongoose';

const TableDataSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true }, // Added unique constraint
  details: [
    {
      Column1: { type: String, required: true }, // Made required
      Column2: { type: Number, required: true }, // Made required
      Column3: { type: Number, required: true }, // Made required
      Column4: { type: Number }, // Optional
    },
  ],
});

// Create an index on 'month' for faster queries and uniqueness
TableDataSchema.index({ month: 1 }, { unique: true });

const TableDataModel = mongoose.model('TableData', TableDataSchema);

export default TableDataModel;