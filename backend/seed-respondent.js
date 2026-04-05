const mongoose = require("mongoose");
// Use non-SRV connection for direct connection
const MONGO_URI = "mongodb://AlbueraESDB:MonkeyD.Luffy12@albueraesdb-shard-00-00.4kmpz5z.mongodb.net:27017,albueraesdb-shard-00-01.4kmpz5z.mongodb.net:27017,albueraesdb-shard-00-02.4kmpz5z.mongodb.net:27017/albuera_ems?ssl=true&replicaSet=atlas-12fq44-shard-0&authSource=admin&retryWrites=true&w=majority";

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  barangay: String,
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function seedRespondent() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if Lourdes Bisoc already exists
    const existingUser = await User.findOne({ username: "lourdes.bisoc" });
    if (existingUser) {
      console.log("✅ Lourdes Bisoc account already exists!");
    } else {
      // Create Lourdes Bisoc respondent account
      const hashedPassword = await bcrypt.hash("lourdes2024", 10);
      
      const lourdes = new User({
        username: "lourdes.bisoc",
        password: hashedPassword,
        name: "Lourdes Bisoc",
        role: "respondent",
        barangay: "Poblacion",
        email: "lourdes.bisoc@albuera.gov.ph",
        phone: "+639123456789",
      });

      await lourdes.save();
      console.log("✅ Lourdes Bisoc respondent account created successfully!");
      console.log("");
      console.log("📋 Account Details:");
      console.log("   Username: lourdes.bisoc");
      console.log("   Password: lourdes2024");
      console.log("   Name: Lourdes Bisoc");
      console.log("   Barangay: Poblacion");
      console.log("   Email: lourdes.bisoc@albuera.gov.ph");
      console.log("   Phone: +639123456789");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedRespondent();
