const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participant-controller");

router.post("/", participantController.createParticipant);

router.get(
  "/match/:participantId",
  participantController.getMatches
);

router.get(
  "/:eventId",
  participantController.getParticipantsByEvent
);

router.put(
  "/:id",
  participantController.updateParticipant
);

// DELETE PARTICIPANT DATA
router.delete(
  "/:id",
  participantController.deleteParticipantData
);

module.exports = router;