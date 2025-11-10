// models/MultiTableDataModel.js

import mongoose from 'mongoose';

// Define allowed platforms
const allowedPlatforms = ['MSAN', 'VPN', 'SLBN'];

// Define a schema for the data
const DataSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: allowedPlatforms,
        message: 'Platform must be either MSAN, VPN, or SLBN',
      },
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Allows flexibility for nested objects/arrays
      required: [true, 'Details are required'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Create a unique compound index on month and platform to prevent duplicates
DataSchema.index({ month: 1, platform: 1 }, { unique: true, background: true });
const currentYear = new Date().getFullYear();  // e.g. 2025
const msan = "fetchMsan_"+currentYear;
const vpn =  "fetchVpn_"+currentYear;
const slbn =  "fetchSlbn_"+currentYear;
console.log("Year as string:", currentYear);
console.log(msan+","+vpn+","+slbn);
// Export models for each platform using separate collections
export const FetchMsan = mongoose.model('FetchMsan', DataSchema, msan);
export const FetchVpn = mongoose.model('FetchVpn', DataSchema, vpn);
export const FetchSlbn = mongoose.model('FetchSlbn', DataSchema, slbn);
//
