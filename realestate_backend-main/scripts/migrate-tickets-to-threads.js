/**
 * Migration Script: Convert Support Tickets to Chat Threads
 * 
 * This script converts existing support tickets (SupportMessage) into
 * chat threads (ChatThread) with their corresponding messages.
 * 
 * Usage: node scripts/migrate-tickets-to-threads.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/api/models/userModel");
const SupportMessage = require("../src/api/models/supportModel");
const ChatThread = require("../src/api/models/chatThreadModel");
const Message = require("../src/api/models/messageModel");

async function migrateTicketsToThreads() {
  try {
    // Connect to database
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/realestate";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all support tickets
    const tickets = await SupportMessage.find().populate("user").sort({ createdAt: 1 });
    console.log(`\n📊 Found ${tickets.length} support tickets to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const ticket of tickets) {
      // Check if thread already exists for this ticket
      const existingThread = await ChatThread.findOne({ supportTicket: ticket._id });
      
      if (existingThread) {
        console.log(`⏭️  Skipping ticket ${ticket._id} - thread already exists`);
        skipped++;
        continue;
      }

      // Determine initial status
      let status = "unassigned";
      if (ticket.status === "closed") {
        status = "closed";
      } else if (ticket.status === "pending" || ticket.isRead) {
        status = "active";
      }

      // Create chat thread
      const thread = new ChatThread({
        type: "user_to_support",
        user: ticket.user._id,
        status,
        subject: ticket.content.substring(0, 50) + (ticket.content.length > 50 ? "..." : ""),
        category: "general",
        supportTicket: ticket._id,
        lastMessage: {
          text: ticket.content,
          sender: ticket.user._id,
          timestamp: ticket.createdAt,
        },
        lastActivityAt: ticket.createdAt,
        unreadCount: {
          support: ticket.isRead ? 0 : 1,
          user: 0,
        },
        createdAt: ticket.createdAt,
      });

      if (status === "closed") {
        thread.closedAt = ticket.updatedAt || ticket.createdAt;
      }

      await thread.save();

      // Create initial message in thread
      const message = new Message({
        threadId: thread._id,
        sender: {
          userId: ticket.user._id,
          role: "user",
        },
        type: "text",
        content: {
          text: ticket.content,
        },
        status: ticket.isRead ? "read" : "sent",
        createdAt: ticket.createdAt,
      });

      await message.save();

      console.log(`✅ Migrated ticket ${ticket._id} → thread ${thread._id} (${status})`);
      migrated++;
    }

    // Show final stats
    console.log("\n" + "=".repeat(60));
    console.log("📈 MIGRATION SUMMARY:");
    console.log("=".repeat(60));
    console.log(`✅ Migrated: ${migrated} tickets`);
    console.log(`⏭️  Skipped: ${skipped} tickets (already migrated)`);
    console.log(`📊 Total threads in database: ${await ChatThread.countDocuments()}`);

    // Show thread stats
    const stats = {
      unassigned: await ChatThread.countDocuments({ status: "unassigned" }),
      active: await ChatThread.countDocuments({ status: "active" }),
      closed: await ChatThread.countDocuments({ status: "closed" }),
    };

    console.log("\n📊 Thread Status Breakdown:");
    console.log(`   Unassigned: ${stats.unassigned}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Closed: ${stats.closed}`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("\n✅ Migration complete! Database connection closed.");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

// Run migration
migrateTicketsToThreads();
