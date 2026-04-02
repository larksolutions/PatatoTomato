const router = require("express").Router();
const controller = require("../controllers/roomController");

router.post("/", controller.createRoom);
router.get("/:roomId", controller.getRoom);
router.post("/:roomId/join", controller.joinRoom);
router.post("/:roomId/leave", controller.leaveRoom);

module.exports = router;
