require('dotenv').config();

const bcrypt = require('bcrypt');

const connectDatabase = require('../../shared/config/database');
const Admin = require('../models/Admin');

async function seedAdmin() {
  try {
    await connectDatabase();

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'ADMIN_USERNAME y ADMIN_PASSWORD deben estar definidos en .env'
      );
    }

    const existingAdmin = await Admin.findOne({
      username: username.toLowerCase()
    });

    if (existingAdmin) {
      console.log(`Admin "${username}" already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Admin.create({
      username: username.toLowerCase(),
      passwordHash
    });

    console.log(`Admin "${username}" created successfully.`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);

    process.exit(1);
  }
}

seedAdmin();