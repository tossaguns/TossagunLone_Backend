const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const { verifyToken } = require('../middlewares/auth.middleware');

// create room + upload images (field name: imgrooms)
router.post("/create", verifyToken, roomController.createRoom);

// get all rooms
router.get("/getAll", verifyToken, roomController.getAllRooms);

// get room by id
router.get("/get:id", verifyToken, roomController.getRoomById);

// update room by id + upload images (optional)
router.put("/update:id", verifyToken, roomController.updateRoom);

router.patch("/update/:id/status", verifyToken, roomController.updateRoomStatus);
router.patch('/update/:id/status-room', roomController.updateRoomStatusRoom);
// delete all rooms
router.delete("/DeleteAll", verifyToken, roomController.deleteAllRooms);

// delete room by id
router.delete("/Delete:id", verifyToken, roomController.deleteRoomById);

router.get("/status-options", verifyToken, roomController.getStatusOptions);

router.patch("/update:id/status", verifyToken, roomController.updateRoomStatus);


module.exports = router;
