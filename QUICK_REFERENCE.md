# 🚀 Team Chat App - Quick Reference Guide

## 📂 **File Structure**

```
/home/adithya/team-chat-app/
│
├── server/
│   ├── src/
│   │   ├── index.js                 # Main Express + Socket.IO server
│   │   ├── models/
│   │   │   ├── User.js              # User schema (name, email, passwordHash)
│   │   │   ├── Channel.js           # Channel schema (name, isPrivate, members)
│   │   │   └── Message.js           # Message schema (text, senderId, edited)
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js    # registerUser, loginUser (JWT)
│   │   │   ├── messageController.js # sendMessage, getMessages, editMessage, deleteMessage
│   │   │   └── channelController.js # createChannel, joinChannel, leaveChannel, inviteUser
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # POST /auth/register, /login
│   │   │   ├── messageRoutes.js     # POST/GET/PATCH/DELETE /messages, /search
│   │   │   ├── channelRoutes.js     # POST/GET /channels, /:id/join, /invite/user
│   │   │   └── userRoutes.js        # GET /users/all
│   │   │
│   │   └── middleware/
│   │       └── authMiddleware.js    # JWT verification
│   │
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx                  # Main router
│   │   ├── main.jsx                 # React entry point
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Register.jsx         # Register form
│   │   │   └── Chat.jsx             # Main layout (Navbar + Sidebar + ChatWindow + OnlineUsers)
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top bar with logout
│   │   │   ├── Sidebar.jsx          # Channel list
│   │   │   ├── ChatWindow.jsx       # Messages display + search
│   │   │   ├── MessageItem.jsx      # Individual message with edit/delete
│   │   │   ├── MessageInput.jsx     # Text input with typing indicator
│   │   │   ├── ChannelItem.jsx      # Channel in sidebar
│   │   │   ├── OnlineUsers.jsx      # Users online panel
│   │   │   ├── CreateChannelModal.jsx # Modal to create channel
│   │   │   ├── InviteModal.jsx      # Modal to invite users to private channel
│   │   │   ├── UserProfilePopup.jsx # User info popup
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global user state (login/logout)
│   │   │   └── UserCacheContext.jsx # Cache of userId → userName
│   │   │
│   │   ├── api/
│   │   │   └── api.js               # Axios instance (baseURL + auth header)
│   │   │
│   │   └── socket.js                # Socket.IO client connection
│   │
│   ├── tailwind.config.js           # Dark mode + custom colors
│   └── package.json
│
└── PROJECT_ANALYSIS.md              # Full documentation
```

---

## 🔑 **Key Concepts**

### **Authentication Flow**
```
Register: name, email, password
    ↓ (POST /auth/register)
Hash password with bcryptjs
    ↓
Save to User collection

Login: email, password
    ↓ (POST /auth/login)
Find user, compare password
    ↓
Generate JWT: jwt.sign({ id }, SECRET, { expiresIn: "7d" })
    ↓
Store token in localStorage
```

### **Real-time with Socket.IO**
```
Client connects → socket.io("http://localhost:5000")
    ↓
Event: joinChannel → Server validates private channel access
    ↓
Event: sendMessage → Server saves to DB → Broadcasts to channel
    ↓
Event: typing → Server broadcasts to channel (no DB save)
    ↓
Event: editMessage → Server updates DB → Broadcasts
```

### **Private Channel Access**
```
Create: isPrivate = true
    ↓
Creator auto-added to members array
    ↓
Only members can:
  - View channel in sidebar
  - Read messages
  - Join Socket.IO room
    ↓
To join: Need invitation via /channels/invite/user
    ↓
Invite: Only members can invite others
```

---

## 📡 **API Endpoints Quick Reference**

### **Authentication**
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token

### **Channels**
- `GET /channels` - List all accessible channels
- `POST /channels` - Create new channel
- `POST /channels/:id/join` - Add user to members
- `POST /channels/:id/leave` - Remove user from members
- `POST /channels/invite/user` - Invite user to private channel

### **Messages**
- `POST /messages` - Send message
- `GET /messages/:channelId` - Get messages (with pagination)
- `GET /messages/search/:channelId?q=query` - Search messages
- `PATCH /messages/:id` - Edit message (sender only)
- `DELETE /messages/:id` - Delete message (sender only)

### **Users**
- `GET /users/all` - Get all users (for invite modal)

---

## 🔌 **Socket.IO Events**

### **Client sends → Server receives**
```javascript
socket.emit("joinChannel", { channelId, userId })
socket.emit("leaveChannel", { channelId, userId })
socket.emit("sendMessage", { channelId, text, userId })
socket.emit("typing", { channelId, userId })
socket.emit("stopTyping", { channelId, userId })
socket.emit("editMessage", { _id, text, edited, ... })
socket.emit("deleteMessage", messageId)
```

### **Server sends → Client receives**
```javascript
socket.on("onlineUsers", (userIds) => {})
socket.on("newMessage", (message) => {})
socket.on("userTyping", (userId) => {})
socket.on("userStoppedTyping", (userId) => {})
socket.on("messageEdited", (message) => {})
socket.on("messageDeleted", (messageId) => {})
socket.on("accessDenied", (reason) => {})
```

---

## 💾 **Data Structures**

