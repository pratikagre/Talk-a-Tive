const express = require("express");
const {
    allMessages,
    sendMessage,
    deleteMessage,
} = require("../controllers/message.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:id").delete(protect, deleteMessage);

module.exports = router;
