//user and admin registration and , page assign 

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, createSuperAdmin, /*fetchLoginData*/ } from '../models/User.js';
const router = express.Router();


// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

//create super admin.............
router.post('/create-super-admin', async (req, res) => {
  const { username, name } = req.body;

  try {
    if (!username || !name) {
      return res.status(400).json({ 
        message: 'Both username and name are required'
      });
    }

    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return res.status(409).json({ 
        message: 'A super admin already exists. Only one super admin is allowed.' 
      });
    }

    // Create super admin without storing the password
    const adminData = {
      username,
      name,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      // No password is stored
    };

    const superAdmin = new User(adminData);
    await superAdmin.save();

    res.status(201).json({ 
      message: 'Super admin created successfully',
      username: superAdmin.username
    });

  } catch (error) {
    console.error('Error creating super admin:', error.message);
    res.status(500).json({ 
      message: 'Error creating super admin', 
      error: error.message 
    });
  }
});





/////////////////////////////////// Modified user registration route with page access//////////////////
// router.post('/register', async (req, res) => {
//   const { username, name, pages } = req.body;

//   try {
//     if (!username || !name) {
//       return res.status(400).json({ 
//         message: 'Both username and name are required'
//       });
//     }

//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(409).json({ 
//         message: 'Username already exists' 
//       });
//     }

//     // Create user with username, name, and assigned pages
//     const userData = {
//       username,
//       name,
//       role: 'user',
//       isActive: true,
//       pages: pages || [], // Add pages array
//       createdAt: new Date(),
//       lastLogin: null
//     };

//     const newUser = new User(userData);
//     await newUser.save();

//     res.status(201).json({ 
//       message: 'User registered successfully',
//       user: {
//         username: newUser.username,
//         name: newUser.name,
//         role: newUser.role,
//         pages: newUser.pages,
//         createdAt: newUser.createdAt
//       }
//     });

//   } catch (error) {
//     console.error('Error registering user:', error.message);
//     res.status(500).json({ 
//       message: 'Error registering user', 
//       error: error.message 
//     });
//   }
// });

// // Get all users
// router.get('/users', async (req, res) => {
//   try {
//     const users = await User.find({ role: 'user' });
//     res.status(200).json({ 
//       message: 'Users retrieved successfully', 
//       users: users.map(user => ({
//         id: user._id,
//         username: user.username,
//         name: user.name,
//         role: user.role,
//         isActive: user.isActive,
//         pages: user.pages,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin
//       }))
//     });
//   } catch (error) {
//     console.error('Error retrieving users:', error.message);
//     res.status(500).json({ 
//       message: 'Error retrieving users', 
//       error: error.message 
//     });
//   }
// });

// // Get single user by ID
// router.get('/users/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({ 
//         message: 'User not found' 
//       });
//     }

//     res.status(200).json({
//       message: 'User retrieved successfully',
//       user: {
//         id: user._id,
//         username: user.username,
//         name: user.name,
//         role: user.role,
//         isActive: user.isActive,
//         pages: user.pages,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin
//       }
//     });
//   } catch (error) {
//     console.error('Error retrieving user:', error.message);
//     res.status(500).json({ 
//       message: 'Error retrieving user', 
//       error: error.message 
//     });
//   }
// });

// // Update user details
// router.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { username, name, isActive, pages } = req.body;

