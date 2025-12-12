const SupportMessage = require("../models/supportModel");
const logger = require("../utils/logger");

exports.createSupportMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;
        const email = req.user.email;

        if (!content) {
            return res.status(400).json({ success: false, message: "Message content is required" });
        }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map((file) => `/uploads/support/attachments/${file.filename}`);
        }

        const message = new SupportMessage({
            user: userId,
            email,
            content,
            attachments,
        });

        await message.save();

        res.status(201).json({
            success: true,
            message: "Support message sent successfully",
            data: message,
        });
    } catch (error) {
        logger.error("Error creating support message:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getSupportMessages = async (req, res) => {
    try {
        const messages = await SupportMessage.find()
            .populate("user", "firstName lastName email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        logger.error("Error fetching support messages:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getSupportMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await SupportMessage.findById(id).populate("user", "firstName lastName email avatar");

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Mark as read if viewed by supervisor (assuming this endpoint is for supervisor)
        // In a real app we might want to check role
        if (!message.isRead) {
            message.isRead = true;
            await message.save();
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        logger.error("Error fetching support message:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
