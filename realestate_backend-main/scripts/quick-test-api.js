/**
 * Simple test to verify messaging API works on localhost
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
    console.log(`   Token: ${token.substring(0, 30)}...`);

    // Test getting threads
    console.log("\n📊 Fetching threads...");
    const threadsRes = await axios.get(`${API_URL}/messages/threads`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Found ${threadsRes.data.data.length} threads`);
    console.log(`   Total: ${threadsRes.data.pagination.total}`);

    // Test thread stats
    console.log("\n📈 Fetching stats...");
    const statsRes = await axios.get(`${API_URL}/messages/threads/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Stats:", statsRes.data.data);

    console.log("\n🎉 ALL TESTS PASSED!");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testAPI();
