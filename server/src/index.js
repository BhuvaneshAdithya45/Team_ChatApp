import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Models
import Message from "./models/Message.js";
import Channel from "./models/Channel.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Server Running...");
});

// -------------------
// SOCKET.IO SETUP
// -------------------

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Track online users in each channel
let channelUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join channel
  socket.on("joinChannel", async ({ channelId, userId }) => {
    try {
      const channel = await Channel.findById(channelId);

      // If private channel, validate membership
      if (channel && channel.isPrivate && !channel.members.includes(userId)) {
        socket.emit("accessDenied", { message: "Private channel - access denied" });
        return;
      }

      socket.join(channelId);

      if (!channelUsers[channelId]) channelUsers[channelId] = new Set();
      channelUsers[channelId].add(userId);

      io.to(channelId).emit("onlineUsers", Array.from(channelUsers[channelId]));
    } catch (err) {
      console.log("Join channel error:", err);
    }
  });

  // Leave channel
  socket.on("leaveChannel", ({ channelId, userId }) => {
    socket.leave(channelId);

    if (channelUsers[channelId]) {
      channelUsers[channelId].delete(userId);
      io.to(channelId).emit("onlineUsers", Array.from(channelUsers[channelId]));
    }
  });

  // New message
  socket.on("sendMessage", async ({ channelId, text, userId }) => {
    const msg = await Message.create({
      channelId,
      senderId: userId,
      text
    });

    const populatedMsg = await msg.populate("senderId", "name email");
    io.to(channelId).emit("newMessage", populatedMsg);
  });

  // Typing events
  socket.on("typing", ({ channelId, userId }) => {
    socket.to(channelId).emit("userTyping", userId);
  });

  socket.on("stopTyping", ({ channelId, userId }) => {
    socket.to(channelId).emit("userStoppedTyping", userId);
  });

  // Edit message
  socket.on("editMessage", (updatedMsg) => {
    io.to(updatedMsg.channelId.toString()).emit("messageEdited", updatedMsg);
  });

  // Delete message
  socket.on("deleteMessage", (id) => {
    io.emit("messageDeleted", id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start real-time server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log("Server running with Socket.IO on port " + PORT);
});
