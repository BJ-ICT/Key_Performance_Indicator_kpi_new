import mongoose from 'mongoose';
import axios from 'axios';
import xml2js from 'xml2js';

// Define User schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin','puser'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pages: {
      type: [String], // Array of page identifiers (e.g., page names, IDs, or routes)
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create User model
const User = mongoose.model('User', UserSchema);

// Function to create superadmin
async function createSuperAdmin(adminData) {
  try {
    // Check if a superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      throw new Error('Superadmin already exists');
    }

    // Ensure the role is explicitly set to 'superadmin'
    const superAdmin = new User({
      ...adminData,
      role: 'superadmin',
    });

    // Save the superadmin user
    return await superAdmin.save();
  } catch (error) {
    throw new Error(`Failed to create superadmin: ${error.message}`);
  }
}

// Function to fetch login data using SOAP
// async function fetchLoginData(username, password) {
//   const soapData = `
//     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
//       <soapenv:Header/>
//       <soapenv:Body>
//         <tem:login>
//           <tem:username>${username}</tem:username>
//           <tem:password>${password}</tem:password>
//         </tem:login>
//       </soapenv:Body>
//     </soapenv:Envelope>`;

//   try {
//     // console.log('Sending SOAP Request:', soapData);

//     const response = await axios.post(
//       'https://fmt.slt.com.lk/FMT/WClogin.asmx',
//       soapData,
//       {
//         headers: {
//           'Content-Type': 'text/xml',
//           SOAPAction: 'http://tempuri.org/login',
//         },
//         timeout: 5000,
//       }
//     );

//     const parser = new xml2js.Parser({
//       explicitArray: false,
//       trim: true,
//       tagNameProcessors: [xml2js.processors.stripPrefix],
//     });

//     const parsedResponse = await parser.parseStringPromise(response.data);
//     const loginResult = parsedResponse.Envelope.Body.loginResponse.loginResult;

//     console.log('Parsed login result:', loginResult);
//     return loginResult;
//   } catch (error) {
//     console.error('SOAP service error:', error);
//     throw new Error(`Failed to fetch login data: ${error.message}`);
//   }
// }

export { User, createSuperAdmin, /*fetchLoginData*/ };
