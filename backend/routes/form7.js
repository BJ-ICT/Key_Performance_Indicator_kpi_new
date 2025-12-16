import express from 'express';
import Form7 from '../models/form7.js';

const router = express.Router();


// Create a new form7 entry
router.post('/add', async (req, res) => {
  const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes, year, month } = req.body;

  try {
    const newForm7Entry = new Form7({
      no,
      network_engineer_kpi,
      division,
      section,
      kpi_percent,
      unavailable_minutes: unavailable_minutes || {},
      total_minutes: total_minutes || {},
      total_nodes: total_nodes || {},
      year,
      month
    });

    await newForm7Entry.save();
    res.status(201).json({ message: 'Form7 entry created successfully!', data: newForm7Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Form7 entry', error: error.message });
  }
});

// Get all form7 entries
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};
    
    if (year) query.year = year;
    if (month) query.month = month;
    
    const form7Entries = await Form7.find(query);
    res.status(200).json(form7Entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form7 entries', error: error.message });
  }
});

// ✅ GET LATEST - MUST BE BEFORE /:id ROUTE!
router.get('/latest', async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};

    if (year) query.year = year;
    if (month) query.month = Number(month);

    const latestEntries = await Form7.find(query)
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean();

    // Return ONLY the array of documents
    res.status(200).json(latestEntries);
  } catch (error) {
    console.error('Error in /form7/latest:', error);
    res.status(500).json({ message: 'Failed to fetch latest entries', error });
  }
});

// Get a specific form7 entry by ID (AFTER /latest)
router.get('/:id', async (req, res) => {
  try {
    const form7Entry = await Form7.findById(req.params.id);
    if (!form7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json(form7Entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form7 entry', error: error.message });
  }
});

// Update a form7 entry by ID
router.put('/update/:id', async (req, res) => {
  try {
    const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;
    const updatedForm7Entry = await Form7.findByIdAndUpdate(
      req.params.id,
      { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes },
      { new: true, runValidators: true }
    );
    if (!updatedForm7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json({ message: 'Form7 entry updated successfully', data: updatedForm7Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Form7 entry', error: error.message });
  }
});

// Delete a form7 entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedForm7Entry = await Form7.findByIdAndDelete(req.params.id);
    if (!deletedForm7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json({ message: 'Form7 entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Form7 entry', error: error.message });
  }
});

export default router;