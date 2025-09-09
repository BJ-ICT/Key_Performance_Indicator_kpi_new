// import express from 'express';
// import kpiTowerTable1 from '../models/kpitowertable1.js';

// const router = express.Router();

// // Add data to the new table
// router.post('/add', async (req, res) => {
//   try {
//     const newData = await kpiTowerTable1.create(req.body);
//     res.status(201).json({ message: 'Data added successfully!', data: newData });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to add data', error });
//   }
// });

// // Retrieve data from the new table
// router.get('/', async (req, res) => {
//   try {
//     const data = await kpiTowerTable1.find();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to retrieve data', error });
//   }
// });

// export default router;


import express from 'express';
import kpiTowerTable1 from '../models/kpitowertable1.js';

const router = express.Router();

// Add data to the new table
router.post('/add', async (req, res) => {
  try {
    const newData = await kpiTowerTable1.create(req.body);
    res.status(201).json({ message: 'Data added successfully!', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add data', error });
  }
});

// Retrieve data from the new table
router.get('/', async (req, res) => {
  try {
    const data = await kpiTowerTable1.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
});

// Update data in the table
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await kpiTowerTable1.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.status(200).json({ message: 'Data updated successfully!', data: updatedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update data', error });
  }
});

// Delete data from the table
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedData = await kpiTowerTable1.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.status(200).json({ message: 'Data deleted successfully!', data: deletedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete data', error });
  }
});

export default router;
