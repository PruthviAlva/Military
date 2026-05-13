#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('📝 Loading schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Schema loaded successfully');

    console.log('📝 Loading seed data...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'database/seed.sql'), 'utf8');
    await client.query(seedSQL);
    console.log('✅ Seed data loaded successfully');

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

initializeDatabase();
