const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../../models/user/employee.schema");
const fs = require("fs");
const path = require("path");

// สร้าง Employee โดย Partner
exports.createEmployee = async (req, res) => {
  try {
    const {
      username,
      password,
      firstname,
      lastname,
      nickname,
      sex,
      email,
      phone,
      employeeCode,
      positionEmployee,
      statusByPartner,
    } = req.body;

    const exist = await Employee.findOne({ username });
    if (exist) {
      return res.status(400).json({ message: "มีผู้ใช้นี้อยู่แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = new Employee({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      nickname,
      sex,
      email,
      phone,
      employeeCode,
      positionEmployee,
      statusByPartner,
      imageIden: req.file?.path || "", 
    });

    await employee.save();
    res.status(201).json({ message: "สร้างพนักงานสำเร็จ", employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login สำหรับ Employee และ AdminPartner
exports.loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    const employee = await Employee.findOne({ username });
    if (!employee) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign(
      {
        id: employee._id,
        role: employee.statusByPartner, // 'adminPartner' หรือ 'employee'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงพนักงานทั้งหมด
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงพนักงานตาม ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "ไม่พบพนักงาน" });
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// อัปเดตข้อมูลพนักงาน
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "ไม่พบพนักงาน" });

    if (req.file && employee.imageIden) {
      fs.unlinkSync(path.join(__dirname, "../../", employee.imageIden));
    }

    Object.assign(employee, req.body);

    // log password ที่รับมา
    console.log('password from req.body:', req.body.password);
    // ตรวจสอบ password ที่ส่งมา ถ้าเป็น plain text ให้ hash
    if (req.body.password && !req.body.password.startsWith('$2a$')) {
      employee.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file?.path) {
      employee.imageIden = req.file.path;
    }

    await employee.save();
    res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ", employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ลบพนักงานตาม ID
exports.deleteEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "ไม่พบพนักงาน" });

    if (employee.imageIden) {
      fs.unlinkSync(path.join(__dirname, "../../", employee.imageIden));
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "ลบพนักงานเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ลบพนักงานทั้งหมด
exports.deleteAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    for (const emp of employees) {
      if (emp.imageIden) {
        fs.unlinkSync(path.join(__dirname, "../../", emp.imageIden));
      }
    }

    await Employee.deleteMany();
    res.status(200).json({ message: "ลบพนักงานทั้งหมดเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
