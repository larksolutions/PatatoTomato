const Room = require("../models/Room");

// POST /api/rooms — create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const room = await Room.create({ name, createdBy });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/rooms/:roomId — get room by roomId
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rooms/:roomId/join — add participant
exports.joinRoom = async (req, res) => {
  try {
    const { peerId, name } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId, isActive: true },
      { $push: { participants: { peerId, name } } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/rooms/:roomId/leave — remove participant
exports.leaveRoom = async (req, res) => {
  try {
    const { peerId } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $pull: { participants: { peerId } } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
