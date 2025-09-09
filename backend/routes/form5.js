///////////router file form 5 

import express from "express";
import mongoose from "mongoose";
import form5 from "../models/form5.js";


const router = express.Router();

// Create a new form5 entry
router.route("/add").post((req, res) => {
  const networkEngineersKPI = req.body.networkEngineersKPI;
  const divisions = req.body.divisions;

  const newForm5 = new form5({
    networkEngineersKPI,
    divisions
  });

  newForm5
    .save()
    .then(() => {
      res.json("form5 Added");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Error creating form5", error: err });
    });
});

// Get all form5 entries
router.route("/").get((req, res) => {
  form5
    .find()
    .then((form5) => {
      res.json(form5);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Error fetching form5", error: err });
    });
});

// Get a specific form5 entry by ID
router.route("/get/:id").get((req, res) => {
  const form5Id = req.params.id;

  form5
    .findById(form5Id)
    .then((form5) => {
      if (form5) {
        res.status(200).send({ status: "form5 fetched", form5 });
      } else {
        res.status(404).send({ status: "form5 not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Error fetching form5", error: err });
    });
});

router.route("/update/:id").put((req, res) => {
  const form5Id = req.params.id;
  const { regionName, totalMinutes, totalNodes, unavailableNE } = req.body;

  form5
    .findOneAndUpdate(
      { _id: form5Id, 'regionalData.percentages': { $exists: true } }, // Query to find form5 and ensure percentages exist
      {
        $set: {
          'regionalData.$[region].percentages.CENHKMD.metrics.totalMinutes': totalMinutes,
          'regionalData.$[region].percentages.CENHKMD.metrics.totalNodes': totalNodes,
          'regionalData.$[region].percentages.CENHKMD.metrics.unavailableNE': unavailableNE,
        },
      },
      {
        new: true, // return the updated document
        arrayFilters: [{ 'region.name': 'Metro 1' }] // Ensure you filter the correct regional data by name
      }
    )
    .then((updatedForm5) => {
      if (updatedForm5) {
        res.status(200).send({ status: "form5 updated", updatedForm5 });
      } else {
        res.status(404).send({ status: "form5 not found" });
      }
    })
    .catch((err) => {
      console.error("Update Error:", err);
      res.status(500).send({ message: "Error updating form5", error: err.message });
    });
});


// Delete a form5 entry by ID
router.route("/delete/:id").delete((req, res) => {
  const form5Id = req.params.id;

  form5
    .findByIdAndDelete(form5Id)
    .then((deletedForm5) => {
      if (deletedForm5) {
        res.status(200).send({ status: "form5 deleted" });
      } else {
        res.status(404).send({ status: "form5 not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Error deleting form5", error: err });
    });
});

export default router;
