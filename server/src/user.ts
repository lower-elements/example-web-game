import { WebSocket } from "ws";
import { userInDatabase } from "./database/types";
import Server from "./server";
import { Timer } from "./utils";
import Player from "./entities/player";
import { WithId } from "mongodb";
export default class User {
    info: WithId<userInDatabase>;
    player?: Player;
    private server: Server;
    private socket?: WebSocket;
    readonly pingTimer: Timer = new Timer();
    constructor(server: Server, info: WithId<userInDatabase>) {
        this.server = server;
        this.info = info;
    }
    setPlayer(player: Player){
        this.player = player;
    }
    save(): Promise<boolean> {
        return this.server.database.users.replaceUserByEmail(
            this.info.email,
            this.info
        );
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
    ping(): void {
        if (this.socket) {
            this.pingTimer.restart();
            this.socket.ping();
        }
    }
}
