const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, default: () => uuidv4() },
    name: { type: String, default: "Untitled Room" },
    createdBy: { type: String, required: true },
    participants: [{ peerId: String, name: String, joinedAt: { type: Date, default: Date.now } }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
