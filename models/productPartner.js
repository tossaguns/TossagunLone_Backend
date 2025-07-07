const mongoose = require('mongoose');
const { Schema } = mongoose

const productPartnerSchema = new Schema({
    productID:{ type: String, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true },

    //ราคา
    priceBeforeVat: { type: Number, require: true },
    vatAmount: { type: Number, require: true },
    sellingPrice: { type: Number, require: true },

    sellerType: { type: String, require: true },
    category: { type: String, require: true },
    productType: { type: String, require: true },
    stock: { type: Number, require: true },

    shippingConditions: [{
        quantity: { type: Number, required: true },
        totalWeight: { type: Number, required: true },
        boxSize: {
            width: { type: Number, required: true },
            length: { type: Number, required: true },
            height: { type: Number, required: true }
        }
    }],

    // ไฟล์แนบ
    images: {type: Array, required: false , default: []},
    document: {type: String, required: false, default: ''},

    status: {type: Boolean, default: false},
    statusRequest: {type: String, required: false, default: 'รอยืนยัน'},

    //addNEW
    width: { type: Number, require: true },
    length: { type: Number, require: true },
    height: { type: Number, require: true },
    weight: { type: Number, require: true },
});

const productPartners = mongoose.model("productPartner", productPartnerSchema)
module.exports = productPartners