const building = require("../../models/POS/building.schema");

// สร้างตึกใหม่
const createBuilding = async (req, res) => {
  try {
    const { nameBuilding, colorText, hascolorBG, colorBG, imgBG } = req.body;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    console.log('📥 Received building data:', {
      nameBuilding,
      colorText,
      hascolorBG,
      colorBG: colorBG ? 'present' : 'undefined',
      imgBG: imgBG ? 'present (base64)' : 'undefined',
      partnerId
    });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!nameBuilding || !colorText || !hascolorBG) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      });
    }

    // ตรวจสอบความถูกต้องของข้อมูลรูปภาพ
    if (hascolorBG === 'imgBG' && imgBG) {
      // ตรวจสอบว่าเป็น base64 string ที่ถูกต้องหรือไม่
      if (!imgBG.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: "รูปแบบรูปภาพไม่ถูกต้อง กรุณาเลือกรูปภาพใหม่",
        });
      }
    }

    // สร้างตึกใหม่
    const newBuilding = new building({
      partnerId, // Associate with authenticated partner
      nameBuilding,
      colorText,
      hascolorBG,
      colorBG: hascolorBG === 'colorBG' ? colorBG : undefined,
      imgBG: hascolorBG === 'imgBG' ? imgBG : undefined,
    });

    const savedBuilding = await newBuilding.save();

    console.log('✅ Building saved successfully:', savedBuilding._id);

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

// ดึงข้อมูลตึกทั้งหมด (เฉพาะของ partner ที่ login)
const getAllBuildings = async (req, res) => {
  try {
    const partnerId = req.partner.id; // Get partner ID from authenticated user
    
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

// ดึงข้อมูลตึกตาม ID (เฉพาะของ partner ที่ login)
const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id; // Get partner ID from authenticated user
    
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

// อัปเดตข้อมูลตึก (เฉพาะของ partner ที่ login)
const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameBuilding, colorText, hascolorBG, colorBG, imgBG } = req.body;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    // Check if building belongs to the authenticated partner
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

// ลบตึก (เฉพาะของ partner ที่ login)
const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    // Check if building belongs to the authenticated partner
    const existingBuilding = await building.findOne({ _id: id, partnerId });
    if (!existingBuilding) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลตึก",
      });
    }

    const deletedBuilding = await building.findByIdAndDelete(id);

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

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
}; 