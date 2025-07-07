const productPartners = require("../../models/productPartner");

const generateProductID = async () => {
    const lastProduct = await productPartners.findOne().sort({ productID: -1 }).limit(1);
    if (!lastProduct) {
        return 'PD000001';
    }

    const lastID = lastProduct.productID;
    const num = parseInt(lastID.substring(2)) + 1;
    return 'PD' + num.toString().padStart(6, '0');
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productPartners.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProduct = async (req, res) => {
    console.log('req.body', req.body);
    try {
        const productID = await generateProductID();

        const product = new productPartners({
            productID,
            name: req.body.name,
            description: req.body.description,

            priceBeforeVat: req.body.priceBeforeVat,
            vatAmount: req.body.vatAmount,
            sellingPrice: req.body.sellingPrice,

            sellerType: req.body.sellerType,
            category: req.body.category,
            productType: req.body.productType,

            stock: req.body.maxStock,

            shippingConditions: req.body.shippingConditions || [],

            images: req.body.images || [],
            document: req.body.document || '',

            //addNew EIEI
            width: req.body.width,
            length: req.body.length,
            height: req.body.height,
            weight: req.body.weight,
        });

        // บันทึกข้อมูลสินค้า
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(400).json({
            message: 'Failed to create product',
            error: err.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await productPartners.findOneAndDelete({ _id: req.params.id });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            description: req.body.description,
            priceBeforeVat: req.body.priceBeforeVat,
            vatAmount: req.body.vatAmount,
            sellingPrice: req.body.sellingPrice,
            category: req.body.category,
        };

        const product = await productPartners.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Failed to update product', error: err.message });
    }
};

exports.getstatusRequestProducts = async (req, res) => {
    try {
        const products = await productPartners.find({ statusRequest: { $ne: 'ยืนยันแล้ว' } });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getApprovedStatusRequestProducts = async (req, res) => {
    try {
        const products = await productPartners.find({ statusRequest: 'ยืนยันแล้ว' });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getstatusProducts = async (req, res) => {
    try {
        const products = await productPartners.find({ status: true });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatusRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedProduct = await productPartners.findByIdAndUpdate(
            id,
            { statusRequest: 'ยืนยันแล้ว' },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRejectStatusRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedProduct = await productPartners.findByIdAndUpdate(
            id,
            { statusRequest: 'ไม่ยืนยัน' },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatusProduct = async (req, res) => {
    try {
        const { status } = req.body

        if (typeof status !== 'boolean') {
            return res.status(400).json({ message: 'สถานะต้องเป็น true หรือ false' })
        }

        const product = await productPartners.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        }

        res.json({ message: 'อัปเดตสถานะสำเร็จ', product })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    }
};

