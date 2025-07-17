// controllers/auth.controller.js
const Employee = require("../models/user/employee.schema");
const Partner = require("../models/user/partner.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ลองค้นหาจาก Employee ก่อน
    const employee = await Employee.findOne({ username });
    if (employee) {
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

      const token = jwt.sign(
        { id: employee._id, role: employee.statusByPartner, type: "employee" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "เข้าสู่ระบบสำเร็จ (Employee)",
        token,
        role: employee.statusByPartner,
        user: employee,
      });
    }

    // ลองค้นหาจาก Partner ถ้าไม่เจอใน Employee
    const partner = await Partner.findOne({ username });
    if (partner) {
      const isMatch = await bcrypt.compare(password, partner.password);
      if (!isMatch) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

      const token = jwt.sign(
        { id: partner._id, role: "partner", type: "partner" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "เข้าสู่ระบบสำเร็จ (Partner)",
        token,
        role: "partner",
        user: partner,
      });
    }

    return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
  } catch (err) {
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
  }
};
