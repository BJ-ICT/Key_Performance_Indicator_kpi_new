import express from "express";
import mongoose from "mongoose";
import form10 from "../models/form10.js";

const router = express.Router();


//create
router.route("/add").post((req,res)=>{
    const no = Number(req.body.no);
    const KPI = req.body.KPI;
    const Target = req.body.Target;
    const Calculation = req.body.Calculation;
    const Platform = req.body.Platform;
    const Responsible_DGM= req.body.Responsible_DGM;
    const Defined_OLA_Details = req.body.Defined_OLA_Details;
    const Data_Sources = req.body.Data_Sources;
    
    const NW_CPN  = req.body.NW_CPN ;
    const NW_CPS = req.body.NW_CPS;
    const NW_EP  = req.body.NW_EP ;
    const NW_NCP = req.body.NW_NCP;
    const NW_NP_1 = req.body.NW_NP_1;
    const NW_NP_2 = req.body.NW_NP_2;
    const NW_NWPE = req.body.NW_NWPE;
    const NW_NWPW= req.body.NW_NWPW;
    const NW_SAB= req.body.NW_SAB;
    const NW_SPE = req.body.NW_SPE;
    const NW_SPW = req.body.NW_SPW;
    const NW_UVA  = req.body.NW_UVA ;
    const NW_WPC = req.body.NW_WPC;
    const NW_WPE= req.body.NW_WPE;
    const NW_WPN  = req.body.NW_WPN ;
    const NW_WPNE = req.body.NW_WPNE;
    const NW_WPS   = req.body.NW_WPS ;
    const NW_WPSE  = req.body.NW_WPSE;
    const NW_WPSW = req.body.NW_WPSW;
   

    const newform10 = new form10({
        no ,
        KPI,
        Target,
        Calculation,
        Platform,
        Responsible_DGM,
        Defined_OLA_Details,
        Data_Sources,
      
        NW_CPN,
        NW_CPS,
        NW_EP,
        NW_NCP,
        NW_NP_1,
        NW_NP_2,
        NW_NWPE,
        NW_NWPW,
        NW_SAB,
        NW_SPE,
        NW_SPW,
        NW_UVA,
        NW_WPC,
        NW_WPE,
        NW_WPN,
        NW_WPNE,
        NW_WPS,
        NW_WPSE,
        NW_WPSW
       


    })

    newform10.save().then(()=>{
        res.json("form10 Added")
    }).catch((err)=>{
        console.log(err);
    })
})

//read
router.route("/").get((req,res)=>{

    form10.find().then((form10)=>{
        res.json(form10)
    }).catch((err)=>{
        console.log(err);
    })
})

//update
router.route("/update/:id").put(async(req,res)=>{
    let userid = req.params.id;
    const {no, KPI, Target, Calculation, Platform, Responsible_DGM, Defined_OLA_Details, Data_Sources, NW_CPN, NW_CPS, NW_EP, NW_NCP, NW_NP_1, NW_NP_2, NW_NWPE, NW_NWPW,  NW_SAB, NW_SPE, NW_SPW, NW_UVA, NW_WPC, NW_WPE, NW_WPN, NW_WPNE, NW_WPS, NW_WPSE, NW_WPSW}= req.body;

    const updateform10 = {
        no ,
        KPI,
        Target,
        Calculation,
        Platform,
        Responsible_DGM,
        Defined_OLA_Details,
        Data_Sources,
      
        NW_CPN,
        NW_CPS,
        NW_EP,
        NW_NCP,
        NW_NP_1,
        NW_NP_2,
        NW_NWPE,
        NW_NWPW,
        NW_SAB,
        NW_SPE,
        NW_SPW,
        NW_UVA,
        NW_WPC,
        NW_WPE,
        NW_WPN,
        NW_WPNE,
        NW_WPS,
        NW_WPSE,
        NW_WPSW
    }
    const update = await form10.findByIdAndUpdate(userid,updateform10).then(()=>{
        res.status(200).send({status: "user updated"})
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({status:"Error with updating data"});
    })
    
})

//delete
router.route("/delete/:id").delete(async(req,res)=>{
    let userid = req.params.id;
    await form10.findByIdAndDelete(userid).then(()=>{
        res.status(200).send({status:"user deleted"});
    }).catch((err)=>{
        console.log(err.message);
        res.status(500).send({status:"Error with delete user",error:err.message});
        })
})

router.route("/get/:id").get(async(req,res)=>{
    let userid = req.params.id;
    const user = await form10.findById(userid).then(()=>{
        res.status(200).send({status:"user fetched",user: user})
    }).catch(()=>{
        console.log(err.message);
        res.status(500).send({status:"error with get user",error:err.message})
    })
})

export default router;
