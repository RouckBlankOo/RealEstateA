# Messaging API Testing Guide

## 🎯 Testing Overview

The messaging system is now fully operational! Follow this guide to test all the features.

## 📋 Prerequisites

1. **Server Running**: The backend server should be running on port 3000
   ```bash
   cd realestate_backend-main
   node server.js
   ```

2. **User Accounts**: You need at least 2 test user accounts:
   - Regular user account
   - Support/admin account (optional for admin features)

## 🔑 Step 1: Get Authentication Tokens

### Option A: Using Thunder Client / Postman

1. **Login as User 1:**
   ```
   POST http://192.168.100.4:3000/api/auth/login
   Content-Type: application/json

   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

2. Copy the `token` from the response

3. Repeat for User 2 and Support user

### Option B: Check existing users in database

```bash
# Connect to MongoDB and find users
```

## 🧪 Step 2: Manual API Testing

### Test 1: Create Support Thread

**Request:**
```http
POST http://192.168.100.4:3000/api/messages/support/thread
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "category": "general"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Support thread retrieved",
  "data": {
    "_id": "thread_id_here",
    "type": "user_to_support",
    "status": "active",
    "participants": [...]
  }
}
```

### Test 2: Send a Text Message

**Request:**
```http
POST http://192.168.100.4:3000/api/messages/threads/THREAD_ID/messages
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "type": "text",
  "content": {
    "text": "Hello! I need help with a property listing."
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id_here",
    "content": {
      "text": "Hello! I need help with a property listing."
    },
    "status": "sent",
    "createdAt": "2025-12-02T..."
  }
}
```

### Test 3: Get Thread Messages

**Request:**
```http
GET http://192.168.100.4:3000/api/messages/threads/THREAD_ID/messages?limit=20
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "_id": "message_id",
      "content": {...},
      "sender": {...},
      "createdAt": "..."
    }
  ],
  "pagination": {
    "hasMore": false
  }
}
```

### Test 4: Get All User Threads

**Request:**
```http
GET http://192.168.100.4:3000/api/messages/threads?limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "thread_id",
      "lastMessage": {...},
      "unreadCount": 2,
      "messageCount": 15
    }
  ],
  "pagination": {
    "total": 5,
    "hasMore": false
  }
}
```

### Test 5: Mark Thread as Read

**Request:**
```http
POST http://192.168.100.4:3000/api/messages/threads/THREAD_ID/read
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thread marked as read",
  "data": {
    "success": true,
    "unreadCount": 0
  }
}
```

### Test 6: Get Unread Count

**Request:**
```http
GET http://192.168.100.4:3000/api/messages/unread/count
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "threadCount": 2
  }
}
```

### Test 7: Search Messages

**Request:**
```http
GET http://192.168.100.4:3000/api/messages/search?q=property&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "message_id",
      "content": {
        "text": "Looking for a property in downtown"
      }
    }
  ],
  "pagination": {
    "total": 3
  }
}
```

### Test 8: Edit Message

**Request:**
```http
PATCH http://192.168.100.4:3000/api/messages/MESSAGE_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "content": "Updated message text here"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": {
    "_id": "message_id",
    "content": {
      "text": "Updated message text here"
    },
    "isEdited": true,
    "editedAt": "2025-12-02T..."
  }
}
```

### Test 9: Send Image Message

**Request:**
```http
POST http://192.168.100.4:3000/api/messages/threads/THREAD_ID/messages/image
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- image: [select an image file]
- caption: "Check out this property!"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Image sent successfully",
  "data": {
    "type": "image",
    "content": {
      "text": "Check out this property!",
      "mediaUrl": "/uploads/messages/message-123.jpg",
      "fileName": "property.jpg",
      "fileSize": 524288
    }
  }
}
```

### Test 10: Delete Message

**Request:**
```http
DELETE http://192.168.100.4:3000/api/messages/MESSAGE_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## 🔌 Step 3: Test Socket.io Real-time Features

### Using JavaScript Console (Browser or Node.js)

