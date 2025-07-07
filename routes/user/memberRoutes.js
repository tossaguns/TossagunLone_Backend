const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const memberController = require('../../controllers/user/memberController');

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
router.post('/register', memberController.registerMember);

// ดึงข้อมูลโปรไฟล์
router.get('/profile', memberController.getProfile);

router.get('/getall' , memberController.getall);

// อัพเดตข้อมูลส่วนตัว
router.put('/update-profile', memberController.updateProfile);

// อัพเดตที่อยู่
router.put('/update-address', memberController.updateAddress);

// อัพโหลดรูปโปรไฟล์
router.post('/upload-profile', upload.single('profile'), memberController.uploadProfileImage);

module.exports = router;
