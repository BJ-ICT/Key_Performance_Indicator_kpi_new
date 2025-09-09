import express from 'express';
import Form6 from '../models/form6.js'; // Import the model


const router = express.Router();

// Create a new form6 entry
router.post('/add', async (req, res) => {
  const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;

  try {
    // Create new Form6 entry with sub-row values
    const newForm6Entry = new Form6({
      no,
      network_engineer_kpi,
      division,
      section,
      kpi_percent,
      unavailable_minutes: unavailable_minutes || {}, // Use provided or default to empty
      total_minutes: total_minutes || {}, // Use provided or default to empty
      total_nodes: total_nodes || {} // Use provided or default to empty
    });

    await newForm6Entry.save();
    res.status(201).json({ message: 'Form6 entry created successfully!', data: newForm6Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Form6 entry', error });
  }
});

// Get all form6 entries
router.get('/', async (req, res) => {
  try {
    const form6Entries = await Form6.find();
    res.status(200).json(form6Entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form6 entries', error });
  }
});

// Get a specific form6 entry by ID
router.get('/:id', async (req, res) => {
  try {
    const form6Entry = await Form6.findById(req.params.id);
    if (!form6Entry) return res.status(404).json({ message: 'Form6 entry not found' });
    res.status(200).json(form6Entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form6 entry', error });
  }
});

// Update a form6 entry by ID
router.put('/update/:id', async (req, res) => {
  try {
    const { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes } = req.body;
    const updatedForm6Entry = await Form6.findByIdAndUpdate(
      req.params.id,
      { no, network_engineer_kpi, division, section, kpi_percent, unavailable_minutes, total_minutes, total_nodes },
      { new: true, runValidators: true } // Ensure that validators are run
    );
    if (!updatedForm6Entry) return res.status(404).json({ message: 'Form6 entry not found' });
    res.status(200).json({ message: 'Form6 entry updated successfully', data: updatedForm6Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Form6 entry', error });
  }
});

// Delete a form6 entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedForm6Entry = await Form6.findByIdAndDelete(req.params.id);
    if (!deletedForm6Entry) return res.status(404).json({ message: 'Form6 entry not found' });
    res.status(200).json({ message: 'Form6 entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Form6 entry', error });
  }
});

export default router;
