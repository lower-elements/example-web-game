import { WebSocket } from "ws";
import { UserInfo } from "./database";
import Server from "./server";
export default class User{
    info: UserInfo;
    private server: Server;
    private socket?: WebSocket;
    constructor(server: Server, info: UserInfo) {
        this.server = server;
        this.info = info;
    }
    save(): Promise<boolean> {
        return this.server.database.replaceUserByEmail(this.info.email, this.info);
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
