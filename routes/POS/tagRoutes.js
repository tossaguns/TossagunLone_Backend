const express = require("express");
const router = express.Router();
const controller = require("../../controllers/POS/tag.controller");
const { verifyPartnerAuth } = require("../../middlewares/partnerAuth.middleware");

// Apply authentication middleware to all routes
router.use(verifyPartnerAuth);

// Create new tag
router.post("/create", controller.createTag);

// Get all tags
router.get("/getAll", controller.getAllTags);

// Get tag by ID
router.get("/get/:id", controller.getTagById);

// Update tag by ID
router.put("/update/:id", controller.updateTag);

// Delete tag by ID
router.delete("/delete/:id", controller.deleteTagById);

// Delete all tags
router.delete("/deleteAll", controller.deleteAllTags);

module.exports = router;
