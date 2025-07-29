const Employee = require("../../models/user/employee.schema");
const bcrypt = require("bcryptjs");

// อัปเดต password ของ employee ที่เป็น plain text ให้เป็น encrypted
exports.updatePlainTextPasswords = async (req, res) => {
  try {
    // หา employee ที่มี password เป็น plain text (ไม่ขึ้นต้นด้วย $2b$ หรือ $2a$)
    const employees = await Employee.find({
      password: { $not: /^\$2[ab]\$/ }
    });

    console.log(`Found ${employees.length} employees with plain text passwords`);

    const updatePromises = employees.map(async (employee) => {
      // เข้ารหัส password ด้วย bcrypt
      const hashedPassword = await bcrypt.hash(employee.password, 10);
      
      // อัปเดต password ในฐานข้อมูล
      return Employee.findByIdAndUpdate(
        employee._id,
        { password: hashedPassword },
        { new: true }
      );
    });

    const updatedEmployees = await Promise.all(updatePromises);

    res.status(200).json({
      message: `อัปเดต password ของ ${updatedEmployees.length} employee สำเร็จ`,
      updatedCount: updatedEmployees.length
    });
  } catch (error) {
    console.error("Error updating passwords:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

// สร้าง employee ใหม่
exports.createEmployee = async (req, res) => {
  try {
    const { username, password, firstname, lastname, nickname, sex, email, phone, employeeCode, positionEmployee, statusByPartner, partnerId } = req.body;

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingEmployee = await Employee.findOne({ username });
    if (existingEmployee) {
      return res.status(400).json({ message: "Username นี้มีอยู่ในระบบแล้ว" });
    }

    // เข้ารหัส password
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
      partnerId
    });

    const savedEmployee = await employee.save();

    res.status(201).json({
      message: "สร้าง employee สำเร็จ",
      employee: savedEmployee
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
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
    const employees = await Employee.find({ partnerId: req.user.id }).sort({ createdAt: -1 });
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
    // ตรวจสอบ password ที่ส่งมา
    if (req.body.password) {
      if (employee.statusByPartner === 'adminPartner' && !req.body.password.startsWith('$2a$')) {
        employee.password = await bcrypt.hash(req.body.password, 10);
      } else {
        employee.password = req.body.password; // เก็บ plain text สำหรับ partner
      }
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
