# POS System API Documentation

## ภาพรวม
POS System API ที่รวมฟังก์ชันทั้งหมดไว้ในที่เดียว (POS, Building, Room, Tag) เพื่อให้ง่ายต่อการจัดการและเรียกใช้ข้อมูล

## Base URL
```
http://localhost:3000/HotelSleepGun/pos
```

## Authentication
ทุก endpoint ต้องใช้ `partnerAuth` middleware และส่ง token ใน header:
```
Authorization: Bearer <token>
```

---

## 📊 POS Endpoints

### สร้าง POS ใหม่
```http
POST /pos
```
**Body:**
```json
{
  "buildingCount": 2,
  "floorCount": 5,
  "floorDetail": "ตึก A 5 ชั้น",
  "roomCount": 20,
  "roomCountSleepGun": 3,
  "quotaRoomSleepGun": 5
}
```

### ดึงข้อมูล POS ทั้งหมด
```http
GET /pos
```

### ดึงข้อมูล POS ตาม ID
```http
GET /pos/:id
```

### ดึงข้อมูล POS สรุป
```http
GET /pos-summary
```

### อัปเดตข้อมูล POS
```http
PUT /pos/:id
```

### ลบ POS
```http
DELETE /pos/:id
```

### ลบ POS ทั้งหมด
```http
DELETE /pos
```

---

## 🏢 Building Endpoints

### สร้างตึกใหม่
```http
POST /buildings
```
**Body:**
```json
{
  "nameBuilding": "ตึก A",
  "colorText": "#FFFFFF",
  "hascolorBG": "colorBG",
  "colorBG": "#FFBB00"
}
```
หรือ
```json
{
  "nameBuilding": "ตึก B",
  "colorText": "#FFFFFF",
  "hascolorBG": "imgBG",
  "imgBG": "data:image/jpeg;base64,..."
}
```

### ดึงข้อมูลตึกทั้งหมด
```http
GET /buildings
```

### ดึงข้อมูลตึกตาม ID
```http
GET /buildings/:id
```

### อัปเดตข้อมูลตึก
```http
PUT /buildings/:id
```

### ลบตึก
```http
DELETE /buildings/:id
```

---

## 🏠 Room Endpoints

### สร้างห้องพัก
```http
POST /rooms
```
**Body (multipart/form-data):**
```
roomNumber: "101"
price: 1500
stayPeople: 2
roomDetail: "ห้องมาตรฐาน"
air: "ห้องเเอร์"
typeRoom: "64f8a1b2c3d4e5f6a7b8c9d0"
typeRoomHotel: ["64f8a1b2c3d4e5f6a7b8c9d1"]
imgrooms: [file1, file2, ...]
```

### ดึงข้อมูลห้องพักทั้งหมด
```http
GET /rooms
```

### ดึงข้อมูลห้องพักตาม ID
```http
GET /rooms/:id
```

### อัปเดตข้อมูลห้องพัก
```http
PUT /rooms/:id
```

### อัปเดตสถานะห้องพัก (SleepGunWeb/Walkin)
```http
PATCH /rooms/:id/status
```
**Body:**
```json
{
  "status": "SleepGunWeb"
}
```

### อัปเดตสถานะห้องพัก (ว่าง/ไม่ว่าง/กำลังทำความสะอาด)
```http
PATCH /rooms/:id/status-room
```
**Body:**
```json
{
  "statusRoom": "ว่าง"
}
```

### อัปเดตสถานะโปรโมชั่น
```http
PATCH /rooms/:id/status-promotion
```
**Body:**
```json
{
  "statusPromotion": "openPromotion"
}
```

### ลบห้องพักทั้งหมด
```http
DELETE /rooms
```

### ลบห้องพักตาม ID
```http
DELETE /rooms/:id
```

### ดึงตัวเลือกสถานะ
```http
GET /rooms/status-options
```

### ดึงข้อมูลโควต้า SleepGun
```http
GET /rooms/sleepgun-quota
```

---

## 🏷️ Tag Endpoints

### สร้างแท็กใหม่
```http
POST /tags
```
**Body:**
```json
{
  "name": "ห้องพรีเมียม",
  "description": "ห้องพรีเมียมพร้อมวิวสวย",
  "color": "#FF6B6B"
}
```

### ดึงข้อมูลแท็กทั้งหมด
```http
GET /tags
```

### ดึงข้อมูลแท็กตาม ID
```http
GET /tags/:id
```

### อัปเดตแท็ก
```http
PUT /tags/:id
```

### ลบแท็ก
```http
DELETE /tags/:id
```

### ลบแท็กทั้งหมด
```http
DELETE /tags
```

---

## 📈 Comprehensive Data Endpoints

### ดึงข้อมูล POS ทั้งหมดพร้อมข้อมูลที่เกี่ยวข้อง
```http
GET /complete-data
```

**Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูล POS ครบถ้วนเรียบร้อยแล้ว",
  "data": {
    "pos": [...],
    "buildings": [...],
    "rooms": [...],
    "tags": [...],
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
}
```

---

## 🔄 การอัปเดตสถิติอัตโนมัติ

ระบบจะอัปเดตสถิติ POS อัตโนมัติเมื่อมีการเปลี่ยนแปลงข้อมูลใน:
- สร้าง/อัปเดต/ลบ Building
- สร้าง/อัปเดต/ลบ Room
- สร้าง/อัปเดต/ลบ Tag

---

## 📝 ตัวอย่างการใช้งาน

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

---

## ⚠️ ข้อควรระวัง

1. **โควต้า SleepGun**: จำกัดสูงสุด 5 ห้องต่อ Partner
2. **รูปภาพ**: จำกัดสูงสุด 10 รูปต่อห้อง
3. **Authentication**: ต้องมี token ที่ถูกต้อง
4. **Partner ID**: ระบบจะใช้ partnerId จาก token อัตโนมัติ

---

## 🚀 ประโยชน์ของการรวม Controller

1. **ง่ายต่อการจัดการ**: ฟังก์ชันทั้งหมดอยู่ในไฟล์เดียว
2. **ลดการเรียก API**: สามารถดึงข้อมูลทั้งหมดพร้อมกันได้
3. **การอัปเดตสถิติอัตโนมัติ**: ไม่ต้องกังวลเรื่องการ sync ข้อมูล
4. **Consistency**: ใช้รูปแบบ response เดียวกันทั้งหมด
5. **Maintenance**: ง่ายต่อการบำรุงรักษาและแก้ไข 