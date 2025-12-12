const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'support'],
      required: true
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date,
      default: null
    }
  }],
  
  lastMessage: {
    text: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    isFromUser: Boolean
  },
  
  status: {
    type: String,
    enum: ['open', 'active', 'closed', 'resolved'],
    default: 'open'
  },
  
  subject: {
    type: String,
    default: 'Support Request'
  },
  
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'feature', 'bug', 'other'],
    default: 'general'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  metadata: {
    userAgent: String,
    platform: String,
    appVersion: String,
    deviceInfo: String
  },
  
  tags: [String],
  
  closedAt: Date,
  resolvedAt: Date,
  
}, {
  timestamps: true
});

// Indexes for performance
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ status: 1, updatedAt: -1 });
conversationSchema.index({ assignedTo: 1, status: 1 });
conversationSchema.index({ createdAt: -1 });

// Virtual for getting user participant
conversationSchema.virtual('userParticipant').get(function() {
  return this.participants.find(p => p.role === 'user');
});

// Virtual for getting support participant
conversationSchema.virtual('supportParticipant').get(function() {
  return this.participants.find(p => p.role === 'support');
});

conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Conversation', conversationSchema);
