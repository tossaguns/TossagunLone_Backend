const mongoose = require('mongoose');
const Employee = require('./models/user/employee.schema');
const bcrypt = require('bcryptjs');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb://localhost:27017/hotel_sleep_gun', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCreateEmployee() {
  try {
    console.log('🔄 เริ่มทดสอบการสร้าง employee...');

    // ข้อมูล employee ตัวอย่าง
    const employeeData = {
      username: 'test_employee',
      password: 'password123',
      firstname: 'ทดสอบ',
      lastname: 'พนักงาน',
      nickname: 'ทดสอบ',
      sex: 'ชาย',
      email: 'test@example.com',
      phone: '0812345678',
      employeeCode: 'EMP001',
      positionEmployee: 'พนักงานต้อนรับ',
      statusByPartner: 'employee',
      partnerId: '507f1f77bcf86cd799439011' // ObjectId ตัวอย่าง
    };

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingEmployee = await Employee.findOne({ username: employeeData.username });
    if (existingEmployee) {
      console.log('⚠️ Username นี้มีอยู่ในระบบแล้ว');
      return;
    }

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // สร้าง employee ใหม่
    const employee = new Employee({
      ...employeeData,
      password: hashedPassword
    });

    const savedEmployee = await employee.save();
    console.log('✅ สร้าง employee สำเร็จ:', savedEmployee);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    mongoose.connection.close();
  }
}

// รันการทดสอบ
testCreateEmployee(); 