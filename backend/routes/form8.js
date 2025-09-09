import express from 'express';
import Form8 from '../models/form8.js'; // Import the model

const router = express.Router();

// Create a new form8 entry
router.post('/add', async (req, res) => {
  const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;

  try {
    // Create new Form8 entry with sub-row values
    const newForm8Entry = new Form8({
      no,
      network_engineer_kpi,
      division,
      section,
      kpi_percent,
      unavailable_minutes: unavailable_minutes || {}, // Use provided or default to empty
      total_minutes: total_minutes || {}, // Use provided or default to empty
      total_nodes: total_nodes || {} // Use provided or default to empty
    });

    await newForm8Entry.save();
    res.status(201).json({ message: 'Form8 entry created successfully!', data: newForm8Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Form8 entry', error });
  }
});

// Get all form8 entries
router.get('/', async (req, res) => {
  try {
    const form8Entries = await Form8.find();
    res.status(200).json(form8Entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form8 entries', error });
  }
});

// Get a specific form8 entry by ID
router.get('/:id', async (req, res) => {
  try {
    const form8Entry = await Form8.findById(req.params.id);
    if (!form8Entry) return res.status(404).json({ message: 'Form8 entry not found' });
    res.status(200).json(form8Entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form8 entry', error });
  }
});

// Update a form8 entry by ID
router.put('/update/:id', async (req, res) => {
  try {
    const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;
    const updatedForm8Entry = await Form8.findByIdAndUpdate(
      req.params.id,
      { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes },
      { new: true, runValidators: true } // Ensure that validators are run
    );
    if (!updatedForm8Entry) return res.status(404).json({ message: 'Form8 entry not found' });
    res.status(200).json({ message: 'Form8 entry updated successfully', data: updatedForm8Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Form8 entry', error });
  }
});

// Delete a form8 entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedForm8Entry = await Form8.findByIdAndDelete(req.params.id);
    if (!deletedForm8Entry) return res.status(404).json({ message: 'Form8 entry not found' });
    res.status(200).json({ message: 'Form8 entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Form8 entry', error });
  }
});

export default router;
