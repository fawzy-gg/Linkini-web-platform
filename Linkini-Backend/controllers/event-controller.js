const pool = require("../db");

function generateEventCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

exports.createEvent = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  try {
    let code;
    let exists = true;

    while (exists) {
      code = generateEventCode();

      const check = await pool.query(
        "SELECT id FROM events WHERE UPPER(code) = UPPER($1)",
        [code]
      );

      exists = check.rows.length > 0;
    }

    const result = await pool.query(
      "INSERT INTO events (title, code) VALUES ($1, $2) RETURNING *",
      [title, code]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("CREATE EVENT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getEventByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE UPPER(code) = UPPER($1)",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log("GET EVENT BY CODE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getEventStats = async (req, res) => {
  const { eventId } = req.params;

  try {
    const participantsResult = await pool.query(
      "SELECT COUNT(*) FROM participants WHERE event_id = $1",
      [eventId]
    );

    const companiesResult = await pool.query(
      `SELECT COUNT(*) 
       FROM participants 
       WHERE event_id = $1 AND is_company = true`,
      [eventId]
    );

    const jobsResult = await pool.query(
      "SELECT COUNT(*) FROM jobs WHERE event_id = $1",
      [eventId]
    );

    const messagesResult = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE event_id = $1",
      [eventId]
    );

    const connectionsResult = await pool.query(
      "SELECT COUNT(*) FROM connections WHERE event_id = $1",
      [eventId]
    );

    const recentJobsResult = await pool.query(
      `
      SELECT 
        j.id,
        j.role,
        p.nickname AS company_name
      FROM jobs j
      JOIN participants p ON p.id = j.owner_id
      WHERE j.event_id = $1
      ORDER BY j.id DESC
      LIMIT 5
      `,
      [eventId]
    );

    res.json({
      totalParticipants: Number(participantsResult.rows[0].count),
      totalCompanies: Number(companiesResult.rows[0].count),
      totalJobs: Number(jobsResult.rows[0].count),
      totalMessages: Number(messagesResult.rows[0].count),
      totalConnections: Number(connectionsResult.rows[0].count),
      recentJobs: recentJobsResult.rows,
    });
  } catch (err) {
    console.log("EVENT DASHBOARD ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};