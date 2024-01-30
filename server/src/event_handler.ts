import Server from "./server";
import User from "./user";
export type eventHandlerCallback = (
    this: EventHandler,
    user: User,
    data: Record<string, any>
) => void;
interface EventHandlers {
    [eventName: string]: eventHandlerCallback;
}
export default class EventHandler {
    private server: Server;
    constructor(server: Server) {
        this.server = server;
    }
    triggerEvent(event: string, user: User, data: Object): void {
        if (event in this.eventBindings) {
            this.eventBindings[event].bind(this)(user, data);
        }
    }
    private eventBindings: EventHandlers = {
        chat(user, data) {
            this.server.sendEventToAll("speak", {
                text: `${user.info.username}: ${data.message}`,
                buffer: "Public chat",
                sound: "ui/chat.ogg",
            });
        },
        move(user, data) {
            let {player} = user;
            if (player && player.canMove) {
                switch (data.direction) {
                    case "forward":
                        player.move(player.x, player.y + 1, player.z);
                        break;
                    case "right":
                        player.move(player.x + 1, player.y, player.z);
                        break;
                    case "backward":
                        player.move(player.x, player.y - 1, player.z);
                        break;
                    case "left":
                        player.move(player.x - 1, player.y, player.z);
                        break;
                }
            }
        },
        getServerInfo(user, data) {
            if (!this.server.users.size) {
                return;
            }
            const onlineList = [];
            for (let onlineUser of this.server.users) {
                onlineList.push({ username: onlineUser.info.username });
            }
            user.sendEvent("serverInfo", { onlineList: onlineList });
        },
    };
}
