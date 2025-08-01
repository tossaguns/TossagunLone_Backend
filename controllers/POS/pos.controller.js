const pos = require("../../models/POS/pos.schema");
const building = require("../../models/POS/building.schema");
const room = require("../../models/POS/room.schema");
const tagPOS = require("../../models/POS/tag.schema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/room");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { files: 10 },
}).array("imgrooms", 10);

// ==================== HELPER FUNCTIONS ====================
const updatePosStatistics = async (partnerId) => {
  try {
    console.log('🔄 Updating POS statistics for partnerId:', partnerId);
    
    // ดึงข้อมูลปัจจุบัน
    const buildings = await building.find({ partnerId });
    const rooms = await room.find({ partnerId });
    const sleepGunRooms = rooms.filter(room => room.status === 'SleepGunWeb');
    
    let totalFloorCount = 0;
    buildings.forEach(buildingDoc => {
      if (buildingDoc.floors && Array.isArray(buildingDoc.floors)) {
        totalFloorCount += buildingDoc.floors.length;
      }
    });
    
    // อัปเดตหรือสร้างข้อมูล POS
    const posData = await pos.findOne({ partnerId });
    if (posData) {
      posData.buildingCount = buildings.length;
      posData.floorCount = totalFloorCount;
      posData.roomCount = rooms.length;
      posData.roomCountSleepGun = sleepGunRooms.length;
      posData.quotaRoomSleepGun = 5;
      await posData.save();
      console.log('✅ Updated existing POS statistics');
    } else {
      // สร้างข้อมูล POS ใหม่
      const newPos = new pos({
        partnerId,
        buildingCount: buildings.length,
        floorCount: totalFloorCount,
        roomCount: rooms.length,
        roomCountSleepGun: sleepGunRooms.length,
        quotaRoomSleepGun: 5
      });
      await newPos.save();
      console.log('✅ Created new POS statistics');
    }
  } catch (error) {
    console.error("❌ Error updating POS statistics:", error);
  }
};

// ==================== POS CONTROLLERS ====================
const createPos = async (req, res) => {
  try {
    const { buildingCount, floorCount, floorDetail, roomCount, roomCountSleepGun, quotaRoomSleepGun, tag, building, room } = req.body;
    const partnerId = req.partner.id;

    if (buildingCount === undefined || floorCount === undefined || roomCount === undefined) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      });
    }

    const newPos = new pos({
      partnerId,
      buildingCount: buildingCount || 0,
      floorCount: floorCount || 0,
      floorDetail: floorDetail || '',
      roomCount: roomCount || 0,
      roomCountSleepGun: roomCountSleepGun || 0,
      quotaRoomSleepGun: quotaRoomSleepGun || 5,
      tags: tag ? [tag] : [],
      buildings: building ? [building] : [],
      rooms: room ? [room] : [],
    });

    const savedPos = await newPos.save();
    res.status(201).json({
      success: true,
      message: "สร้าง POS เรียบร้อยแล้ว",
      data: savedPos,
    });
  } catch (error) {
    console.error("❌ Error creating POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง POS",
      error: error.message,
    });
  }
};

const getAllPos = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    
    const posData = await pos.find({ partnerId })
      .populate('tags', 'name color')
      .populate('buildings', 'nameBuilding colorText hascolorBG colorBG imgBG')
      .populate('rooms', 'roomNumber price typeRoom air statusRoom status statusPromotion')
      .sort({ createdAt: -1 });

    const tags = await tagPOS.find({ partnerId });
    const buildings = await building.find({ partnerId });
    const rooms = await room.find({ partnerId })
      .populate('typeRoom')
      .populate('typeRoomHotel');

    const enrichedPosData = posData.map(posItem => ({
      ...posItem.toObject(),
      tags: tags,
      buildings: buildings,
      rooms: rooms
    }));

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูล POS เรียบร้อยแล้ว",
      data: enrichedPosData,
    });
  } catch (error) {
    console.error("❌ Error fetching POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล POS",
      error: error.message,
    });
  }
};

