const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String }, // ฟิลด์สำหรับเก็บ URL ไฟล์
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);