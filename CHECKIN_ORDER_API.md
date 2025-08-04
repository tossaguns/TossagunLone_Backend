# CheckInOrder API Documentation

## ภาพรวม
API สำหรับจัดการ Check-in Orders ในระบบโรงแรม โดยมีฟีเจอร์หลัก:
- สร้าง Check-in Order ใหม่
- ดึงข้อมูล Check-in Orders
- อัปเดตและลบ Check-in Orders
- ดึงสถิติ Check-in Orders

## การสร้าง checkInOrderId
- รูปแบบ: `CI-yyyymm-x` (ตัวอย่าง: CI-202508-102)
- `yyyymm`: ปีและเดือน (202508 = สิงหาคม 2025)
- `x`: หมายเลขลำดับที่รีเซ็ตทุกเดือน (001, 002, 003, ...)

## การสร้าง orderCheckIn
- เป็นตัวนับออเดอร์ทั้งหมดของ partner
- เพิ่มขึ้นเรื่อยๆ ไม่รีเซ็ต

## Endpoints

### 1. สร้าง Check-in Order ใหม่
```
POST /HotelSleepGun/checkInOrder/create
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "partnerId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "roomIDs": ["64f1a2b3c4d5e6f7g8h9i0j2", "64f1a2b3c4d5e6f7g8h9i0j3"],
  "memberIDs": ["64f1a2b3c4d5e6f7g8h9i0j4", "64f1a2b3c4d5e6f7g8h9i0j5"],
  "orderBy": "employee_name",
  "employeeId": "64f1a2b3c4d5e6f7g8h9i0j6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "สร้าง Check-in Order สำเร็จ",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "partnerId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "checkInOrderId": "CI-202508-001",
    "orderCheckIn": 1,
    "orderDate": "2025-08-15T10:30:00.000Z",
    "orderTime": "2025-08-15T10:30:00.000Z",
    "orderBy": "employee_name",
    "employeeId": "64f1a2b3c4d5e6f7g8h9i0j6",
    "roomID": ["64f1a2b3c4d5e6f7g8h9i0j2", "64f1a2b3c4d5e6f7g8h9i0j3"],
    "memberID": ["64f1a2b3c4d5e6f7g8h9i0j4", "64f1a2b3c4d5e6f7g8h9i0j5"],
    "createdAt": "2025-08-15T10:30:00.000Z",
    "updatedAt": "2025-08-15T10:30:00.000Z"
  }
}
```

### 2. ดึง Check-in Orders ทั้งหมดของ Partner
```
GET /HotelSleepGun/checkInOrder/partner/:partnerId?page=1&limit=10&status=active
```

**Query Parameters:**
- `page`: หน้าปัจจุบัน (default: 1)
- `limit`: จำนวนรายการต่อหน้า (default: 10)
- `status`: สถานะ (optional)

**Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูล Check-in Orders สำเร็จ",
  "data": {
    "docs": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
        "checkInOrderId": "CI-202508-001",
        "orderCheckIn": 1,
        "orderDate": "2025-08-15T10:30:00.000Z",
        "orderBy": "employee_name",
        "employeeId": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
          "firstname": "สมหญิง",
          "lastname": "ใจดี",
          "employeeCode": "EMP001",
          "positionEmployee": "พนักงานต้อนรับ"
        },
        "roomID": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
            "roomNumber": "101",
            "price": 1500,
            "statusRoom": "ไม่ว่าง"
          }
        ],
        "memberID": [
          {
            "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
            "firstname": "สมชาย",
            "lastname": "ใจดี",
            "phone": "0812345678"
          }
        ]
      }
    ],
    "totalDocs": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3. ดึง Check-in Order ตาม ID
```
GET /HotelSleepGun/checkInOrder/:id
```