const getPosById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;
    
    const posData = await pos.findOne({ _id: id, partnerId })
      .populate('tags', 'name color')
      .populate('buildings', 'nameBuilding colorText hascolorBG colorBG imgBG')
      .populate('rooms', 'roomNumber price typeRoom air statusRoom status statusPromotion');

    if (!posData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล POS",
      });
    }

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูล POS เรียบร้อยแล้ว",
      data: posData,
    });
  } catch (error) {
    console.error("❌ Error fetching POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล POS",
      error: error.message,
    });
  }
};

const getPosSummary = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    console.log('🔍 Getting POS summary for partnerId:', partnerId);
    
    // ดึงข้อมูลจริงจากตาราง buildings และ rooms
    const buildings = await building.find({ partnerId });
    const rooms = await room.find({ partnerId });
    
    console.log('🏢 Found buildings:', buildings.length);
    console.log('🏠 Found rooms:', rooms.length);
    
    // นับจำนวนห้องที่เป็น SleepGunWeb
    const sleepGunRooms = rooms.filter(room => room.status === 'SleepGunWeb');
    console.log('💤 SleepGun rooms:', sleepGunRooms.length);
    
    // คำนวณจำนวนชั้นทั้งหมด
    let totalFloorCount = 0;
    buildings.forEach(buildingDoc => {
      if (buildingDoc.floors && Array.isArray(buildingDoc.floors)) {
        totalFloorCount += buildingDoc.floors.length;
      }
    });
    console.log('🏢 Total floors:', totalFloorCount);
    
    const summary = {
      totalBuildingCount: buildings.length,
      totalFloorCount: totalFloorCount,
      totalRoomCount: rooms.length,
      totalRoomCountSleepGun: sleepGunRooms.length,
      totalQuotaRoomSleepGun: 5, // โควต้าเริ่มต้น
      totalPosRecords: buildings.length + rooms.length
    };

    console.log('📊 POS Summary:', summary);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสรุป POS เรียบร้อยแล้ว",
      data: summary,
    });
  } catch (error) {
    console.error("❌ Error fetching POS summary:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุป POS",
      error: error.message,
    });
  }
};

const updatePos = async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingCount, floorCount, floorDetail, roomCount, roomCountSleepGun, quotaRoomSleepGun, tag, building, room } = req.body;
    const partnerId = req.partner.id;

    const existingPos = await pos.findOne({ _id: id, partnerId });
    if (!existingPos) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล POS",
      });
    }

    const updatedPos = await pos.findByIdAndUpdate(
      id,
      { buildingCount, floorCount, floorDetail, roomCount, roomCountSleepGun, quotaRoomSleepGun, tag, building, room },
      { new: true }
    ).populate('tag', 'name color')
     .populate('building', 'nameBuilding colorText hascolorBG colorBG imgBG')
     .populate('room', 'roomNumber price typeRoom air statusRoom status statusPromotion');

    res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูล POS เรียบร้อยแล้ว",
      data: updatedPos,
    });
  } catch (error) {
    console.error("❌ Error updating POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล POS",
      error: error.message,
    });
  }
};

const deletePos = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;

    const existingPos = await pos.findOne({ _id: id, partnerId });
    if (!existingPos) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล POS",
      });
    }

    const deletedPos = await pos.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "ลบ POS เรียบร้อยแล้ว",
      data: deletedPos,
    });
  } catch (error) {
    console.error("❌ Error deleting POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ POS",
      error: error.message,
    });
  }
};

const deleteAllPos = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    const deletedPos = await pos.deleteMany({ partnerId });

    res.status(200).json({
      success: true,
      message: "ลบ POS ทั้งหมดเรียบร้อยแล้ว",
      data: { deletedCount: deletedPos.deletedCount },
    });
  } catch (error) {
    console.error("❌ Error deleting all POS:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ POS ทั้งหมด",
      error: error.message,
    });
  }
};

