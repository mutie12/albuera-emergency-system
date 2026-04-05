const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterName: String,
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  location: { type: String, required: true },
  emergencyType: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Responding", "Resolved"],
    default: "Pending"
  },
  assignedTo: {
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    respondentName: String,
    assignedAt: Date
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);
