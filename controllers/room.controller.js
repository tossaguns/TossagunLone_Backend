const Room = require("../models/room.schema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ตั้งค่า multer สำหรับอัปโหลดรูป (เก็บใน /uploads/room/)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/room");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ให้ไม่ซ้ำ
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { files: 10 },
}).array("imgrooms", 10); // field ชื่อ imgrooms

// สร้างห้องพัก
exports.createRoom = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // รูปภาพเก็บชื่อไฟล์
      const imgrooms = req.files ? req.files.map((file) => file.filename) : [];

      // ตรวจสอบ typeRoom ว่ามีหรือไม่
      if (!req.body.typeRoom) {
        return res.status(400).json({ message: "typeRoom is required" });
      }

      // สร้างข้อมูล
      const roomData = {
        roomNumber: req.body.roomNumber,
        price: req.body.price,
        stayPeople: req.body.stayPeople,
        roomDetail: req.body.roomDetail,
        imgrooms: imgrooms, // array ของชื่อไฟล์
        typeRoom: req.body.typeRoom, // ObjectId
        typeRoomHotel: req.body.typeRoomHotel
          ? Array.isArray(req.body.typeRoomHotel)
            ? req.body.typeRoomHotel
            : [req.body.typeRoomHotel]
          : [],
        partnerId: req.user.id, // เพิ่ม partnerId
      };

      const newRoom = new Room(roomData);
      const savedRoom = await newRoom.save();
      res.status(201).json(savedRoom);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// ดึงข้อมูลทั้งหมด
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ partnerId: req.user.id })
      .populate("typeRoom")
      .populate("typeRoomHotel");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึงข้อมูลตาม id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("typeRoom")
      .populate("typeRoomHotel");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// อัปเดตข้อมูล (พร้อมอัปโหลดรูปภาพใหม่เพิ่ม/แทนที่)
exports.updateRoom = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const room = await Room.findById(req.params.id);
      if (!room) return res.status(404).json({ message: "Room not found" });

      // อัปเดตฟิลด์ตามที่ส่งมา (ยกเว้นรูป)
      room.roomNumber = req.body.roomNumber ?? room.roomNumber;
      room.price = req.body.price ?? room.price;
      room.stayPeople = req.body.stayPeople ?? room.stayPeople;
      room.roomDetail = req.body.roomDetail ?? room.roomDetail;
      room.typeRoom = req.body.typeRoom ?? room.typeRoom;
      room.typeRoomHotel = req.body.typeRoomHotel
        ? Array.isArray(req.body.typeRoomHotel)
          ? req.body.typeRoomHotel
          : [req.body.typeRoomHotel]
        : room.typeRoomHotel;

      // ถ้ามีรูปใหม่ให้แทนที่ทั้งหมด (หรือต้องการแบบเพิ่มให้ปรับโค้ดได้)
      if (req.files && req.files.length > 0) {
        // (ถ้าต้องการลบรูปเก่า อาจเพิ่มโค้ดลบไฟล์ใน server ได้)
        room.imgrooms = req.files.map((file) => file.filename);
      }

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;         // รับ id ห้องพักจาก URL param
    const { status } = req.body;       // รับสถานะใหม่จาก body

    // ตรวจสอบว่าสถานะที่ส่งมาตรงกับค่าในระบบหรือไม่
    const allowedStatuses = ["SleepGunWeb", "Walkin"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // หา room ด้วย id
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // อัปเดตสถานะ
    room.status = status;

    // บันทึก
    const updatedRoom = await room.save();

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoomStatusRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusRoom } = req.body;
    const allowedStatusRoom = ["เปิดใช้งาน", "ปิดทำการ"];
    if (!allowedStatusRoom.includes(statusRoom)) {
      return res.status(400).json({ message: "Invalid statusRoom value" });
    }
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    room.statusRoom = statusRoom;
    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoomStatusPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPromotion } = req.body;
    const allowedStatusPromotion = ["openPromotion", "closePromotion"];
    if (!allowedStatusPromotion.includes(statusPromotion)) {
      return res.status(400).json({ message: "Invalid statusPromotion value" });
    }
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    room.statusPromotion = statusPromotion;
    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ลบห้องพักทั้งหมด
exports.deleteAllRooms = async (req, res) => {
  try {
    await Room.deleteMany({});
    res.json({ message: "All rooms deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ลบห้องพักตาม id
exports.deleteRoomById = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStatusOptions = (req, res) => {
  try {
    const statusOptions = ["SleepGunWeb", "Walkin"];
    res.json(statusOptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
