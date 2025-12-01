import Message from "../models/Message.js";

// Save new message
export const sendMessage = async (req, res) => {
  try {
    const { channelId, text } = req.body;

    const message = await Message.create({
      channelId,
      senderId: req.user.id,
      text
    });

    res.json(message);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages with pagination
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { before } = req.query;

    const limit = 20;

    let query = { channelId };

    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message
      .find(query)
      .sort({ _id: -1 }) // newest first
      .limit(limit)
      .populate("senderId", "name email");

    res.json(messages.reverse()); // return oldest → newest

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.text = req.body.text || message.text;
    message.edited = true;
    await message.save();

    // Populate sender info before sending
    await message.populate("senderId", "name email");

    res.json(message);

  } catch (err) {
    res.status(500).json({ message: "Edit failed", error: err.message });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await message.deleteOne();

    res.json({ success: true, id: req.params.id });

  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
