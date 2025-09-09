//data fetch 2 route...............

import express from 'express';
import Data1 from '../models/dataModel2.js'; // Mongoose model

const router = express.Router();

router.get('/data', async (req, res) => {
  try {
    const { platform } = req.query; // Get platform query parameter
    const query = platform ? { platform } : {}; // Filter by platform if specified
    const data = await Data1.find(query); // Find data with the specified platform
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

export default router;
