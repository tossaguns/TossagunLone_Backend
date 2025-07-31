const express = require("express");
const router = express.Router();
const {
  createPos,
  getAllPos,
  getPosById,
  getPosSummary,
  updatePos,
  deletePos,
  deleteAllPos,
} = require("../../controllers/POS/pos.controller");
const { verifyPartnerAuth } = require("../../middlewares/partnerAuth.middleware");

// Apply authentication middleware to all routes
router.use(verifyPartnerAuth);

// สร้าง POS ใหม่
router.post("/create", createPos);

// ดึงข้อมูล POS ทั้งหมด
router.get("/getAll", getAllPos);

// ดึงข้อมูล POS ตาม ID
router.get("/getById/:id", getPosById);

// ดึงข้อมูล POS สรุป
router.get("/getSummary", getPosSummary);

// อัปเดตข้อมูล POS
router.put("/update/:id", updatePos);

// ลบ POS
router.delete("/delete/:id", deletePos);

// ลบ POS ทั้งหมด
router.delete("/deleteAll", deleteAllPos);

module.exports = router; 