### **User Object**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String (never sent to client),
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Channel Object**
```javascript
{
  _id: ObjectId,
  name: String,
  isPrivate: Boolean,
  members: [ObjectId],  // Array of user IDs
  createdBy: ObjectId,
  memberCount: Number,  // Calculated field in response
  timestamps: { createdAt, updatedAt }
}
```

### **Message Object**
```javascript
{
  _id: ObjectId,
  channelId: ObjectId,
  senderId: ObjectId,
  text: String,
  edited: Boolean,
  createdAt: Date,
  updatedAt: Date,
  // When populated:
  senderId: { _id, name, email }
}
```

---

## 🎯 **Feature Checklist**

### **Core Features**
- ✅ User registration & login (JWT)
- ✅ Create channels (public/private)
- ✅ Join channels
- ✅ Send messages in real-time
- ✅ View online users

### **Advanced Features**
- ✅ Message editing (sender only)
- ✅ Message deletion (sender only)
- ✅ Message search (regex, case-insensitive)
- ✅ Typing indicators
- ✅ User profiles (click name)
- ✅ Private channels with access control
- ✅ Invite users to private channels
- ✅ Message pagination (load older on scroll)

### **UI Features**
- ✅ Dark mode theme
- ✅ Professional navbar
- ✅ Responsive layout
- ✅ Lock icon for private channels
- ✅ "(edited)" label on messages
- ✅ Green online indicator
- ✅ Modals with smooth animations

---

## 🛠️ **Common Tasks**

### **Send a Message**
1. User types in MessageInput
2. Press Enter
3. Socket.emit("sendMessage", { channelId, text, userId })
4. Server: Message.create() → save to DB
5. Server: io.to(channelId).emit("newMessage", msg)
6. All clients: newMessage event → add to messages array

### **Edit a Message**
1. User clicks ✏️ on their message
2. MessageItem shows input field
3. User edits text and clicks Save
4. API: PATCH /messages/{id} { text }
5. Server: Check sender, update text, set edited = true
6. Socket.emit("editMessage", updatedMsg)
7. All clients: Update message in list, show "(edited)"

### **Create Private Channel**
1. Click "+ Create Channel"
2. Enter name
3. Check "Make this channel private"
4. Click Create
5. API: POST /channels { name, isPrivate: true }
6. Server: Create channel, add creator to members
7. Channel appears in sidebar with 🔒 icon

### **Invite User to Private Channel**
1. Open private channel
2. Click "+ Invite" button in header
3. Select users from list
4. Click "Invite (X)"
5. API: POST /channels/invite/user { channelId, userId } (batch)
6. Server: Add users to members array
7. Users can now access channel

### **Search Messages**
1. Type in search bar
2. Press Enter
3. API: GET /messages/search/{channelId}?q=query
4. Results appear below search bar
5. Click result → smooth scroll to message

---

## 🚀 **Deploy Checklist**

### **Backend**
- [ ] Set MONGO_URI in .env
- [ ] Set JWT_SECRET in .env
- [ ] Set PORT in .env (default 5000)
- [ ] `npm install` in /server
- [ ] `npm start` (use production server)
- [ ] Test: curl http://localhost:5000/

### **Frontend**
- [ ] Update API_URL to production backend
- [ ] Update Socket.IO URL to production
- [ ] `npm install` in /client
- [ ] `npm run build` (creates /dist)
- [ ] Deploy /dist to hosting (Netlify, Vercel, etc.)

### **Database**
- [ ] Create MongoDB Atlas cluster
- [ ] Add IP whitelist
- [ ] Create database user
- [ ] Copy connection string → MONGO_URI

---

## 🐛 **Debugging Tips**

### **Backend Issues**
- Check `/server/package.json` for dependencies
- Verify MongoDB connection: `mongodb+srv://...`
- Check JWT_SECRET in .env
- Use `console.log` in Socket.IO handlers
- Test endpoints with Postman/curl

### **Frontend Issues**
- Check browser console (F12) for errors
- Check Network tab to see API requests
- Verify localStorage has `token` and `user`
- Check Socket.IO connection status
- Use React DevTools to inspect component state

### **Socket.IO Connection**
```javascript
// Check if connected:
socket.on("connect", () => console.log("Connected:", socket.id))
socket.on("disconnect", () => console.log("Disconnected"))
socket.on("error", (error) => console.log("Error:", error))
```

---

## 📊 **Performance Metrics**

- **Message Load**: 20 per batch (pagination)
- **Search Results**: 20 max
- **User Cache**: Load once at startup
- **Typing Debounce**: 1.5 seconds
- **JWT Expiry**: 7 days
- **Password Hash**: 10 salt rounds (bcryptjs)

---

## 🔐 **Security Best Practices**

- ✅ Never expose JWT_SECRET in code
- ✅ Hash passwords with bcryptjs (10+ rounds)
- ✅ Validate private channel membership server-side
- ✅ Check sender ID for edit/delete operations
- ✅ Use CORS to whitelist origins
- ✅ Use Bearer token authentication
- ✅ Never store sensitive data in localStorage (except token)

---

## 📞 **Support Resources**

- **Express**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Socket.IO**: https://socket.io/docs/
- **React**: https://react.dev/
- **Tailwind**: https://tailwindcss.com/
- **Axios**: https://axios-http.com/
- **JWT**: https://jwt.io/

---

**Last Updated**: December 1, 2025  
**Version**: 1.0.0 - Production Ready ✅
