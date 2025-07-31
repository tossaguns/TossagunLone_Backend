const mongoose = require("mongoose");
const { Schema } = mongoose;

const posSchema = new Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partner",
      required: true
    },
    // ข้อมูลสถิติ
    buildingCount: {
      type: Number,
      default: 0,
    },
    floorCount: {
      type: Number,
      default: 0,
    },
    floorDetail: {
      type: String,
      trim: true,
    },
    roomCount: {
      type: Number,
      default: 0,
    },
    roomCountSleepGun: {
      type: Number,
      default: 0,
    }, 
    quotaRoomSleepGun: {
      type: Number,
      default: 5, // โควต้าเริ่มต้น 5 ห้องต่อ partner
    },
    // การเชื่อมโยงกับไฟล์ลูก
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "tagPOS",
    }],
    buildings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "building",
    }],
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
    }],
    // ข้อมูลเพิ่มเติมสำหรับ POS
    posName: {
      type: String,
      trim: true,
      default: "POS System"
    },
    posStatus: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    },
    lastSync: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Virtual fields สำหรับคำนวณสถิติ
posSchema.virtual('totalRooms').get(function() {
  return this.roomCount || 0;
});

posSchema.virtual('availableQuota').get(function() {
  return Math.max(0, this.quotaRoomSleepGun - this.roomCountSleepGun);
});

posSchema.virtual('quotaPercentage').get(function() {
  if (this.quotaRoomSleepGun === 0) return 0;
  return Math.round((this.roomCountSleepGun / this.quotaRoomSleepGun) * 100);
});

// Pre-save middleware เพื่ออัปเดตสถิติ
posSchema.pre('save', async function(next) {
  try {
    // อัปเดตจำนวน buildings
    if (this.buildings && this.buildings.length > 0) {
      this.buildingCount = this.buildings.length;
    }
    
    // อัปเดตจำนวน rooms
    if (this.rooms && this.rooms.length > 0) {
      this.roomCount = this.rooms.length;
    }
    
    // อัปเดตจำนวน tags
    if (this.tags && this.tags.length > 0) {
      // สามารถเพิ่ม logic สำหรับ tag count ได้
    }
    
    this.lastSync = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method สำหรับอัปเดตสถิติจากข้อมูลจริง
posSchema.methods.updateStatistics = async function() {
  const Building = mongoose.model('building');
  const Room = mongoose.model('room');
  const TagPOS = mongoose.model('tagPOS');
  
  try {
    // นับจำนวน buildings
    this.buildingCount = await Building.countDocuments({ partnerId: this.partnerId });
    
    // นับจำนวน rooms
    this.roomCount = await Room.countDocuments({ partnerId: this.partnerId });
    
    // นับจำนวน rooms ที่เป็น SleepGunWeb
    this.roomCountSleepGun = await Room.countDocuments({ 
      partnerId: this.partnerId, 
      status: "SleepGunWeb" 
    });
    
    // นับจำนวน tags
    const tagCount = await TagPOS.countDocuments({ partnerId: this.partnerId });
    
    this.lastSync = new Date();
    await this.save();
    
    return {
      buildingCount: this.buildingCount,
      roomCount: this.roomCount,
      roomCountSleepGun: this.roomCountSleepGun,
      tagCount: tagCount,
      lastSync: this.lastSync
    };
  } catch (error) {
    throw error;
  }
};

const pos = mongoose.model("pos", posSchema);

module.exports = pos;
