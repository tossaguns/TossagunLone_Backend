const tagPOS = require("../../models/POS/tag.schema");

// Create new tag
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ชื่อแท็กเป็นข้อมูลที่จำเป็น"
      });
    }

    // Check if tag name already exists for this partner
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

    // Create new tag
    const newTag = new tagPOS({
      partnerId, // Associate with authenticated partner
      name: name.trim(),
      description: description || "",
      color: color || "#FFBB00"
    });

    const savedTag = await newTag.save();

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

// Get all tags (only for authenticated partner)
const getAllTags = async (req, res) => {
  try {
    const partnerId = req.partner.id; // Get partner ID from authenticated user
    
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

// Get tag by ID (only for authenticated partner)
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

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

// Update tag by ID (only for authenticated partner)
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    // Check if tag exists and belongs to the authenticated partner
    const existingTag = await tagPOS.findOne({ _id: id, partnerId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการอัปเดต"
      });
    }

    // Check if new name already exists for this partner (if name is being updated)
    if (name && name.trim() !== existingTag.name) {
      const duplicateTag = await tagPOS.findOne({ 
        name: name.trim(),
        partnerId,
        _id: { $ne: id } // Exclude current tag
      });
      if (duplicateTag) {
        return res.status(400).json({
          success: false,
          message: "ชื่อแท็กนี้มีอยู่แล้ว"
        });
      }
    }

    // Update tag
    const updatedTag = await tagPOS.findByIdAndUpdate(
      id,
      {
        name: name ? name.trim() : existingTag.name,
        description: description !== undefined ? description : existingTag.description,
        color: color || existingTag.color
      },
      { new: true, runValidators: true }
    );

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

// Delete tag by ID (only for authenticated partner)
const deleteTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id; // Get partner ID from authenticated user

    // Check if tag exists and belongs to the authenticated partner
    const existingTag = await tagPOS.findOne({ _id: id, partnerId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการลบ"
      });
    }

    const deletedTag = await tagPOS.findByIdAndDelete(id);

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

// Delete all tags (only for authenticated partner)
const deleteAllTags = async (req, res) => {
  try {
    const partnerId = req.partner.id; // Get partner ID from authenticated user
    
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

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTagById,
  deleteAllTags
};
