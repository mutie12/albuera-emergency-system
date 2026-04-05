const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["announcement", "safety-tip", "update", "alert"],
    default: "announcement"
  },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
