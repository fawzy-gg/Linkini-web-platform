const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event-controller");
const pool = require("../db");

// CREATE EVENT
router.post("/", eventController.createEvent);

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.log("GET EVENTS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// JOIN EVENT FROM DATABASE
router.post("/join", async (req, res) => {
  const { eventCode } = req.body;

  if (!eventCode) {
    return res.status(400).json({
      message: "eventCode is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE UPPER(code) = UPPER($1)`,
      [eventCode.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const event = result.rows[0];

    if (event.is_active === false) {
      return res.status(403).json({
        message: "This event is closed",
      });
    }

    res.json({
      message: "Event valid",
      event,
    });
  } catch (err) {
    console.log("JOIN EVENT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// STATS FOR ONE EVENT
router.get("/:eventId/stats", eventController.getEventStats);

// ACTIVATE / DEACTIVATE EVENT
router.put("/:eventId/toggle", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE events
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING *
      `,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log("TOGGLE EVENT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE EVENT + RELATED DATA
router.delete("/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    await pool.query("DELETE FROM messages WHERE event_id = $1", [eventId]);
    await pool.query("DELETE FROM connections WHERE event_id = $1", [eventId]);

    await pool.query(
      `DELETE FROM job_interests 
       WHERE user_id IN (
         SELECT id FROM participants WHERE event_id = $1
       )`,
      [eventId]
    );

    await pool.query("DELETE FROM jobs WHERE event_id = $1", [eventId]);
    await pool.query("DELETE FROM participants WHERE event_id = $1", [eventId]);
    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (err) {
    console.log("DELETE EVENT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET EVENT BY CODE
router.get("/:code", eventController.getEventByCode);

module.exports = router;