// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'listingType'
  },
  listingType: {
    type: String,
    required: true,
    enum: ['Property', 'Vehicle']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  categories: {
    cleanliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ listingId: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 }, { unique: true }); // One review per booking

// Virtual for average category rating
reviewSchema.virtual('averageCategoryRating').get(function() {
  const { cleanliness, communication, accuracy, value } = this.categories;
  return (cleanliness + communication + accuracy + value) / 4;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate that reviewer and reviewee are different
reviewSchema.pre('save', function(next) {
  if (this.reviewer.equals(this.reviewee)) {
    return next(new Error('Reviewer and reviewee cannot be the same person'));
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);