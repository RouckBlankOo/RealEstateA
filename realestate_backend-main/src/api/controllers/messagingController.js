const ChatThread = require("../models/chatThreadModel");
const Message = require("../models/messageModel");
const SupportMessage = require("../models/supportModel");

/**
 * Get all threads (for support dashboard)
 */
exports.getThreads = async (req, res) => {
  try {
    console.log("📋 getThreads called with query:", req.query);
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      if (status === "unassigned") {
        query.status = "unassigned";
      } else {
        query.status = status;
      }
    }
    if (type) query.type = type;

    const threads = await ChatThread.find(query)
      .populate("user", "firstName lastName email avatar phoneNumber")
      .populate("assignedTo", "firstName lastName email")
      .populate("lastMessage.sender", "firstName lastName")
      .sort({ lastActivityAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatThread.countDocuments(query);

    console.log(`✅ Found ${threads.length} threads`);

    // Transform to match frontend expectations
    const transformedThreads = threads.map(thread => {
      try {
        const threadObj = thread.toObject();
        const user = threadObj.user;

        return {
          _id: threadObj._id,
          participants: [
            {
              role: 'user',
              userId: user ? {
                _id: user._id,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email,
                avatar: user.avatar,
                phoneNumber: user.phoneNumber
              } : null
            },
            ...(threadObj.assignedTo ? [{
              role: 'support',
              userId: {
                _id: threadObj.assignedTo._id,
                fullName: `${threadObj.assignedTo.firstName || ''} ${threadObj.assignedTo.lastName || ''}`.trim(),
                email: threadObj.assignedTo.email
              }
            }] : [])
          ],
          type: threadObj.type,
          status: threadObj.status,
          subject: threadObj.subject,
          category: threadObj.category,
          priority: threadObj.priority,
          lastMessage: threadObj.lastMessage ? {
            content: threadObj.lastMessage.text,
            timestamp: threadObj.lastMessage.timestamp,
            type: 'text'
          } : null,
          unreadCount: threadObj.unreadCount ? (threadObj.unreadCount.support || 0) : 0,
          assignedTo: threadObj.assignedTo ? threadObj.assignedTo._id : null,
          createdAt: threadObj.createdAt,
          lastActivityAt: threadObj.lastActivityAt
        };
      } catch (transformError) {
        console.error("❌ Error transforming thread:", transformError);
        // Return basic structure on error
        return {
          _id: thread._id,
          participants: [],
          status: thread.status,
          unreadCount: 0
        };
      }
    });

    res.status(200).json({
      success: true,
      data: transformedThreads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching threads:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get single thread with messages
 */
exports.getThreadById = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await ChatThread.findById(threadId)
      .populate("user", "firstName lastName email avatar phoneNumber")
      .populate("assignedTo", "firstName lastName email");

    if (!thread) {
      return res.status(404).json({ success: false, message: "Thread not found" });
    }

    // Get messages
    const messages = await Message.find({ threadId })
      .populate("sender.userId", "firstName lastName avatar")
      .sort({ createdAt: 1 });

    // Mark messages as read by support
    if (req.user && thread.unreadCount.support > 0) {
      await Message.updateMany(
        { threadId, "sender.role": "user", status: { $ne: "read" } },
        { $set: { status: "read" } }
      );
      thread.unreadCount.support = 0;
      await thread.save();
    }

    res.status(200).json({
      success: true,
      data: {
        thread,
        messages,
      },
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Send message in a thread
 */
exports.sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { type = "text", content } = req.body;
    const userId = req.user._id;

    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: "Thread not found" });
    }

    // Determine sender role
    let senderRole = "user";

    // Check if the sender is the customer (user) of the thread
    const isCustomer = thread.participants && thread.participants.some(p => p.userId.toString() === userId.toString() && p.role === 'user');

    if (!isCustomer && req.user.role && (req.user.role.includes('admin') || req.user.role.includes('support'))) {
      senderRole = req.user.role.includes('admin') ? 'admin' : 'support';
    } else {
      // Fallback to legacy check or default to user
      senderRole = thread.assignedTo && thread.assignedTo.equals(userId) ? "support" : "user";
    }

    // Create message
    const message = new Message({
      threadId,
      sender: {
        userId,
        role: senderRole,
      },
      type,
      content,
      status: "sent",
    });

    await message.save();

    // Update thread
    thread.lastMessage = {
      text: content.text || "Media message",
      sender: userId,
      timestamp: new Date(),
    };
    thread.lastActivityAt = new Date();

    // Update unread count
    if (senderRole === "user") {
      thread.unreadCount.support += 1;
    } else {
      thread.unreadCount.user += 1;
    }

    // Update status
    if (thread.status === "unassigned" && (senderRole === "support" || senderRole === "admin")) {
      thread.status = "active";
    }

    await thread.save();

    // Populate sender info
    await message.populate("sender.userId", "firstName lastName avatar");

    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit to the specific thread room
      io.to(`thread:${threadId}`).emit('message:new', {
        threadId,
        message,
      });

      // Emit thread update to all connected support agents
      io.emit('thread:updated', {
        threadId,
        lastMessage: thread.lastMessage,
        unreadCount: thread.unreadCount,
        lastActivityAt: thread.lastActivityAt,
      });

      // Emit notification to support agents if message is from user
      if (senderRole === "user") {
        io.emit('notification:new', {
          id: message._id,
          type: 'message',
          title: 'New Message',
          body: `${message.sender?.userId?.firstName || 'A user'} sent a new message`,
          threadId,
          createdAt: message.createdAt,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Assign thread to support agent
 */
exports.assignThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { assignedTo } = req.body;

    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: "Thread not found" });
    }

    thread.assignedTo = assignedTo;
    thread.status = "active";
    await thread.save();

    // Create system message
    const systemMessage = new Message({
      threadId,
      sender: {
        userId: req.user._id,
        role: "support",
      },
      type: "system",
      content: {
        systemMessageType: "assigned",
      },
    });
    await systemMessage.save();

    res.status(200).json({
      success: true,
      message: "Thread assigned successfully",
      data: thread,
    });
  } catch (error) {
    console.error("Error assigning thread:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update thread status
 */
exports.updateThreadStatus = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { status } = req.body;

    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: "Thread not found" });
    }

    thread.status = status;
    if (status === "closed") {
      thread.closedAt = new Date();
    }
    await thread.save();

    // Create system message
    const systemMessage = new Message({
      threadId,
      sender: {
        userId: req.user._id,
        role: "support",
      },
      type: "system",
      content: {
        systemMessageType: status === "closed" ? "thread_closed" : "thread_reopened",
      },
    });
    await systemMessage.save();

    res.status(200).json({
      success: true,
      message: "Thread status updated",
      data: thread,
    });
  } catch (error) {
    console.error("Error updating thread status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Create thread from support ticket
 */
exports.createThreadFromTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await SupportMessage.findById(ticketId).populate("user");
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Check if thread already exists for this ticket
    let thread = await ChatThread.findOne({ supportTicket: ticketId });

    if (!thread) {
      // Create new thread
      thread = new ChatThread({
        type: "user_to_support",
        user: ticket.user._id,
        status: "unassigned",
        subject: ticket.content.substring(0, 50),
        supportTicket: ticketId,
        lastMessage: {
          text: ticket.content,
          sender: ticket.user._id,
          timestamp: ticket.createdAt,
        },
        lastActivityAt: ticket.createdAt,
        unreadCount: {
          support: 1,
          user: 0,
        },
      });

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
      });

      await message.save();
    }

    await thread.populate("user", "firstName lastName email avatar");

    res.status(201).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error("Error creating thread from ticket:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get thread stats
 */
exports.getThreadStats = async (req, res) => {
  try {
    const stats = {
      total: await ChatThread.countDocuments(),
      active: await ChatThread.countDocuments({ status: "active" }),
      closed: await ChatThread.countDocuments({ status: "closed" }),
      unassigned: await ChatThread.countDocuments({ status: "unassigned" }),
      open: await ChatThread.countDocuments({ status: "open" }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching thread stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
