const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/user");

const router = express.Router();

// Get notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const notifications = await Notification.find({ recipientId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications || []);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// Get messages sent by resident to admin
router.get("/sent/:userId", async (req, res) => {
  try {
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Find notifications where the user is the sender (sent to admin)
    const messages = await Notification.find({ 
      senderId: req.params.userId,
      type: { $in: ["resident-message", "resident-emergency"] }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(messages || []);
  } catch (err) {
    console.error("Get sent messages error:", err);
    res.status(500).json({ message: "Server error fetching sent messages" });
  }
});

// Get unread count
router.get("/unread/:userId", async (req, res) => {
  try {
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const count = await Notification.countDocuments({ 
      recipientId: req.params.userId,
      status: "unread"
    });
    res.json({ count });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Server error fetching unread count" });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    ).lean();
    res.json(notification);
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error marking notification" });
  }
});

// Mark all as read
router.patch("/read-all/:userId", async (req, res) => {
  try {
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    await Notification.updateMany(
      { recipientId: req.params.userId, status: "unread" },
      { status: "read" }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ message: "Server error marking all notifications" });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Server error deleting notification" });
  }
});

// Create assignment notification
router.post("/assignment", async (req, res) => {
  try {
    const { respondentId, respondentName, adminId, adminName, reportId, emergencyType, location } = req.body;

    if (!respondentId) {
      return res.status(400).json({ message: "Respondent ID is required" });
    }

    const notification = await Notification.create({
      recipientId: respondentId,
      recipientName,
      senderId: adminId,
      senderName: adminName,
      type: "assignment",
      title: "New Emergency Assignment",
      message: `You have been assigned to respond to a ${emergencyType || "emergency"} at ${location || "unknown location"}.`,
      reportId,
      emergencyType,
      location
    });

    res.json(notification);
  } catch (err) {
    console.error("Create assignment notification error:", err);
    res.status(500).json({ message: "Server error creating notification", error: err.message });
  }
});

// Send custom message to respondent (admin only)
router.post("/message", async (req, res) => {
  try {
    const { respondentId, recipientName, adminId, adminName, subject, message } = req.body;

    if (!respondentId || !subject || !message) {
      return res.status(400).json({ message: "Respondent ID, subject, and message are required" });
    }

    const notification = await Notification.create({
      recipientId: respondentId,
      recipientName,
      senderId: adminId,
      senderName: adminName,
      type: "message",
      title: subject,
      message: message
    });

    res.json(notification);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error sending message", error: err.message });
  }
});

// Broadcast message to all respondents (admin only)
router.post("/broadcast", async (req, res) => {
  try {
    const { adminId, adminName, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const respondents = await User.find({ role: "respondent" }).lean();
    
    if (respondents.length === 0) {
      return res.json({ message: "No respondents found", count: 0 });
    }
    
    const notifications = await Promise.all(
      respondents.map(r => 
        Notification.create({
          recipientId: r._id,
          recipientName: r.name,
          senderId: adminId,
          senderName: adminName,
          type: "broadcast",
          title: subject,
          message: message
        })
      )
    );

    res.json({ 
      message: `Message sent to ${notifications.length} respondents`,
      count: notifications.length 
    });
  } catch (err) {
    console.error("Broadcast message error:", err);
    res.status(500).json({ message: "Server error broadcasting message", error: err.message });
  }
});

// Send emergency alert to all residents (SMS + Email + In-app)
router.post("/emergency-alert", async (req, res) => {
  try {
    const { adminId, adminName, alertType, title, message, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    // Get all residents
    const residents = await User.find({ role: "resident" }).lean();
    
    // Create in-app notifications for all users (residents and respondents)
    const allUsers = await User.find({ role: { $in: ["resident", "respondent"] } }).lean();
    
    if (allUsers.length === 0) {
      return res.json({ message: "No users found", count: 0 });
    }
    
    const notifications = await Promise.all(
      allUsers.map(u => 
        Notification.create({
          recipientId: u._id,
          recipientName: u.name,
          senderId: adminId,
          senderName: adminName,
          type: "emergency",
          title: title,
          message: message,
          status: "unread"
        })
      )
    );

    res.json({ 
      message: `Emergency alert sent to ${notifications.length} users`,
      count: notifications.length 
    });
  } catch (err) {
    console.error("Emergency alert error:", err);
    res.status(500).json({ message: "Server error sending emergency alert", error: err.message });
  }
});

// Send message from resident to admin
router.post("/resident-message", async (req, res) => {
  try {
    const { residentId, residentName, subject, message, messageType } = req.body;

    if (!residentId || !message) {
      return res.status(400).json({ message: "Resident ID and message are required" });
    }

    // Get all admins
    const admins = await User.find({ role: "admin" }).lean();
    
    if (admins.length === 0) {
      return res.status(404).json({ message: "No admin found" });
    }

    // Determine notification type based on messageType
    const notificationType = messageType === "emergency" ? "resident-emergency" : "resident-message";

    const notifications = await Promise.all(
      admins.map(admin =>
        Notification.create({
          recipientId: admin._id,
          recipientName: admin.name,
          senderId: residentId,
          senderName: residentName || "Resident",
          type: notificationType,
          title: subject || (messageType === "emergency" ? "Emergency Report from Resident" : "Message from Resident"),
          message: message,
          status: "unread"
        })
      )
    );

    res.json({ 
      message: `Message sent to ${notifications.length} admins`,
      count: notifications.length 
    });
  } catch (err) {
    console.error("Resident message error:", err);
    res.status(500).json({ message: "Server error sending resident message", error: err.message });
  }
});

// Send message from respondent to admin
router.post("/respondent-message", async (req, res) => {
  try {
    const { respondentId, respondentName, subject, message, messageType } = req.body;

    if (!respondentId || !message) {
      return res.status(400).json({ message: "Respondent ID and message are required" });
    }

    // Get all admins
    const admins = await User.find({ role: "admin" }).lean();
    
    if (admins.length === 0) {
      return res.status(404).json({ message: "No admin found" });
    }

    // Determine notification type based on messageType
    const notificationType = messageType === "emergency" ? "respondent-emergency" : "respondent-message";

    const notifications = await Promise.all(
      admins.map(admin =>
        Notification.create({
          recipientId: admin._id,
          recipientName: admin.name,
          senderId: respondentId,
          senderName: respondentName || "Respondent",
          type: notificationType,
          title: subject || (messageType === "emergency" ? "Emergency Report from Respondent" : "Message from Respondent"),
          message: message,
          status: "unread"
        })
      )
    );

    res.json({ 
      message: `Message sent to ${notifications.length} admins`,
      count: notifications.length 
    });
  } catch (err) {
    console.error("Respondent message error:", err);
    res.status(500).json({ message: "Server error sending respondent message", error: err.message });
  }
});

module.exports = router;
