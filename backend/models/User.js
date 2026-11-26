
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      default: "Team Member",
    },

    notifications: {
      email: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      meetings: { type: Boolean, default: true },
      updates: { type: Boolean, default: false },
    },

    privacy: {
      showOnlineStatus: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
      profileVisibility: { type: Boolean, default: true },
    },

    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
