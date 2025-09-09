import mongoose from "mongoose";

const Schema = mongoose.Schema;

const form4Schema = new Schema({

    no :{
        type : Number,
        required: false
    },

    kpi :{
        type : String,
        required: false
    },

    target:{
        type: String,
        required: false
    },

    calculation :{
        type : String,
        required: false
    },

    platform :{
        type : String,
        required: false
    },

    responsibledgm : {
        type : String,
        required: false
    },

    definedoladetails : {
        type  : String,
        required : false
    },

    weightage : {
        type : String,
        required : false
    },

    datasources : {
        type : String,
        required : false
    },



    CENHKMD :{
        type : String,
        required: false
    },

    CENHKMD1 :{
        type : String,
        required: false
    },

    GQKINTB :{
        type: String,
        required: false
    },

    NDRM :{
        type : String,
        required: false
    },

    AWHO :{
        type : String,
        required: false
    },

    KONKX : {
        type : String,
        required: false
    },

    NGWT : {
        type  : String,
        required : false
    },

    KGKLY : {
        type : String,
        required : false
    },

    CWPX : {
        type : String,
        required : false
    },

    DBKYMT : {
        type : String,
        required : false
    },

    GPHTNW : {
        type : String,
        required : false
    },

    ADPR : {
        type : String,
        required : false
    },

    BDBWMRG : {
        type : String,
        required : false
    },

    KERN : {
        type : String,
        required : false
    },

    EBMHMBH : {
        type : String,
        required : false
    },

    AGGL : {
        type : String,
        required : false
    },

    HRKTPH : {
        type : String,
        required : false
    },

    BCAPKLTC : {
        type : String,
        required : false
    },

    JA : {
        type : String,
        required : false
    },

    KOMLTMBVA: {
        type : String,
        required : false
    }




}) 

const form4 = mongoose.model("form4",form4Schema);

export default form4;