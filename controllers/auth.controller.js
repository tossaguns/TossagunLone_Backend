// controllers/auth.controller.js
const Employee = require("../models/user/employee.schema");
const Partner = require("../models/user/partner.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  console.log("BODY:", req.body); // log body ที่รับมา
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? 'SET' : 'NOT SET'); // log ว่ามี JWT_SECRET หรือไม่
  const { username, password } = req.body;

  try {
    const employee = await Employee.findOne({ username });
    console.log("employee:", employee);
    if (employee) {
      const isMatch = await bcrypt.compare(password, employee.password);
      console.log("isMatch (employee):", isMatch);
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

    const partner = await Partner.findOne({ username }).select('+password');
    console.log("partner:", partner);
    if (partner) {
      if (!partner.password) {
        return res.status(500).json({ message: "ข้อมูล partner ไม่มีรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ" });
      }
      const isMatch = await bcrypt.compare(password, partner.password);
      console.log("isMatch (partner):", isMatch);
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

    console.log("ไม่พบผู้ใช้งาน");
    return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
  }
};
