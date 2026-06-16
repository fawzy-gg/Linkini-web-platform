const pool = require("../db");

// ✅ SEND MESSAGE
exports.sendMessage = async (req, res) => {
  const { event_id, sender_id, receiver_id, content } = req.body;

  if (!event_id || !sender_id || !receiver_id || !content) {
    return res.status(400).json({
      message: "event_id, sender_id, receiver_id, content are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (event_id, sender_id, receiver_id, content, is_read)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
      [event_id, sender_id, receiver_id, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log("SEND MSG ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL CONVERSATIONS + UNREAD COUNT
exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    const userResult = await pool.query(
      `SELECT event_id FROM participants WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventId = userResult.rows[0].event_id;

    const result = await pool.query(
      `
      WITH latest AS (
        SELECT DISTINCT ON (
          CASE
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END
        )
          CASE
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS other_id,
          content,
          created_at,
          sender_id
        FROM messages
        WHERE (sender_id = $1 OR receiver_id = $1)
          AND event_id = $2
        ORDER BY
          CASE
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END,
          created_at DESC
      ),
      unread AS (
        SELECT sender_id AS other_id, COUNT(*) AS unread_count
        FROM messages
        WHERE receiver_id = $1 
          AND is_read = false
          AND event_id = $2
        GROUP BY sender_id
      )
      SELECT
        p.id,
        p.nickname,
        latest.content,
        latest.created_at,
        latest.sender_id,
        COALESCE(unread.unread_count, 0) AS unread_count
      FROM latest
      JOIN participants p ON p.id = latest.other_id
      LEFT JOIN unread ON unread.other_id = latest.other_id
      ORDER BY latest.created_at DESC
      `,
      [userId, eventId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log("CONVERSATIONS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ MARK MESSAGES AS READ
exports.markAsRead = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const userResult = await pool.query(
      `SELECT event_id FROM participants WHERE id = $1`,
      [user1]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventId = userResult.rows[0].event_id;

    await pool.query(
      `UPDATE messages
       SET is_read = true
       WHERE sender_id = $2
         AND receiver_id = $1
         AND is_read = false
         AND event_id = $3`,
      [user1, user2, eventId]
    );

    res.json({ success: true });
  } catch (err) {
    console.log("MARK READ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET CHAT BETWEEN 2 USERS
exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const userResult = await pool.query(
      `SELECT event_id FROM participants WHERE id = $1`,
      [user1]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventId = userResult.rows[0].event_id;

    const result = await pool.query(
      `SELECT * FROM messages
       WHERE 
         (
           (sender_id = $1 AND receiver_id = $2)
           OR
           (sender_id = $2 AND receiver_id = $1)
         )
         AND event_id = $3
       ORDER BY created_at ASC`,
      [user1, user2, eventId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log("GET MSG ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};