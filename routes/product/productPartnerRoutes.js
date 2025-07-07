const express = require('express');
const router = express.Router();
const productPartnerController = require('../../controllers/product/product.controller');

// GET all products
router.get('/', productPartnerController.getAllProducts);

router.get('/statusRequest', productPartnerController.getstatusRequestProducts);

router.get('/statusRequestApprove', productPartnerController.getApprovedStatusRequestProducts);

router.get('/status', productPartnerController.getstatusProducts);

router.post('/', productPartnerController.createProduct);

router.put('/:id', productPartnerController.updateProduct);

router.put('/status/:id', productPartnerController.updateStatusProduct);

router.put('/statusRequest/comfirm/:id', productPartnerController.updateStatusRequest);

router.put('/statusRequest/cancle/:id', productPartnerController.updateRejectStatusRequest);

router.delete('/:id', productPartnerController.deleteProduct);

module.exports = router;