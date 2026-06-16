const express = require("express");
const router = express.Router();
const controller = require("../controllers/message-controller");

// send
router.post("/", controller.sendMessage);

router.get("/conversations/:userId", controller.getConversations);

router.put("/read/:user1/:user2", controller.markAsRead);

router.get("/:user1/:user2", controller.getMessages);

module.exports = router;