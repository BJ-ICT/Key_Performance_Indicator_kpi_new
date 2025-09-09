import https from 'https'; // Import the HTTPS module
import axios from 'axios';
import { FetchMsan, FetchSlbn, FetchVpn } from '../models/MultiTableDataModel.js';

// Create an HTTPS agent to allow self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL certificate validation
});

// Helper function to validate the response format
const isValidResponse = (response) => {
  if (!response || !Array.isArray(response) || response.length === 0) {
    return false;
  }
  return true;
};

// Helper function to fetch data from an API and store it in the database
const fetchDataAndStore = async (model, url, platform) => {
  try {
    console.info(`[START] Fetching data for platform: ${platform}`);
    
    const response = await axios.get(url, { httpsAgent }); // Use the HTTPS agent
    const data = response.data;

    if (!data || !Array.isArray(data)) {
      console.error(`[ERROR] Invalid data format received for ${platform}`);
      return;
    }

    console.info(`[INFO] Fetched ${data.length} records for ${platform}`);
    
    for (const record of data) {
      console.info(`[PROCESSING] Platform: ${platform}, Month: ${record.month}`);

      // Validate if the record contains required fields
      if (!record.month || !record.response) {
        console.warn(`[SKIP] Missing required fields for ${platform}, Month: ${record.month || 'Unknown'}`);
        continue;
      }

      // Parse the response field
      let parsedDetails;
      try {
        parsedDetails = JSON.parse(record.response);
      } catch (parseError) {
        console.warn(`[SKIP] Failed to parse response for ${platform}, Month: ${record.month}: ${parseError.message}`);
        continue;
      }

      if (!isValidResponse(parsedDetails)) {
        console.warn(`[SKIP] Invalid or empty details for ${platform}, Month: ${record.month}`);
        continue;
      }

      // Check if the record already exists
      const existingRecord = await model.findOne({ month: record.month, platform });
      if (existingRecord) {
        console.info(`[SKIP] Record already exists for ${platform}, Month: ${record.month}`);
        continue;
      }

      // Save the new record
      const newRecord = new model({
        month: record.month,
        platform,
        response: JSON.stringify(parsedDetails),
      });

      await newRecord.save();
      console.info(`[SUCCESS] New data saved for ${platform}, Month: ${record.month}`);
    }

    console.info(`[COMPLETE] Data processing complete for platform: ${platform}`);
  } catch (error) {
    console.error(`[ERROR] Fetching or storing data for ${platform} failed: ${error.message}`);
  }
};

// Main function to fetch and store data for all platforms
export const fetchAndStoreAllData = async () => {
  console.info('[START] Fetching and storing data for all platforms');
  
  await Promise.all([
    fetchDataAndStore(FetchMsan, 'https://localhost/data-fetch2/data?platform=MSAN', 'MSAN'),
    fetchDataAndStore(FetchVpn, 'https://localhost/data-fetch2/data?platform=VPN', 'VPN'),
    fetchDataAndStore(FetchSlbn, 'https://localhost/data-fetch2/data?platform=SLBN', 'SLBN')
  ]);

  console.info('[COMPLETE] All data fetching and storing processes finished');
};
