import { pool } from '../config/db.js';
import { validateRatingValue } from '../middleware/validators.js';

/**
 * Get all registered stores for Normal Users
 * Features:
 * - Search by Name and Address
 * - Overall Average Rating
 * - User's Submitted Rating (from logged-in token)
 * - Sorting on Name, Address, Overall Rating
 */
export const getStoresForUser = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      rating: 'overall_rating',
      myRating: 'user_rating',
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const conditions = [];
    const values = [];

    // Search query matches store Name OR Address
    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`(s.name ILIKE $${values.length} OR s.address ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Parameter for current user's rating
    const userParamIndex = values.length + 1;
    values.push(currentUserId);

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS overall_rating,
        COUNT(r.id)::int AS total_ratings,
        MAX(CASE WHEN r.user_id = $${userParamIndex} THEN r.rating ELSE NULL END) AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY ${sortColumn} ${safeSortOrder};
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      stores: result.rows.map((row) => ({
        ...row,
        overall_rating: parseFloat(row.overall_rating),
        user_rating: row.user_rating !== null ? parseInt(row.user_rating, 10) : null,
      })),
    });
  } catch (error) {
    console.error('Error in getStoresForUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stores.',
    });
  }
};

/**
 * Submit or Modify Rating (1 to 5) for a Store
 * - Uses UPSERT on (user_id, store_id)
 */
export const rateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Validate rating value
    const ratingErr = validateRatingValue(rating);
    if (ratingErr) {
      return res.status(400).json({
        success: false,
        message: ratingErr,
      });
    }

    const ratingVal = parseInt(rating, 10);

    // Verify store exists
    const storeCheck = await pool.query('SELECT id, name FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Upsert rating (Insert or Update if already exists)
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, store_id) 
       DO UPDATE SET 
         rating = EXCLUDED.rating,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, store_id, rating, updated_at`,
      [userId, storeId, ratingVal]
    );

    // Fetch new overall rating and count for this store
    const statsRes = await pool.query(
      `SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS overall_rating,
        COUNT(id)::int AS total_ratings
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: result.rows[0],
      storeStats: {
        overallRating: parseFloat(statsRes.rows[0].overall_rating),
        totalRatings: statsRes.rows[0].total_ratings,
      },
    });
  } catch (error) {
    console.error('Error in rateStore:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating.',
    });
  }
};
