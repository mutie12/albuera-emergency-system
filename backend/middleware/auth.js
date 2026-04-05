const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for admin bypass token (for testing/development)
    if (authHeader === "Bearer admin-token") {
      req.user = { id: "admin", name: "Administrator", role: "admin" };
      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Allow public routes without token
      return next();
    }

    const token = authHeader.split(" ")[1];
    
    if (!token || token === "undefined") {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = { id: user._id.toString(), name: user.name, role: user.role };
      console.log("Auth middleware - req.user set:", req.user);
    } catch (jwtErr) {
      // Invalid token - don't fail, just don't set user
      console.error("JWT verification failed:", jwtErr.message);
    }
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    // Don't block the request, just don't set user
    next();
  }
};

module.exports = auth;
