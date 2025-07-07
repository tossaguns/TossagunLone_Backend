const TypeProduct = require("../../models/dataset/typeProduct");

// GET All
exports.getAllTypeProducts = async (req, res) => {
    try {
        const types = await TypeProduct.find();
        if (types.length === 0) {
            return res.status(200).json();
        }

        res.json(types);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET One
exports.getTypeProductById = async (req, res) => {
    try {
        const type = await TypeProduct.findById(req.params.id);
        if (!type) return res.status(404).json({ message: "Type not found" });
        res.json(type);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST Create
exports.createTypeProduct = async (req, res) => {
    try {
        const { name, createId } = req.body;
        const newType = new TypeProduct({ name, createId });
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT Update
exports.updateTypeProduct = async (req, res) => {
    try {
        const updated = await TypeProduct.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Type not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.deleteTypeProduct = async (req, res) => {
    try {
        const deleted = await TypeProduct.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Type not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
