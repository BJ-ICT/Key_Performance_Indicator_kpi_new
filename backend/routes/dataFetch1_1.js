import express from 'express';
import axios from 'axios';
import https from 'https';
import Data from '../models/dataModel.js';  // Import the Mongoose model

const router = express.Router();


// Replace with your SOAP service base URL
const wsdlUrl = 'https://fmt.slt.com.lk/FMT/WClogin.asmx?wsdl'; // Base URL (without ?wsdl)

// Prepare SOAP Request (Envelope)
const soapRequest = `
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <TowerMaintenance xmlns="http://tempuri.org/"> 
        <month>January</month>  <!-- Replace with actual parameter values -->
      </TowerMaintenance>
    </soap:Body>
  </soap:Envelope>
`;

// Set SOAP headers
const soapHeaders = {
  'Content-Type': 'text/xml',           // Ensure the content type is correct for SOAP
  'SOAPAction': 'http://tempuri.org/TowerMaintenance' // Replace with correct SOAPAction from WSDL
};

// Create an HTTPS agent to handle HTTPS requests
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Allow self-signed certificates if needed; be cautious with production!
});

// Route to trigger SOAP request and store the response
router.post('/soap-request-all-months', async (req, res) => {
  try {
    // Define all 12 months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const savedData = [];  // Array to hold the saved/updated data for each month

    // Loop over each month and send a SOAP request
    for (const month of months) {
      // Prepare the SOAP request (Envelope) with the current month
      const soapRequest = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <TowerMaintenance xmlns="http://tempuri.org/"> 
              <month>${month}</month>  <!-- Use dynamic month -->
            </TowerMaintenance>
          </soap:Body>
        </soap:Envelope>
      `;

      // Perform the axios POST request over HTTPS for each month
      const response = await axios.post(wsdlUrl, soapRequest, {
        headers: soapHeaders,
        httpsAgent: httpsAgent
      });

      // Log the response from the SOAP service
      const soapResponse = response.data;

      // Find existing record by month and update it or insert new data
      const updatedData = await Data.findOneAndUpdate(
        { month },  // Query to find the existing record by month
        { response: soapResponse },  // Fields to update
        { new: true, upsert: true }  // Create the document if it doesn't exist (upsert)
      );

      // Push updated/saved data to the array
      savedData.push(updatedData);
    }

    // Return the response indicating successful storage of all months' data
    res.status(201).json({ message: 'Data updated successfully for all months', data: savedData });
  } catch (error) {
    console.error('Error making SOAP request:', error);
    res.status(500).json({ message: 'Error making SOAP requests', error });
  }
});

// Route to retrieve all stored data
router.get('/data', async (req, res) => {
  try {
    const data = await Data.find();  // Retrieve all stored data from MongoDB
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

export default router;
