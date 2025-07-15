const AboutHotel = require("../../models/aboutHotel/aboutHotel.schema")

// CREATE
exports.createAboutHotel = async (req, res) => {
  try {
    const newAboutHotel = new AboutHotel(req.body)
    const saved = await newAboutHotel.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET ALL (with populate)
exports.getAllAboutHotel = async (req, res) => {
  try {
    const data = await AboutHotel.find()
      .populate("typeFacilityHotel")
      .populate("typeFoodHotel")
      .populate("typeHotel")
      .populate("typeHotelFor")
      .populate("typeHotelLocation")
      .populate("typePaymentPolicy")
      .populate("typeRoomHotel")

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET BY ID
exports.getAboutHotelById = async (req, res) => {
  try {
    const data = await AboutHotel.findById(req.params.id)
      .populate("typeFacilityHotel")
      .populate("typeFoodHotel")
      .populate("typeHotel")
      .populate("typeHotelFor")
      .populate("typeHotelLocation")
      .populate("typePaymentPolicy")
      .populate("typeRoomHotel")

    if (!data) return res.status(404).json({ message: "Not found" })
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE BY ID
exports.updateAboutHotel = async (req, res) => {
  try {
    const updated = await AboutHotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: "Not found" })
    res.status(200).json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE BY ID
exports.deleteAboutHotelById = async (req, res) => {
  try {
    const deleted = await AboutHotel.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: "Not found" })
    res.status(200).json({ message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE ALL
exports.deleteAllAboutHotel = async (req, res) => {
  try {
    await AboutHotel.deleteMany({})
    res.status(200).json({ message: "All entries deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
