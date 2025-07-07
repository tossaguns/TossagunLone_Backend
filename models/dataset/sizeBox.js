const mongoose = require("mongoose")
const { Schema } = mongoose

const sizeboxSchema = new Schema(
    {
        width: { type: String, require: true },
        length: { type: String, require: true },
        height: { type: String, require: true },
        
        createId: { type: String, require: false, default: ""  }
    },
    {
        timestamps: true
    }
)

const sizeBoxs = mongoose.model("sizebox", sizeboxSchema)
module.exports = sizeBoxs