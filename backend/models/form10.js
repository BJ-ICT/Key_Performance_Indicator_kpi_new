import mongoose from "mongoose";

const Schema = mongoose.Schema;

const form10Schema = new Schema({

    no :{
        type : Number,
        required: true
       
    },

    KPI :{
        type : String,
        required: true
    },

    Target:{
        type: String,
        required: true
        
    },

    Calculation :{
        type : String,
        required: true
        
    },

    Platform:{
        type : String,
        required: true
    },

    Responsible_DGM:{
        type:String,
        required: true
    },

    Defined_OLA_Details:{
        type:String,
        required: true
    },

    Data_Sources:{
        type :String,
        required: true
    },


    NW_CPN :{
        type : String,
        
    },

    NW_CPS :{
        type : String,
        
    },

    NW_EP :{
        type: String,
        
    },

    NW_NCP :{
        type : String,
       
    },

    NW_NP_1 :{
        type : String,
        
    },

    NW_NP_2: {
        type : String,
        
    },

    NW_NWPE : {
        type  : String,
        
    },

    NW_NWPW : {
        type : String,
        
    },

    NW_SAB : {
        type : String,
        
    },

    NW_SPE : {
        type : String,
        
    },

    NW_SPW: {
        type : String,
       
    },

    NW_UVA : {
        type : String,
    
    },

    NW_WPC : {
        type : String,
        
    },

    NW_WPE : {
        type : String,
        
    },

    NW_WPN : {
        type : String,
       
    },

    NW_WPNE : {
        type : String,
        
    },

    NW_WPS : {
        type : String,
       
    },

    NW_WPSE: {
        type : String,
       
    },

    NW_WPSW: {
        type : String,
        
    }


}) 

const form10 = mongoose.model("form10",form10Schema);

export default form10;