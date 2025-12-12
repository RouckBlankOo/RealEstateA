/**
 * Direct database test - bypassing API
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/api/models/userModel");
const ChatThread = require("../src/api/models/chatThreadModel");
const Message = require("../src/api/models/messageModel");

async function testDatabase() {
  try {
    console.log("🔌 Connecting to database...");
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/realestate";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    console.log("\n📊 Checking ChatThreads...");
    const threads = await ChatThread.find()
      .populate("user", "firstName lastName email")
      .limit(5);
    
    console.log(`✅ Found ${threads.length} threads`);
    threads.forEach(thread => {
      console.log(`   - ${thread.user?.firstName} ${thread.user?.lastName}: ${thread.subject} (${thread.status})`);
    });

    console.log("\n📨 Checking Messages...");
    const messages = await Message.find().limit(5);
    console.log(`✅ Found ${messages.length} messages`);

    console.log("\n📈 Thread Stats:");
    const stats = {
      total: await ChatThread.countDocuments(),
      active: await ChatThread.countDocuments({ status: "active" }),
      closed: await ChatThread.countDocuments({ status: "closed" }),
      unassigned: await ChatThread.countDocuments({ status: "unassigned" }),
    };
    console.log(stats);

    await mongoose.connection.close();
    console.log("\n✅ Database test complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDatabase();
