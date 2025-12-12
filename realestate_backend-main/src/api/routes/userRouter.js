const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const auth = require("../middleware/auth");
const { upload } = require("../utils/multer");

// Complete Profile Route (handles avatar + full info)
router.post(
  "/complete-profile",
  auth,
  upload.single("avatar"),
  userCtrl.completeProfile
);

// Profile management
router.get('/profile', auth, userCtrl.getProfile);          // GET profile
router.put('/profile', auth, userCtrl.updateBasicProfile);  // Basic info only
router.put('/preferences', auth, userCtrl.updatePreferences);  // Preferences only
router.post(
  '/upload-avatar',
  auth,
  upload.single('avatar'),
  userCtrl.uploadAvatar
);  // Avatar only

// Listings management - separated by type
router.get('/listings/properties', auth, userCtrl.getUserPropertyListings);
router.get('/listings/vehicles', auth, userCtrl.getUserVehicleListings);

// Favorites system - separated by type
router.get('/favorites/properties', auth, userCtrl.getFavoriteProperties);
router.get('/favorites/vehicles', auth, userCtrl.getFavoriteVehicles);
router.get('/favorites', auth, userCtrl.getAllFavorites);

router.post('/favorites/properties/:propertyId', auth, userCtrl.addFavoriteProperty);
router.post('/favorites/vehicles/:vehicleId', auth, userCtrl.addFavoriteVehicle);

router.delete('/favorites/properties/:propertyId', auth, userCtrl.removeFavoriteProperty);
router.delete('/favorites/vehicles/:vehicleId', auth, userCtrl.removeFavoriteVehicle);

module.exports = router;