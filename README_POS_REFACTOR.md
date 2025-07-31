# POS System Refactoring

## 🎯 วัตถุประสงค์
รวม controller และ routes ของ POS System ทั้งหมดไว้ในที่เดียว เพื่อให้ง่ายต่อการจัดการและเรียกใช้ข้อมูล

## 📁 โครงสร้างไฟล์ใหม่

### Controllers
```
backend/controllers/POS/
├── pos.controller.js          # รวมทุกฟังก์ชัน POS, Building, Room, Tag
└── (ไฟล์เก่าถูกลบแล้ว)
```

### Routes
```
backend/routes/POS/
├── pos.routes.js              # รวมทุก routes POS, Building, Room, Tag
└── (ไฟล์เก่าถูกลบแล้ว)
```

### Documentation
```
backend/docs/
└── POS_API.md                 # เอกสาร API ครบถ้วน
```

## 🔄 การเปลี่ยนแปลง

### ไฟล์ที่ถูกลบ
- `backend/controllers/POS/building.controller.js`
- `backend/controllers/POS/room.controller.js`
- `backend/controllers/POS/tag.controller.js`
- `backend/routes/POS/buildingRoutes.js`
- `backend/routes/POS/tagRoutes.js`
- `backend/routes/roomRoutes.js`

### ไฟล์ที่สร้างใหม่
- `backend/controllers/POS/pos.controller.js` (อัปเดต)
- `backend/routes/POS/pos.routes.js` (อัปเดต)
- `backend/docs/POS_API.md` (ใหม่)

## 🚀 ประโยชน์ของการรวม Controller

### 1. **ง่ายต่อการจัดการ**
- ฟังก์ชันทั้งหมดอยู่ในไฟล์เดียว
- ไม่ต้องสลับไปมาระหว่างไฟล์
- การแก้ไขและเพิ่มฟีเจอร์ทำได้ง่าย

### 2. **ลดการเรียก API**
- สามารถดึงข้อมูลทั้งหมดพร้อมกันได้ด้วย `/complete-data`
- ลดจำนวน HTTP requests
- เพิ่มประสิทธิภาพการทำงาน

### 3. **การอัปเดตสถิติอัตโนมัติ**
- ระบบจะอัปเดตสถิติ POS อัตโนมัติเมื่อมีการเปลี่ยนแปลงข้อมูล
- ไม่ต้องกังวลเรื่องการ sync ข้อมูล
- ข้อมูลสถิติถูกต้องเสมอ

### 4. **Consistency**
- ใช้รูปแบบ response เดียวกันทั้งหมด
- Error handling แบบเดียวกัน
- Authentication แบบเดียวกัน

### 5. **Maintenance**
- ง่ายต่อการบำรุงรักษา
- การแก้ไข bug ทำได้เร็ว
- การเพิ่มฟีเจอร์ใหม่ทำได้ง่าย

## 📊 API Endpoints ใหม่

### Base URL
```
http://localhost:3000/HotelSleepGun/pos
```

### กลุ่ม Endpoints
- **POS**: `/pos`, `/pos/:id`, `/pos-summary`
- **Buildings**: `/buildings`, `/buildings/:id`
- **Rooms**: `/rooms`, `/rooms/:id`, `/rooms/status-options`, `/rooms/sleepgun-quota`
- **Tags**: `/tags`, `/tags/:id`
- **Comprehensive**: `/complete-data`

## 🔧 การใช้งาน

### 1. ดึงข้อมูลทั้งหมดของ Partner
```javascript
const response = await fetch('/HotelSleepGun/pos/complete-data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.data.statistics);
```

### 2. สร้างห้องพักใหม่
```javascript
const formData = new FormData();
formData.append('roomNumber', '101');
formData.append('price', '1500');
formData.append('typeRoom', '64f8a1b2c3d4e5f6a7b8c9d0');
formData.append('imgrooms', file);

const response = await fetch('/HotelSleepGun/pos/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 3. อัปเดตสถานะห้องพัก
```javascript
const response = await fetch('/HotelSleepGun/pos/rooms/64f8a1b2c3d4e5f6a7b8c9d0/status', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'SleepGunWeb'
  })
});
```

## 📈 สถิติที่ได้จาก `/complete-data`

```json
{
  "statistics": {
    "totalBuildings": 2,
    "totalRooms": 20,
    "totalTags": 5,
    "sleepGunRooms": 3,
    "availableRooms": 15,
    "occupiedRooms": 3,
    "cleaningRooms": 2
  }
}
```

## ⚠️ ข้อควรระวัง

1. **โควต้า SleepGun**: จำกัดสูงสุด 5 ห้องต่อ Partner
2. **รูปภาพ**: จำกัดสูงสุด 10 รูปต่อห้อง
3. **Authentication**: ต้องมี token ที่ถูกต้อง
4. **Partner ID**: ระบบจะใช้ partnerId จาก token อัตโนมัติ

## 🔄 การอัปเดตสถิติอัตโนมัติ

ระบบจะอัปเดตสถิติ POS อัตโนมัติเมื่อมีการเปลี่ยนแปลงข้อมูลใน:
- สร้าง/อัปเดต/ลบ Building
- สร้าง/อัปเดต/ลบ Room
- สร้าง/อัปเดต/ลบ Tag

## 📚 เอกสารเพิ่มเติม

ดูรายละเอียดเพิ่มเติมได้ที่:
- [POS_API.md](./docs/POS_API.md) - เอกสาร API ครบถ้วน

## 🎉 สรุป

การรวม controller และ routes ของ POS System ทำให้:
- **ง่ายต่อการจัดการ** และ **บำรุงรักษา**
- **ลดการเรียก API** และ **เพิ่มประสิทธิภาพ**
- **การอัปเดตสถิติอัตโนมัติ** และ **ข้อมูลถูกต้องเสมอ**
- **Consistency** และ **ความเสถียร** ของระบบ 