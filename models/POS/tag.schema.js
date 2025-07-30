const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagPOSSchema = new Schema(
  {
    partnerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'partner', 
      required: true 
    },
    name: {
      type: String,
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
