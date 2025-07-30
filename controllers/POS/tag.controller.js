const tagPOS = require("../../models/POS/tag.schema");

// Create new tag
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ชื่อแท็กเป็นข้อมูลที่จำเป็น"
      });
    }

    // Check if tag name already exists
    const existingTag = await tagPOS.findOne({ name: name.trim() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "ชื่อแท็กนี้มีอยู่แล้ว"
      });
    }

    // Create new tag
    const newTag = new tagPOS({
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

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await tagPOS.find().sort({ createdAt: -1 });

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

// Get tag by ID
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await tagPOS.findById(id);
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

// Update tag by ID
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if tag exists
    const existingTag = await tagPOS.findById(id);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการอัปเดต"
      });
    }

    // Check if new name already exists (if name is being updated)
    if (name && name.trim() !== existingTag.name) {
      const duplicateTag = await tagPOS.findOne({ 
        name: name.trim(),
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

// Delete tag by ID
const deleteTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTag = await tagPOS.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบแท็กที่ต้องการลบ"
      });
    }

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

// Delete all tags
const deleteAllTags = async (req, res) => {
  try {
    const result = await tagPOS.deleteMany({});

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
