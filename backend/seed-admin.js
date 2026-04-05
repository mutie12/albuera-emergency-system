
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

async function seedAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const User = mongoose.model("User", userSchema);

    const admins = [
      { name: "Administrator", username: "admin", password: "admin123" },
      { name: "Mercy Alga", username: "Mercy.admin", password: "Alga123" },
      { name: "Lovelyn Penserga", username: "Lovelyn.admin", password: "Penserga123" },
      { name: "Mariniel Butlay", username: "Mariniel.admin", password: "Butlay123" },
      
    ];

    for (const admin of admins) {
      const existingUser = await User.findOne({ username: admin.username });
      
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      if (existingUser) {
        await User.findByIdAndUpdate(existingUser._id, { 
          password: hashedPassword,
          name: admin.name,
          role: "admin"
        });
        console.log(`✅ Updated admin: ${admin.username}`);
      } else {
        await User.create({
          name: admin.name,
          username: admin.username,
          password: hashedPassword,
          role: "admin"
        });
        console.log(`✅ Created admin: ${admin.username}`);
      }
    }

    console.log("\n📋 Admin Accounts:");
    console.log("------------------");
    for (const admin of admins) {
      console.log(`  Username: ${admin.username}`);
      console.log(`  Password: ${admin.password}`);
      console.log("");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedAdmins();
