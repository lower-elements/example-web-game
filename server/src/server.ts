import express, { Request, Response } from "express";
import http, { IncomingMessage } from "http";
import WebSocket from "ws";
import { MongoClient } from "mongodb";
import Database, { UserInfo } from "./database";
import Cookie from "cookie";
import User from "./user";
import EventHandler, { eventHandlerCallback } from "./event_handler";
/**
 * Represents the json events the client and server exchange.
 */
interface Event {
    event: string;
    data: Object;
}

export default class Server {
    private readonly app = express();
    private readonly server: http.Server;
    private readonly wss: WebSocket.Server;
    private readonly port: number;
    private readonly eventHandler: EventHandler;
    readonly database: Database;
    users: Set<User> = new Set<User>();
    constructor(port: number = 3000, mongoClient: MongoClient) {
        this.port = port;
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({
            server: this.server,
            maxPayload: 1024 * 1024, //1 megabytes
        });
        this.database = new Database(mongoClient);
        this.eventHandler = new EventHandler(this);
    }
    addUser(user: User): void {
        this.users.add(user);
    }
    removeUser(user: User): void {
        this.users.delete(user);
    }
    sendEventToAll(event: string, data: Object) {
        this.users.forEach((user) => user.sendEvent(event, data));
    }
    sendBinaryToAll(data: Buffer) {
        this.users.forEach((user) => user.sendBinary(data));
    }
    private async handleNewConnection(
        ws: WebSocket,
        req: IncomingMessage
    ): Promise<void> {
        const cookies = req.headers.cookie;
        try {
            if (cookies) {
                const userInfo = Cookie.parse(cookies);
                const user = await this.database.getUserByEmailAndPassword(
                    userInfo.email,
                    userInfo.password
                );
                if (user) {
                    return this.acceptConnection(ws, new User(this, user));
                }
            }
            ws.close();
        } catch (err) {
            ws.close();
            throw err;
        }
    }
    private acceptConnection(ws: WebSocket, user: User) {
        user.setSocket(ws);
        this.addUser(user);
        console.log(
            `WebSocket connected, welcome ${user.info.username}, ${user.info.email}. Password hash: ${user.info.password}`
        );
        ws.on("message", (message, isBinary) => {
            this.handleMessage(user, ws, message as Buffer, isBinary);
        });
        ws.on("close", async () => {
            this.removeUser(user);
            await user.save();
            console.log("WebSocket disconnected");
        });
    }

    private handleMessage(
        user: User,
        ws: WebSocket,
        message: Buffer,
        isBinary: boolean = true
    ): void {
        if (!isBinary) {
            let data: Event = JSON.parse(message.toString());
            this.eventHandler.triggerEvent(data.event, user, data.data);
            console.log(data);
        } else {
            console.log(`binary message! ${message.readUint8(0)}`);
        }
    }
    async start(): Promise<void> {
        this.app.use(express.json());
        this.app.post("/signin", this.onsignin.bind(this));
        this.app.post("/signup", this.onsignup.bind(this));
        this.app.use(express.static("public", { maxAge: 2000000000 }));
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
                ["username", "email", "password"].forEach((cookieName) => {
                    this.setCookie(res, cookieName, req.body[cookieName]);
                });
                return res.status(201).json({ status: "success" });
            }
            return res.status(409).json({
                status: "error",
                message:
                    "An account with this email or username already exists!",
            });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    }
    private async onsignin(
        req: Request,
        res: Response
    ): Promise<Response | null> {
        const { email, password } = req.body;
        if (!email || !password) {
            return null;
        }
        try {
            const user = await this.database.getUserByEmailAndPassword(
                email,
                password
            );
            if (user) {
                ["username", "email"].forEach((cookieName) => {
                    this.setCookie(res, cookieName, user[cookieName] ?? "");
                });
                this.setCookie(res, "password", password ?? "");
                return res.status(201).json({ status: "success" });
            }
            return res.status(404).json({
                status: "error",
                message: "This account does not exist!",
            });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    }
    private setCookie(
        res: express.Response<any, Record<string, any>>,
        cookieName: string,
        cookieContent: string
    ) {
        res.cookie(cookieName, cookieContent, {
            expires: new Date(Date.UTC(2025, 0, 1)),
            httpOnly: true,
            secure: true,
        });
    }
}
