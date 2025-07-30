const mongoose = require("mongoose");
const { Schema } = mongoose;

const posSchema = new Schema(
  {

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
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tag",
    },
   
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 10;
}

const pos = mongoose.model("pos", posSchema);

module.exports = pos;
