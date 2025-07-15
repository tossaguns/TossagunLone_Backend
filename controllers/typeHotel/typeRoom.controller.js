const TypeRoom = require("../../models/typeHotel/typeRoom.schema");


// ✅ CREATE
exports.createTypeRoom = async (req, res) => {
  try {
    const { mainName, name, icon, description } = req.body;

    if (!mainName || !name) {
      return res.status(400).json({ message: "mainName และ name จำเป็นต้องกรอก" });
    }

    const existing = await TypeRoom.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "ชื่อประเภทห้องนี้มีอยู่แล้ว" });
    }

    const newType = new TypeRoom({ mainName, name, icon, description });
    await newType.save();

    res.status(201).json({ message: "เพิ่มประเภทห้องสำเร็จ", data: newType });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ✅ GET All Grouped by mainName
exports.getAllTypeRoomsGrouped = async (req, res) => {
  try {
    const grouped = await TypeRoom.aggregate([
      {
        $group: {
          _id: "$mainName",
          icon: { $first: "$icon" },
          types: {
            $push: {
              _id: "$_id",
              name: "$name",
              description: "$description",
              createdAt: "$createdAt",
            },
          },
        },
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ✅ GET by ID
exports.getTypeRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await TypeRoom.findById(id);

    if (!type) {
      return res.status(404).json({ message: "ไม่พบประเภทห้องนี้" });
    }

    res.status(200).json(type);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ✅ UPDATE by ID
exports.updateTypeRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainName, name, icon, description } = req.body;

    const updated = await TypeRoom.findByIdAndUpdate(
      id,
      { mainName, name, icon, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "ไม่พบประเภทห้องเพื่ออัปเดต" });
    }

    res.status(200).json({ message: "อัปเดตสำเร็จ", data: updated });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ✅ DELETE by ID
exports.deleteTypeRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await TypeRoom.findByIdAndDelete(id);
    res.status(200).json({ message: "ลบประเภทห้องสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ✅ DELETE ALL
exports.deleteAllTypeRooms = async (req, res) => {
  try {
    await TypeRoom.deleteMany({});
    res.status(200).json({ message: "ลบข้อมูลประเภทห้องทั้งหมดแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};
