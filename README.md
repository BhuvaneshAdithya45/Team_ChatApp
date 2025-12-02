# Team Chat App – Real-Time Messaging Platform

A full-stack, real-time team communication app built using the MERN stack with Socket.IO.  
Supports channel-based communication, presence tracking, message history, private channels, typing indicators, and a clean UI with React + TailwindCSS.

This project was developed as part of an internship assignment.  
All **mandatory features** + **bonus features** are implemented.

---

# Live Demo

### Frontend (Vercel)
https://team-chat-app-rho.vercel.app/

### Backend (Render)
https://team-chatapp.onrender.com/

### GitHub Repository
https://github.com/BhuvaneshAdithya45/Team_ChatApp

---

#  Features

##  Mandatory Features (Completed)

### **Authentication**
- Register with name, email, password  
- Login using JWT  
- Protected routes  

### **Channel Management**
- Create channels  
- Join channel on click  
- Auto-select newly created channel  
- Real-time active member count  

### 💬 **Real-Time Messaging**
- Socket.IO instant chat  
- Live message rendering  
- Messages stored in MongoDB  

###  **Message History**
- Loads last 20 messages  
- Infinite scroll → load older messages  
- Smooth scroll preservation  

###  **Online User Presence**
- Shows who is online in each channel  
- Updates instantly when users join/leave  

---

#  Bonus Features (Implemented)

###  **Typing Indicators**
Shows *“User is typing…”* in real time.

###  **Private Channels**
- Hidden from other users  
- Only visible to invited members  

###  **Message Editing / Deletion**
Users can edit or delete **their own** messages.

###  **Message Search**
Search messages by keyword inside a channel.

###  **Dark Mode**
Stored using localStorage.

---

#  Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- Socket.IO Client

### **Backend**
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Socket.IO

### **Deployment**
- Render → Backend  
- Vercel → Frontend  
- MongoDB Atlas → Database  

---

#  System Architecture

```
Frontend  (Vercel)
     ↓  REST / WebSocket
Backend  (Render)
     ↓
MongoDB Atlas
```

---

# Folder Structure

```
Team_ChatApp/
 ├── server/
 │    ├── models/
 │    ├── routes/
 │    ├── middleware/
 │    ├── server.js
 │    ├── package.json
 │    └── .gitignore
 ├── client/
 │    ├── src/
 │    ├── public/
 │    ├── package.json
 │    ├── vite.config.js
 │    └── vercel.json
 └── README.md
```

---

#  Environment Variables

##  Backend (Render) — `server/.env`

```
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
```

##  Frontend (Vercel) — `client/.env`

```
VITE_API_URL=https://team-chatapp.onrender.com/api
VITE_SOCKET_URL=https://team-chatapp.onrender.com
```

---

#  Local Development Setup

### 1️ Clone the repository

```sh
git clone https://github.com/BhuvaneshAdithya45/Team_ChatApp.git
cd Team_ChatApp
```

### 2️ Install backend dependencies

```sh
cd server
npm install
```

### 3️ Install frontend dependencies

```sh
cd ../client
npm install
```

### 4️ Run backend

```sh
cd server
npm run dev
```

### 5️ Run frontend

```sh
cd client
npm run dev
```

---

#  Deployment Guide

##  Deploy Backend (Render)
1. Select **server** folder  
2. Build command: `npm install`  
3. Start command: `node server.js`  
4. Add env variables  
5. Deploy  

##  Deploy Frontend (Vercel)
Add env variables:

```
VITE_API_URL=https://team-chatapp.onrender.com/api
VITE_SOCKET_URL=https://team-chatapp.onrender.com
```
#  Author

**Bhuvanesh Adithya M C**  
Full Stack Developer  
LinkedIn:https://www.linkedin.com/in/bhuvaneshadithya/

---

#  Conclusion

This project demonstrates:

- Full-stack development  
- Real-time WebSocket communication  
- Authentication & authorization  
- Clean UI + Tailwind  
- Full deployment pipeline  

A complete, production-ready team chat system. 

