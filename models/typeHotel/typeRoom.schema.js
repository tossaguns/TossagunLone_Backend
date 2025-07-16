const mongoose = require("mongoose");
const { Schema } = mongoose;

const typeRoomSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const TypeRoom = mongoose.model("TypeRoom", typeRoomSchema);

module.exports = TypeRoom;
