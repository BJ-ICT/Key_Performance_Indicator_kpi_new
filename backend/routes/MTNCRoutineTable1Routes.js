import express from 'express';
import MTNCRoutineTable1 from '../models/MTNCRoutinetable1.js';

const router = express.Router();

// Add data to the table
router.post('/add', async (req, res) => {
  try {
    const newData = await MTNCRoutineTable1.create(req.body);
    res.status(201).json({ message: 'Data added successfully!', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add data', error });
  }
});

// Retrieve all data from the table
router.get('/', async (req, res) => {
  try {
    const data = await MTNCRoutineTable1.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
});

// Update data by ID
router.put('/update/:id', async (req, res) => {
  try {
    const updatedData = await MTNCRoutineTable1.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found!' });
    }
    res.status(200).json({ message: 'Data updated successfully!', data: updatedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update data', error });
  }
});

// Delete data by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedData = await MTNCRoutineTable1.findByIdAndDelete(req.params.id);
    if (!deletedData) {
      return res.status(404).json({ message: 'Data not found!' });
    }
    res.status(200).json({ message: 'Data deleted successfully!', data: deletedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete data', error });
  }
});

export default router;
