
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: true,
      trim: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderName: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
