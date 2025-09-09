// import axios from 'axios';
import express from 'express';
// import { parseStringPromise } from 'xml2js'; // Import xml2js to parse XML
import TableDataModel from '../models/TableDataModel.js'; // Import your new database model

const router = express.Router();

// Endpoint to fetch and process data from old API
router.post('/ProcessedDataFetch1', async (req, res) => {
  try {
    // Step 1: Fetch data from the old API
    //const response = await axios.get('https://socapplications.intranet.slt.com.lk/data-fetch1/data');
    const response = await axios.get("http://localhost:3000/data-fetch1/data");
    const oldData = response.data;

    // Step 2: Transform data (parsing XML to JSON)
    const transformedData = await Promise.all(oldData.map(async (entry) => {
      try {
        const xml = entry.response;

        // Use xml2js to parse the XML
        const parsedXml = await parseStringPromise(xml);

        // Navigate the SOAP structure to get the actual data
        const soapBody = parsedXml?.['soap:Envelope']?.['soap:Body']?.[0];
        if (soapBody && soapBody.TowerMaintenanceResponse?.[0].TowerMaintenanceResult?.[0]) {
          const result = soapBody.TowerMaintenanceResponse[0].TowerMaintenanceResult[0];

          // Parse the JSON string inside TowerMaintenanceResult
          const cleanedResult = result
            .replace(/"Column3":(\d+)"Column4":/g, '"Column3":$1,"Column4":') // Add missing commas
            .replace(/,(?=\})/g, ''); // Remove trailing commas before closing braces

          const parsedResult = JSON.parse(cleanedResult);
          return {
            month: entry.month,
            details: parsedResult,
          };
        } else {
          console.error('Error: Unable to locate TowerMaintenanceResult in parsed XML:', parsedXml);
          return null;
        }
      } catch (parseError) {
        console.error('Error parsing XML:', parseError);
        return null;
      }
    }));

    // Filter out any null values in transformed data
    const validTransformedData = transformedData.filter(data => data !== null);

    // Step 3: Prepare bulk operations for upsert
    const bulkOps = validTransformedData.map(dataEntry => {
      return {
        updateOne: {
          filter: { month: dataEntry.month },
          update: { $set: { details: dataEntry.details } },
          upsert: true, // Insert if not exists
        }
      };
    });

    // Step 4: Execute bulk operations
    if (bulkOps.length > 0) {
      const bulkWriteResult = await TableDataModel.bulkWrite(bulkOps);
      res.status(200).json({
        message: 'Data processed successfully.',
        insertedCount: bulkWriteResult.upsertedCount,
        modifiedCount: bulkWriteResult.modifiedCount,
      });
    } else {
      res.status(200).json({ message: 'No valid data to process.' });
    }
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Failed to process data.' });
  }
});

// Endpoint to get processed data
router.get('/ProcessedDataFetch1', async (req, res) => {
  try {
    const data = await TableDataModel.find();
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: 'No data found.' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
});

export default router;
