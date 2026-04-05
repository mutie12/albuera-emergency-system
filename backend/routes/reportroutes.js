const express = require("express");
const Report = require("../models/report");
const Notification = require("../models/notification");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all reports (PUBLIC)
router.get("/public", async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 }).lean();
    res.json(reports || []);
  } catch (err) {
    console.error("Get public reports error:", err);
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
});

// Create a report (admin/respondent only)
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "respondent")) {
      return res.status(403).json({ message: "Not authorized to create reports" });
    }

    const { location, emergencyType, description } = req.body;

    if (!location || !emergencyType || !description) {
      return res.status(400).json({ message: "Location, emergency type, and description are required" });
    }

    const report = await Report.create({
      reporterName: req.user.name || "Anonymous",
      reporterId: req.user.id,
      location,
      emergencyType,
      description
    });
    res.json(report);
  } catch (err) {
    console.error("Create report error:", err);
    res.status(500).json({ message: "Server error creating report" });
  }
});

// Get all reports (any authenticated user)
router.get("/", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const reports = await Report.find().sort({ date: -1 }).lean();
    res.json(reports || []);
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ message: "Server error fetching reports" });
  }
});

// Update report status (admin/respondent only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "respondent")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status, action } = req.body;
    
    let updateData = { status };
    
    if (action === "accept" && req.user.role === "respondent") {
      updateData = {
        status: "Responding",
        assignedTo: {
          respondentId: req.user.id,
          respondentName: req.user.name,
          assignedAt: new Date()
        }
      };
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });
    
    if (req.user.role === "respondent") {
      try {
        const admins = await User.find({ role: "admin" }).lean();
        
        const notificationMessage = action === "accept" 
          ? `Respondent ${req.user.name} accepted the emergency: ${report.emergencyType} at ${report.location}`
          : `Respondent ${req.user.name} declined the emergency: ${report.emergencyType} at ${report.location}`;
        
        for (const admin of admins) {
          await Notification.create({
            recipientId: admin._id,
            title: action === "accept" ? "Task Accepted" : "Task Declined",
            message: notificationMessage,
            type: action === "accept" ? "response" : "alert",
            status: "unread"
          });
        }
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }
    }
    
    res.json(report);
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ message: "Server error updating report" });
  }
});

// Assign respondent to report (admin only)
router.patch("/:id/assign", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can assign respondents" });
    }

    const { respondentId, respondentName } = req.body;
    
    if (!respondentId) {
      return res.status(400).json({ message: "Respondent ID is required" });
    }

    if (!respondentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Respondent ID format" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: {
          respondentId,
          respondentName: respondentName || "Unknown Respondent",
          assignedAt: new Date()
        },
        status: "Responding"
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });
    
    try {
      await Notification.create({
        recipientId: respondentId,
        title: "🚨 New Emergency Task Assigned",
        message: `You have been assigned to respond to: ${report.emergencyType} at ${report.location}. Please check the details and respond immediately.`,
        type: "emergency",
        status: "unread"
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }
    
    res.json(report);
  } catch (err) {
    console.error("Assign respondent error:", err);
    res.status(500).json({ message: "Failed to assign respondent: " + err.message });
  }
});

// Get single report
router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ message: "Server error fetching report" });
  }
});

module.exports = router;
