const mongoose = require('mongoose');
const { Schema } = mongoose;

const memberSchema = new Schema({
  // ข้อมูลการเข้าสู่ระบบ
  username: { type: String, required: true, unique: true, trim: true, minlength: 6 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['member', 'partner', 'admin'], default: 'member' },
  memberId: { type: String, unique: true },

  // ข้อมูลส่วนตัว
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

  // ข้อมูลระบบ
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  versionKey: false 
});

// อัปเดต timestamp เมื่อมีการแก้ไข
memberSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;