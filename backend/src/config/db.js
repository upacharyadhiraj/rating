import pkg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Stores Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Ratings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
      );
    `);

    // Indexes for high performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);`);

    // Check if initial admin exists, if not seed initial demo data
    const userCountRes = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountRes.rows[0].count, 10);

    if (userCount === 0) {
      console.log('Database empty. Seeding initial test accounts and stores...');
      const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

      // Seed Admin
      const adminRes = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'System Administrator Officer', // 29 chars
          'admin@storerating.com',
          defaultPasswordHash,
          '742 Evergreen Terrace, Administrative Block 4, Springfield',
          'ADMIN',
        ]
      );

      // Seed Store Owners
      const owner1Res = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Michael Scott Regional Manager', // 31 chars
          'owner1@dundermifflin.com',
          defaultPasswordHash,
          '1725 Slough Avenue, Suite 200, Scranton, Pennsylvania',
          'STORE_OWNER',
        ]
      );

      const owner2Res = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Eleanor Shellstrop Market Owner', // 32 chars
          'owner2@goodplacefoods.com',
          defaultPasswordHash,
          '888 Utopia Boulevard, Commercial Sector, Phoenix, Arizona',
          'STORE_OWNER',
        ]
      );

      // Seed Normal Users
      const user1Res = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Alexander James Washington User', // 32 chars
          'alexander@consumer.com',
          defaultPasswordHash,
          '123 Liberty Street, Apartment 4B, Boston, Massachusetts',
          'USER',
        ]
      );

      const user2Res = await client.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Jessica Scarlett Henderson User', // 32 chars
          'jessica@consumer.com',
          defaultPasswordHash,
          '456 Ocean Drive, Sunset District, San Francisco, California',
          'USER',
        ]
      );

      // Seed Stores
      const store1Res = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          'Dunder Mifflin Paper Co Scranton',
          'contact@scrantonpaper.com',
          '1725 Slough Avenue, Commercial Hub, Scranton, PA',
          owner1Res.rows[0].id,
        ]
      );

      const store2Res = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          'The Good Place Organic Groceries',
          'support@goodplaceorganic.com',
          '888 Utopia Boulevard, Green Sector, Phoenix, AZ',
          owner2Res.rows[0].id,
        ]
      );

      const store3Res = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          'Downtown Tech and Electronics Hub',
          'sales@downtowntechhub.com',
          '101 Silicon Valley Boulevard, Tech Corridor, Austin, TX',
          null, // Unassigned owner for admin demonstration
        ]
      );

      // Seed Sample Ratings
      await client.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES
         ($1, $2, 5),
         ($3, $2, 4),
         ($1, $4, 4),
         ($3, $4, 3)`,
        [
          user1Res.rows[0].id,
          store1Res.rows[0].id,
          user2Res.rows[0].id,
          store2Res.rows[0].id,
        ]
      );

      console.log('Sample seed data created successfully.');
    }

    await client.query('COMMIT');
    console.log('Database tables verified and ready.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database initialization:', error);
    throw error;
  } finally {
    client.release();
  }
};
