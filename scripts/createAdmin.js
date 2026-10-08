// Creates the FIRST admin directly in the database (public registration cannot do this).
// Usage: put ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env, run `npm run create-admin`,
// then delete those three lines from .env.
require('dotenv').config();

const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');
const userModel = require('../src/models/userModel');
const { isNonEmptyString, isValidEmail } = require('../src/utils/validate');

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (
    !isNonEmptyString(ADMIN_NAME, 100) ||
    !isValidEmail(ADMIN_EMAIL) ||
    !ADMIN_PASSWORD ||
    ADMIN_PASSWORD.length < 8 ||
    ADMIN_PASSWORD.length > 72
  ) {
    console.error('Set ADMIN_NAME, a valid ADMIN_EMAIL and an ADMIN_PASSWORD (8-72 chars) in .env first.');
    process.exitCode = 1;
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();

  if (await userModel.findByEmailWithHash(email)) {
    console.error(`A user with email ${email} already exists. Nothing was created.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await userModel.createUser({
    name: ADMIN_NAME.trim(),
    email,
    passwordHash,
    role: 'ADMIN',
  });

  console.log(`Admin created: id=${admin.id}, email=${admin.email}`);
  console.log('Now remove ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from your .env file.');
}

createAdmin()
  .catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());