const express = require("express");
const router = express.Router();

const {
  addInterest,
  getJobInterests
} = require("../controllers/jobInterestController");

router.post("/", addInterest);
router.get("/:jobId", getJobInterests);

module.exports = router;