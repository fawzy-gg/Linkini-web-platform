const pool = require("../db");
const { cosineSimilarity } = require("../utils/localAI");

function getEmbeddingValue(value) {
  if (!value) return null;
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

function similarityToScore(similarity) {
  let score = Math.round(((similarity - 0.35) / 0.4) * 100);

  if (score > 98) score = 98;
  if (score < 35) score = 35;

  return score;
}

function normalizeTag(tag) {
  return String(tag || "").toLowerCase().trim();
}

function generateDashboardReason(user, job, score) {
  const userTags = Array.isArray(user.tags)
    ? user.tags.map(normalizeTag)
    : [];

  const jobTags = Array.isArray(job.tags)
    ? job.tags.map(normalizeTag)
    : [];

  const commonTags = userTags.filter((tag) => jobTags.includes(tag));

  if (commonTags.length > 0) {
    return `Shared skills: ${commonTags.join(", ")}`;
  }

  if (score >= 75) {
    return "Strong semantic fit for this role.";
  }

  if (score >= 55) {
    return "Good potential fit based on profile and job details.";
  }

  return "Possible fit based on available profile data.";
}

exports.getCompanyDashboard = async (req, res) => {
  const { companyId } = req.params;

  try {
    const jobsResult = await pool.query(
      `SELECT * FROM jobs WHERE owner_id = $1 ORDER BY id DESC`,
      [companyId]
    );

    const jobs = [];

    for (const job of jobsResult.rows) {
      const interestedResult = await pool.query(
        `SELECT 
           p.id,
           p.nickname,
           p.intention,
           p.bio,
           p.tags,
           p.embedding
         FROM job_interests ji
         JOIN participants p ON ji.user_id = p.id
         WHERE ji.job_id = $1
         ORDER BY ji.id DESC`,
        [job.id]
      );

      const jobEmbedding = getEmbeddingValue(job.embedding);

      const interestedUsers = interestedResult.rows.map((user) => {
        let matchScore = 35;

        try {
          const userEmbedding = getEmbeddingValue(user.embedding);

          if (userEmbedding && jobEmbedding) {
            const similarity = cosineSimilarity(userEmbedding, jobEmbedding);
            matchScore = similarityToScore(similarity);
          }
        } catch (err) {
          console.log("DASHBOARD MATCH ERROR:", err.message);
        }

        return {
          id: user.id,
          nickname: user.nickname,
          intention: user.intention,
          bio: user.bio,
          tags: user.tags,
          matchScore,
          matchReason: generateDashboardReason(user, job, matchScore),
        };
      });

      interestedUsers.sort((a, b) => b.matchScore - a.matchScore);

      jobs.push({
        ...job,
        interested_users: interestedUsers,
      });
    }

    res.json(jobs);
  } catch (err) {
    console.log("COMPANY DASHBOARD ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};