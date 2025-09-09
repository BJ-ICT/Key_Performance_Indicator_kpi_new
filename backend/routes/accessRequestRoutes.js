import express from 'express';
import multer from 'multer';
import { getAllAccessRequests, addAccessRequest } from '../models/accessRequestModel.js';

const router = express.Router();

// Route to fetch all access requests
router.get('/getDetails', async (req, res) => {
  try {
    const requests = await getAllAccessRequests();
    res.status(200).json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Route to add a new access request
router.post('/submitData', multer().none(), async (req, res) => {
  try {
    const result = await addAccessRequest(req.body);
    res.status(200).json('Added Successfully..');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

export default router;