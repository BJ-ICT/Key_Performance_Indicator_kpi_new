import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Define a schema for the Main Table
const mainTableSchema = new mongoose.Schema({
  mainTable: [
    {
      no: String,
      KPI: String,
      Target: String,
      Calculation: String,
      Platform: String,
      Responsible_DGM: String,
      Defined_OLA_Details: String,
      Data_Sources: String,
      nwData: {
        type: Map,
        of: String,
      },
    },
  ],
  columnSums: Object,
  currentMonth: String,
}, { timestamps: true });

const MainTable = mongoose.model('MainTable', mainTableSchema);

// Route to save the Main Table data
router.post('/main-table/save', async (req, res) => {
  try {
    const { mainTable, columnSums, currentMonth } = req.body;

    const newTable = new MainTable({
      mainTable,
      columnSums,
      currentMonth,
    });

    await newTable.save();
    res.status(200).send({ message: 'Table data saved successfully!' });
  } catch (error) {
    console.error('Error saving table data:', error);
    res.status(500).send({ message: 'Failed to save table data.' });
  }
});

export default router;