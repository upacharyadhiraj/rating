import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

/**
 * 1. Admin Dashboard Metrics:
 * - Total number of users
 * - Total number of stores
 * - Total number of submitted ratings
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const [userRes, storeRes, ratingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total_users FROM users'),
      pool.query('SELECT COUNT(*) AS total_stores FROM stores'),
      pool.query('SELECT COUNT(*) AS total_ratings FROM ratings'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(userRes.rows[0].total_users, 10),
        totalStores: parseInt(storeRes.rows[0].total_stores, 10),
        totalRatings: parseInt(ratingRes.rows[0].total_ratings, 10),
      },
    });
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard metrics.',
    });
  }
};

/**
 * 2. Get Users Listing with Filters and Sorting:
 * - Filters: name, email, address, role
 * - Sorting: sortBy (name, email, address, role, created_at), sortOrder (ASC, DESC)
 */
export const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['id', 'name', 'email', 'address', 'role', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const conditions = [];
    const values = [];

    if (name && name.trim()) {
      values.push(`%${name.trim()}%`);
      conditions.push(`u.name ILIKE $${values.length}`);
    }

    if (email && email.trim()) {
      values.push(`%${email.trim()}%`);
      conditions.push(`u.email ILIKE $${values.length}`);
    }

    if (address && address.trim()) {
      values.push(`%${address.trim()}%`);
      conditions.push(`u.address ILIKE $${values.length}`);
    }

    if (role && role.trim()) {
      values.push(role.trim().toUpperCase());
      conditions.push(`u.role = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS store_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY u.id, s.id
      ORDER BY u.${safeSortBy} ${safeSortOrder};
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users list.',
    });
  }
};

/**
 * 3. Add New User (Admin, Normal User, or Store Owner)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check unique email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash, address.trim(), role]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
    });
  }
};

/**
 * 4. Get User Details
 * - Name, Email, Address, Role
 * - If user is a Store Owner, their store's rating should also be displayed.
 */
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const userRes = await pool.query(
      `SELECT id, name, email, address, role, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = userRes.rows[0];

    // If store owner, fetch their store and store rating
    if (user.role === 'STORE_OWNER') {
      const storeRes = await pool.query(
        `SELECT 
          s.id AS store_id, 
          s.name AS store_name, 
          s.email AS store_email, 
          s.address AS store_address,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS store_rating,
          COUNT(r.id)::int AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [user.id]
      );

      if (storeRes.rows.length > 0) {
        user.store = storeRes.rows[0];
        user.storeRating = parseFloat(storeRes.rows[0].store_rating);
      } else {
        user.store = null;
        user.storeRating = 0;
      }
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details.',
    });
  }
};

/**
 * 5. Get Stores Listing with Filters and Sorting:
 * - Details: Name, Email, Address, Overall Rating
 * - Filters: name, email, address
 * - Sorting: name, email, address, rating (ascending/descending)
 */
export const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'overall_rating',
      created_at: 's.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const conditions = [];
    const values = [];

    if (name && name.trim()) {
      values.push(`%${name.trim()}%`);
      conditions.push(`s.name ILIKE $${values.length}`);
    }

    if (email && email.trim()) {
      values.push(`%${email.trim()}%`);
      conditions.push(`s.email ILIKE $${values.length}`);
    }

    if (address && address.trim()) {
      values.push(`%${address.trim()}%`);
      conditions.push(`s.address ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.id AS owner_id,
        u.name AS owner_name,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS overall_rating,
        COUNT(r.id)::int AS total_ratings
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id, u.id
      ORDER BY ${sortColumn} ${safeSortOrder};
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      stores: result.rows,
    });
  } catch (error) {
    console.error('Error in getStores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stores list.',
    });
  }
};

/**
 * 6. Add New Store
 * - Admin can add new stores with: Name, Email, Address, (and optional ownerId)
 */
export const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check unique store email
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      });
    }

    // Verify owner exists and is STORE_OWNER if provided
    let safeOwnerId = null;
    if (ownerId) {
      const ownerCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Specified store owner user does not exist.',
        });
      }
      safeOwnerId = ownerId;
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name.trim(), normalizedEmail, address.trim(), safeOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully!',
      store: result.rows[0],
    });
  } catch (error) {
    console.error('Error in createStore:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store.',
    });
  }
};
