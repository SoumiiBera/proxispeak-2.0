
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      default: "To be decided",
    },

    time: {
      type: String,
      default: "To be decided",
    },

    type: {
      type: String,
      default: "Team Meeting",
    },

    status: {
      type: String,
      default: "Scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meeting", meetingSchema);

