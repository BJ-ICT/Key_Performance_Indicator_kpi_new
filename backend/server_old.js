import https from 'https';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { parseStringPromise } from 'xml2js';
import connectDB from './config/dbfinal.js';
import { fileURLToPath } from 'url';

// Import services and routes
import repeatedHardcodeTab1Routes from './routes/3repeatedHardcodeTab1Routes.js'; // Import 3repeatedhardcodetab1 routes
import MTNCRoutineTable1Routes from './routes/MTNCRoutineTable1Routes.js'; // Import MTNC Routine Table 1 routes
import multiTableDataRoutes from './routes/MultiTableDataRoutes.js';
import TMTable1Routes from './routes/TMTable1Routes.js'; // Import TM Table 1 routes
import finalDataRoutes from './routes/finalDataRoutes.js';
import kpiTowerRoutes from './routes/kpiTowerRoutes.js';
import { fetchAndStoreAllData } from './services/DataService.js';

// Import existing routes and models
import TableDataModel from './models/TableDataModel.js';
import dataFetchRouter1 from './routes/dataFetch1.js';
import dataFetchRouter2 from './routes/dataFetch2.js';
import form1Router from './routes/form1.js';
import form10Router from './routes/form10.js';
import form2Router from './routes/form2.js';
import form3Router from './routes/form3.js';
import form4Router from './routes/form4.js';
import form5Router from './routes/form5.js';
import form6Router from './routes/form6.js';
import form7Router from './routes/form7.js';
import form8Router from './routes/form8.js';
import form9Router from './routes/form9.js';
import saveTMActivityPlanRoutes from './routes/mainTable.js';
import processedDataFetch1Router from './routes/processedDataFetch1.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/emailRoutes.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';

// Load environment variables
dotenv.config();

// Get the current directory equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL certificate paths
const sslKeyPath = path.resolve(__dirname, '../ssl/socapplications.key');
const sslCertPath = path.resolve(__dirname, '../ssl/socapplications.crt');

// Read SSL certificate files
const sslOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
};

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

//app.use(cors({
  //origin: 'https://socapplications.intranet.slt.com.lk:3000', // Adjust as needed
  //credentials: true
//}));
//const cors = require('cors');

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log('MongoDB connection established.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
})();

// Function to check and populate data if collection is empty
const checkAndPopulateData = async () => {
  try {
    const count = await TableDataModel.countDocuments();
    if (count === 0) {
      console.log('No data found in "tabledatas" collection. Fetching data...');
      await fetchDataAndSave();
    } else {
      console.log('Data already exists in the "tabledatas" collection. Skipping fetch.');
    }
  } catch (error) {
    console.error('Error checking and populating data:', error);
  }
};

// Function to fetch and save additional data
const fetchDataAndSave = async () => {
  try {
    //const response = await axios.get('https://socapplications.intranet.slt.com.lk:8070/data-fetch1/data');
    const response = await axios.get('http://localhost:3000/:8070/data-fetch1/data');
    const oldData = response.data;

    const transformedData = await Promise.all(
      oldData.map(async (entry) => {
        try {
          const xml = entry.response;

          const parsedXml = await parseStringPromise(xml);
          const soapBody = parsedXml?.['soap:Envelope']?.['soap:Body']?.[0];
          if (soapBody) {
            const towerResponse = soapBody?.TowerMaintenanceResponse?.[0];
            if (towerResponse && towerResponse.TowerMaintenanceResult) {
              const resultString = towerResponse.TowerMaintenanceResult[0];
              const cleanedResult = resultString
                .replace(/"Column3":(\d+)"Column4":/g, '"Column3":$1,"Column4":')
                .replace(/,(?=\})/g, '');

              const parsedResult = JSON.parse(cleanedResult);
              return {
                month: entry.month,
                details: parsedResult,
              };
            }
          }
          return null;
        } catch (parseError) {
          console.error('Error parsing XML:', parseError);
          return null;
        }
      })
    );

    const validTransformedData = transformedData.filter((data) => data !== null);
    const newEntries = [];
    for (const dataEntry of validTransformedData) {
      const exists = await TableDataModel.findOne({
        month: dataEntry.month,
        'details.Column1': { $in: dataEntry.details.map((d) => d.Column1) },
      });
      if (!exists) {
        newEntries.push(dataEntry);
      }
    }

    if (newEntries.length > 0) {
      await TableDataModel.insertMany(newEntries);
      console.log('New data saved successfully.');
    } else {
      console.log('No new data to save.');
    }
  } catch (error) {
    console.error('Error fetching and saving data:', error);
  }
};

// Initialize data fetch and storage
(async () => {
  try {
    console.log('Starting data fetch and storage...');
    await fetchAndStoreAllData();
    await checkAndPopulateData();
    console.log('Data fetch and storage completed.');
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
})();

// Serve static files from the "public" directory
const publicDir = path.join(__dirname, 'routes/public');
app.use('/public', express.static(publicDir));

// Define routes
app.use('/form1', form1Router);
app.use('/form2', form2Router);
app.use('/form3', form3Router);
app.use('/form4', form4Router);
app.use('/form5', form5Router);
app.use('/form6', form6Router);
app.use('/form7', form7Router);
app.use('/form8', form8Router);
app.use('/form9', form9Router);
app.use('/form10', form10Router);
app.use('/data-fetch2', dataFetchRouter2);
app.use('/data-fetch1', dataFetchRouter1);
app.use('/api', saveTMActivityPlanRoutes);
app.use('/api', processedDataFetch1Router);
app.use('/api/multi-table', multiTableDataRoutes);
app.use('/api/final-data', finalDataRoutes); // Final Data Routes
app.use('/api/kpi-tower', kpiTowerRoutes); // KPI Tower Table Routes
app.use('/api/tm-table1', TMTable1Routes); // TM Table 1 Routes
app.use('/api/mtnc-routine', MTNCRoutineTable1Routes); // MTNC Routine Table 1 Routes
app.use('/api/repeated-hardcode-tab1', repeatedHardcodeTab1Routes); // 3RepeatedHardcodeTab1 Routes
app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/access-requests', accessRequestRoutes); // Access Request Routes

// Start the HTTPS server
const PORT = process.env.PORT || 8070;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server is running on port ${PORT}`);
});
