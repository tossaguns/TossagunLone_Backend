const Partner = require('../models/user/partner');
const Member = require("../models/user/member");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

exports.loginPartner = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // ค้นหาใน Partner collection ก่อน
        let partner = await Partner.findOne({ username });
        
        // ถ้าไม่เจอใน Partner ให้ค้นหาใน Member collection
        if (!partner) {
            partner = await Member.findOne({ username });
        }
        
        // ถ้าไม่เจอในทั้ง 2 ตาราง
        if (!partner) {
            return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        // เช็ครหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, partner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        // สร้าง token
        const token = jwt.sign({ partnerId: partner._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // เตรียมข้อมูล response
        const ResponesData = {
            username: partner.username,
            role: partner.role,
            fullname: partner.fullName,
            personalPhone: partner.personalPhone,
            personalEmail: partner.personalEmail
        };
        
        console.log('responseData : ', ResponesData);
        
        const partnerWithToken = partner.toObject ? partner.toObject() : { ...partner };
        partnerWithToken.token = token;
        
        res.json({
            success: true,
            message: 'เข้าสู่ระบบสําเร็จ',
            data: ResponesData,
            partner: partnerWithToken,
            token: token,
        });
        
    } catch (error) {
        console.error('Error login partner:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            details: error.message
        });
    }
};