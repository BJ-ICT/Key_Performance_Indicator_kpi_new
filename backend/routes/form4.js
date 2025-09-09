import express from "express";
import mongoose from "mongoose";
import form4 from "../models/form4.js";

const router = express.Router();


//create
router.route("/add").post((req,res)=>{
    const no = Number(req.body.no);
    const kpi = req.body.kpi;
    const target = req.body.target;
    const calculation = req.body.calculation;
    const platform = req.body.platform;
    const responsibledgm = req.body.responsibledgm;
    const definedoladetails = req.body.definedoladetails;
    const weightage = req.body.weightage;
    const datasources = req.body.datasources;
    const CENHKMD = req.body.CENHKMD;
    const CENHKMD1 = req.body.CENHKMD1;
    const GQKINTB = req.body.GQKINTB;
    const NDRM = req.body.NDRM;
    const AWHO = req.body.AWHO;
    const KONKX = req.body.KONKX;
    const NGWT = req.body.NGWT;
    const KGKLY = req.body.KGKLY;
    const CWPX = req.body.CWPX;
    const DBKYMT = req.body.DBKYMT;
    const GPHTNW = req.body.GPHTNW;
    const ADPR = req.body.ADPR;
    const BDBWMRG = req.body.BDBWMRG;
    const KERN = req.body.KERN;
    const EBMHMBH = req.body.EBMHMBH;
    const AGGL = req.body.AGGL;
    const HRKTPH  = req.body.HRKTPH ;
    const BCAPKLTC = req.body.BCAPKLTC;
    const JA  = req.body.JA ;
    const KOMLTMBVA = req.body.KOMLTMBVA;

    const newform4 = new form4({
        no,
        kpi,
        target,
        calculation,
        platform,
        responsibledgm,
        definedoladetails,
        weightage,
        datasources, 
        CENHKMD,
        CENHKMD1,
        GQKINTB,
        NDRM,
        AWHO,
        KONKX,
        NGWT,
        KGKLY,
        CWPX,
        DBKYMT,
        GPHTNW,
        ADPR,
        BDBWMRG,
        KERN,
        EBMHMBH,
        AGGL,
        HRKTPH,
        BCAPKLTC,
        JA,
        KOMLTMBVA


    })

    newform4.save().then(()=>{
        res.json("form4 Added")
    }).catch((err)=>{
        console.log(err);
    })
})

//read
router.route("/").get((req,res)=>{

    form4.find().then((form4)=>{
        res.json(form4)
    }).catch((err)=>{
        console.log(err);
    })
})

//update
router.route("/update/:id").put(async(req,res)=>{
    let userid = req.params.id;
    const {no, kpi, target, calculation, platform, responsibledgm, definedoladetails, weightage, datasources,CENHKMD, CENHKMD1, GQKINTB, NDRM, AWHO, KONKX, NGWT, KGKLY, CWPX, DBKYMT, GPHTNW, ADPR, BDBWMRG, KERN, EBMHMBH, AGGL, HRKTPH, BCAPKLTC, JA, KOMLTMBVA}= req.body;

    const updateform4 = {
        no,
        kpi,
        target,
        calculation,
        platform,
        responsibledgm,
        definedoladetails,
        weightage,
        datasources,
        CENHKMD,
        CENHKMD1,
        GQKINTB,
        NDRM,
        AWHO,
        KONKX,
        NGWT,
        KGKLY,
        CWPX,
        DBKYMT,
        GPHTNW,
        ADPR,
        BDBWMRG,
        KERN,
        EBMHMBH,
        AGGL,
        HRKTPH,
        BCAPKLTC,
        JA,
        KOMLTMBVA 
    }
    const update = await form4.findByIdAndUpdate(userid,updateform4).then(()=>{
        res.status(200).send({status: "user updated"})
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({status:"Error with updating data"});
    })
    
})

//delete
router.route("/delete/:id").delete(async(req,res)=>{
    let userid = req.params.id;
    await form4.findByIdAndDelete(userid).then(()=>{
        res.status(200).send({status:"user deleted"});
    }).catch((err)=>{
        console.log(err.message);
        res.status(500).send({status:"Error with delete user",error:err.message});
        })
})

router.route("/get/:id").get(async(req,res)=>{
    let userid = req.params.id;
    const user = await form4.findById(userid).then(()=>{
        res.status(200).send({status:"user fetched",user: user})
    }).catch(()=>{
        console.log(err.message);
        res.status(500).send({status:"error with get user",error:err.message})
    })
})

export default router;
