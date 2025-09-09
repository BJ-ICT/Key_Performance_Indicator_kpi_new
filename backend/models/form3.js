import mongoose from "mongoose";

const Schema = mongoose.Schema;

const form3Schema = new Schema({

    no :{
        type : Number,
       
    },

    NetworkEngineersKPIs :{
        type : String,
        
    },

    division:{
        type: String,
        
    },

    section :{
        type : String,
        
    },

    kpi:{
        type : String,
       
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

const form3 = mongoose.model("form3",form3Schema);

export default form3;