**Response:**
```json
{
  "success": true,
  "message": "ดึงข้อมูล Check-in Order สำเร็จ",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
    "checkInOrderId": "CI-202508-001",
    "orderCheckIn": 1,
    "orderDate": "2025-08-15T10:30:00.000Z",
    "orderBy": "employee_name",
    "roomID": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "roomNumber": "101",
        "price": 1500,
        "statusRoom": "ไม่ว่าง",
        "floor": "1"
      }
    ],
    "memberID": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
        "firstname": "สมชาย",
        "lastname": "ใจดี",
        "phone": "0812345678",
        "email": "somchai@example.com"
      }
    ],
    "partnerId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "companyName": "โรงแรมตัวอย่าง"
    }
  }
}
```

### 4. ดึง Check-in Order ตาม checkInOrderId
```
GET /HotelSleepGun/checkInOrder/order/:checkInOrderId?partnerId=64f1a2b3c4d5e6f7g8h9i0j1
```

**Query Parameters:**
- `partnerId`: ID ของ partner (optional)

### 5. อัปเดต Check-in Order
```
PUT /HotelSleepGun/checkInOrder/:id
```

**Body:**
```json
{
  "roomIDs": ["64f1a2b3c4d5e6f7g8h9i0j7", "64f1a2b3c4d5e6f7g8h9i0j8"],
  "memberIDs": ["64f1a2b3c4d5e6f7g8h9i0j9"],
  "orderBy": "new_employee_name",
  "employeeId": "64f1a2b3c4d5e6f7g8h9i0j7"
}
```

### 6. ลบ Check-in Order
```
DELETE /HotelSleepGun/checkInOrder/:id
```

**Response:**
```json
{
  "success": true,
  "message": "ลบ Check-in Order สำเร็จ"
}
```

### 7. ดึงสถิติ Check-in Orders
```
GET /HotelSleepGun/checkInOrder/stats/:partnerId?startDate=2025-08-01&endDate=2025-08-31
```

**Query Parameters:**
- `startDate`: วันที่เริ่มต้น (optional)
- `endDate`: วันที่สิ้นสุด (optional)

**Response:**
```json
{
  "success": true,
  "message": "ดึงสถิติ Check-in Orders สำเร็จ",
  "data": {
    "totalOrders": 150,
    "todayOrders": 5,
    "monthlyOrders": 45
  }
}
```

## การจัดการสถานะห้อง
- เมื่อสร้าง Check-in Order: ห้องจะเปลี่ยนสถานะเป็น "ไม่ว่าง"
- เมื่ออัปเดต Check-in Order: ห้องเก่าจะเปลี่ยนเป็น "ว่าง" ห้องใหม่จะเปลี่ยนเป็น "ไม่ว่าง"
- เมื่อลบ Check-in Order: ห้องจะเปลี่ยนสถานะเป็น "ว่าง"

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "กรุณากรอกข้อมูลให้ครบถ้วน"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "ไม่พบ Check-in Order"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "เกิดข้อผิดพลาดในการสร้าง Check-in Order",
  "error": "Error details"
}
```

## Authentication
ทุก endpoint ต้องใช้ `partnerAuth` middleware และส่ง token ใน header:
```
Authorization: Bearer <token>
```

## ตัวอย่างการใช้งาน

### สร้าง Check-in Order ใหม่
```javascript
const response = await fetch('/HotelSleepGun/checkInOrder/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    partnerId: '64f1a2b3c4d5e6f7g8h9i0j1',
    roomIDs: ['64f1a2b3c4d5e6f7g8h9i0j2'],
    memberIDs: ['64f1a2b3c4d5e6f7g8h9i0j4'],
    orderBy: 'employee_name',
    employeeId: '64f1a2b3c4d5e6f7g8h9i0j6'
  })
});

const result = await response.json();
console.log(result.data.checkInOrderId); // CI-202508-001
```

### ดึง Check-in Orders ทั้งหมด
```javascript
const response = await fetch('/HotelSleepGun/checkInOrder/partner/64f1a2b3c4d5e6f7g8h9i0j1?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const result = await response.json();
console.log(result.data.docs); // Array of check-in orders
``` 