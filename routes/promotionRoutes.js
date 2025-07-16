const express = require("express");
const router = express.Router();

const promotion = require("../controllers/promotion.controller");

router.post("/create", promotion.createPromotion);
router.get("/getAll", promotion.getAllPromotions);
router.get("/get/:id", promotion.getPromotionById);
router.put("/update/:id", promotion.updatePromotionById);
router.delete("/delete/:id", promotion.deletePromotionById);
router.delete("/deleteAll", promotion.deleteAllPromotions);

module.exports = router;
