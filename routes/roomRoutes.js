const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");

// create room + upload images (field name: imgrooms)
router.post("/create", roomController.createRoom);

// get all rooms
router.get("/getAll", roomController.getAllRooms);

// get room by id
router.get("/get:id", roomController.getRoomById);

// update room by id + upload images (optional)
router.put("/update:id", roomController.updateRoom);

router.patch("/update/:id/status", roomController.updateRoomStatus);
// delete all rooms
router.delete("/DeleteAll", roomController.deleteAllRooms);

// delete room by id
router.delete("/Delete:id", roomController.deleteRoomById);

router.get("/status-options", roomController.getStatusOptions);

router.patch("/update:id/status", roomController.updateRoomStatus);


module.exports = router;
