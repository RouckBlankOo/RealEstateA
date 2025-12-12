const { body, param, query, validationResult } = require("express-validator");

/**
 * Validation middleware for message endpoints
 */

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Create thread validation
exports.validateCreateThread = [
  body("participantIds")
    .optional()
    .isArray()
    .withMessage("participantIds must be an array"),
  body("participantIds.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid participant ID"),
  body("type")
    .optional()
    .isIn(["user_to_user", "user_to_support", "group"])
    .withMessage("Invalid thread type"),
  body("subject")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Subject must not exceed 200 characters"),
  body("category")
    .optional()
    .isIn([
      "general",
      "property_inquiry",
      "vehicle_inquiry",
      "booking",
      "payment",
      "technical",
      "other",
    ])
    .withMessage("Invalid category"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),
  handleValidationErrors,
];

// Support thread validation
exports.validateSupportThread = [
  body("category")
    .optional()
    .isIn([
      "general",
      "property_inquiry",
      "vehicle_inquiry",
      "booking",
      "payment",
      "technical",
      "other",
    ])
    .withMessage("Invalid category"),
  handleValidationErrors,
];

// Send message validation
exports.validateSendMessage = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
  body("type")
    .optional()
    .isIn(["text", "image", "file", "system"])
    .withMessage("Invalid message type"),
  body("content").notEmpty().withMessage("Content is required"),
  body("content.text")
    .if(body("type").equals("text"))
    .trim()
    .notEmpty()
    .withMessage("Text content is required for text messages")
    .isLength({ max: 5000 })
    .withMessage("Message text must not exceed 5000 characters"),
  body("replyTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid reply message ID"),
  handleValidationErrors,
];

// Thread ID validation
exports.validateThreadId = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
  handleValidationErrors,
];

// Message ID validation
exports.validateMessageId = [
  param("messageId").isMongoId().withMessage("Invalid message ID"),
  handleValidationErrors,
];

// Get threads validation
exports.validateGetThreads = [
  query("type")
    .optional()
    .isIn(["user_to_user", "user_to_support", "group"])
    .withMessage("Invalid thread type"),
  query("status")
    .optional()
    .custom((value) => {
      const statuses = value.split(",");
      const validStatuses = ["active", "closed", "archived"];
      return statuses.every((s) => validStatuses.includes(s));
    })
    .withMessage("Invalid status value"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("skip")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Skip must be a non-negative integer"),
  handleValidationErrors,
];

// Get messages validation
exports.validateGetMessages = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("before").optional().isMongoId().withMessage("Invalid before cursor"),
  query("after").optional().isMongoId().withMessage("Invalid after cursor"),
  handleValidationErrors,
];

// Update thread status validation
exports.validateUpdateThreadStatus = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
  body("status")
    .isIn(["active", "closed", "archived"])
    .withMessage("Invalid status"),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason must not exceed 500 characters"),
  handleValidationErrors,
];

// Assign thread validation
exports.validateAssignThread = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
  body("agentId").isMongoId().withMessage("Invalid agent ID"),
  handleValidationErrors,
];

// Search messages validation
exports.validateSearchMessages = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("skip")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Skip must be a non-negative integer"),
  handleValidationErrors,
];

// Edit message validation
exports.validateEditMessage = [
  param("messageId").isMongoId().withMessage("Invalid message ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 5000 })
    .withMessage("Content must not exceed 5000 characters"),
  handleValidationErrors,
];
