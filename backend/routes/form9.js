import express from 'express';
import Form9 from '../models/form9.js'; // Import the model
console.log("✅ Form9 router loaded");


const router = express.Router();

// Create a new form9 entry
router.post('/add', async (req, res) => {
  // year month creating frontend eke dila na
  
  try {
    // Create new Form9 entry with sub-row values
    const newForm9Entry = new Form9({
      no,
      network_engineer_kpi,
      division,
      section,
      kpi_percent,
      Total_Failed_Links: Total_Failed_Links || {}, // Use provided or default to empty
      Links_SLA_Not_Violated: Links_SLA_Not_Violated || {}, // Use provided or default to empty
      year,
      month
    });

    await newForm9Entry.save();
    res.status(201).json({ message: 'Form9 entry created successfully!', data: newForm9Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Form9 entry', error });
  }

    
});

// Get all form9 entries
router.get('/', async (req, res) => {
  try {
     const { year, month } = req.query;
    const query = {};
    
    if (year) query.year = year;
    if (month) query.month = month;
    const form9Entries = await Form9.find(query);

    res.status(200).json(form9Entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form9 entries', error });
  }
});

// Get the latest Form9 entry (based on date)
// Get the *two* latest Form9 entries (most recent updatedAt first)
router.get('/latest', async (req, res) => {
  try {
    // Accept optional year/month filters (you already use them in the FE)
    const { year, month } = req.query;
    const query = {};

    if (year) query.year = year;
    if (month) query.month = Number(month);   // month is stored as Number in the model

    // 1. Find all docs that match the optional filters
    // 2. Sort by updatedAt descending
    // 3. Limit to 2
    const latestEntries = await Form9.find(query)
      .sort({ updatedAt: -1 })
      .limit(2)
      .lean();                     // lean() → plain JS objects (faster)

    if (!latestEntries.length) {
      return res.status(404).json({ message: 'No entries found' });
    }

    // If you still want the “latestYear / latestMonth” helpers,
    // take them from the **first** (most recent) entry
    const mostRecent = latestEntries[0];
    const latestYear = mostRecent.updatedAt.getFullYear();
    const latestMonth = mostRecent.updatedAt.getMonth() + 1;

    res.status(200).json({
      message: 'Latest two Form9 entries retrieved successfully',
      latestYear,
      latestMonth,
      latestEntries,               // <-- array with 1 or 2 docs
    });
  } catch (error) {
    console.error('latest /form9 error →', error);
    res.status(500).json({ message: 'Failed to fetch latest entries', error });
  }
});

// Get a specific form9 entry by ID
router.get('/:id', async (req, res) => {
  try {
    const form9Entry = await Form9.findById(req.params.id);
    if (!form9Entry) return res.status(404).json({ message: 'Form9 entry not found' });
    res.status(200).json(form9Entry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Form9 entry', error });
  }
});




// Update a form9 entry by ID
router.put('/update/:id', async (req, res) => {
  try {
    const { no, network_engineer_kpi, division, section, kpi_percent, Total_Failed_Links, Links_SLA_Not_Violated} = req.body;
    const updatedForm9Entry = await Form9.findByIdAndUpdate(
      req.params.id,
      { no, network_engineer_kpi, division, section, kpi_percent, Total_Failed_Links, Links_SLA_Not_Violated  },
      { new: true, runValidators: true } // Ensure that validators are run
    );
    if (!updatedForm9Entry) return res.status(404).json({ message: 'Form9 entry not found' });
    res.status(200).json({ message: 'Form9 entry updated successfully', data: updatedForm9Entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Form9 entry', error });
  }
});

// Delete a form9 entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedForm9Entry = await Form9.findByIdAndDelete(req.params.id);
    if (!deletedForm9Entry) return res.status(404).json({ message: 'Form9 entry not found' });
    res.status(200).json({ message: 'Form9 entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Form9 entry', error });
  }
});

export default router;
