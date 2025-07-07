const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const partnerController = require('../../controllers/user/partnerController');

// ตั้งค่า Multer สำหรับอัพโหลดไฟล์ชั่วคราว
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์ JPG, PNG, GIF, PDF, DOC, และ DOCX เท่านั้น'));
  }
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// สมัครสมาชิก Partner
router.post('/register', partnerController.registerPartner);

// อัพโหลดไฟล์ (ใช้ multer แบบกำหนดในไฟล์นี้)
router.post('/upload', upload.array('files', 10), partnerController.uploadFile);

router.get('/getall', partnerController.getPartnerAll);

router.get('/getpending', partnerController.getPendingPartners);

router.put('/approve/confirm', partnerController.confirmPartnerStatus)

router.put('/approve/cancle', partnerController.canclePartnerStatus)
module.exports = router;
