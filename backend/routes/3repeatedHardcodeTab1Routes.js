import express from 'express';
import RepeatedHardcodeTab1 from '../models/3repeatedhardcodetab1.js';

const router = express.Router();

// Add data to the table
router.post('/add', async (req, res) => {
  try {
    const newData = await RepeatedHardcodeTab1.create(req.body);
    res.status(201).json({ message: 'Data added successfully!', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add data', error });
  }
});

// Retrieve all data from the table
router.get('/', async (req, res) => {
  try {
    const data = await RepeatedHardcodeTab1.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
});

// Update data in the table
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const result = await RepeatedHardcodeTab1.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });

    if (!result) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data updated successfully!', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update data', error });
  }
});

// Delete data from the table
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await RepeatedHardcodeTab1.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted successfully!', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete data', error });
  }
});

export default router;
