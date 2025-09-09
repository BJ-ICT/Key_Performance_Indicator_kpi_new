import express from "express";
import mongoose from "mongoose";
import form1 from "../models/form1.js";

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

    const newform1 = new form1({
        no,
        kpi,
        target,
        calculation,
        platform,
        responsibledgm,
        definedoladetails,
        weightage,
        datasources 


    })

    newform1.save().then(()=>{
        res.json("form1 Added")
    }).catch((err)=>{
        console.log(err);
    })
})

//read
router.route("/").get((req,res)=>{

    form1.find().then((form1)=>{
        res.json(form1)
    }).catch((err)=>{
        console.log(err);
    })
})

//update
router.route("/update/:id").put(async(req,res)=>{
    let userid = req.params.id;
    const {no, kpi, target, calculation, platform, responsibledgm, definedoladetails, weightage, datasources}= req.body;

    const updateform1 = {
        no,
        kpi,
        target,
        calculation,
        platform,
        responsibledgm,
        definedoladetails,
        weightage,
        datasources 
    }
    const update = await form1.findByIdAndUpdate(userid,updateform1).then(()=>{
        res.status(200).send({status: "user updated"})
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({status:"Error with updating data"});
    })
    
})

//delete
router.route("/delete/:id").delete(async(req,res)=>{
    let userid = req.params.id;
    await form1.findByIdAndDelete(userid).then(()=>{
        res.status(200).send({status:"user deleted"});
    }).catch((err)=>{
        console.log(err.message);
        res.status(500).send({status:"Error with delete user",error:err.message});
        })
})

router.route("/average-kpi").get(async (req, res) => {
    try {
        const formData = await form1.find();
        
        // Ensure there is data to calculate average
        if (formData.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        
        // Convert KPIs to numbers and calculate average
        const totalKPI = formData.reduce((acc, item) => acc + Number(item.kpi), 0);
        const averageKPI = totalKPI / formData.length;

        // Save the average KPI in the last entry or any logic you prefer
        formData[formData.length - 1].averageKPI = averageKPI; // Example: update the last entry
        await formData[formData.length - 1].save();

        res.json({ averageKPI });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate average KPI' });
    }
});



router.route("/get/:id").get(async(req,res)=>{
    let userid = req.params.id;
    const user = await form1.findById(userid).then(()=>{
        res.status(200).send({status:"user fetched",user: user})
    }).catch(()=>{
        console.log(err.message);
        res.status(500).send({status:"error with get user",error:err.message})
    })
})

export default router;
