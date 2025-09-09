import express from 'express';
import TMTable1 from '../models/TMTable1data.js';

const router = express.Router();

// Add data to the table
router.post('/add', async (req, res) => {
  try {
    const newData = await TMTable1.create(req.body);
    res.status(201).json({ message: 'Data added successfully!', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add data', error });
  }
});

// Retrieve all data from the table
router.get('/', async (req, res) => {
  try {
    const data = await TMTable1.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
});

export default router;
