// Importing express and the model
import express from 'express';
import FinalDataTable from '../models/FinalDataTable.js';

const router = express.Router();

// Add data to the database
router.post('/add', async (req, res) => {
  try {
    const newData = await FinalDataTable.create(req.body);
    res.status(201).json({ message: 'Data added successfully!', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add data', error });
  }
});

// Retrieve data from the database
router.get('/', async (req, res) => {
  try {
    const data = await FinalDataTable.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
});

// Update data in the database
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await FinalDataTable.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found!' });
    }
    res.status(200).json({ message: 'Data updated successfully!', data: updatedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update data', error });
  }
});

// Delete data from the database
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedData = await FinalDataTable.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({ message: 'Data not found!' });
    }
    res.status(200).json({ message: 'Data deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete data', error });
  }
});

export default router;