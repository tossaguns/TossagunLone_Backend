const express = require("express");
const router = express.Router();
const TypeProduct = require("../../controllers/dataset/typeproduct.controller");
const SizeBox = require("../../controllers/dataset/sizebox.controller");
const TypeConsignor = require("../../controllers/dataset/consignor.controller");

//TypeProduct
router.get("/typeproduct", TypeProduct.getAllTypeProducts);
router.get("/typeproduct/:id", TypeProduct.getTypeProductById);
router.post("/typeproduct", TypeProduct.createTypeProduct);
router.put("/typeproduct/:id", TypeProduct.updateTypeProduct);
router.delete("/typeproduct/:id", TypeProduct.deleteTypeProduct);

//SizeBox
router.get("/sizebox", SizeBox.getAllSizeBox);
router.get("/sizebox/:id", SizeBox.getSizeboxById);
router.post("/sizebox", SizeBox.createSizeBox);
router.put("/sizebox/:id", SizeBox.updateSizeBox);
router.delete("/sizebox/:id", SizeBox.deleteSizeBox);

//Consignor
router.get("/consignor", TypeConsignor.getAllTypeConsignor);
router.get("/consignor/:id", TypeConsignor.getTypeConsignorById);
router.post("/consignor", TypeConsignor.createTypeConsignor);
router.put("/consignor/:id", TypeConsignor.updateTypeConsignor);
router.delete("/consignor/:id", TypeConsignor.deleteTypeConsignor);


module.exports = router;
