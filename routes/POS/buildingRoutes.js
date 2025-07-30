const express = require("express");
const router = express.Router();
const {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
} = require("../../controllers/POS/building.controller");
const { verifyPartnerAuth } = require("../../middlewares/partnerAuth.middleware");

// Apply authentication middleware to all routes
router.use(verifyPartnerAuth);

// สร้างตึกใหม่
router.post("/create", createBuilding);

// ดึงข้อมูลตึกทั้งหมด
router.get("/getAll", getAllBuildings);

// ดึงข้อมูลตึกตาม ID
router.get("/getById/:id", getBuildingById);

// อัปเดตข้อมูลตึก
router.put("/update/:id", updateBuilding);

// ลบตึก
router.delete("/delete/:id", deleteBuilding);

module.exports = router; 