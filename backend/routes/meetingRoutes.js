
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} = require("../controllers/meetingController");

router.get("/", protect, getMeetings);
router.post("/", protect, createMeeting);
router.put("/:id", protect, updateMeeting);
router.delete("/:id", protect, deleteMeeting);

module.exports = router;