// ==================== BUILDING CONTROLLERS ====================
const createBuilding = async (req, res) => {
  try {
    const { nameBuilding, colorText, hascolorBG, colorBG, imgBG } = req.body;
    const partnerId = req.partner.id;

    if (!nameBuilding || !colorText || !hascolorBG) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      });
    }

    if (hascolorBG === 'imgBG' && imgBG && !imgBG.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบรูปภาพไม่ถูกต้อง กรุณาเลือกรูปภาพใหม่",
      });
    }

    const newBuilding = new building({
      partnerId,
      nameBuilding,
      colorText,
      hascolorBG,
      colorBG: hascolorBG === 'colorBG' ? colorBG : undefined,
      imgBG: hascolorBG === 'imgBG' ? imgBG : undefined,
      floors: [] // เริ่มต้นด้วยชั้นว่าง
    });

    const savedBuilding = await newBuilding.save();
    console.log('✅ Building saved, updating statistics...');
    await updatePosStatistics(partnerId);

    res.status(201).json({
      success: true,
      message: "สร้างตึกเรียบร้อยแล้ว",
      data: savedBuilding,
    });
  } catch (error) {
    console.error("❌ Error creating building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างตึก",
      error: error.message,
    });
  }
};

// เพิ่มฟังก์ชันสำหรับเพิ่มชั้นในตึก
const addFloorToBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const { name, description } = req.body;
    const partnerId = req.partner.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ชื่อชั้นเป็นข้อมูลที่จำเป็น",
      });
    }

    const buildingData = await building.findOne({ _id: buildingId, partnerId });
    if (!buildingData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    // ตรวจสอบว่าชั้นนี้มีอยู่แล้วหรือไม่
    const existingFloor = buildingData.floors.find(floor => floor.name === name.trim());
    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: "ชั้นนี้มีอยู่แล้วในตึกนี้",
      });
    }

    // เพิ่มชั้นใหม่
    buildingData.floors.push({
      name: name.trim(),
      description: description || "",
      roomCount: 0
    });

    const updatedBuilding = await buildingData.save();
    console.log('✅ Floor added, updating statistics...');
    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "เพิ่มชั้นเรียบร้อยแล้ว",
      data: updatedBuilding,
    });
  } catch (error) {
    console.error("❌ Error adding floor to building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มชั้น",
      error: error.message,
    });
  }
};

