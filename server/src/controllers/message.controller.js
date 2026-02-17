const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        const pageSize = 20; // Default page size
        const page = Number(req.query.pageNumber) || 1;

        // Search functionality
        const keyword = req.query.search
            ? {
                content: { $regex: req.query.search, $options: "i" },
            }
            : {};

        const count = await Message.countDocuments({ chat: req.params.chatId, ...keyword });
        const messages = await Message.find({ chat: req.params.chatId, ...keyword })
            .populate("sender", "name pic email")
            .populate("chat")
            .sort({ createdAt: -1 }) // Get latest first for pagination
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Reverse to show in correct order
        res.json({ messages: messages.reverse(), page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Delete Message
//@route           DELETE /api/message/:id
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        // Check if user is sender
        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You can't delete this message");
        }

        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Message Removed" });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage, deleteMessage };
