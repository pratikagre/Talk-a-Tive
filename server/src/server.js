const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const userRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const supabase = require("./config/supabaseClient");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "https://talk-a-tive-eta.vercel.app", "https://talk-a-tive-9cec.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/message", require("./routes/message.routes"));
app.use("/api/upload", require("./routes/upload.routes"));

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));



// Root Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Create Socket using helper reference if needed, or keep inline for now in main server file
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.CLIENT_URL, "http://localhost:5173", "https://talk-a-tive-eta.vercel.app", "https://talk-a-tive-9cec.vercel.app"],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id || userData.id); // Handle both for now
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            // Updated to handle both _id (old mongoose) and id (supabase) if mixed, or just id? 
            // Better to normalize everything to _id for frontend compatibility as done in controllers.
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message received", newMessageRecieved);
        });
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
        socket.broadcast.emit("callEnded");
    });

    // WebRTC Signaling
    socket.on("callUser", (data) => {
        socket.to(data.userToCall).emit("callUser", {
            signal: data.signalData,
            from: data.from,
            name: data.name,
        });
    });

    socket.on("answerCall", (data) => {
        socket.to(data.to).emit("callAccepted", data.signal);
    });

});

// Supabase Realtime Setup (Optional: Listening to DB changes directly)
// This is redundant if we use Socket.io for instant feedback from client-side emission,
// BUT it ensures consistency if records are inserted via other means.
// For now, adhering to user request "Implement realtime message subscription using Supabase channels"
const channel = supabase.channel('realtime-messages');
channel
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
            // payload.new contains the new message row
            // Problem: We need the full populated message to emit to frontend (sender info, chat users).
            // Supabase realtime payload only has raw data.
            // So efficiently, we still rely on the API response to emit 'new message' via Socket.io from the CLIENT
            // OR we fetch the full message here and emit.
            console.log('New message in DB:', payload.new.id);
        }
    )
    .subscribe();


// Error Handling
app.use(notFound);
app.use(errorHandler);


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
