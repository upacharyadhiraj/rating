import { pool } from '../config/db.js';

/**
 * Store Owner Dashboard Details:
 * - See average rating of their store
 * - View list of users who have submitted ratings for their store (Name, Email, Address, Rating, Date)
 * - Sorting on Name, Email, Rating, Date
 */
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    // Allowed sort fields for the ratings table
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      date: 'r.created_at',
      created_at: 'r.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 'r.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 1. Fetch store owned by this user
    const storeRes = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
        COUNT(r.id)::int AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (storeRes.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store is currently assigned to your account. Please contact an administrator.',
        store: null,
        ratings: [],
      });
    }

    const store = storeRes.rows[0];

    // 2. Fetch list of users who submitted ratings for this store
    const ratingsQuery = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = $1
      ORDER BY ${sortColumn} ${safeSortOrder};
    `;

    const ratingsRes = await pool.query(ratingsQuery, [store.id]);

    return res.status(200).json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.average_rating),
        totalRatings: store.total_ratings,
      },
      ratings: ratingsRes.rows,
    });
  } catch (error) {
    console.error('Error in getOwnerDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store owner dashboard data.',
    });
  }
};
