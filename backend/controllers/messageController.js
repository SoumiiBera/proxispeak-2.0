
const Message = require("../models/Message");
const User = require("../models/User");

// GET ALL MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load messages",
      error: error.message,
    });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { chatName, text } = req.body;

    if (!chatName || !text || !text.trim()) {
      return res.status(400).json({
        message: "Chat name and message are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const message = await Message.create({
      chatName,
      sender: user._id,
      senderName: user.name,
      text: text.trim(),
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};
