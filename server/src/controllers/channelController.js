import Channel from "../models/Channel.js";

export const createChannel = async (req, res) => {
  try {
    const { name, isPrivate } = req.body;

    // Check if exists
    const exists = await Channel.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Channel name already exists" });
    }

    const channel = await Channel.create({
      name,
      isPrivate: isPrivate || false,
      createdBy: req.user.id,
      members: [req.user.id]   // creator auto joins
    });

    res.json(channel);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find().select("name members isPrivate");
    const formatted = channels.map((ch) => ({
      _id: ch._id,
      name: ch.name,
      memberCount: ch.members.length,
      isPrivate: ch.isPrivate,
      members: ch.members
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinChannel = async (req, res) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Add user if not already joined
    if (!channel.members.includes(req.user.id)) {
      channel.members.push(req.user.id);
      await channel.save();
    }

    res.json({ message: "Joined channel" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveChannel = async (req, res) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Remove user
    channel.members = channel.members.filter(
      (member) => member.toString() !== req.user.id
    );

    await channel.save();

    res.json({ message: "Left channel" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Only members can invite
    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Add user if not already member
    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
      await channel.save();
    }

    res.json({ success: true, message: "User invited" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
