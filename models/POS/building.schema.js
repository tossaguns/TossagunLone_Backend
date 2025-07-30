const mongoose = require("mongoose");
const { Schema } = mongoose;


const buildingSchema = new Schema(
  {
    partnerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'partner', 
      required: true 
    },
    hascolorBG: { type: String, enum: ['colorBG', 'imgBG'], default: 'colorBG' },
    nameBuilding: { type: String },

    colorText: { type: String },
    colorBG: {
      type: String,
      default: "#FFBB00",
    },
    imgBG: { type: String },

  },
  { timestamps: true }
);

const building = mongoose.model("building", buildingSchema);
module.exports = building;
