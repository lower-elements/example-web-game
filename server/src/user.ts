import { WebSocket } from "ws";
import { UserInfo } from "./database";
import Server from "./server";
export default class User implements UserInfo {
    email: string;
    password: string;
    username: string;
    private server: Server;
    private socket?: WebSocket;
    constructor(server: Server, info: UserInfo) {
        this.server = server;
        this.email = info.email;
        this.username = info.username;
        this.password = info.password;
    }
    save(): Promise<boolean> {
        return this.server.database.replaceUserByEmail(this.email, {
            email: this.email,
            password: this.password,
            username: this.username,
        });
    }
    setSocket(socket: WebSocket) {
        this.socket = socket;
    }
    sendEvent(event: string, data: Object) {
        if (this.socket) {
            this.socket.send(JSON.stringify({ event: event, data: data }));
        }
    }
    sendBinary(data: Buffer) {
        if (this.socket) {
            this.socket.send(data);
        }
    }
}
