const Member = require("../../models/user/member");
const { S3Client, PutObjectCommand , DeleteObjectCommand } = require("@aws-sdk/client-s3");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Partner = require("../../models/user/partner"); // เพิ่มบรรทัดนี้

// ตั้งค่า AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ฟังก์ชันสร้าง memberId (เปลี่ยนจาก P เป็น M)
const generateMemberId = async () => {
  const lastMember = await Member.findOne({}, {}, { sort: { createdAt: -1 } });

  let lastId = 0;
  if (lastMember && lastMember.memberId) {
    const numberPart = lastMember.memberId.replace(/^M/, "");
    if (!isNaN(numberPart)) {
      lastId = parseInt(numberPart);
    } else {
      console.warn("Invalid memberId format:", lastMember.memberId);
    }
  }

  return "M" + String(lastId + 1).padStart(6, "0");
};

// ฟังก์ชันตรวจสอบข้อมูลที่ซ้ำ
const checkDuplicate = async (field, value) => {
  const [memberUser, partnerUser] = await Promise.all([
    Member.findOne({ [field]: value }),
    Partner.findOne({ [field]: value }),
  ]);
  return { exists: !!memberUser || !!partnerUser };
};

// สมัครสมาชิก Member
exports.registerMember = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ตรวจสอบข้อมูลที่ต้องไม่ซ้ำ
    const checks = await Promise.all([
      checkDuplicate("username", req.body.username),
      checkDuplicate("personalId", req.body.personalId),
      checkDuplicate("personalPhone", req.body.personalPhone),
      checkDuplicate("personalEmail", req.body.personalEmail),
    ]);

    const conflicts = {
      username: checks[0].exists,
      personalId: checks[1].exists,
      personalPhone: checks[2].exists,
      personalEmail: checks[3].exists,
    };

    const conflictNames = [];
    if (conflicts.username) conflictNames.push("ชื่อผู้ใช้");
    if (conflicts.personalId) conflictNames.push("เลขบัตรประชาชน");
    if (conflicts.personalPhone) conflictNames.push("เบอร์โทรศัพท์ส่วนตัว");
    if (conflicts.personalEmail) conflictNames.push("อีเมลส่วนตัว");

    if (conflictNames.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "ข้อมูลซ้ำกับในระบบ",
        fields: conflicts,
        conflictNames,
      });
    }

    // สร้าง memberId
    const memberId = await generateMemberId();

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // สร้างข้อมูล Member
    const newMember = new Member({
      username: req.body.username,
      password: hashedPassword,
      role: "member",
      memberId: memberId,
      title: req.body.title,
      fullName: req.body.fullName,
      personalId: req.body.personalId,
      personalPhone: req.body.personalPhone,
      personalEmail: req.body.personalEmail,
      personalAddress: req.body.personalAddress,
      personalProvince: req.body.personalProvince,
      personalDistrict: req.body.personalDistrict,
      personalSubdistrict: req.body.personalSubdistrict,
      personalPostalCode: req.body.personalPostalCode,
      profile_img: "",
    });

    await newMember.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      memberId: memberId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error registering member:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      details: error.message,
    });
  }
};

// ดึงข้อมูลโปรไฟล์ (ไม่ใช้ req.user)
exports.getProfile = async (req, res) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const member = await Member.findOne({ memberId }).select(
      "-password -token"
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// อัพเดตข้อมูลส่วนตัว (ไม่ใช้ req.user)
exports.updateProfile = async (req, res) => {
  try {
    const { memberId, fullName, personalEmail, personalPhone, title, personalId } =
      req.body;

      console.log(req.body)

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { memberId },
      {
        fullName,
        personalEmail,
        personalPhone,
        personalId,
        title,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password -token");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// อัพเดตที่อยู่ (ไม่ใช้ req.user)
exports.updateAddress = async (req, res) => {
  try {
    const {
      memberId,
      personalAddress,
      personalSubdistrict,
      personalDistrict,
      personalProvince,
      personalPostalCode,
    } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { memberId },
      {
        personalAddress,
        personalSubdistrict,
        personalDistrict,
        personalProvince,
        personalPostalCode,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Address updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
};

// อัพโหลดรูปโปรไฟล์ (ไม่ใช้ req.user)
// อัพโหลดรูปโปรไฟล์ (ไม่ใช้ req.user)
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    // ดึงข้อมูลสมาชิกเพื่อหา URL รูปเดิม
    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // ถ้ามีรูปเดิมอยู่ ให้ลบออกก่อน
    if (member.profile_img) {
      try {
        const oldImageUrl = member.profile_img;
        const oldImageKey = oldImageUrl.split(
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`
        )[1];

        if (oldImageKey) {
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: oldImageKey,
          };
          await s3Client.send(new DeleteObjectCommand(deleteParams));
        }
      } catch (deleteError) {
        console.error("Error deleting old profile image:", deleteError);
        // ไม่ต้องหยุดกระบวนการถ้าลบรูปเดิมไม่สำเร็จ
      }
    }

    // อัพโหลดรูปใหม่ไปยัง S3
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `profile-images/${memberId}-${Date.now()}.${fileExt}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // อัพเดต URL รูปในฐานข้อมูล
    await Member.findOneAndUpdate(
      { memberId },
      {
        profile_img: imageUrl,
        updatedAt: Date.now(),
      }
    );

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
};


exports.getall = async (req , res) => {
  try {
    const users = await Member.find();
    res.status(200).json(users)
  } catch (error) {
      console.error("Error fetching :", error);
      res.status(500).json({ error: "Failed to get all members" });
  }
}