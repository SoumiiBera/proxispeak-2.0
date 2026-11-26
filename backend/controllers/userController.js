
const User = require("../models/User");
const RegistrationCounter = require("../models/RegistrationCounter");

// GET USER SETTINGS
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      notifications: {
        messages: user.notifications.messages,
        meetings: user.notifications.meetings,
        updates: user.notifications.updates,
      },
      privacy: {
        onlineStatus: user.privacy.showOnlineStatus,
        profileVisibility: user.privacy.profileVisibility,
      },
      theme: user.theme,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get settings",
      error: error.message,
    });
  }
};

// UPDATE USER SETTINGS
exports.updateUserSettings = async (req, res) => {
  try {
    const { profile, notifications, privacy, theme } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (profile) {
      if (profile.name !== undefined) {
        user.name = profile.name;
      }

      if (profile.role !== undefined) {
        user.role = profile.role;
      }
    }

    if (notifications) {
      if (notifications.messages !== undefined) {
        user.notifications.messages = notifications.messages;
      }

      if (notifications.meetings !== undefined) {
        user.notifications.meetings = notifications.meetings;
      }

      if (notifications.updates !== undefined) {
        user.notifications.updates = notifications.updates;
      }
    }

    if (privacy) {
      if (privacy.onlineStatus !== undefined) {
        user.privacy.showOnlineStatus = privacy.onlineStatus;
      }

      if (privacy.profileVisibility !== undefined) {
        user.privacy.profileVisibility = privacy.profileVisibility;
      }
    }

    if (theme !== undefined) {
      const selectedTheme = theme.toLowerCase();

      if (!["light", "dark", "system"].includes(selectedTheme)) {
        return res.status(400).json({
          message: "Invalid theme",
        });
      }

      user.theme = selectedTheme;
    }

    await user.save();

    res.json({
      message: "Settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

// GET ALL TEAM MEMBERS
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await User.find()
      .select("name email role createdAt");

    res.json(members);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load team members",
      error: error.message,
    });
  }
};
// GET TOTAL NEW REGISTRATIONS
exports.getRegistrationCount = async (req, res) => {
  try {
    const counter = await RegistrationCounter.findOne();

    res.json({
      total: counter ? counter.total : 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get registration count",
      error: error.message,
    });
  }
};