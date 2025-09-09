// // routes/MultiTableDataRoutes.js

// import axios from 'axios';
// import express from 'express';
// import { parseStringPromise, processors } from 'xml2js'; // Import xml2js to parse XML and processors
// import { FetchMsan, FetchSlbn, FetchVpn } from '../models/MultiTableDataModel.js'; // Import models

// const router = express.Router();

// // Helper object to map month names to their numerical order
// const monthOrder = {
//   'January': 1,
//   'February': 2,
//   'March': 3,
//   'April': 4,
//   'May': 5,
//   'June': 6,
//   'July': 7,
//   'August': 8,
//   'September': 9,
//   'October': 10,
//   'November': 11,
//   'December': 12
// };

// // Utility function to safely access nested properties
// const getNestedProperty = (obj, path) => path.reduce((acc, key) => acc?.[key], obj);

// /**
//  * Helper function to process data for a specific platform
//  * @param {String} platform - The platform name (MSAN, VPN, SLBN)
//  * @param {String} apiUrl - The API URL to fetch data from
//  * @returns {Object} - Result of the bulk operation
//  */
// const processPlatformData = async (platform, apiUrl) => {
//   try {
//     // Step 1: Fetch data from the API
//     const response = await axios.get(`${apiUrl}?platform=${platform}`);
//     const rawData = response.data;

//     console.log(`Fetched data for platform ${platform}:`, rawData);

//     // Step 2: Transform data
//     const transformedData = await Promise.all(rawData.map(async (entry) => {
//       try {
//         const xml = entry.response;

//         // Parse XML to JSON with stripPrefix to remove namespace prefixes
//         const parsedXml = await parseStringPromise(xml, {
//           explicitArray: false, // Set to false to avoid arrays for single elements
//           tagNameProcessors: [processors.stripPrefix] // Removes namespace prefixes
//         });

//         // Log the entire parsed XML for debugging
//         console.log(`Parsed XML for platform ${platform}, month ${entry.month}:`, JSON.stringify(parsedXml, null, 2));

//         // Navigate to the TowerMaintenanceOthersResult
//         const towerMaintenanceResult = getNestedProperty(parsedXml, [
//           'Envelope',
//           'Body',
//           'TowerMaintenanceOthersResponse',
//           'TowerMaintenanceOthersResult'
//         ]);

//         if (towerMaintenanceResult) {
//           // Parse the JSON string inside TowerMaintenanceOthersResult
//           let parsedResult;
//           try {
//             parsedResult = JSON.parse(towerMaintenanceResult);
//           } catch (jsonParseError) {
//             console.error(`JSON parsing error for platform ${platform}, month ${entry.month}:`, jsonParseError);
//             return null;
//           }

//           console.log(`Parsed result for platform ${platform}, month ${entry.month}:`, parsedResult);

//           return {
//             month: entry.month,
//             platform: platform, // Include platform in the data entry
//             details: parsedResult, // Assuming 'details' is the field you want to store
//           };
//         } else {
//           console.error(`Error: Unable to locate TowerMaintenanceOthersResult in parsed XML for platform ${platform}, month ${entry.month}.`, parsedXml);
//           return null;
//         }
//       } catch (parseError) {
//         console.error(`Error parsing XML for platform ${platform}, month ${entry.month}:`, parseError);
//         return null;
//       }
//     }));

//     // Filter out any null values in transformed data
//     const validTransformedData = transformedData.filter(data => data !== null);

//     console.log(`Transformed data for platform ${platform}:`, validTransformedData);

//     // Step 3: Prepare bulk operations for upsert
//     let Model;
//     switch (platform) {
//       case 'MSAN':
//         Model = FetchMsan;
//         break;
//       case 'VPN':
//         Model = FetchVpn;
//         break;
//       case 'SLBN':
//         Model = FetchSlbn;
//         break;
//       default:
//         throw new Error(`Unsupported platform: ${platform}`);
//     }

//     const bulkOps = validTransformedData.map(dataEntry => ({
//       updateOne: {
//         filter: { month: dataEntry.month, platform: dataEntry.platform }, // Include both month and platform
//         update: { $set: { details: dataEntry.details } },
//         upsert: true, // Insert if not exists
//       }
//     }));

//     console.log(`Bulk operations for platform ${platform}:`, bulkOps);

//     // Step 4: Execute bulk operations
//     if (bulkOps.length > 0) {
//       const bulkWriteResult = await Model.bulkWrite(bulkOps);
//       console.log(`Bulk write result for platform ${platform}:`, bulkWriteResult);
//       if (bulkWriteResult.upsertedCount === 0 && bulkWriteResult.modifiedCount === 0) {
//         console.log(`No changes detected for platform ${platform}.`);
//         return {
//           platform,
//           message: "No changes detected, update skipped"
//         };
//       }
//       return {
//         platform,
//         insertedCount: bulkWriteResult.upsertedCount,
//         modifiedCount: bulkWriteResult.modifiedCount,
//       };
//     } else {
//       console.log(`No valid data to process for platform ${platform}.`);
//       return {
//         platform,
//         message: 'No valid data to process.',
//       };
//     }
//   } catch (error) {
//     console.error(`Error processing data for platform ${platform}:`, error);
//     return {
//       platform,
//       error: error.message,
//     };
//   }
// };

