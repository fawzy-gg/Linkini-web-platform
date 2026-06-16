const pool = require("../db");

// ADD INTEREST
exports.addInterest = async (req, res) => {
  const { job_id, user_id } = req.body;

  if (!job_id || !user_id) {
    return res.status(400).json({
      message: "job_id and user_id required"
    });
  }

  try {
    // prevent duplicate
    const existing = await pool.query(
      `SELECT * FROM job_interests WHERE job_id=$1 AND user_id=$2`,
      [job_id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Already interested"
      });
    }

    const result = await pool.query(
      `INSERT INTO job_interests (job_id, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [job_id, user_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


// GET USERS INTERESTED IN A JOB
exports.getJobInterests = async (req, res) => {
  const { jobId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id, p.nickname
       FROM job_interests ji
       JOIN participants p ON ji.user_id = p.id
       WHERE ji.job_id = $1`,
      [jobId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};