import React from "react";
import Game from "../game";
import ChatGui from "../gui/chat";
import Client from "../network";
import State from "./state";

export default class ChatState extends State {
    private client: Client;
    constructor(game: Game, client: Client) {
        super(game);
        this.client = client;
        this.gui = (
            <ChatGui
                onSubmit={(message) => {
                    client.sendEvent("chat", { message: message });
                    game.popState();
                }}
            />
        );
    }
    update(delta: number, events: UIEvent[]): void {
        super.update(delta, events);
        for (event of events) {
            if (event instanceof KeyboardEvent && event.code === "Escape") {
                this.game.popState();
                break;
            }
        }
    }
}
