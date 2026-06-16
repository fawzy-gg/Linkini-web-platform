async function createEmbedding(text) {
  const res = await fetch("http://localhost:8000/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("AI server embedding failed");
  }

  const data = await res.json();
  return data.embedding;
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (!magA || !magB) return 0;

  return dot / (magA * magB);
}

module.exports = {
  createEmbedding,
  cosineSimilarity,
};