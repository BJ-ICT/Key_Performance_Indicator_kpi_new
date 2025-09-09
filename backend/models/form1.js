import mongoose from "mongoose";

const Schema = mongoose.Schema;

const form1Schema = new Schema({

    no :{
        type : Number,
        required: true
    },

    kpi :{
        type : String,
        required: true
    },

    target:{
        type: String,
        required: true
    },

    calculation :{
        type : String,
        required: true
    },

    platform :{
        type : String,
        required: true
    },

    responsibledgm : {
        type : String,
        required: true
    },

    definedoladetails : {
        type  : String,
        required : true
    },

    weightage : {
        type : String,
        required : true
    },

    datasources : {
        type : String,
        required : true 
    },

    averageKPI: {
        type: Number,
        default: null, // Or required based on your logic
    },


}) 

const form1 = mongoose.model("form1",form1Schema);

export default form1;