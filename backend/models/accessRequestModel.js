import mongoose from 'mongoose';

// Define AccessRequest schema
const AccessRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    serviceNo: {
      type: String,
      required: true,
      trim: true,
    },
    option: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create AccessRequest model
const AccessRequest = mongoose.model('AccessRequest', AccessRequestSchema);

// Function to fetch all access requests
async function getAllAccessRequests() {
  try {
    return await AccessRequest.find({});
  } catch (error) {
    throw new Error(`Error fetching access requests: ${error.message}`);
  }
}

// Function to add a new access request
async function addAccessRequest(data) {
  try {
    const count = await AccessRequest.countDocuments();
    const id = (count + 1).toString().padStart(6, '0');

    const newRequest = new AccessRequest({
      id,
      name: data.newSubmissionName,
      serviceNo: data.newSubmissionSNO,
      option: data.newSubmissionOption,
      reason: data.newSubmissionReason,
      timestamp: data.newSubmissionTimestamp,
    });

    return await newRequest.save();
  } catch (error) {
    throw new Error(`Error adding access request: ${error.message}`);
  }
}

export { AccessRequest, getAllAccessRequests, addAccessRequest };