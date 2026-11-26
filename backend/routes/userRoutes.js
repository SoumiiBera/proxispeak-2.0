const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getUserSettings,
  updateUserSettings,
  getTeamMembers,
  getRegistrationCount,
} = require("../controllers/userController");

router.get("/settings", protect, getUserSettings);
router.put("/settings", protect, updateUserSettings);

// GET TEAM MEMBERS
router.get("/team", protect, getTeamMembers);
router.get("/registration-count", protect, getRegistrationCount);

module.exports = router;