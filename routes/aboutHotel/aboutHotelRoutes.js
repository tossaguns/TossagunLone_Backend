const express = require("express");
const router = express.Router();
const aboutHotel = require("../../controllers/aboutHotel/aboutHotel.controller");
const cors = require('cors');

router.post("/creat", aboutHotel.createAboutHotel);
router.get("/getAll", aboutHotel.getAllAboutHotel);
router.get("/getByPartnerId/:partnerId", aboutHotel.getAboutHotelByPartnerId);
router.get("/get/:id", aboutHotel.getAboutHotelById);
router.put("/update/:id", aboutHotel.updateAboutHotel);
router.delete("/delete/:id", aboutHotel.deleteAboutHotelById);
router.delete("/deleteAll", aboutHotel.deleteAllAboutHotel);

module.exports = router;             