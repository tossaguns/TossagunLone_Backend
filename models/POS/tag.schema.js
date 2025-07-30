const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagPOSSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#FFBB00",
    },
  },
  {
    timestamps: true,
  }
);

const tagPOS = mongoose.model(
  "tagPOS",
  tagPOSSchema
);

module.exports = tagPOS;