// /**
//  * POST Endpoint to fetch and process data for all platforms
//  */
// router.post('/ProcessedDataFetch2', async (req, res) => {
//   try {
//     // Define platforms and their respective API URLs
//     const platforms = [
//       { name: 'MSAN', url: 'https://socapplications.intranet.slt.com.lk/data-fetch2/data' },
//       { name: 'VPN', url: 'https://socapplications.intranet.slt.com.lk/data-fetch2/data' },
//       { name: 'SLBN', url: 'https://socapplications.intranet.slt.com.lk/data-fetch2/data' },
//     ];

//     // Process data for all platforms concurrently
//     const results = await Promise.all(platforms.map(p => processPlatformData(p.name, p.url)));

//     res.status(200).json({
//       message: 'Data processed successfully.',
//       results,
//     });
//   } catch (error) {
//     console.error('Error processing data for all platforms:', error);
//     res.status(500).json({ error: `Failed to process data. Reason: ${error.message}` });
//   }
// });

// // Route to fetch MSAN data
// router.get('/fetchMsan', async (req, res) => {
//   try {
//     const data = await FetchMsan.find();

//     // Sort data based on monthOrder
//     data.sort((a, b) => {
//       const monthA = monthOrder[a.month] || 13; // Assign 13 if month not found
//       const monthB = monthOrder[b.month] || 13;
//       return monthA - monthB;
//     });

//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching MSAN data:', error);
//     res.status(500).json({ error: 'Failed to fetch MSAN data' });
//   }
// });

// // Route to fetch VPN data
// router.get('/fetchVpn', async (req, res) => {
//   try {
//     const data = await FetchVpn.find();

//     // Sort data based on monthOrder
//     data.sort((a, b) => {
//       const monthA = monthOrder[a.month] || 13;
//       const monthB = monthOrder[b.month] || 13;
//       return monthA - monthB;
//     });

//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching VPN data:', error);
//     res.status(500).json({ error: 'Failed to fetch VPN data' });
//   }
// });

// // Route to fetch SLBN data
// router.get('/fetchSlbn', async (req, res) => {
//   try {
//     const data = await FetchSlbn.find();

//     // Sort data based on monthOrder
//     data.sort((a, b) => {
//       const monthA = monthOrder[a.month] || 13;
//       const monthB = monthOrder[b.month] || 13;
//       return monthA - monthB;
//     });

//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching SLBN data:', error);
//     res.status(500).json({ error: 'Failed to fetch SLBN data' });
//   }
// });

// export default router;


////////////////////////////////////////////////////////////////////////////////

import express from 'express';
import { FetchMsan, FetchSlbn, FetchVpn } from '../models/MultiTableDataModel.js'; // Import models

const router = express.Router();

// Helper object to map month names to their numerical order
const monthOrder = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12
};

// Route to fetch all platform data
router.get('/ProcessedDataFetch2', async (req, res) => {
  try {
    // Fetch data for all platforms from the database
    const msanData = await FetchMsan.find();
    const vpnData = await FetchVpn.find();
    const slbnData = await FetchSlbn.find();

    // Sort data by month for each platform
    const sortByMonth = (data) =>
      data.sort((a, b) => {
        const monthA = monthOrder[a.month] || 13; // Assign 13 if month not found
        const monthB = monthOrder[b.month] || 13;
        return monthA - monthB;
      });

    res.status(200).json({
      message: 'Data fetched successfully.',
      MSAN: sortByMonth(msanData),
      VPN: sortByMonth(vpnData),
      SLBN: sortByMonth(slbnData),
    });
  } catch (error) {
    console.error('Error fetching data for all platforms:', error);
    res.status(500).json({ error: `Failed to fetch data. Reason: ${error.message}` });
  }
});

// Route to fetch MSAN data
router.get('/fetchMsan', async (req, res) => {
  try {
    const data = await FetchMsan.find();

    // Sort data based on monthOrder
    data.sort((a, b) => {
      const monthA = monthOrder[a.month] || 13; // Assign 13 if month not found
      const monthB = monthOrder[b.month] || 13;
      return monthA - monthB;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching MSAN data:', error);
    res.status(500).json({ error: 'Failed to fetch MSAN data' });
  }
});

// Route to fetch VPN data
router.get('/fetchVpn', async (req, res) => {
  try {
    const data = await FetchVpn.find();

    // Sort data based on monthOrder
    data.sort((a, b) => {
      const monthA = monthOrder[a.month] || 13;
      const monthB = monthOrder[b.month] || 13;
      return monthA - monthB;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching VPN data:', error);
    res.status(500).json({ error: 'Failed to fetch VPN data' });
  }
});

// Route to fetch SLBN data
router.get('/fetchSlbn', async (req, res) => {
  try {
    const data = await FetchSlbn.find();

    // Sort data based on monthOrder
    data.sort((a, b) => {
      const monthA = monthOrder[a.month] || 13;
      const monthB = monthOrder[b.month] || 13;
      return monthA - monthB;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching SLBN data:', error);
    res.status(500).json({ error: 'Failed to fetch SLBN data' });
  }
});

export default router;