const controller = require("../../controllers/typeHotel/typeRoom.controller");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ==== Multer Config ====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/icons");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/create", controller.createTypeRoom);

router.get("/getAll", controller.getAllTypeRoomsGrouped);

router.get("/get/:id", controller.getTypeRoomById);

router.put("/update/:id", controller.updateTypeRoom);

router.delete("/delete/:id", controller.deleteTypeRoom);

router.delete("/deleteAll", controller.deleteAllTypeRooms);

module.exports = router;
