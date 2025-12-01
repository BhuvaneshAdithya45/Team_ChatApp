import express from "express";
import auth from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";
import { sendMessage, getMessages, editMessage, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/:channelId", auth, getMessages);
router.patch("/:id", auth, editMessage);
router.delete("/:id", auth, deleteMessage);

// Search messages
router.get("/search/:channelId", auth, async (req, res) => {
  try {
    const { q } = req.query;
    const { channelId } = req.params;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const results = await Message.find({
      channelId,
      text: { $regex: q, $options: "i" } // case-insensitive search
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("senderId", "name");

    res.json(results);

  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