```javascript
// Install socket.io-client first
// npm install socket.io-client

const io = require('socket.io-client');

// Connect with authentication
const socket = io('http://192.168.100.4:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to chat server');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from chat server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Join a thread
socket.emit('thread:join', {
  threadId: 'YOUR_THREAD_ID_HERE'
});

socket.on('thread:joined', (data) => {
  console.log('✅ Joined thread:', data.threadId);
});

// Listen for new messages
socket.on('message:new', (data) => {
  console.log('📨 New message received:', data.message);
});

// Send a message
socket.emit('message:send', {
  threadId: 'YOUR_THREAD_ID_HERE',
  type: 'text',
  content: {
    text: 'Hello from Socket.io!'
  },
  tempId: Date.now().toString()
});

// Listen for message sent confirmation
socket.on('message:sent', (data) => {
  console.log('✅ Message sent:', data.message);
});

// Start typing indicator
socket.emit('typing:start', {
  threadId: 'YOUR_THREAD_ID_HERE'
});

// Listen for typing indicators
socket.on('typing:user', (data) => {
  console.log(`⌨️  User ${data.userId} is typing:`, data.isTyping);
});

// Stop typing indicator
socket.emit('typing:stop', {
  threadId: 'YOUR_THREAD_ID_HERE'
});

// Mark messages as read
socket.emit('message:read', {
  threadId: 'YOUR_THREAD_ID_HERE'
});

// Listen for read receipts
socket.on('messages:read', (data) => {
  console.log(`✅ User ${data.userId} read messages in thread ${data.threadId}`);
});

// Listen for online/offline status
socket.on('user:online', (data) => {
  console.log('🟢 User came online:', data.userId);
});

socket.on('user:offline', (data) => {
  console.log('⚪ User went offline:', data.userId);
});

// Leave thread
socket.emit('thread:leave', {
  threadId: 'YOUR_THREAD_ID_HERE'
});
```

## 🤖 Step 4: Automated Test Script

We've created an automated test script for you:

1. **Edit the script:**
   ```bash
   # Open test-messaging-api.js
   # Set USER1_TOKEN, USER2_TOKEN, SUPPORT_TOKEN at the top
   ```

2. **Run the tests:**
   ```bash
   cd realestate_backend-main
   node test-messaging-api.js
   ```

The script will test:
- ✅ Create support thread
- ✅ Send text messages
- ✅ Get thread messages
- ✅ Get user threads
- ✅ Mark as read
- ✅ Get unread count
- ✅ Search messages
- ✅ Edit messages
- ✅ Support statistics (if support token available)

## 📊 Step 5: Test Support Dashboard Features (Admin/Support Only)

### Get Support Statistics

**Request:**
```http
GET http://192.168.100.4:3000/api/messages/support/stats
Authorization: Bearer SUPPORT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "active": 25,
    "closed": 150,
    "unassigned": 8,
    "highPriority": 5,
    "totalMessages": 1250
  }
}
```

### Assign Thread to Agent

**Request:**
```http
POST http://192.168.100.4:3000/api/messages/threads/THREAD_ID/assign
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "agentId": "AGENT_USER_ID_HERE"
}
```

### Update Thread Status

**Request:**
```http
PATCH http://192.168.100.4:3000/api/messages/threads/THREAD_ID/status
Authorization: Bearer SUPPORT_TOKEN_HERE
Content-Type: application/json

{
  "status": "closed",
  "reason": "Issue resolved successfully"
}
```

## 🐛 Common Issues & Solutions

### Issue: "401 Unauthorized"
**Solution:** 
- Check if your token is valid
- Make sure to include "Bearer " prefix in Authorization header
- Token format: `Authorization: Bearer YOUR_TOKEN`

### Issue: "403 Forbidden - Not a participant"
**Solution:**
- You can only access threads you're a participant in
- Create a new thread first, or use a thread where you're a participant

### Issue: "404 Thread not found"
**Solution:**
- Verify the thread ID is correct
- Use GET /api/messages/threads to see your available threads

### Issue: "Cannot read property 'role' of undefined"
**Solution:**
- Make sure your user account has a `role` field in the database
- User should have role: ["user"] or ["support"] or ["admin"]

### Issue: Socket.io not connecting
**Solution:**
- Check if server is running: `http://192.168.100.4:3000`
- Verify JWT token is valid and not expired
- Check network connectivity to the server

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Socket.io initialized successfully
- [ ] Can login and get JWT token
- [ ] Can create support thread
- [ ] Can send text message
- [ ] Can retrieve messages
- [ ] Can mark thread as read
- [ ] Can get unread count
- [ ] Can search messages
- [ ] Can edit messages
- [ ] Can upload and send images
- [ ] Can delete messages
- [ ] Socket.io connection successful
- [ ] Real-time message delivery works
- [ ] Typing indicators work
- [ ] Read receipts work
- [ ] Online/offline status updates

## 📝 Next Steps After Testing

Once all tests pass:

1. **Frontend Integration**
   - Build React Native chat UI components
   - Implement Socket.io client
   - Add message input with image picker
   - Display typing indicators and read receipts

2. **Support Dashboard**
   - Build web interface for support team
   - Show active conversations
   - Thread assignment interface
   - Statistics dashboard

3. **Enhancements**
   - Push notifications for offline users
   - Message reactions
   - Voice messages
   - Video calls (future feature)

## 📚 Documentation

For complete API documentation, see:
- `MESSAGING_API_DOCUMENTATION.md` - Complete API reference
- `server.js` - Main server configuration
- `src/api/routes/messageRouter.js` - API routes
- `src/api/controllers/messageController.js` - Request handlers
- `src/api/services/messageService.js` - Business logic

---

**Happy Testing! 🚀**

If you encounter any issues, check the server logs for detailed error messages.