// เพิ่มฟังก์ชันสำหรับลบชั้นจากตึก
const removeFloorFromBuilding = async (req, res) => {
  try {
    const { buildingId, floorName } = req.params;
    const partnerId = req.partner.id;

    const buildingData = await building.findOne({ _id: buildingId, partnerId });
    if (!buildingData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    // ตรวจสอบว่ามีห้องในชั้นนี้หรือไม่
    const roomCount = await room.countDocuments({ 
      buildingId: buildingId, 
      floor: floorName,
      partnerId: partnerId 
    });

    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถลบชั้นได้ เนื่องจากมีห้อง ${roomCount} ห้องในชั้นนี้`,
      });
    }

    // ลบชั้นออก
    buildingData.floors = buildingData.floors.filter(floor => floor.name !== floorName);
    const updatedBuilding = await buildingData.save();
    console.log('✅ Floor removed, updating statistics...');
    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "ลบชั้นเรียบร้อยแล้ว",
      data: updatedBuilding,
    });
  } catch (error) {
    console.error("❌ Error removing floor from building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบชั้น",
      error: error.message,
    });
  }
};

// เพิ่มฟังก์ชันสำหรับดึงชั้นในตึก
const getFloorsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const partnerId = req.partner.id;

    const buildingData = await building.findOne({ _id: buildingId, partnerId });
    if (!buildingData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลชั้นเรียบร้อยแล้ว",
      data: buildingData.floors,
    });
  } catch (error) {
    console.error("❌ Error getting floors by building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลชั้น",
      error: error.message,
    });
  }
};

// แก้ไขฟังก์ชัน getAllBuildings เพื่อ populate floors
const getAllBuildings = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    const buildings = await building.find({ partnerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลตึกเรียบร้อยแล้ว",
      data: buildings,
    });
  } catch (error) {
    console.error("❌ Error fetching buildings:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตึก",
      error: error.message,
    });
  }
};

const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;
    
    const buildingData = await building.findOne({ _id: id, partnerId });

    if (!buildingData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลตึกเรียบร้อยแล้ว",
      data: buildingData,
    });
  } catch (error) {
    console.error("❌ Error fetching building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตึก",
      error: error.message,
    });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameBuilding, colorText, hascolorBG, colorBG, imgBG } = req.body;
    const partnerId = req.partner.id;

    const existingBuilding = await building.findOne({ _id: id, partnerId });
    if (!existingBuilding) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    const updatedBuilding = await building.findByIdAndUpdate(
      id,
      {
        nameBuilding,
        colorText,
        hascolorBG,
        colorBG: hascolorBG === 'colorBG' ? colorBG : undefined,
        imgBG: hascolorBG === 'imgBG' ? imgBG : undefined,
      },
      { new: true }
    );

    console.log('✅ Building updated, updating statistics...');
    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูลตึกเรียบร้อยแล้ว",
      data: updatedBuilding,
    });
  } catch (error) {
    console.error("❌ Error updating building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลตึก",
      error: error.message,
    });
  }
};

const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;

    const existingBuilding = await building.findOne({ _id: id, partnerId });
    if (!existingBuilding) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    const deletedBuilding = await building.findByIdAndDelete(id);
    console.log('✅ Building deleted, updating statistics...');
    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "ลบตึกเรียบร้อยแล้ว",
      data: deletedBuilding,
    });
  } catch (error) {
    console.error("❌ Error deleting building:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบตึก",
      error: error.message,
    });
  }
};

// ==================== ROOM CONTROLLERS ====================
const createRoom = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const imgrooms = req.files ? req.files.map((file) => file.filename) : [];

      if (!req.body.typeRoom) {
        return res.status(400).json({ message: "typeRoom is required" });
      }

      if (!req.body.buildingId) {
        return res.status(400).json({ message: "buildingId is required" });
      }

      if (!req.body.floor) {
        return res.status(400).json({ message: "floor is required" });
      }

      const roomData = {
        roomNumber: req.body.roomNumber,
        price: req.body.price,
        stayPeople: req.body.stayPeople,
        roomDetail: req.body.roomDetail,
        air: req.body.air,
        floor: req.body.floor,
        buildingId: req.body.buildingId, // เพิ่ม buildingId
        imgrooms: imgrooms,
        typeRoom: req.body.typeRoom,
        typeRoomHotel: req.body.typeRoomHotel
          ? Array.isArray(req.body.typeRoomHotel)
            ? req.body.typeRoomHotel
            : [req.body.typeRoomHotel]
          : [],
              tag: req.body.tag ? (Array.isArray(req.body.tag) ? req.body.tag : [req.body.tag]) : [],
        partnerId: req.partner.id,
      };

      const newRoom = new room(roomData);
      const savedRoom = await newRoom.save();

      // อัปเดต roomCount ในชั้น
      const buildingData = await building.findById(req.body.buildingId);
      if (buildingData) {
        const floorIndex = buildingData.floors.findIndex(floor => floor.name === req.body.floor);
        if (floorIndex !== -1) {
          buildingData.floors[floorIndex].roomCount += 1;
          await buildingData.save();
        }
      }

      console.log('✅ Room created, updating statistics...');
      await updatePosStatistics(req.partner.id);

      res.status(201).json(savedRoom);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await room.find({ partnerId: req.partner.id })
      .populate("typeRoom")
      .populate("typeRoomHotel")
      .populate("tag", "name color description");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// เพิ่มฟังก์ชันสำหรับดึงห้องตามตึกและชั้น
const getRoomsByBuildingAndFloor = async (req, res) => {
  try {
    const { buildingId, floor } = req.params;
    const partnerId = req.partner.id;
    
    const rooms = await room.find({ 
      partnerId: partnerId,
      buildingId: buildingId,
      floor: floor 
    })
      .populate("typeRoom")
      .populate("typeRoomHotel")
      .populate("buildingId", "nameBuilding")
      .populate("tag", "name color description");
      
    res.status(200).json({
      success: true,
      message: `ดึงข้อมูลห้องพักในตึก ${buildingId} ชั้น ${floor} เรียบร้อยแล้ว`,
      data: rooms
    });
  } catch (error) {
    console.error("❌ Error fetching rooms by building and floor:", error);
    res.status(500).json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก",
      error: error.message 
    });
  }
};

const getRoomsByFloor = async (req, res) => {
  try {
    const { buildingId, floor } = req.params;
    const partnerId = req.partner.id;
    
    const rooms = await room.find({ 
      partnerId: partnerId,
      buildingId: buildingId,
      floor: floor 
    })
      .populate("typeRoom")
      .populate("typeRoomHotel")
      .populate("buildingId", "nameBuilding")
      .populate("tag", "name color description");
      
    res.status(200).json({
      success: true,
      message: `ดึงข้อมูลห้องพักในตึก ${buildingId} ชั้น ${floor} เรียบร้อยแล้ว`,
      data: rooms
    });
  } catch (error) {
    console.error("❌ Error fetching rooms by floor:", error);
    res.status(500).json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก",
      error: error.message 
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const roomData = await room.findById(req.params.id)
      .populate("typeRoom")
      .populate("typeRoomHotel")
      .populate("tag", "name color description");
    if (!roomData) return res.status(404).json({ message: "Room not found" });
    res.json(roomData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoom = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const roomData = await room.findById(req.params.id);
      if (!roomData) return res.status(404).json({ message: "Room not found" });

      roomData.roomNumber = req.body.roomNumber ?? roomData.roomNumber;
      roomData.price = req.body.price ?? roomData.price;
      roomData.stayPeople = req.body.stayPeople ?? roomData.stayPeople;
      roomData.roomDetail = req.body.roomDetail ?? roomData.roomDetail;
      roomData.air = req.body.air ?? roomData.air;
      roomData.floor = req.body.floor ?? roomData.floor; // เพิ่ม floor field
      roomData.typeRoom = req.body.typeRoom ?? roomData.typeRoom;
      roomData.typeRoomHotel = req.body.typeRoomHotel
        ? Array.isArray(req.body.typeRoomHotel)
          ? req.body.typeRoomHotel
          : [req.body.typeRoomHotel]
        : roomData.typeRoomHotel;

      // อัปเดต tag
      if (req.body.tag !== undefined) {
        roomData.tag = req.body.tag ? (Array.isArray(req.body.tag) ? req.body.tag : [req.body.tag]) : [];
      }

      if (req.files && req.files.length > 0) {
        roomData.imgrooms = req.files.map((file) => file.filename);
      }

      const updatedRoom = await roomData.save();
      console.log('✅ Room updated, updating statistics...');
      await updatePosStatistics(req.partner.id);

      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["SleepGunWeb", "Walkin"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const roomData = await room.findById(id);
    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (status === "SleepGunWeb" && roomData.status !== "SleepGunWeb") {
      const sleepGunCount = await room.countDocuments({
        partnerId: req.partner.id,
        status: "SleepGunWeb"
      });

      if (sleepGunCount >= 5) {
        return res.status(400).json({ 
          message: "โควต้าห้อง SleepGun เต็มแล้ว (สูงสุด 5 ห้องต่อ partner)",
          currentCount: sleepGunCount,
          maxQuota: 5
        });
      }
    }

    roomData.status = status;
    const updatedRoom = await roomData.save();
    console.log('✅ Room status updated, updating statistics...');
    await updatePosStatistics(req.partner.id);

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoomStatusRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusRoom } = req.body;
    const allowedStatusRoom = ["ว่าง", "ไม่ว่าง", "กำลังทำความสะอาด"];
    if (!allowedStatusRoom.includes(statusRoom)) {
      return res.status(400).json({ message: "Invalid statusRoom value" });
    }
    const roomData = await room.findById(id);
    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }
    roomData.statusRoom = statusRoom;
    const updatedRoom = await roomData.save();
    await updatePosStatistics(req.partner.id);

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoomStatusPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPromotion } = req.body;
    const allowedStatusPromotion = ["openPromotion", "closePromotion"];
    if (!allowedStatusPromotion.includes(statusPromotion)) {
      return res.status(400).json({ message: "Invalid statusPromotion value" });
    }
    const roomData = await room.findById(id);
    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }
    roomData.statusPromotion = statusPromotion;
    const updatedRoom = await roomData.save();
    await updatePosStatistics(req.partner.id);

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAllRooms = async (req, res) => {
  try {
    await room.deleteMany({});
    res.json({ message: "All rooms deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoomById = async (req, res) => {
  try {
    const roomData = await room.findByIdAndDelete(req.params.id);
    if (!roomData) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatusOptions = (req, res) => {
  try {
    const statusOptions = ["SleepGunWeb", "Walkin"];
    res.json(statusOptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSleepGunQuota = async (req, res) => {
  try {
    const sleepGunCount = await room.countDocuments({
      partnerId: req.partner.id,
      status: "SleepGunWeb"
    });

    const quota = 5;
    const remaining = Math.max(0, quota - sleepGunCount);

    res.json({
      currentCount: sleepGunCount,
      maxQuota: quota,
      remaining: remaining,
      isFull: sleepGunCount >= quota
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TAG CONTROLLERS ====================
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const partnerId = req.partner.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ชื่อแท็กเป็นข้อมูลที่จำเป็น"
      });
    }

    const existingTag = await tagPOS.findOne({ 
      name: name.trim(), 
      partnerId 
    });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "ชื่อแท็กนี้มีอยู่แล้ว"
      });
    }

    const newTag = new tagPOS({
      partnerId,
      name: name.trim(),
      description: description || "",
      color: color || "#FFBB00"
    });

    const savedTag = await newTag.save();
    await updatePosStatistics(partnerId);

    res.status(201).json({
      success: true,
      message: "สร้างแท็กสำเร็จ",
      data: savedTag
    });

  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างแท็ก",
      error: error.message
    });
  }
};

const getAllTags = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    
    const tags = await tagPOS.find({ partnerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลแท็กสำเร็จ",
      data: tags,
      count: tags.length
    });

  } catch (error) {
    console.error("Error getting tags:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลแท็ก",
      error: error.message
    });
  }
};

const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;

    const tag = await tagPOS.findOne({ _id: id, partnerId });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการ"
      });
    }

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลแท็กสำเร็จ",
      data: tag
    });

  } catch (error) {
    console.error("Error getting tag by ID:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลแท็ก",
      error: error.message
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const partnerId = req.partner.id;

    const existingTag = await tagPOS.findOne({ _id: id, partnerId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการอัปเดต"
      });
    }

    if (name && name.trim() !== existingTag.name) {
      const duplicateTag = await tagPOS.findOne({ 
        name: name.trim(),
        partnerId,
        _id: { $ne: id }
      });
      if (duplicateTag) {
        return res.status(400).json({
          success: false,
          message: "ชื่อแท็กนี้มีอยู่แล้ว"
        });
      }
    }

    const updatedTag = await tagPOS.findByIdAndUpdate(
      id,
      {
        name: name ? name.trim() : existingTag.name,
        description: description !== undefined ? description : existingTag.description,
        color: color || existingTag.color
      },
      { new: true, runValidators: true }
    );

    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "อัปเดตแท็กสำเร็จ",
      data: updatedTag
    });

  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตแท็ก",
      error: error.message
    });
  }
};

const deleteTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id;

    const existingTag = await tagPOS.findOne({ _id: id, partnerId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการลบ"
      });
    }

    const deletedTag = await tagPOS.findByIdAndDelete(id);
    await updatePosStatistics(partnerId);

    res.status(200).json({
      success: true,
      message: "ลบแท็กสำเร็จ",
      data: deletedTag
    });

  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบแท็ก",
      error: error.message
    });
  }
};

const deleteAllTags = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    
    const result = await tagPOS.deleteMany({ partnerId });

    res.status(200).json({
      success: true,
      message: "ลบแท็กทั้งหมดสำเร็จ",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error deleting all tags:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบแท็กทั้งหมด",
      error: error.message
    });
  }
};

// ==================== COMPREHENSIVE DATA FETCHING ====================
const getCompletePosData = async (req, res) => {
  try {
    const partnerId = req.partner.id;
    
    // ดึงข้อมูลทั้งหมดพร้อมกัน
    const [posData, buildings, rooms, tags] = await Promise.all([
      pos.find({ partnerId }).populate('tags').populate('buildings').populate('rooms'),
      building.find({ partnerId }),
      room.find({ partnerId }).populate('typeRoom').populate('typeRoomHotel').populate('tag', 'name color description'),
      tagPOS.find({ partnerId })
    ]);

    // คำนวณสถิติ
    const statistics = {
      totalBuildings: buildings.length,
      totalRooms: rooms.length,
      totalTags: tags.length,
      sleepGunRooms: rooms.filter(r => r.status === 'SleepGunWeb').length,
      availableRooms: rooms.filter(r => r.statusRoom === 'ว่าง').length,
      occupiedRooms: rooms.filter(r => r.statusRoom === 'ไม่ว่าง').length,
      cleaningRooms: rooms.filter(r => r.statusRoom === 'กำลังทำความสะอาด').length
    };

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูล POS ครบถ้วนเรียบร้อยแล้ว",
      data: {
        pos: posData,
        buildings,
        rooms,
        tags,
        statistics
      }
    });
  } catch (error) {
    console.error("❌ Error fetching complete POS data:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล POS",
      error: error.message,
    });
  }
};

// ==================== FLOOR MANAGEMENT ====================
const updateFloorName = async (req, res) => {
  try {
    const { buildingId, oldFloorName } = req.params;
    const { newFloorName } = req.body;
    const partnerId = req.partner.id;

    console.log('🏢 Updating floor name:', { buildingId, oldFloorName, newFloorName, partnerId });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!newFloorName || !newFloorName.trim()) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อชั้นใหม่"
      });
    }

    // ค้นหาตึก
    const buildingDoc = await building.findOne({ _id: buildingId, partnerId });
    if (!buildingDoc) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบตึกที่ต้องการแก้ไข"
      });
    }

    // ตรวจสอบว่าชั้นที่ต้องการแก้ไขมีอยู่หรือไม่
    const floorIndex = buildingDoc.floors.findIndex(floor => floor.name === oldFloorName);
    if (floorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบชั้นที่ต้องการแก้ไข"
      });
    }

    // ตรวจสอบว่าชื่อชั้นใหม่ซ้ำกับชั้นอื่นหรือไม่
    const isDuplicate = buildingDoc.floors.some(floor => floor.name === newFloorName.trim());
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: "ชื่อชั้นนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น"
      });
    }

    // อัปเดตชื่อชั้น
    buildingDoc.floors[floorIndex].name = newFloorName.trim();
    await buildingDoc.save();

    // อัปเดตชื่อชั้นในห้องที่เกี่ยวข้อง
    await room.updateMany(
      { 
        buildingId: buildingId, 
        floor: oldFloorName,
        partnerId 
      },
      { 
        $set: { floor: newFloorName.trim() } 
      }
    );

    // อัปเดตสถิติ
    await updatePosStatistics(partnerId);

    console.log('✅ Floor name updated successfully');

    res.status(200).json({
      success: true,
      message: "อัปเดตชื่อชั้นเรียบร้อยแล้ว",
      data: {
        buildingId,
        oldFloorName,
        newFloorName: newFloorName.trim()
      }
    });

  } catch (error) {
    console.error("❌ Error updating floor name:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตชื่อชั้น",
      error: error.message
    });
  }
};

module.exports = {
  // POS Controllers
  createPos,
  getAllPos,
  getPosById,
  getPosSummary,
  updatePos,
  deletePos,
  deleteAllPos,
  
  // Building Controllers
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
  addFloorToBuilding,
  removeFloorFromBuilding,
  getFloorsByBuilding,
  updateFloorName,
  
  // Room Controllers
  createRoom,
  getAllRooms,
  getRoomsByFloor,
  getRoomsByBuildingAndFloor,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  updateRoomStatusRoom,
  updateRoomStatusPromotion,
  deleteAllRooms,
  deleteRoomById,
  getStatusOptions,
  getSleepGunQuota,
  
  // Tag Controllers
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTagById,
  deleteAllTags,
  
  // Comprehensive Data
  getCompletePosData
}; 