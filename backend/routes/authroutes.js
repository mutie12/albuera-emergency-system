const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// OTP Storage for email verification during registration
const otpStorage = new Map();
const phoneOtpStorage = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Barangay Verification Codes Configuration
// Only residents who provide the correct code for their barangay can register
const BARANGAY_CODES = {
  "Poblacion": "6001",
  "Balugo": "6002",
  "Damula-an": "6003",
  "Antipolo": "6004",
  "Benolho": "6005",
  "Doña Maria (Kangkuirina)": "6006",
  "Mahayag": "6007",
  "Mahayahay": "6008",
  "Salvacion": "6009",
  "San Pedro": "6010",
  "Seguinon": "6011",
  "Sherwood": "6012",
  "Tabgas": "6013",
  "Talisayan": "6014",
  "Tinag-an": "6015",
};

// Get all barangays and their codes (for admin to manage)
router.get("/barangay-codes", auth, (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can view barangay codes" });
  }
  
  const codes = Object.entries(BARANGAY_CODES).map(([barangay, code]) => ({
    barangay,
    code
  }));
  res.json(codes);
});

// Update barangay code (admin only)
router.put("/barangay-codes/:barangay", auth, (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can update barangay codes" });
  }
  
  const { barangay } = req.params;
  const { code } = req.body;
  
  if (BARANGAY_CODES.hasOwnProperty(barangay)) {
    BARANGAY_CODES[barangay] = code;
    res.json({ message: "Barangay code updated successfully", barangay, code });
  } else {
    res.status(404).json({ message: "Barangay not found" });
  }
});

// Email configuration (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password"
  }
});

// Helper function to send OTP email
async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com") {
    console.log("Email not configured - skipping OTP email");
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "Albuera Emergency <your-email@gmail.com>",
      to: email,
      subject: "🔐 Email Verification - Albuera Emergency",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Email Verification</h1>
            <p style="color: #93c5fd; margin-top: 10px;">Albuera Emergency Registration</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <p style="color: #475569; line-height: 1.6;">
              Use the following code to verify your email address during registration:
            </p>
            <div style="background: white; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="color: #64748b; margin: 0 0 12px 0; font-size: 14px;">Your Verification Code</p>
              <p style="color: #1e40af; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;">
              This code expires in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("OTP email send error:", error);
    return false;
  }
}

// Send OTP to email for registration verification
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry
    otpStorage.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    res.json({
      message: emailSent
        ? "Verification code sent to your email"
        : "Email service not configured. Your code is: " + otp,
      emailSent,
      otp: emailSent ? undefined : otp // Show OTP on screen if email fails
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Server error sending verification code" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const stored = otpStorage.get(email);
    
    if (!stored) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // OTP verified successfully
    otpStorage.delete(email);
    res.json({ message: "Email verified successfully", verified: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error verifying code" });
  }
});

// Send OTP to phone for registration verification (simulated - would need SMS service)
router.post("/send-phone-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Validate phone format (Philippines format)
    const phoneRegex = /^(\+63|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format. Use 09xxxxxxxxx or +63xxxxxxxxx" });
    }

    // Check if phone is already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "This phone number is already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry
    phoneOtpStorage.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    // In production, integrate with SMS service like Twilio
    // For now, we'll return the OTP in response (for development/demo)
    console.log(`Phone OTP for ${phone}: ${otp}`);
    
    res.json({
      message: "Verification code sent to your phone",
      otp: otp // In production, remove this - only for demo
    });
  } catch (err) {
    console.error("Send phone OTP error:", err);
    res.status(500).json({ message: "Server error sending verification code" });
  }
});

// Verify phone OTP
router.post("/verify-phone-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone number and verification code are required" });
    }

    const stored = phoneOtpStorage.get(phone);
    
    if (!stored) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (Date.now() > stored.expiresAt) {
      phoneOtpStorage.delete(phone);
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Phone verified successfully
    phoneOtpStorage.delete(phone);
    res.json({ message: "Phone verified successfully", verified: true });
  } catch (err) {
    console.error("Verify phone OTP error:", err);
    res.status(500).json({ message: "Server error verifying code" });
  }
});

