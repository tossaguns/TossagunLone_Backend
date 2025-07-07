const mongoose = require('mongoose');
const { Schema } = mongoose;

const partnerSchema = new Schema({
  // ข้อมูลการเข้าสู่ระบบ
  username: { type: String, required: true, unique: true, trim: true, minlength: 6 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['member', 'partner', 'admin'] },
  partnerId: { type: String, unique: true },

  // ข้อมูลส่วนตัว (เหมือน UniqueUser)
  title: { type: String, required: true, enum: ['นาย', 'นาง', 'นางสาว', 'อื่นๆ'] },
  fullName: { type: String, required: true, trim: true },
  personalId: { type: String, required: true, unique: true, match: /^[0-9]{13}$/ },
  personalPhone: { type: String, required: true, unique: true, match: /^[0-9]{10}$/ },
  personalEmail: { type: String, required: true, unique: true, lowercase: true },
  personalAddress: { type: String, required: true },
  personalProvince: { type: String, required: true },
  personalDistrict: { type: String, required: true },
  personalSubdistrict: { type: String, required: true },
  personalPostalCode: { type: String, required: true },
  profile_img:{ type: String, required: false },

  // ข้อมูลบริษัท
  companyName: { type: String, required: true, trim: true },
  companyTaxId: { type: String, required: true, match: /^[0-9]{13}$/ },
  companyAddress: { type: String, required: true },
  companyProvince: { type: String, required: true },
  companyDistrict: { type: String, required: true },
  companySubdistrict: { type: String, required: true },
  companyPostalCode: { type: String, required: true },
  companyPhone: { type: String, required: true, match: /^[0-9]{10}$/ },
  companyEmail: { type: String, required: true, lowercase: true },
  shopLatitude: { type: Number }, // ละติจูด
  shopLongitude: { type: Number }, // ลองติจูด
  shopImages: { type: String }, // รูปภาพหน้าร้าน


  // ไฟล์
  idCardImage: { type: String, required: true },
  companyStampImage: { type: String, required: true },
  companyLogo: { type: String, required: true },
  companyDocuments: [{ name: String, url: String }],

  // ลายเซ็นต์
  signatoryName: { type: String, required: true, trim: true },
  signatoryAuthority: { 
    type: String, 
    required: true, 
    enum: ['ผู้มีอำนาจลงนาม', 'ผู้แทน', 'พยาน', 'อื่นๆ'],
    default: 'ผู้มีอำนาจลงนาม'
  },
  signatoryPosition: { type: String, required: true, trim: true },
  signatureType: { type: String, required: true, enum: ['handwritten', 'upload'] },
  signatureImage: { type: String, required: true },

  status:{ type: String, required: false, default:"รอยืนยัน" }, 
  rejectDescription: { type: String },
  // ข้อมูลระบบ
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { 
  timestamps: true,
  versionKey: false 
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;