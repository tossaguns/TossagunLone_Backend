const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
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
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
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
    status: {
      type: String,
      enum: ["SleepGunWeb", "Walkin"],
      default: "Walkin",
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
