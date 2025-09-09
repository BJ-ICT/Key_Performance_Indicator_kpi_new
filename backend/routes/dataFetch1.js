import express from 'express';
import Data from '../models/dataModel.js'; // Import the Mongoose model

const router = express.Router();

// Route to retrieve all stored data
router.get('/data', async (req, res) => {
  try {
    const data = await Data.find(); // Fetch data directly from the database
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

export default router;
