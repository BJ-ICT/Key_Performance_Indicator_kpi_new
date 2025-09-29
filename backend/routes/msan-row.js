import express from "express";
import MsanKpi from "../models/msan-row.js";

const router = express.Router();

// ➕ Add MSAN KPI row
router.post("/add", async (req, res) => {
  try {
    const newRow = await MsanKpi.create(req.body);
    res.status(201).json({ message: "MSAN row added successfully!", data: newRow });
  } catch (err) {
    console.error("Error adding MSAN row:", err);
    res.status(500).json({ message: "Failed to add MSAN row", error: err.message });
  }
});

// 📄 Get all MSAN KPI rows
router.get("/", async (req, res) => {
  try {
    const rows = await MsanKpi.find();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching MSAN rows:", err);
    res.status(500).json({ message: "Failed to fetch MSAN rows", error: err.message });
  }
});

// ✏️ Update MSAN KPI row
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await MsanKpi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "MSAN row not found!" });
    res.status(200).json({ message: "MSAN row updated successfully!", data: updated });
  } catch (err) {
    console.error("Error updating MSAN row:", err);
    res.status(500).json({ message: "Failed to update MSAN row", error: err.message });
  }
});

// ❌ Delete MSAN KPI row
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await MsanKpi.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "MSAN row not found!" });
    res.status(200).json({ message: "MSAN row deleted successfully!" });
  } catch (err) {
    console.error("Error deleting MSAN row:", err);
    res.status(500).json({ message: "Failed to delete MSAN row", error: err.message });
  }
});

export default router;
