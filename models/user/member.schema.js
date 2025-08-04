const mongoose = require('mongoose');
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    
    firstname: { type: String,  },
    lastname: { type: String,},
    profileName: { type: String, },
    sex: { type: String },
   
    imageProfile: { type: String, default: "" },
    email: {
      type: String,
      
    },
    phone: {
      type: String, 
      match: /^[0-9]{10}$/,
    },

    birthDate: { type: Date, },
    age: { type: Number, },

    nationality: { type: String, },
    religion: { type: String, },

    address: { type: String, default: "" },
    subdistrict: { type: String, default: "" },
    district: { type: String, default: "" },
    province: { type: String, default: "" },
    postcode: { type: String, match: /^[0-9]{5}$/, default: "" },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const member = mongoose.model('member', memberSchema);

module.exports = member;


