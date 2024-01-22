import express, { Request, Response } from "express";
import http from "http";
import WebSocket from "ws";
import { MongoClient } from "mongodb";
import Database from "./database";
/**
 * Represents the json events the client and server exchange.
 */
interface Event {
    event: string;
    data: Object;
}

export default class Server {
    private app = express();
    private server: http.Server;
    private wss: WebSocket.Server;
    private port: number;
    private database: Database;
    constructor(port: number = 3000, mongoClient: MongoClient) {
        this.port = port;
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.database = new Database(mongoClient);
    }
    private handleNewConnection(ws: WebSocket): void {
        console.log("WebSocket connected");
        ws.on("message", (message, isBinary) => {
            this.handleMessage(ws, message as Buffer, isBinary);
        });
        ws.on("close", () => {
            console.log("WebSocket disconnected");
        });
    }
    private handleMessage(
        ws: WebSocket,
        message: Buffer,
        isBinary: boolean = true
    ): void {
        if (!isBinary) {
            try {
                let data: Event = JSON.parse(message.toString());
                console.log(data);
            } catch {}
        } else {
            console.log(`binary message! ${message.readUint8(0)}`);
        }
    }
    async start(): Promise<void> {
        this.app.use(express.json());
        this.app.post("/signup", this.onsignup.bind(this));
        this.app.use(express.static("public"));
        // WebSocket setup
        this.wss.on("connection", this.handleNewConnection.bind(this));
        this.server.listen(this.port, () =>
            console.log(`listening on ${this.port}`)
        );
    }
    private async onsignup(
        req: Request,
        res: Response
    ): Promise<Response | null> {
        const { email, username, password } = req.body;
        if (!username || !email || !password) {
            return null;
        }
        try {
            const userCreated = await this.database.insertUser({
                email,
                username,
                password,
            });
            if (userCreated) {
                ["email", "password"].forEach((cookieName) => {
                    res.cookie(cookieName, req.body[cookieName], {
                        expires: new Date(Date.UTC(2025, 0, 1)),
                        httpOnly: true,
                        secure: true,
                    });
                });
                return res.status(201).json({ status: "success" });
            }
            return res.status(409).json({
                status: "error",
                message: "An account with this email already exists!",
            });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    }
}
