// models/form4.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const form4Schema = new Schema(
  {
    no: { type: Number, required: false },
    kpi: { type: String, required: false },
    target: { type: String, required: false },
    calculation: { type: String, required: false },
    platform: { type: String, required: false },
    responsibledgm: { type: String, required: false },
    definedoladetails: { type: String, required: false },
    weightage: { type: String, required: false },
    datasources: { type: String, required: false },

    /**
     * Dynamic area values.
     * Key example: "CENHKMD", "CENHKMD1", "GQKINTB", etc.
     * Value should be a Number (store as percent or raw as you do today).
     */
    areas: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Implementing RTOM AREA filter
const rtomAreaFilter = (data) => {
    return data.filter(item => item.areas.has('RTOM'));
};

const Form4 = mongoose.model("form4", form4Schema);
export default Form4;
