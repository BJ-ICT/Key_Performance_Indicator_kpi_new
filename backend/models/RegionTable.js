import mongoose from "mongoose";

// Define Region Table schema
const RegionTableSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    networkEngineer: {
      type: String,
      required: true,
      trim: true,
    },
    lea: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
RegionTableSchema.index({ region: 1 });
RegionTableSchema.index({ province: 1 });
RegionTableSchema.index({ networkEngineer: 1 });
RegionTableSchema.index({ lea: 1 });

// Create RegionTable model
const RegionTable = mongoose.model("RegionTable", RegionTableSchema);

//- duplicate prevention:
// Entire row must be unique across these 4 fields
RegionTableSchema.index(
  { region: 1, province: 1, networkEngineer: 1, lea: 1 },
  { unique: true }
);

export default RegionTable;
