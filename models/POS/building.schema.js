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

    // เพิ่ม floors field เพื่อเก็บข้อมูลชั้นในแต่ละตึก
    floors: [{
      name: { type: String, required: true },
      description: { type: String },
      roomCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }],

  },
  { timestamps: true }
);

const building = mongoose.model("building", buildingSchema);
module.exports = building;
