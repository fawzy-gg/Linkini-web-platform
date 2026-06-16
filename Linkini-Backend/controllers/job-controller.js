const pool = require("../db");
const { createEmbedding, cosineSimilarity } = require("../utils/localAI");

// CREATE JOB
exports.createJob = async (req, res) => {
  const { event_id, owner_id, role, description, tags } = req.body;

  if (!event_id || !owner_id || !role) {
    return res.status(400).json({
      message: "event_id, owner_id, role are required"
    });
  }

  try {
    const jobText = `
Role: ${role}
Description: ${description || ""}
Tags: ${(tags || []).join(", ")}
`;

    const embedding = await createEmbedding(jobText);

    const result = await pool.query(
      `INSERT INTO jobs (event_id, owner_id, role, description, tags, embedding)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        event_id,
        owner_id,
        role,
        description,
        tags || [],
        JSON.stringify(embedding)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("CREATE JOB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET JOBS BY EVENT
exports.getJobsByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT j.*, p.nickname AS company_name
       FROM jobs j
       JOIN participants p ON j.owner_id = p.id
       WHERE j.event_id = $1
       ORDER BY j.id DESC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log("GET JOBS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

function getEmbeddingValue(value) {
  if (!value) return null;
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

function normalizeTag(tag) {
  return String(tag || "").toLowerCase().trim();
}

function similarityToScore(similarity) {
  let score = Math.round(((similarity - 0.35) / 0.4) * 100);

  if (score > 98) score = 98;
  if (score < 35) score = 35;

  return score;
}

function generateJobMatchReason(user, job, score) {
  const userTags = Array.isArray(user.tags)
    ? user.tags.map(normalizeTag)
    : [];

  const jobTags = Array.isArray(job.tags)
    ? job.tags.map(normalizeTag)
    : [];

  const commonTags = userTags.filter((tag) => jobTags.includes(tag));

  if (commonTags.length > 0) {
    return `Strong match because your profile shares these skills with the job: ${commonTags.join(", ")}.`;
  }

  const userGoal = normalizeText(user.intention);
  const jobRole = normalizeText(job.role);

  if (userGoal && jobRole && (userGoal.includes(jobRole) || jobRole.includes(userGoal))) {
    return `This role aligns well with your goal: ${user.intention}.`;
  }

  if (score >= 75) {
    return "Strong semantic match based on your profile, background, and this opportunity.";
  }

  if (score >= 55) {
    return "Good potential match based on your profile and this job description.";
  }

  return "Possible opportunity based on your profile and interests.";
}

function calculateJobMatchScore(user, job) {
  try {
    const userEmbedding = getEmbeddingValue(user.embedding);
    const jobEmbedding = getEmbeddingValue(job.embedding);

    if (userEmbedding && jobEmbedding) {
      const similarity = cosineSimilarity(userEmbedding, jobEmbedding);

      console.log("JOB:", job.role, "SIMILARITY:", similarity);

      return similarityToScore(similarity);
    }
  } catch (err) {
    console.log("JOB EMBEDDING MATCH ERROR:", err.message);
  }

  return 35;
}

// GET MATCHED JOBS
exports.getJobMatches = async (req, res) => {
  const { participantId } = req.params;

  try {
    const me = await pool.query(
      `SELECT * FROM participants WHERE id = $1`,
      [participantId]
    );

    if (me.rows.length === 0) {
      return res.status(404).json({
        message: "Participant not found"
      });
    }

    const user = me.rows[0];

    const jobs = await pool.query(
      `SELECT j.*, p.nickname AS company_name
       FROM jobs j
       JOIN participants p ON j.owner_id = p.id
       WHERE j.event_id = $1
         AND j.owner_id != $2
       ORDER BY j.id DESC`,
      [user.event_id, participantId]
    );

    const matchedJobs = jobs.rows.map((job) => {
      const matchScore = calculateJobMatchScore(user, job);
      const matchReason = generateJobMatchReason(user, job, matchScore);

      return {
        ...job,
        matchScore,
        matchReason
      };
    });

    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedJobs);
  } catch (err) {
    console.log("JOB MATCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};