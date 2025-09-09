//data fetch 2 route...............

import express from 'express';
import axios from 'axios';
import https from 'https';
import Data1 from '../models/dataModel2.js'; // Mongoose model

const router = express.Router();

// SOAP service base URL
//const wsdlUrl = 'https://fmt.slt.com.lk/FMT/WClogin.asmx'; // Without ?wsdl
const wsdlUrl = 'http://172.25.37.193/FMT/WClogin.asmx';
// Set SOAP headers
const soapHeaders = {
  'Content-Type': 'text/xml',
  'SOAPAction': 'http://tempuri.org/TowerMaintenanceOthers'
};

// HTTPS agent for handling self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// List of months and platforms
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const platforms = ['MSAN', 'SLBN', 'VPN'];

// Route to send SOAP requests for all months and platforms
router.post('/soap-request', async (req, res) => {
  try {
    const results = [];

    // Loop through all months and platforms
    for (const month of months) {
      for (const platform of platforms) {
        // Check if data already exists in the database for this month and platform
        const existingData = await Data1.findOne({ month, platform });

        // Prepare the SOAP request dynamically
        const soapRequest = `
          <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
              <TowerMaintenanceOthers xmlns="http://tempuri.org/"> 
                <month>${month}</month>
                <platform>${platform}</platform>
              </TowerMaintenanceOthers>
            </soap:Body>
          </soap:Envelope>
        `;

        try {
          // Send the SOAP request
          const response = await axios.post(wsdlUrl, soapRequest, {
            headers: soapHeaders,
            httpsAgent: httpsAgent,
          });

          // Check if existing data needs to be updated
          if (existingData) {
            const newResponse = response.data;

            if (existingData.response !== newResponse) {
              // Update only the fields that changed
              existingData.response = newResponse;
              await existingData.save();
              results.push({ month, platform, message: 'Data updated successfully' });
            } else {
              results.push({ month, platform, message: 'No changes detected, skipping update' });
            }
          } else {
            // If no existing data, create a new entry
            const dataToStore = new Data1({
              month,
              platform,
              response: response.data, // Store the raw XML response
            });

            await dataToStore.save();
            results.push({ month, platform, message: 'Data stored successfully' });
          }
        } catch (innerError) {
          console.error(`Error fetching data for ${month}, ${platform}:`, innerError.message);

          if (!existingData) {
            // Store the error message in the database if no existing data
            const dataToStore = new Data1({
              month,
              platform,
              response: innerError.message,
            });

            await dataToStore.save();
          }

          results.push({ month, platform, error: innerError.message });
        }
      }
    }

    // Respond with the results
    res.status(200).json({ message: 'Requests completed', results });
  } catch (error) {
    console.error('Error during SOAP requests:', error);
    res.status(500).json({ message: 'Error processing SOAP requests', error });
  }
});


// Route to retrieve all stored data
// router.get('/data', async (req, res) => {
//   try {
//     const data = await Data1.find();
//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).json({ message: 'Error fetching data', error });
//   }
// });

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
