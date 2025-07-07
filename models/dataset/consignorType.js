const mongoose = require("mongoose")
const { Schema } = mongoose

const typeConsignorSchema = new Schema(
    {
        name: { type: String, require: true },
        createId: { type: String, require: false, default: ""  }
    },
    {
        timestamps: true
    }
)

const consignorTypes = mongoose.model("consignorType", typeConsignorSchema)
module.exports = consignorTypes