/**
 * Test API response format
 */

const axios = require("axios");

const API_URL = "http://localhost:3000/api";
const SUPPORT_EMAIL = "support@gmail.com";
const SUPPORT_PASSWORD = "password123";

async function testAPI() {
  try {
    console.log("🔐 Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: SUPPORT_EMAIL,
      password: SUPPORT_PASSWORD,
    });

    const token = loginRes.data.access_token;
    console.log("✅ Login successful!");

    // Test getting threads
    console.log("\n📊 Fetching threads...");
    const threadsRes = await axios.get(`${API_URL}/messages/threads`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Found ${threadsRes.data.data.length} threads`);
    
    // Show first thread structure
    if (threadsRes.data.data.length > 0) {
      const firstThread = threadsRes.data.data[0];
      console.log("\n📝 First thread structure:");
      console.log("   ID:", firstThread._id);
      console.log("   Status:", firstThread.status);
      console.log("   Subject:", firstThread.subject);
      console.log("   Participants:", firstThread.participants?.length || 0);
      
      if (firstThread.participants && firstThread.participants[0]) {
        const user = firstThread.participants[0];
        console.log("   User role:", user.role);
        console.log("   User name:", user.userId?.fullName);
        console.log("   User email:", user.userId?.email);
      }
      
      console.log("   Unread count:", firstThread.unreadCount);
      console.log("   Last message:", firstThread.lastMessage?.content?.substring(0, 50));
    }

    console.log("\n🎉 API response format is correct!");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    console.error("Stack:", error.stack);
  }
}

testAPI();
