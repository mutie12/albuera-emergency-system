
require("dotenv").config();


const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  role: {
    type: String,
    enum: ["resident", "admin", "respondent"],
    default: "resident"
  }
});

async function seedUser() {
  try {
  
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

   
    const User = mongoose.model("User", userSchema);

    
    const existingUser = await User.findOne({ username: "admin" });
    if (existingUser) {
     
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.findByIdAndUpdate(existingUser._id, { password: hashedPassword });
      console.log("✅ Admin password reset successfully!");
      console.log("  Username: admin");
      console.log("  Password: admin123");
      process.exit(0);
    }


    const hashedPassword = await bcrypt.hash("admin123", 10);

  
    const user = await User.create({
      name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ User created successfully!");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("  Role: admin");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedUser();
