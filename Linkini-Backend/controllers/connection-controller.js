const pool = require("../db");


// ✅ CREATE CONNECTION
exports.createConnection = async (req, res) => {

  const { event_id, requester_id, receiver_id } = req.body;

  //  validation
  if (!event_id || !requester_id || !receiver_id) {
    return res.status(400).json({
      message: "event_id, requester_id, receiver_id are required"
    });
  }

  if (requester_id === receiver_id) {
    return res.status(400).json({
      message: "Cannot connect to yourself"
    });
  }

  try {


    const existing = await pool.query(
      `SELECT * FROM connections
       WHERE (requester_id=$1 AND receiver_id=$2)
       OR (requester_id=$2 AND receiver_id=$1)`,
      [requester_id, receiver_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Connection already exists"
      });
    }

    const result = await pool.query(
      `INSERT INTO connections 
       (event_id, requester_id, receiver_id, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [event_id, requester_id, receiver_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.log("CREATE CONNECTION ERROR:", err.message);
    res.status(500).json({ error: err.message });

  }

};



// ✅ UPDATE STATUS (accept / reject)
exports.updateConnectionStatus = async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  if (!["pending","accepted","rejected"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  try {

    const result = await pool.query(
      `UPDATE connections 
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({message:"Connection not found"});
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.log("UPDATE ERROR:", err.message);
    res.status(500).json({ error: err.message });

  }

};



// ✅ GET ALL CONNECTIONS (requests + connected)
exports.getConnectionsForParticipant = async (req, res) => {

  const { participantId } = req.params;

  try {

    const result = await pool.query(`
      SELECT 
        c.id,
        c.status,
        c.requester_id,
        c.receiver_id,

        p1.nickname AS requester_name,
        p2.nickname AS receiver_name,

        CASE 
          WHEN c.requester_id = $1 THEN p2.nickname
          ELSE p1.nickname
        END AS connected_with,

        CASE 
          WHEN c.requester_id = $1 THEN p2.id
          ELSE p1.id
        END AS other_user_id

      FROM connections c
      JOIN participants p1 ON c.requester_id = p1.id
      JOIN participants p2 ON c.receiver_id = p2.id
      WHERE c.requester_id = $1 OR c.receiver_id = $1
      ORDER BY c.id DESC
    `,[participantId]);

    res.json(result.rows);

  } catch (err) {

    console.log("CONNECTION ERROR:", err.message);
    res.status(500).json({ error: err.message });

  }

};