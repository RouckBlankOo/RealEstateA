const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  isFromUser: {
    type: Boolean,
    required: true,
    default: true
  },
  
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number
  }],
  
  metadata: {
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  deliveredAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true
});

// Indexes for performance
supportMessageSchema.index({ conversationId: 1, createdAt: -1 });
supportMessageSchema.index({ senderId: 1 });
supportMessageSchema.index({ status: 1 });
supportMessageSchema.index({ createdAt: -1 });

// Update message status
supportMessageSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

supportMessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Pre-save hook to update conversation's lastMessage
supportMessageSchema.post('save', async function(doc) {
  try {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(doc.conversationId, {
      lastMessage: {
        text: doc.text,
        senderId: doc.senderId,
        timestamp: doc.createdAt,
        isFromUser: doc.isFromUser
      },
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating conversation lastMessage:', error);
  }
});

// Use a different model name to avoid conflict with old SupportMessage
// Safely export model to avoid OverwriteModelError when files are re-required
module.exports = mongoose.models.SupportMessageV2 || mongoose.model('SupportMessageV2', supportMessageSchema);
