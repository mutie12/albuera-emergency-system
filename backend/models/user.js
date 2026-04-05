const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  barangay: { type: String, required: false }, // Not required for respondents/admins
  barangayCode: { type: String }, // Verification code for barangay (optional)
  isBarangayVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["resident", "admin", "respondent"],
    default: "resident"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  verificationCode: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
