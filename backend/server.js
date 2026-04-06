// Load environment variables (MUST be first)
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authroutes");
const reportRoutes = require("./routes/reportroutes");
const notificationRoutes = require("./routes/notificationroutes");
const newsRoutes = require("./routes/newsroutes");

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    'https://albuera-emergency-frontend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/news", newsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Albuera EMS Backend is running");
});

// Health check for Render
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to create default admin (remove in production)
app.get("/setup-admin", async (req, res) => {
  try {
    const User = require("./models/user");
    const bcrypt = require("bcryptjs");
    
    const existingAdmin = await User.findOne({ username: "admin" });
    
    if (existingAdmin) {
      return res.json({ message: "Admin already exists", username: existingAdmin.username });
    }
    
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      status: "approved"
    });
    
    res.json({ message: "Admin created", username: "admin", password: "admin123" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
