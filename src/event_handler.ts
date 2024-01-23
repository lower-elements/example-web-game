import Game from "./game";
import Client from "./network";
import speak from "./speech";
import Gameplay from "./states/gameplay";

export type eventHandlerCallback = (
    this: EventHandler,
    data: Record<string, any>
) => void;
interface EventHandlers {
    [eventName: string]: eventHandlerCallback;
}
export default class EventHandler {
    gameplay: Gameplay;
    game: Game;
    client: Client;
    constructor(gameplay: Gameplay, client: Client) {
        this.gameplay = gameplay;
        this.game = gameplay.game;
        this.client = client;
    }
    triggerEvent(event: string, data: Object): void {
        if (event in this.eventBindings) {
            this.eventBindings[event].bind(this)(data);
        }
    }
    private eventBindings: EventHandlers = {
        speak(data) {
            speak(data.text ?? "", data.interupt ?? true);
        },
    };
}
