import { app } from "./app.js";
import {dbConnect} from "./db/database.js";
import dotenv from "dotenv";
import http from "http";
import {Server} from "socket.io"

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to your frontend domain in production
        methods: ["GET", "POST"]
    }
});

// Socket.IO setup
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // Example event: Receive message from one client and broadcast
    socket.on("chat message", (msg) => {
        console.log("📩 Message received:", msg);
        io.emit("chat message", msg); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

// Connect to DB and start the server
dbConnect()
    .then(() => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MONGO db connection failed !!!", err);
    });



