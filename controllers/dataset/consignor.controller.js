const consignorTypes = require("../../models/dataset/consignorType");

// GET All
exports.getAllTypeConsignor = async (req, res) => {
    try {
        const consignor = await consignorTypes.find();
        if (consignor.length === 0) {
            return res.status(200).json();
        }

        res.json(consignor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET One
exports.getTypeConsignorById = async (req, res) => {
    try {
        const type = await consignorTypes.findById(req.params.id);
        if (!type) return res.status(404).json({ message: "Type not found" });
        res.json(type);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST Create
exports.createTypeConsignor = async (req, res) => {
    try {
        const { name, createId } = req.body;
        const newType = new consignorTypes({ name, createId });
        const savedType = await newType.save();
        res.status(201).json(savedType);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT Update
exports.updateTypeConsignor = async (req, res) => {
    try {
        const updated = await consignorTypes.findByIdAndUpdate(
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
exports.deleteTypeConsignor = async (req, res) => {
    try {
        const deleted = await consignorTypes.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Type not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