//   try {
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({ 
//         message: 'User not found' 
//       });
//     }

//     // Check if new username already exists (if username is being updated)
//     if (username && username !== user.username) {
//       const existingUser = await User.findOne({ username });
//       if (existingUser) {
//         return res.status(409).json({ 
//           message: 'Username already exists' 
//         });
//       }
//       user.username = username;
//     }

//     // Update other fields if provided
//     if (name) user.name = name;
//     if (typeof isActive === 'boolean') user.isActive = isActive;
//     if (Array.isArray(pages)) user.pages = pages;

//     await user.save();

//     res.status(200).json({
//       message: 'User updated successfully',
//       user: {
//         id: user._id,
//         username: user.username,
//         name: user.name,
//         role: user.role,
//         isActive: user.isActive,
//         pages: user.pages,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin
//       }
//     });
//   } catch (error) {
//     console.error('Error updating user:', error.message);
//     res.status(500).json({ 
//       message: 'Error updating user', 
//       error: error.message 
//     });
//   }
// });

// // Delete user
// router.delete('/users/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedUser = await User.findByIdAndDelete(id);

//     if (!deletedUser) {
//       return res.status(404).json({ 
//         message: 'User not found' 
//       });
//     }

//     res.status(200).json({
//       message: 'User deleted successfully',
//       user: {
//         id: deletedUser._id,
//         username: deletedUser.username,
//         name: deletedUser.name,
//         role: deletedUser.role
//       }
//     });
//   } catch (error) {
//     console.error('Error deleting user:', error.message);
//     res.status(500).json({ 
//       message: 'Error deleting user', 
//       error: error.message 
//     });
//   }
// });



// // Update user's page access
// router.patch('/users/:id/pages', async (req, res) => {
//   const { id } = req.params;
//   const { pages } = req.body;

//   try {
//     if (!Array.isArray(pages)) {
//       return res.status(400).json({ 
//         message: 'Pages must be provided as an array' 
//       });
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).json({ 
//         message: 'User not found' 
//       });
//     }

//     user.pages = pages;
//     await user.save();

//     res.status(200).json({
//       message: 'User page access updated successfully',
//       user: {
//         username: user.username,
//         name: user.name,
//         role: user.role,
//         pages: user.pages
//       }
//     });

//   } catch (error) {
//     console.error('Error updating user page access:', error.message);
//     res.status(500).json({ 
//       message: 'Error updating user page access', 
//       error: error.message 
//     });
//   }
// });

// // Get user's page access
// router.get('/users/:id/pages', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).json({ 
//         message: 'User not found' 
//       });
//     }

//     res.status(200).json({
//       message: 'User page access retrieved successfully',
//       pages: user.pages
//     });

//   } catch (error) {
//     console.error('Error retrieving user page access:', error.message);
//     res.status(500).json({ 
//       message: 'Error retrieving user page access', 
//       error: error.message 
//     });
//   }
// });

// Register a new user or puser
router.post('/register', async (req, res) => {
  const { username, name, pages, role } = req.body;

  try {
    if (!username || !name || !role) {
      return res.status(400).json({ 
        message: 'Username, name, and role are required' 
      });
    }

    // Ensure role is either 'user' or 'puser'
    if (!['user', 'puser'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Role must be either "user" or "puser"' 
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Username already exists' 
      });
    }

    // Create user with role and assigned pages
    const userData = {
      username,
      name,
      role,
      isActive: true,
      pages: pages || [], // Default to empty array if no pages are provided
      createdAt: new Date(),
      lastLogin: null
    };

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        pages: newUser.pages,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
});

// Get all users and pusers
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'puser'] } });
    res.status(200).json({ 
      message: 'Users retrieved successfully', 
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        pages: user.pages,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    res.status(500).json({ 
      message: 'Error retrieving users', 
      error: error.message 
    });
  }
});

// Get single user or puser by ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    
    if (!user || !['user', 'puser'].includes(user.role)) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        pages: user.pages,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    res.status(500).json({ 
      message: 'Error retrieving user', 
      error: error.message 
    });
  }
});

////////////////// Update user or puser details
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, name, isActive, pages, role } = req.body;

  try {
    const user = await User.findById(id);
    
    if (!user || !['user', 'puser'].includes(user.role)) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if new username already exists (if username is being updated)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ 
          message: 'Username already exists' 
        });
      }
      user.username = username;
    }

    // Update role if provided and valid
    if (role && ['user', 'puser'].includes(role)) {
      user.role = role;
    } else if (role) {
      return res.status(400).json({ 
        message: 'Invalid role. Role must be either "user" or "puser"' 
      });
    }

    // Update other fields if provided
    if (name) user.name = name;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (Array.isArray(pages)) user.pages = pages;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        pages: user.pages,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
});

