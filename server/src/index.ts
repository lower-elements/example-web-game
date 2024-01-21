import express from "express";
import http from "http";
import WebSocket, { Data } from "ws";
import { Collection, Db, MongoClient } from "mongodb";
interface Event {
    event: string;
    data: Object;
}
interface User {
    username: string;
    password: string;
    }
export default class App {
    private app = express();
    private server: http.Server;
    private wss: WebSocket.Server;
    private port: number;
    static mongoUrl = `mongodb://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@mongo:27017`;
    private mongoClient: MongoClient;
    private database: Db;
    private users: Collection<User>;
    constructor(port: number = 3000, mongoClient: MongoClient) {
        this.port = port;
        this.mongoClient = mongoClient;
        this.database = mongoClient.db("example");
        this.users = this.database.collection<User>("users");
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
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
        // Serve static files
        this.app.use(express.static("public"));
        // WebSocket setup
        this.wss.on("connection", this.handleNewConnection.bind(this));
        this.server.listen(this.port, () =>
            console.log(`listening on ${this.port}`)
        );
    }
}
const PORT = parseInt(process.env.PORT || "3000");
async function main(): Promise<void> {
    let mongoClient = new MongoClient(App.mongoUrl);
    console.log("Connected to database...");
    let app = new App(PORT, await mongoClient.connect());
    await app.start();
}
main();
