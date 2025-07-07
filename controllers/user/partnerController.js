const Partner = require('../../models/user/partner');
const UniqueUser = require('../../models/user/unique-user');
const Member = require("../../models/user/member");

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// ตั้งค่า AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ฟังก์ชันสร้าง partnerId
const generatePartnerId = async () => {
  const lastPartner = await Partner.findOne({}, {}, { sort: { createdAt: -1 } });

  let lastId = 0;
  if (lastPartner && lastPartner.partnerId) {
    const numberPart = lastPartner.partnerId.replace(/^P/, '');
    if (!isNaN(numberPart)) {
      lastId = parseInt(numberPart);
    } else {
      console.warn('Invalid partnerId format:', lastPartner.partnerId);
    }
  }

  return 'P' + String(lastId + 1).padStart(6, '0');
};


// ฟังก์ชันตรวจสอบข้อมูลที่ซ้ำ
const checkDuplicate = async (field, value) => {
  const [memberUser, partnerUser] = await Promise.all([
      Member.findOne({ [field]: value }),
      Partner.findOne({ [field]: value }),
  ]);
  return { exists: !!memberUser || !!partnerUser };
};

// สมัครสมาชิก Partner
exports.registerPartner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // ตรวจสอบข้อมูลที่ต้องไม่ซ้ำ
    const checks = await Promise.all([
      checkDuplicate('username', req.body.username),
      checkDuplicate('personalId', req.body.personalId),
      checkDuplicate('personalPhone', req.body.personalPhone),
      checkDuplicate('personalEmail', req.body.personalEmail)
    ]);

    const conflicts = {
      username: checks[0].exists,
      personalId: checks[1].exists,
      personalPhone: checks[2].exists,
      personalEmail: checks[3].exists
    };

    const conflictNames = [];
    if (conflicts.username) conflictNames.push('ชื่อผู้ใช้');
    if (conflicts.personalId) conflictNames.push('เลขบัตรประชาชน');
    if (conflicts.personalPhone) conflictNames.push('เบอร์โทรศัพท์ส่วนตัว');
    if (conflicts.personalEmail) conflictNames.push('อีเมลส่วนตัว');

    if (conflictNames.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'ข้อมูลซ้ำกับในระบบ',
        fields: conflicts,
        conflictNames
      });
    }

    // สร้าง partnerId
    const partnerId = await generatePartnerId();

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // สร้างข้อมูลใน Partner
    const newPartner = new Partner({
      ...req.body,
      password: hashedPassword,
      role: 'partner',
      partnerId: partnerId,
      // ข้อมูลส่วนตัว (เหมือน UniqueUser)
      title: req.body.title,
      fullName: req.body.fullName,
      personalId: req.body.personalId,
      personalPhone: req.body.personalPhone,
      personalEmail: req.body.personalEmail,
      personalAddress: req.body.personalAddress,
      personalProvince: req.body.personalProvince,
      personalDistrict: req.body.personalDistrict,
      personalSubdistrict: req.body.personalSubdistrict,
      personalPostalCode: req.body.personalPostalCode,
      profile_img: '',
      shopLatitude: req.body.shopLatitude,
      shopLongitude: req.body.shopLongitude,
      shopImages: req.body.shopImages,
      rejectDescription: ''

    });

    await newPartner.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      partnerId: partnerId
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error registering partner:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      details: error.message
    });
  }
};

// อัพโหลดไฟล์ (คงเดิม)
exports.uploadFile = async (req, res) => {
  console.log('req', req.files)
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'ไม่มีไฟล์ที่อัพโหลด' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const folder = file.fieldname || req.body.folder || 'others';
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${folder}/${file.originalname}-${Date.now()}`;
    
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
      };
    
      await s3Client.send(new PutObjectCommand(uploadParams));

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
      uploadedFiles.push({ url: fileUrl });
    }
    
    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์' });
  }
};

exports.getPartnerAll = async (req, res) => {
  try {
    const partner = await Partner.find()

    if (!partner) {
      return res.status(404).json({
        error: 'ไม่พบพาร์ทเนอร์ที่ต้องการ'
      });
    }

    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพาร์ทเนอร์',
      details: error.message
    });
  }
};

exports.getPendingPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ status: 'รอยืนยัน' });

    if (!partners.length) {
      return res.status(200).json({
        error: 'ไม่พบพาร์ทเนอร์ที่รอยืนยัน'
      });
    }

    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching pending partners:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพาร์ทเนอร์',
      details: error.message
    });
  }
};

exports.confirmPartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ message: 'ต้องระบุ partnerId' });
    }

    console.log('partner' , partnerId)

    const updatedPartner = await Partner.findOneAndUpdate(
      { _id: partnerId },
      { status: 'ยืนยันแล้ว' },
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ message: 'ไม่พบ Partner ที่ระบุ' });
    }

    res.status(200).json({
      message: 'อัปเดตสถานะเป็น "ยืนยันแล้ว" เรียบร้อย',
      partner: updatedPartner
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
};

exports.canclePartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ message: 'ต้องระบุ partnerId' });
    }

    const updatedPartner = await Partner.findOneAndUpdate(
      {_id: partnerId},
      { status: 'ไม่ยืนยัน' },
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ message: 'ไม่พบ Partner ที่ระบุ' });
    }

    res.status(200).json({
      message: 'อัปเดตสถานะเป็น "ยืนยันแล้ว" เรียบร้อย',
      partner: updatedPartner
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
};

exports.listPartners = async (req, res) => {
  const currentPartnerId = req.query.currentPartnerId;

  try {
    const users = await Partner.find({ partnerId: { $ne: currentPartnerId } });
    res.json({ success: true, partners: users });
  } catch (err) {
    console.error('❌ DB error:', err);
    res.json({ success: false, error: err.message });
  }
};