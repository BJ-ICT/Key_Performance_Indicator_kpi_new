import express from "express";
import RegionTable from "../models/RegionTable.js";

const router = express.Router();

// GET /api/region-table/ - Fetch all region data
router.get("/", async (req, res) => {
  try {
    const regionData = await RegionTable.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: regionData,
    });
  } catch (error) {
    console.error("Error fetching region data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch region data",
      error: error.message,
    });
  }
});

// POST /api/region-table/add - Add new region data
router.post("/add", async (req, res) => {
  try {
    const { region, province, networkEngineer, lea } = req.body;

    // Validation
    if (!region || !province || !networkEngineer || !lea) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newEntry = new RegionTable({
      region: region.trim(),
      province: province.trim(),
      networkEngineer: networkEngineer.trim(),
      lea: lea.trim(),
    });

    const savedEntry = await newEntry.save();

    res.status(201).json({
      success: true,
      message: "Region data added successfully",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error adding region data:", error);

    // if (error.code === 11000) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Duplicate entry found",
    //   });
    // }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate row: (region, province, networkEngineer, lea) must be unique",
      });
    }


    res.status(500).json({
      success: false,
      message: "Failed to add region data",
      error: error.message,
    });
  }
});

// PUT /api/region-table/update/:id - Update region data
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { region, province, networkEngineer, lea } = req.body;

    // Validation
    if (!region || !province || !networkEngineer || !lea) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedEntry = await RegionTable.findByIdAndUpdate(
      id,
      {
        region: region.trim(),
        province: province.trim(),
        networkEngineer: networkEngineer.trim(),
        lea: lea.trim(),
      },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        message: "Region data not found",
      });
    }

    res.json({
      success: true,
      message: "Region data updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating region data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update region data",
      error: error.message,
    });
  }
});

// DELETE /api/region-table/delete/:id - Delete region data
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await RegionTable.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Region data not found",
      });
    }

    res.json({
      success: true,
      message: "Region data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting region data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete region data",
      error: error.message,
    });
  }
});

// GET /api/region-table/network-engineers - Get unique network engineers
router.get("/network-engineers", async (req, res) => {
  try {
    const networkEngineers = await RegionTable.distinct("networkEngineer");
    res.json({
      success: true,
      data: networkEngineers.sort(),
    });
  } catch (error) {
    console.error("Error fetching network engineers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch network engineers",
      error: error.message,
    });
  }
});

// GET /api/region-table/leas - Get unique LEAs
router.get("/leas", async (req, res) => {
  try {
    const leas = await RegionTable.distinct("lea");
    res.json({
      success: true,
      data: leas.sort(),
    });
  } catch (error) {
    console.error("Error fetching LEAs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch LEAs",
      error: error.message,
    });
  }
});

// POST /api/region-table/move-lea - Move LEA to different network engineer
router.post("/move-lea", async (req, res) => {
  try {
    const { lea, newNetworkEngineer, newRegion, newProvince } = req.body;

    // Validation
    if (!lea || !newNetworkEngineer || !newRegion || !newProvince) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find the LEA entry
    const leaEntry = await RegionTable.findOne({ lea: lea.trim() });

    if (!leaEntry) {
      return res.status(404).json({
        success: false,
        message: "LEA not found",
      });
    }

    // Update the LEA entry
    leaEntry.networkEngineer = newNetworkEngineer.trim();
    leaEntry.region = newRegion.trim();
    leaEntry.province = newProvince.trim();

    await leaEntry.save();

    res.json({
      success: true,
      message: `LEA "${lea}" moved successfully`,
      data: leaEntry,
    });
  } catch (error) {
    console.error("Error moving LEA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to move LEA",
      error: error.message,
    });
  }
});



// PATCH /api/region-table/update-fields/:id - Update specific fields
router.patch("/update-fields/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow updating networkEngineer and lea fields
    const allowedFields = ["networkEngineer", "lea"];
    const filteredUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        filteredUpdates[key] = value.trim();
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const updatedEntry = await RegionTable.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        message: "Region data not found",
      });
    }

    res.json({
      success: true,
      message: `${Object.keys(filteredUpdates)[0]} updated successfully`,
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating fields:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fields",
      error: error.message,
    });
  }
});

export default router;
