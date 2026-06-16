const express = require("express");
const router = express.Router();
const controller = require("../controllers/job-controller");

router.post("/", controller.createJob);
router.get("/match/:participantId", controller.getJobMatches);
router.get("/:eventId", controller.getJobsByEvent);

module.exports = router;