// Helper function to send verification email (disabled if no valid credentials)
async function sendVerificationEmail(email, name, verificationCode) {
  // Skip if no email credentials configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com") {
    console.log("Email not configured - skipping verification email");
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "Albuera Emergency <your-email@gmail.com>",
      to: email,
      subject: "📋 Verification Code - Albuera Emergency Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚨 Albuera Emergency</h1>
            <p style="color: #93c5fd; margin-top: 10px;">Barangay Emergency Management System</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome, ${name}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              Thank you for registering with the Albuera Emergency Management System. Your registration is pending approval from our admin team.
            </p>
            <div style="background: white; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="color: #64748b; margin: 0 0 12px 0; font-size: 14px;">Your Verification Code</p>
              <p style="color: #1e40af; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${verificationCode}</p>
            </div>
            <p style="color: #475569; line-height: 1.6;">
              <strong>Important:</strong> Please share this code with the admin for verification. Once approved, you'll receive a confirmation and can login to report emergencies.
            </p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                📍 Barangay Hall, Poblacion, Albuera<br>
                📞 Contact Admin for immediate assistance
              </p>
            </div>
          </div>
          <div style="background: #1e293b; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This is an automated message from Albuera Emergency Management System.
            </p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// Helper function to send approval notification (disabled if no valid credentials)
async function sendApprovalEmail(email, name) {
  // Skip if no email credentials configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com") {
    console.log("Email not configured - skipping approval email");
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "Albuera Emergency <your-email@gmail.com>",
      to: email,
      subject: "✅ Account Approved - Albuera Emergency",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Account Approved!</h1>
            <p style="color: #a7f3d0; margin-top: 10px;">You can now login to the system</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Congratulations, ${name}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              Your account has been approved by the admin. You can now login to the Albuera Emergency Management System to report and track emergencies.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="http://localhost:5173/login" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Login Now
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Stay safe and help keep our community secure!
            </p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Approval email send error:", error);
    return false;
  }
}

// Register (residents and respondents only - no admin registration)
// Residents require valid barangay verification code
// Respondents and admins do not need barangay verification code
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, barangay, barangayCode, email, phone, role, emailVerified, phoneVerified } = req.body;

    // Prevent admin registration
    if (role === "admin") {
      return res.status(403).json({ message: "Admin registration is not allowed" });
    }

    // Name and password are always required
    // Username is required for residents, but optional for respondents (we'll generate one)
    // Barangay is only required for residents, not for respondents/admins
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    // Check if email or phone is verified (at least one required)
    if (!emailVerified && !phoneVerified) {
      return res.status(400).json({ 
        message: "Please verify either your email or phone number to register",
        hint: "At least one verification (email OR phone) is required"
      });
    }

    // If email is provided, it must be verified
    if (email && !emailVerified) {
      return res.status(400).json({ message: "Please verify your email address" });
    }

    // If phone is provided, it must be verified
    if (phone && !phoneVerified) {
      return res.status(400).json({ message: "Please verify your phone number" });
    }

    let userName = username;

    // For residents, username and barangay are required
    if (role === "resident" || !role) {
      if (!userName || !barangay) {
        return res.status(400).json({ message: "Username and barangay are required for residents" });
      }
    }

    // For respondents, generate username if not provided
    if (role === "respondent" && (!userName || userName.trim() === "")) {
      userName = `respondent_${Date.now()}`;
    }

    // Residents registration - no barangay code required
    if (role === "resident" || !role) {
      // Registration is now open without barangay code requirement
    }

    const existingUser = await User.findOne({ username: userName });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Build user data based on role
    const userData = {
      name,
      username: userName,
      password: hashed,
      email,
      phone,
      role: role || "resident",
      status: role === "respondent" ? "approved" : "pending",
      verificationCode
    };

    // Only add barangay-related fields for residents
    if (role === "resident" || !role) {
      userData.barangay = barangay;
      userData.barangayCode = barangayCode || "";
      userData.isBarangayVerified = true;
    }

    await User.create(userData);
    
    // Send verification email if email is provided (residents only)
    let emailSent = false;
    if ((role === "resident" || !role) && email) {
      emailSent = await sendVerificationEmail(email, name, verificationCode);
    }
    
    // For respondents, return success message (admin is adding them)
    if (role === "respondent") {
      return res.json({ 
        message: "Respondent added successfully!",
        success: true
      });
    }
    
    res.json({ 
      message: "Registration successful! Your barangay verification has been confirmed. Please wait for admin approval to login.",
      verificationCode,
      emailSent: emailSent,
      note: email 
        ? "A verification email has been sent to your email address."
        : "Please save your verification code: " + verificationCode + " (share this with admin for approval)"
    });
  } catch (err) {
    console.error("Register error:", err);
    const errorMessage = err.message || "Unknown error";
    res.status(500).json({ 
      message: "Server error during registration",
      error: errorMessage
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("User found:", user.username, "role:", user.role, "status:", user.status);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    // Check if user is approved (for residents)
    if (user.role === "resident" && user.status !== "approved") {
      if (user.status === "pending") {
        return res.status(403).json({ 
          message: "Your account is pending approval. Please wait for admin to verify your registration.",
          status: "pending"
        });
      } else if (user.status === "rejected") {
        return res.status(403).json({ 
          message: "Your registration has been rejected. Please contact the admin.",
          status: "rejected"
        });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    res.json({ token, role: user.role, name: user.name, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get all users (admin only)
router.get("/users", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view all users" });
    }
    
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }
    
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Get all respondents
router.get("/respondents", async (req, res) => {
  try {
    const respondents = await User.find({ role: "respondent" }).select("-password");
    res.json(respondents);
  } catch (err) {
    console.error("Get respondents error:", err);
    res.status(500).json({ message: "Server error fetching respondents" });
  }
});

// Get single user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error fetching user" });
  }
});

// Update user (admin only)
router.put("/users/:id", auth, async (req, res) => {
  // If the user is updating their own profile (not admin), allow limited updates
  const isOwnProfile = req.user.id === req.params.id;
  const isAdmin = req.user.role === "admin";
  
  if (!isAdmin && !isOwnProfile) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }
  
  try {
    const { name, email, phone, barangay, role, station, badgeNumber, vehicleNumber } = req.body;
    
    // Non-admins can update name, email, phone, station, badgeNumber, vehicleNumber
    const updateData = isAdmin 
      ? { name, email, phone, barangay, role, station, badgeNumber, vehicleNumber }
      : { name, email, phone, station, badgeNumber, vehicleNumber };
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// Update user password
router.put("/users/:id/password", auth, async (req, res) => {
  // Users can only update their own password
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: "You can only update your own password" });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // For residents who registered with verification code (no password hash), skip password check
    const isPasswordSet = user.password && user.password.length > 0;
    
    if (isPasswordSet) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }
    
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Server error updating password" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete users" });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

// Create respondent account (admin only - creates ready-to-use account)
router.post("/create-respondent", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create respondent accounts" });
    }
    
    const { name, username, password, barangay, email, phone } = req.body;

    if (!name || !username || !password || !barangay) {
      return res.status(400).json({ message: "Name, username, password, and barangay are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const respondent = await User.create({ 
      name, 
      username, 
      password: hashed, 
      barangay,
      email,
      phone,
      role: "respondent"
    });

    res.json({
      message: "Respondent account created successfully",
      user: {
        id: respondent._id,
        name: respondent.name,
        username: respondent.username,
        barangay: respondent.barangay,
        email: respondent.email,
        phone: respondent.phone,
        role: respondent.role
      }
    });
  } catch (err) {
    console.error("Create respondent error:", err);
    res.status(500).json({ message: "Server error creating respondent account" });
  }
});

