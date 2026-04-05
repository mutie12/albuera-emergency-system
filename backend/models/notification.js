const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipientName: String,
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  senderName: String,
  type: {
    type: String,
    enum: ["assignment", "update", "resolved", "system", "broadcast", "emergency", "resident-message", "resident-emergency", "respondent-message", "respondent-emergency"],
    default: "system"
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report"
  },
  emergencyType: String,
  location: String,
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
