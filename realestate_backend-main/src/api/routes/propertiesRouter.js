const router = require("express").Router();
const propertiesCtrl = require("../controllers/propertiesController");
const auth = require("../middleware/auth");
const { uploadPropertyMedia } = require("../utils/multer");

// Property Search/Filter Routes (MUST be before /:id routes to avoid conflicts)
router.get("/search", propertiesCtrl.searchProperties);

// Get authenticated user's properties (MUST be before /:id route)
router.get("/my-properties", auth, propertiesCtrl.getUserProperties);

// Property Registration/Creation Routes
router.post("/", 
  auth, 
  uploadPropertyMedia, 
  propertiesCtrl.parseFormData,  // Add this middleware
  propertiesCtrl.createProperty
);

router.get("/:id", propertiesCtrl.getProperty);

router.put("/:id", 
  auth, 
  uploadPropertyMedia,
  propertiesCtrl.parseFormData,  // Add this middleware
  propertiesCtrl.updateProperty
);

router.delete("/:id", auth, propertiesCtrl.deleteProperty);

// Property Media Management Routes
router.post("/:id/media", 
  auth, 
  uploadPropertyMedia,
  propertiesCtrl.parseFormData,  // Add this middleware for consistency
  propertiesCtrl.uploadMedia
);

router.delete("/:id/media/:mediaId", auth, propertiesCtrl.deleteMedia);
router.get("/:id/media-info", auth, propertiesCtrl.getMediaInfo);

router.put("/:id/media/:mediaId", 
  auth, 
  uploadPropertyMedia,
  propertiesCtrl.parseFormData,  // Add this middleware
  propertiesCtrl.replaceMedia
);

router.delete("/:id/media-bulk", auth, propertiesCtrl.bulkDeleteMedia);

// Property Interaction Routes
router.post("/:id/like", auth, propertiesCtrl.likeProperty);
router.delete("/:id/like", auth, propertiesCtrl.unlikeProperty);

// Property Availability Management
router.put("/:id/availability", auth, propertiesCtrl.updateAvailability);

module.exports = router;