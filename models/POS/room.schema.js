const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    //มาเพิ่มราคาที่ลดเเล้ว เเละสถานะปุ่ม radio
    roomNumber: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    stayPeople: {
      type: Number,
      default: 0,
    },
    roomDetail: {
      type: String,
      trim: true,
    },
    imgrooms: {
      type: [String],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "building",
      required: true,
    }, // เพิ่ม buildingId
    typeRoomHotel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "typeRoomHotel",
      },
    ],
    typeRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeRoom",
    },
    tag: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tagPOS",
      },
    ],
    status: {
      type: String,
      enum: ["SleepGunWeb", "Walkin"],
      default: "Walkin",
    },
    statusRoom: {
      type: String,
      enum: ["ว่าง", "ไม่ว่าง", "กำลังทำความสะอาด"],
      default: "ว่าง",
    },
    statusPromotion: {
      type: String,
      enum: ["openPromotion", "closePromotion"],
      default: "closePromotion",
    },
    air: {
      type: String,
      enum: ["ห้องเเอร์", "ห้องพัดลม", "ห้องเเอร์และพัดลม"],
      default: "ห้องพัดลม",
    },
    floor: {
      type: String,
      trim: true,
      required: true,
    },
    quota: {
      type: Number,
      default: 5, // โควต้าเริ่มต้น 5 ห้องต่อ partner
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 10;
}

const room = mongoose.model("room", roomSchema);

module.exports = room;
