const express = require("express");
const router = express.Router();
const controller = require("../controllers/company-dashboard-controller");

router.get("/:companyId", controller.getCompanyDashboard);

module.exports = router;