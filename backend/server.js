// Load environment variables (MUST be first)
require("dotenv").config();

// Use Google DNS to resolve MongoDB Atlas hostnames
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
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
