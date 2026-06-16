const express = require("express");
const router = express.Router();

const {
  getPlatformDashboard,
} = require("../controllers/platform-dashboard-controller");

router.get("/", getPlatformDashboard);

module.exports = router;