//model 2 

import mongoose from 'mongoose';

const dataSchema1 = new mongoose.Schema({
  month: String,
  platform: String,         // Example fields based on the SOAP request
  response: String,      // This will store the SOAP response (as a string for simplicity)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Data1 = mongoose.model('Data1', dataSchema1);

export default Data1;
