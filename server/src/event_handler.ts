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
            });
        },
    };
}
