import mongoose from "mongoose";

const Schema = mongoose.Schema;

const form2Schema = new Schema({

    CENHKMD :{
        type : String,
        required: true
    },

    CENHKMD1 :{
        type : String,
        required: true
    },

    GQKINTB :{
        type: String,
        required: true
    },

    NDRM :{
        type : String,
        required: true
    },

    AWHO :{
        type : String,
        required: true
    },

    KONKX : {
        type : String,
        required: true
    },

    NGWT : {
        type  : String,
        required : true
    },

    KGKLY : {
        type : String,
        required : true
    },

    CWPX : {
        type : String,
        required : true
    },

    DBKYMT : {
        type : String,
        required : true
    },

    GPHTNW : {
        type : String,
        required : true
    },

    ADPR : {
        type : String,
        required : true
    },

    BDBWMRG : {
        type : String,
        required : true
    },

    KERN : {
        type : String,
        required : true
    },

    EBMHMBH : {
        type : String,
        required : true
    },

    AGGL : {
        type : String,
        required : true
    },

    HRKTPH : {
        type : String,
        required : true
    },

    BCAPKLTC : {
        type : String,
        required : true
    },

    JA : {
        type : String,
        required : true
    },

    KOMLTMBVA: {
        type : String,
        required : true
    }




}) 

const form2 = mongoose.model("form2",form2Schema);

export default form2;