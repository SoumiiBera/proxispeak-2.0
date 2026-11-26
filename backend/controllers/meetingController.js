
const Meeting = require("../models/Meeting");
const User = require("../models/User");

// GET ALL MEETINGS
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load meetings",
      error: error.message,
    });
  }
};

// CREATE MEETING
exports.createMeeting = async (req, res) => {
  try {
    const { title, date, time, type } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Meeting title is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      date: date || "To be decided",
      time: time || "To be decided",
      type: type || "Team Meeting",
      status: "Scheduled",
      createdBy: user._id,
    });

    res.status(201).json({
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create meeting",
      error: error.message,
    });
  }
};

// UPDATE MEETING
exports.updateMeeting = async (req, res) => {
  try {
    const { title, date, time, type } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Meeting title is required",
      });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        date: date || "To be decided",
        time: time || "To be decided",
        type: type || "Team Meeting",
      },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json({
      message: "Meeting updated successfully",
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update meeting",
      error: error.message,
    });
  }
};

// DELETE MEETING
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json({
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete meeting",
      error: error.message,
    });
  }
};
