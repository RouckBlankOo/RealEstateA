const router = require("express").Router();
const vehiclesCtrl = require("../controllers/vehiclesController");
const auth = require("../middleware/auth");
const { upload } = require("../utils/multer");

// Vehicle Search/Availability Routes (must come before /:id routes)
router.get("/search", vehiclesCtrl.searchVehicles);
router.get("/my-vehicles", auth, vehiclesCtrl.getUserVehicles);

// Vehicle CRUD Routes
router.post("/", auth, vehiclesCtrl.createVehicle);
router.get("/:id", vehiclesCtrl.getVehicle);
router.put("/:id", auth, vehiclesCtrl.updateVehicle);
router.delete("/:id", auth, vehiclesCtrl.deleteVehicle);

// Vehicle Media Routes
router.post("/:id/media", auth, upload.array("media", 10), vehiclesCtrl.addMedia);
router.delete("/:id/media/:mediaId", auth, vehiclesCtrl.removeMedia);

// Vehicle Interaction Routes
router.post("/:id/like", auth, vehiclesCtrl.likeVehicle);
router.delete("/:id/like", auth, vehiclesCtrl.unlikeVehicle);

// Vehicle Availability Routes
router.put("/:id/availability", auth, vehiclesCtrl.updateAvailability);

module.exports = router;



