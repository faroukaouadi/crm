const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const createUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@crm.com' });
    
    if (existingUser) {
      console.log('User already exists with email: admin@crm.com');
      process.exit(0);
    }

    // Create new user
    const userData = {
      email: 'admin@crm.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      isActive: true
    };

    const user = new User(userData);
    await user.save();

    console.log('User created successfully!');
    console.log('Email: admin@crm.com');
    console.log('Password: admin123');
    console.log('Role: super_admin');

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createUser();
