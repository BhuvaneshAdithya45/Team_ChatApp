import express from "express";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch ALL users (used for full cache refresh)
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find().select("_id name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch SINGLE user (MOST IMPORTANT)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
