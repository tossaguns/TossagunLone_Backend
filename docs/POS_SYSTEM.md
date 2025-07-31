# ระบบ POS (Point of Sale) สำหรับโรงแรม

## โครงสร้างระบบ

ระบบ POS ถูกออกแบบให้เป็นไฟล์หลักที่เชื่อมโยงกับไฟล์ลูกต่างๆ ดังนี้:

### ไฟล์หลัก
- **`pos.schema.js`** - Schema หลักสำหรับเก็บข้อมูลสถิติและการเชื่อมโยง
- **`pos.controller.js`** - Controller สำหรับจัดการข้อมูลรวม
- **`pos.routes.js`** - Routes สำหรับ API endpoints

### ไฟล์ลูก
- **`building.schema.js`** - ข้อมูลตึก/อาคาร
- **`room.schema.js`** - ข้อมูลห้องพัก
- **`tag.schema.js`** - ข้อมูลแท็ก

## คุณสมบัติหลัก

### 1. การเชื่อมโยงข้อมูล
- POS จะเก็บข้อมูลสถิติรวมจาก building, room, และ tag
- อัปเดตสถิติอัตโนมัติเมื่อมีการเปลี่ยนแปลงข้อมูลในไฟล์ลูก

### 2. สถิติที่เก็บ
- จำนวนตึก (buildingCount)
- จำนวนห้องพัก (roomCount)
- จำนวนห้อง SleepGunWeb (roomCountSleepGun)
- จำนวนแท็ก (tagCount)
- โควต้า SleepGun (quotaRoomSleepGun)

### 3. Virtual Fields
- `totalRooms` - จำนวนห้องพักทั้งหมด
- `availableQuota` - โควต้าที่เหลือ
- `quotaPercentage` - เปอร์เซ็นต์การใช้โควต้า

## API Endpoints

### POS Management
```
POST   /api/pos          - สร้าง POS ใหม่
GET    /api/pos          - ดึงข้อมูล POS พร้อมข้อมูลรวม
PUT    /api/pos          - อัปเดตข้อมูล POS
DELETE /api/pos          - ลบ POS
```

### Statistics
```
GET    /api/pos/statistics     - ดึงข้อมูลสถิติ
PUT    /api/pos/statistics     - อัปเดตสถิติ
```

## การใช้งาน

### 1. สร้าง POS ใหม่
```javascript
POST /api/pos
{
  "posName": "โรงแรม ABC"
}
```

### 2. ดึงข้อมูลรวม
```javascript
GET /api/pos
// Response จะรวมข้อมูล:
// - pos: ข้อมูล POS
// - buildings: รายการตึก
// - rooms: รายการห้องพัก
// - tags: รายการแท็ก
// - statistics: สถิติรวม
```

### 3. ดึงข้อมูลสถิติ
```javascript
GET /api/pos/statistics
// Response:
{
  "buildingCount": 2,
  "roomCount": 15,
  "roomCountSleepGun": 3,
  "tagCount": 5,
  "quota": {
    "current": 3,
    "max": 5,
    "remaining": 2,
    "percentage": 60
  },
  "roomStatus": [...],
  "roomType": [...]
}
```

## การอัปเดตสถิติอัตโนมัติ

เมื่อมีการเปลี่ยนแปลงข้อมูลในไฟล์ลูก ระบบจะอัปเดตสถิติใน POS อัตโนมัติ:

### Building Controller
- สร้างตึกใหม่ → อัปเดต buildingCount
- อัปเดตตึก → อัปเดตสถิติ
- ลบตึก → อัปเดต buildingCount

### Room Controller
- สร้างห้องใหม่ → อัปเดต roomCount
- อัปเดตสถานะห้อง → อัปเดต roomCountSleepGun
- ลบห้อง → อัปเดต roomCount

### Tag Controller
- สร้างแท็กใหม่ → อัปเดต tagCount
- อัปเดตแท็ก → อัปเดตสถิติ
- ลบแท็ก → อัปเดต tagCount

## Middleware

ระบบใช้ `authenticatePartner` middleware เพื่อตรวจสอบสิทธิ์การเข้าถึง:

```javascript
router.use(authenticatePartner);
```

## การจัดการข้อผิดพลาด

- ตรวจสอบการมีอยู่ของ POS สำหรับ partner
- จัดการข้อผิดพลาดในการอัปเดตสถิติ
- ตรวจสอบโควต้า SleepGun

## การขยายระบบ

สามารถเพิ่มฟีเจอร์ใหม่ได้โดย:

1. เพิ่ม fields ใน pos.schema.js
2. อัปเดต updateStatistics method
3. เพิ่ม endpoints ใน pos.controller.js
4. เพิ่ม routes ใน pos.routes.js 