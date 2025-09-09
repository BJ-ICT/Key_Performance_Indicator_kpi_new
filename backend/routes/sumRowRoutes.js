const express = require('express');
const router = express.Router();
const SumRow = require('../models/SumRow');

// POST: Save "Sum Row" data
router.post('/', async (req, res) => {
  try {
    const { sumRowData } = req.body;

    // Save each header-value pair from the sumRowData to the database
    const savePromises = Object.entries(sumRowData).map(([header, value]) => {
      const row = new SumRow({ header, value });
      return row.save();
    });

    await Promise.all(savePromises);

    res.status(200).send({ message: 'Sum Row data saved successfully!' });
  } catch (error) {
    console.error('Error saving Sum Row data:', error);
    res.status(500).send({ error: 'Failed to save Sum Row data.' });
  }
});

// GET: Retrieve all "Sum Row" data
router.get('/', async (req, res) => {
  try {
    const data = await SumRow.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving Sum Row data:', error);
    res.status(500).send({ error: 'Failed to retrieve Sum Row data.' });
  }
});

module.exports = router;
