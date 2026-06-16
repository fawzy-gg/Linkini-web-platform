const express = require("express");
const router = express.Router();
const controller = require("../controllers/connection-controller");

router.get("/:participantId", controller.getConnectionsForParticipant);
router.post("/", controller.createConnection);
router.put("/:id", controller.updateConnectionStatus);

module.exports = router;