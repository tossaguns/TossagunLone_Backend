require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connection = require("./config/db");

connection();

const app = express();
const httpServer = createServer(app);

// Init Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
const prefix = "/chain";

app.use(prefix + "/partners", require("./routes/user/partnerRoutes"));
app.use(prefix + "/members", require("./routes/user/memberRoutes"));
app.use(prefix + "/login", require("./routes/login"));

app.use(prefix + "/dataset", require("./routes/dataset/dataset"));

app.use(prefix + "/chat", require("./routes/chat"));

app.use(prefix + "/product", require("./routes/product/productPartnerRoutes"));

app.get(prefix + "/test", (req, res) => res.send("✅ Test OK with prefix"));

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  console.log("✅ Socket connected with id:", socket.id);
  socket.on("join", (roomName) => {
    socket.join(roomName);
    console.log(`🔌 ${socket.id} joined room: ${roomName}`);
    console.log("📦 ห้องทั้งหมดของ client:", [...socket.rooms]);
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, text, timestamp } = data;
  
    const roomName = [senderId, receiverId].sort().join("_");
  
    console.log(
      `📨 Message from ${senderId} to ${receiverId} (room: ${roomName}): ${text}`
    );
  
    try {
      const savedMessage = await require("./controllers/chatController").saveMessage(data);
      console.log("💾 ข้อความถูกบันทึกแล้ว:", savedMessage._id);
  
      io.to(roomName).emit("receive_message", savedMessage);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกข้อความ:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 9999;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