// Delete user or puser
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser || !['user', 'puser'].includes(deletedUser.role)) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser._id,
        username: deletedUser.username,
        name: deletedUser.name,
        role: deletedUser.role
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
});

// Update user's or puser's page access
router.patch('/users/:id/pages', async (req, res) => {
  const { id } = req.params;
  const { pages } = req.body;

  try {
    if (!Array.isArray(pages)) {
      return res.status(400).json({ 
        message: 'Pages must be provided as an array' 
      });
    }

    const user = await User.findById(id);
    if (!user || !['user', 'puser'].includes(user.role)) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    user.pages = pages;
    await user.save();

    res.status(200).json({
      message: 'User page access updated successfully',
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        pages: user.pages
      }
    });

  } catch (error) {
    console.error('Error updating user page access:', error.message);
    res.status(500).json({ 
      message: 'Error updating user page access', 
      error: error.message 
    });
  }
});

// Get user's or puser's page access
router.get('/users/:id/pages', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user || !['user', 'puser'].includes(user.role)) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      message: 'User page access retrieved successfully',
      pages: user.pages
    });

  } catch (error) {
    console.error('Error retrieving user page access:', error.message);
    res.status(500).json({ 
      message: 'Error retrieving user page access', 
      error: error.message 
    });
  }
});

// Fetch Current Role
router.get('/current-role', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, 'secretKey'); // Replace 'secretKey' with your actual secret
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.status(200).json({
      message: 'Role retrieved successfully',
      role: user.role,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Error fetching role:', error.message);
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
});

// Admin registration route - Requires username and name
router.post('/register-admin', async (req, res) => {
  const { username, name } = req.body;

  try {
    if (!username || !name) {
      return res.status(400).json({ 
        message: 'Both username and name are required'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Username already exists' 
      });
    }

    // Create admin with username and name
    const adminData = {
      username,
      name,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };

    const newAdmin = new User(adminData);
    await newAdmin.save();

    res.status(201).json({ 
      message: 'Admin registered successfully',
      admin: {
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering admin:', error.message);
    res.status(500).json({ 
      message: 'Error registering admin', 
      error: error.message 
    });
  }
});

//get all admins.........
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.status(200).json({ 
      message: 'Admins retrieved successfully', 
      admins 
    });
  } catch (error) {
    console.error('Error retrieving admins:', error.message);
    res.status(500).json({ 
      message: 'Error retrieving admins', 
      error: error.message 
    });
  }
});

//delete all admins...........
router.delete('/admins/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAdmin = await User.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ 
        message: 'Admin not found' 
      });
    }

    res.status(200).json({ 
      message: 'Admin deleted successfully', 
      admin: deletedAdmin 
    });
  } catch (error) {
    console.error('Error deleting admin:', error.message);
    res.status(500).json({ 
      message: 'Error deleting admin', 
      error: error.message 
    });
  }
});

//role fetch 
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET); // Replace JWT_SECRET with your actual secret key
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Token verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Route: Get Current Role
router.get('/current-role', verifyToken, (req, res) => {
  try {
    res.status(200).json({
      message: 'Role retrieved successfully',
      role: req.user.role,
    });
  } catch (error) {
    console.error('Error fetching role:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route 
router.post('/login', async (req, res) => {
  const { username } = req.body;

  try {
    // Validate the username or fetch user details from Azure AD
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: 'User not registered in the system',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token for your app
    const jwtToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      'secretKey', // Replace with your actual secret key
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Login successful',
      user: {
        name: user.name,
        role: user.role,
        username: user.username,
        lastLogin: user.lastLogin,
        pages: user.pages, // Include pages if needed
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      message: 'Error during login process',
      error: error.message,
    });
  }
});

export default router;