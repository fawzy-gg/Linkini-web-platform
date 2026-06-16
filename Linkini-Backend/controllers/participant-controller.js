const pool = require("../db");
const { createEmbedding, cosineSimilarity } = require("../utils/localAI");

// CREATE PARTICIPANT
exports.createParticipant = async (req, res) => {
  const {
    event_id,
    nickname,
    intention,
    bio,
    ai_enabled,
    tags,
    is_company,
    is_visible,
  } = req.body;

  if (!event_id || !nickname) {
    return res.status(400).json({
      message: "event_id and nickname are required",
    });
  }

  try {
    const profileText = `
Name: ${nickname}
Goal: ${intention || ""}
Bio: ${bio || ""}
Tags: ${(tags || []).join(", ")}
Type: ${is_company ? "Company" : "Participant"}
`;

    const embedding = await createEmbedding(profileText);

    const result = await pool.query(
      `INSERT INTO participants 
       (event_id, nickname, intention, bio, ai_enabled, tags, is_company, embedding, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        event_id,
        nickname,
        intention,
        bio,
        ai_enabled,
        tags || [],
        is_company || false,
        JSON.stringify(embedding),
        is_visible ?? true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("CREATE PARTICIPANT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET PARTICIPANTS BY EVENT
exports.getParticipantsByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM participants WHERE event_id = $1`,
      [eventId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PARTICIPANT
exports.updateParticipant = async (req, res) => {
  const { id } = req.params;
  const {
    nickname,
    intention,
    bio,
    ai_enabled,
    tags,
    is_company,
    is_visible,
  } = req.body;

  try {
    const profileText = `
Name: ${nickname}
Goal: ${intention || ""}
Bio: ${bio || ""}
Tags: ${(tags || []).join(", ")}
Type: ${is_company ? "Company" : "Participant"}
`;

    const embedding = await createEmbedding(profileText);

    const result = await pool.query(
      `UPDATE participants
       SET nickname=$1,
           intention=$2,
           bio=$3,
           ai_enabled=$4,
           tags=$5,
           is_company=$6,
           embedding=$7,
           is_visible=$8
       WHERE id=$9
       RETURNING *`,
      [
        nickname,
        intention,
        bio,
        ai_enabled,
        tags || [],
        is_company || false,
        JSON.stringify(embedding),
        is_visible ?? true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Participant not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log("UPDATE PARTICIPANT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

function getEmbeddingValue(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
}

function similarityToScore(similarity) {
  let score = Math.round(((similarity - 0.35) / 0.4) * 100);

  if (score > 98) score = 98;
  if (score < 35) score = 35;

  return score;
}

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

function generateMatchReason(user, other, score) {
  const userTags = Array.isArray(user.tags)
    ? user.tags.map((t) => String(t).toLowerCase())
    : [];

  const otherTags = Array.isArray(other.tags)
    ? other.tags.map((t) => String(t).toLowerCase())
    : [];

  const commonTags = userTags.filter((tag) => otherTags.includes(tag));

  if (commonTags.length > 0) {
    return `You both share strong interests in ${commonTags.join(", ")}, making this a relevant connection.`;
  }

  const userGoal = normalizeText(user.intention);
  const otherGoal = normalizeText(other.intention);

  if (
    userGoal &&
    otherGoal &&
    (userGoal.includes(otherGoal) || otherGoal.includes(userGoal))
  ) {
    return `You both have aligned goals: ${user.intention}.`;
  }

  if (score >= 75) {
    return "Strong semantic match based on your profiles, goals, and background.";
  }

  if (score >= 55) {
    return "Good potential match based on your interests and profile.";
  }

  return "Possible networking opportunity based on your profiles.";
}

// GET MATCHES WITH LOCAL AI EMBEDDINGS
exports.getMatches = async (req, res) => {
  const { participantId } = req.params;

  try {
    const me = await pool.query(
      `SELECT * FROM participants WHERE id = $1`,
      [participantId]
    );

    if (me.rows.length === 0) {
      return res.status(404).json({
        message: "Participant not found",
      });
    }

    const user = me.rows[0];

    const others = await pool.query(
      `SELECT id,
              nickname,
              intention,
              bio,
              ai_enabled,
              tags,
              is_company,
              embedding,
              is_visible
       FROM participants
       WHERE event_id = $1
         AND id != $2
         AND is_company = false
         AND is_visible = true`,
      [user.event_id, participantId]
    );

    const matches = others.rows.map((p) => {
      let matchScore = 35;

      try {
        const userEmbedding = getEmbeddingValue(user.embedding);
        const otherEmbedding = getEmbeddingValue(p.embedding);

        if (userEmbedding && otherEmbedding) {
          const similarity = cosineSimilarity(userEmbedding, otherEmbedding);
          matchScore = similarityToScore(similarity);
        }
      } catch (err) {
        console.log("EMBEDDING MATCH ERROR:", err.message);
      }

      const matchReason = generateMatchReason(user, p, matchScore);

      return {
        id: p.id,
        nickname: p.nickname,
        intention: p.intention,
        bio: p.bio,
        tags: p.tags,
        is_company: p.is_company,
        is_visible: p.is_visible,
        matchScore,
        matchReason,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    console.log("MATCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE PARTICIPANT DATA
exports.deleteParticipantData = async (req, res) => {
  const { id } = req.params;

  try {
    const participantResult = await pool.query(
      `SELECT * FROM participants WHERE id = $1`,
      [id]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Participant not found",
      });
    }

    await pool.query(
      `DELETE FROM job_interests WHERE user_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM connections
       WHERE requester_id = $1 OR receiver_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM messages
       WHERE sender_id = $1 OR receiver_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM jobs WHERE owner_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM participants WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: "Participant data deleted successfully",
    });
  } catch (err) {
    console.log("DELETE PARTICIPANT DATA ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};