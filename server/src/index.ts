import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static("public"));
// WebSocket setup
wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        // Handle WebSocket messages here
    });

    ws.on("close", () => {
        console.log("WebSocket disconnected");
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
