import express from 'express';
import Form7 from '../models/form7.js'; // Import the model

const router = express.Router();

// Create a new form7 entry
router.post('/add', async (req, res) => {
  const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;

  try {
    // Create new Form7 entry with sub-row values
    const newForm7Entry = new Form7({
      no,
      network_engineer_kpi,
      division,
      section,
      kpi_percent,
      unavailable_minutes: unavailable_minutes || {}, // Use provided or default to empty
      total_minutes: total_minutes || {}, // Use provided or default to empty
      total_nodes: total_nodes || {} // Use provided or default to empty
    });

    await newForm7Entry.save();
    res.status(201).json({ message: 'Form7 entry created successfully!', data: newForm7Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Form7 entry', error });
  }
});

// Get all form7 entries
router.get('/', async (req, res) => {
  try {
    const form7Entries = await Form7.find();
    res.status(200).json(form7Entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form7 entries', error });
  }
});

// Get a specific form7 entry by ID
router.get('/:id', async (req, res) => {
  try {
    const form7Entry = await Form7.findById(req.params.id);
    if (!form7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json(form7Entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form7 entry', error });
  }
});

// Update a form7 entry by ID
router.put('/update/:id', async (req, res) => {
  try {
    const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;
    const updatedForm7Entry = await Form7.findByIdAndUpdate(
      req.params.id,
      { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes },
      { new: true, runValidators: true } // Ensure that validators are run
    );
    if (!updatedForm7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json({ message: 'Form7 entry updated successfully', data: updatedForm7Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Form7 entry', error });
  }
});

// Delete a form7 entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedForm7Entry = await Form7.findByIdAndDelete(req.params.id);
    if (!deletedForm7Entry) return res.status(404).json({ message: 'Form7 entry not found' });
    res.status(200).json({ message: 'Form7 entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Form7 entry', error });
  }
});

export default router;
