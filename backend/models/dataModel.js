import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  month: String,         // Example fields based on the SOAP request
  response: String,      // This will store the SOAP response (as a string for simplicity)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Data = mongoose.model('Data', dataSchema);

export default Data;