// Get pending residents (admin only)
router.get("/pending-residents", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view pending residents" });
    }
    
    const pendingUsers = await User.find({ role: "resident", status: "pending" }).select("-password").sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (err) {
    console.error("Get pending residents error:", err);
    res.status(500).json({ message: "Server error fetching pending residents" });
  }
});

// Approve resident (admin only)
router.post("/approve-resident/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can approve residents" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.role !== "resident") {
      return res.status(400).json({ message: "Only residents can be approved through this endpoint" });
    }

    user.status = "approved";
    await user.save();
    
    // Send approval email if user has email
    if (user.email) {
      await sendApprovalEmail(user.email, user.name);
    }
    
    res.json({ 
      message: "Resident approved successfully", 
      user: { id: user._id, name: user.name, username: user.username },
      emailSent: !!user.email
    });
  } catch (err) {
    console.error("Approve resident error:", err);
    res.status(500).json({ message: "Server error approving resident" });
  }
});

// Reject resident (admin only)
router.post("/reject-resident/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can reject residents" });
    }
    
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.role !== "resident") {
      return res.status(400).json({ message: "Only residents can be rejected through this endpoint" });
    }

    user.status = "rejected";
    await user.save();
    
    res.json({ message: "Resident rejected", user: { id: user._id, name: user.name, username: user.username } });
  } catch (err) {
    console.error("Reject resident error:", err);
    res.status(500).json({ message: "Server error rejecting resident" });
  }
});

// Verify resident with code (admin only - alternative approval method)
router.post("/verify-resident", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can verify residents" });
    }
    
    const { username, verificationCode } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.role !== "resident") {
      return res.status(400).json({ message: "Only residents can be verified" });
    }

    // Make verification code comparison case-insensitive
    if (user.verificationCode && user.verificationCode.toUpperCase() !== verificationCode.toUpperCase()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.status = "approved";
    await user.save();
    
    // Send approval email
    if (user.email) {
      await sendApprovalEmail(user.email, user.name);
    }
    
    res.json({ message: "Resident verified and approved successfully", user: { id: user._id, name: user.name, username: user.username } });
  } catch (err) {
    console.error("Verify resident error:", err);
    res.status(500).json({ message: "Server error verifying resident" });
  }
});

// Send/Resend verification code to resident (admin only)
router.post("/send-verification/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can send verification codes" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.role !== "resident") {
      return res.status(400).json({ message: "Only residents can receive verification codes" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User has no email address" });
    }

    // Generate new verification code if needed
    if (!user.verificationCode) {
      user.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.name, user.verificationCode);
    
    res.json({ 
      message: "Verification code sent successfully",
      email: user.email
    });
  } catch (err) {
    console.error("Send verification error:", err);
    res.status(500).json({ message: "Server error sending verification code" });
  }
});

// Generate/Regenerate verification code for a user (admin only)
router.post("/generate-code/:username", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can generate verification codes" });
    }
    
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Generate new verification code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.verificationCode = newCode;
    await user.save();
    
    res.json({ 
      message: "Verification code generated successfully",
      verificationCode: newCode,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error("Generate code error:", err);
    res.status(500).json({ message: "Server error generating verification code" });
  }
});

module.exports = router;
