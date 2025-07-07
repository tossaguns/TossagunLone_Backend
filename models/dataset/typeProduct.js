const mongoose = require("mongoose")
const { Schema } = mongoose

const typeProductSchema = new Schema(
    {
        name: { type: String, require: true },
        createId: { type: String, require: false, default: ""  }
    },
    {
        timestamps: true
    }
)

const typeProduct = mongoose.model("productType", typeProductSchema)
module.exports = typeProduct