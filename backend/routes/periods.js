import express from 'express';
import TableDataModel from '../models/TableDataModel.js';

const router = express.Router();

router.get('/periods/years', async (req, res) => {
  try {
    const years = await TableDataModel.distinct('year');
    years.sort((a, b) => a - b);
    res.json(years);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch years' });
  }
});

router.get('/periods/months', async (req, res) => {
  try {
    const year = Number(req.query.year);
    if (!year) return res.status(400).json({ message: 'year is required' });
    const months = await TableDataModel.find({ year }).distinct('month');
    res.json(months);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch months' });
  }
});

export default router;






