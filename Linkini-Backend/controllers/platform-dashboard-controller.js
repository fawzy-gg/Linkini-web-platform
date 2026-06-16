const pool = require("../db");

exports.getPlatformDashboard = async (req, res) => {
  try {
    const eventsResult = await pool.query(`SELECT COUNT(*) FROM events`);
    const participantsResult = await pool.query(`SELECT COUNT(*) FROM participants`);
    const companiesResult = await pool.query(
      `SELECT COUNT(*) FROM participants WHERE is_company = true`
    );
    const usersResult = await pool.query(
      `SELECT COUNT(*) FROM participants WHERE is_company = false`
    );
    const jobsResult = await pool.query(`SELECT COUNT(*) FROM jobs`);
    const messagesResult = await pool.query(`SELECT COUNT(*) FROM messages`);
    const connectionsResult = await pool.query(`SELECT COUNT(*) FROM connections`);
    const interestsResult = await pool.query(`SELECT COUNT(*) FROM job_interests`);

    const topEventsResult = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.code,
        COUNT(p.id) AS participants_count
      FROM events e
      LEFT JOIN participants p ON p.event_id = e.id
      GROUP BY e.id, e.title, e.code
      ORDER BY participants_count DESC
      LIMIT 5
    `);

    const recentJobsResult = await pool.query(`
      SELECT 
        j.id,
        j.role,
        j.description,
        p.nickname AS company_name
      FROM jobs j
      JOIN participants p ON p.id = j.owner_id
      ORDER BY j.id DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalEvents: Number(eventsResult.rows[0].count),
        totalParticipants: Number(participantsResult.rows[0].count),
        totalUsers: Number(usersResult.rows[0].count),
        totalCompanies: Number(companiesResult.rows[0].count),
        totalJobs: Number(jobsResult.rows[0].count),
        totalMessages: Number(messagesResult.rows[0].count),
        totalConnections: Number(connectionsResult.rows[0].count),
        totalInterests: Number(interestsResult.rows[0].count),
      },
      topEvents: topEventsResult.rows,
      recentJobs: recentJobsResult.rows,
    });
  } catch (err) {
    console.log("PLATFORM DASHBOARD ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};