const mongoose = require("mongoose");
const { Schema } = mongoose;

const checkInOrderSchema = new Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partner",
      required: true
    },
    // Order Check-in ID
    checkInOrderId: {
      type: String,
      default: 0,
    },
    // OrderAll
    orderCheckIn: {
      type: Number,
      default: 0,
    },
    orderDate: {
      type: Date,
      trim: true,
    },
    orderTime: {
      type: Date,
      default: 0,
    },
    orderBy: {
      type: String,
      default: 0,
    }, 


    // การเชื่อมโยงกับไฟล์ลูก
    roomID: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
    }],

    memberID: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "member",
    }],
  },
  {
    timestamps: true,
  }
);

  const checkInOrder = mongoose.model("checkInOrder", checkInOrderSchema);

module.exports = checkInOrder;
