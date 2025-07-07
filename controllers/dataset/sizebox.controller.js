const sizeBoxs = require("../../models/dataset/sizeBox");

// GET All
exports.getAllSizeBox = async (req, res) => {
    try {
        const size = await sizeBoxs.find();
        if (size.length === 0) {
            return res.status(200).json();
        }

        res.json(size);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET One
exports.getSizeboxById = async (req, res) => {
    try {
        const size = await sizeBoxs.findById(req.params.id);
        if (!size) return res.status(404).json({ message: "Type not found" });
        res.json(size);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST Create
exports.createSizeBox = async (req, res) => {
    try {
        const { width, length, height, createId } = req.body;
        const newSize = new sizeBoxs({ 
            width, 
            length,
            height,
            createId
        });
        const savedSize = await newSize.save();
        res.status(201).json(savedSize);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT Update
exports.updateSizeBox = async (req, res) => {
    try {
        const updated = await sizeBoxs.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Size not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
exports.deleteSizeBox = async (req, res) => {
    try {
        const deleted = await sizeBoxs.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Size not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
