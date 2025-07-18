const mongoose = require("mongoose");
const { Schema } = mongoose;

// ประกาศ cashPledgeSchema ก่อน
const cashPledgeSchema = new Schema({
  price: { type: Number, default: 0 },
  note: { type: String, default: '' }
});

// ประกาศ typeBedPriceSchema
const typeBedPriceSchema = new Schema({
  child: { type: Number, default: 0 },
  normal: { type: Number, default: 0 }
});

const aboutHotelSchema = new Schema(
  {
    hasExtraBed: { type: String, enum: ['yes', 'no'], default: 'no' },
    hasExtraCashPledge: { type: String, enum: ['yes', 'no'], default: 'no' },
    checkInForm: { type: String },
    checkInTo: { type: String },
    checkOutForm: { type: String },
    checkOutTo: { type: String },
    VerifyIden_checkIn: { type: String },

    AboutFacilityHotel: { type: String },
    AboutHotelLocation: { type: String },
    AboutRoomHotel: { type: String },
    AboutHotelFor: { type: String },
    AboutFoodHotel: { type: String },
    
    typeBedPrice: {
      type: typeBedPriceSchema,
      default: () => ({ child: 0, normal: 0 })
    },
    cashPledge: {
      type: cashPledgeSchema,
      default: () => ({ price: 0, note: '' })
    },
    typeFacilityHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeFacilityHotel"
    },
    typeFoodHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeFoodHotel"
    },
    typeHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeHotel"
    },
    typeHotelFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeHotelFor"
    },
    typeHotelLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeHotelLocation"
    },
    typePaymentPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typePaymentPolicy"
    },
    typeRoomHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeRoomHotel"
    },
    typeRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeRoom"
    },

  },
  { timestamps: true }
);

const aboutHotel = mongoose.model("aboutHotel", aboutHotelSchema);
module.exports = aboutHotel;
