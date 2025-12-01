import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createChannel,
  getAllChannels,
  joinChannel,
  leaveChannel,
  inviteUser
} from "../controllers/channelController.js";

const router = express.Router();

router.post("/", auth, createChannel);
router.get("/", auth, getAllChannels);
router.post("/:id/join", auth, joinChannel);
router.post("/:id/leave", auth, leaveChannel);
router.post("/invite/user", auth, inviteUser);

export default router;
