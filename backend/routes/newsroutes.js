const express = require("express");
const News = require("../models/news");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all news (public)
router.get("/", async (req, res) => {
  try {
    const news = await News.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(news || []);
  } catch (err) {
    console.error("Get news error:", err);
    res.status(500).json({ message: "Failed to fetch news", error: err.message });
  }
});

// Get single news
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id).lean();
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (err) {
    console.error("Get news error:", err);
    res.status(500).json({ message: "Server error fetching news", error: err.message });
  }
});

// Create news (admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create news" });
    }

    const { title, content, category, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const news = await News.create({
      title,
      content,
      category: category || "announcement",
      priority: priority || "normal",
      author: {
        id: req.user.id,
        name: req.user.name
      }
    });

    res.json(news);
  } catch (err) {
    console.error("Create news error:", err);
    res.status(500).json({ message: "Server error creating news", error: err.message });
  }
});

// Update news (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update news" });
    }

    const { title, content, category, priority, isActive } = req.body;

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, category, priority, isActive },
      { new: true }
    ).lean();

    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (err) {
    console.error("Update news error:", err);
    res.status(500).json({ message: "Server error updating news", error: err.message });
  }
});

// Delete news (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete news" });
    }

    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    console.error("Delete news error:", err);
    res.status(500).json({ message: "Server error deleting news", error: err.message });
  }
});

module.exports = router;
