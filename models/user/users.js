const mongoose = require('mongoose');
const { Schema } = mongoose;

const partnerSchema = new Schema({
  // ข้อมูลพื้นฐาน
  companyName: { 
    type: String, 
    required: [true, 'กรุณากรอกชื่อบริษัท'], 
    trim: true 
  },
  idCardNumber: { 
    type: String, 
    required: [true, 'กรุณากรอกเลขบัตรประชาชน'], 
    unique: true,
    match: [/^[0-9]{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก']
  },
  
  // ที่อยู่
  address: { 
    type: String, 
    required: [true, 'กรุณากรอกที่อยู่บริษัท'] 
  },
  province: { 
    type: String, 
    required: [true, 'กรุณาเลือกจังหวัด'] 
  },
  district: { 
    type: String, 
    required: [true, 'กรุณาเลือกอำเภอ'] 
  },
  subdistrict: { 
    type: String, 
    required: [true, 'กรุณาเลือกตำบล'] 
  },
  postalCode: { 
    type: String, 
    required: [true, 'กรุณากรอกรหัสไปรษณีย์'],
    match: [/^[0-9]{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก']
  },
  
  // ข้อมูลติดต่อ
  phoneNumber: { 
    type: String, 
    required: [true, 'กรุณากรอกเบอร์โทรศัพท์'],
    match: [/^[0-9]{10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก']
  },
  companyEmail: { 
    type: String, 
    required: [true, 'กรุณากรอกอีเมลบริษัท'],
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'กรุณากรอกอีเมลให้ถูกต้อง']
  },
  
  // ไฟล์รูปภาพ (เก็บเป็น URL หรือ reference ไปที่ S3)
  idCardImage: { 
    type: String, 
    required: [true, 'กรุณาอัพโหลดรูปบัตรประชาชน'],
    match: [/^https?:\/\//, 'URL รูปภาพไม่ถูกต้อง']
  },
  companyStampImage: { 
    type: String, 
    required: [true, 'กรุณาอัพโหลดรูปตราประทับบริษัท'],
    match: [/^https?:\/\//, 'URL รูปภาพไม่ถูกต้อง']
  },
  companyLogo: { 
    type: String, 
    required: [true, 'กรุณาอัพโหลดโลโก้บริษัท'],
    match: [/^https?:\/\//, 'URL รูปภาพไม่ถูกต้อง']
  },
  
  // เอกสารบริษัท (ไม่บังคับ)
  companyDoc1: { 
    type: String,
    match: [/^https?:\/\//, 'URL เอกสารไม่ถูกต้อง']
  },
  companyDoc2: { 
    type: String,
    match: [/^https?:\/\//, 'URL เอกสารไม่ถูกต้อง']
  },
  companyDoc3: { 
    type: String,
    match: [/^https?:\/\//, 'URL เอกสารไม่ถูกต้อง']
  },
  companyDoc4: { 
    type: String,
    match: [/^https?:\/\//, 'URL เอกสารไม่ถูกต้อง']
  },
  
  // ข้อมูลผู้ลงนาม
  signatoryName: { 
    type: String, 
    required: [true, 'กรุณากรอกชื่อผู้ลงนาม'],
    trim: true
  },
  signatoryAuthority: { 
    type: String, 
    required: [true, 'กรุณาระบุอำนาจการลงนาม'],
    enum: ['ผู้มีอำนาจลงนาม', 'ผู้แทน', 'พยาน', 'อื่นๆ'],
    default: 'ผู้มีอำนาจลงนาม'
  },
  signatoryPosition: { 
    type: String, 
    required: [true, 'กรุณากรอกตำแหน่งในบริษัท'],
    trim: true
  },
  signatureImage: { 
    type: String, 
    required: [true, 'กรุณาอัพโหลดลายเซ็น'],
    match: [/^https?:\/\//, 'URL รูปภาพไม่ถูกต้อง']
  },
  
  // ข้อมูลระบบ
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true,
  versionKey: false 
});

// สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
partnerSchema.index({ companyName: 1 });
partnerSchema.index({ idCardNumber: 1 });
partnerSchema.index({ province: 1, district: 1, subdistrict: 1 });

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;