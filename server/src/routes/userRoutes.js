import express from "express";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all users (for cache)
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find().select("_id name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
