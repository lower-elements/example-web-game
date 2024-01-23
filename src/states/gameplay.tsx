import State from "./state";
import Player from "../entities/player";
import Game from "../game";
import Map from "../map";
import speak from "../speech";
import InputBox from "../gui/input_box";
import React from "react";
import { replaceWithMainMenu } from "../menus";
import Client from "../network";
import ChatState from "./chat";
type KeyHandlers = {
    [key: string]: (event: KeyboardEvent) => void;
};
type HeldKeys = {
    [key: string]: KeyboardEvent;
};

export default class Gameplay extends State {
    player: Player;
    map: Map;
    private blocked: boolean = false;
    private heldKeys: HeldKeys = {};
    private onKeyPress: KeyHandlers = {
        Escape: (event) => {
            replaceWithMainMenu(this.game);
        },
        Slash: (event) =>
            this.game.pushState(new ChatState(this.game, this.networkClient)),
    };
    private onKeyRelease: KeyHandlers = {};
    private onKeyDown: KeyHandlers = {};
    private networkClient: Client;
    constructor(game: Game) {
        super(game);
        this.map = new Map(this, 0, 10, 0, 10, 0, 10);
        this.player = new Player(this.game, 0, 0, 0, this.map);
        this.networkClient = new Client(this, {
            url: "ws://localhost:3000",
            onClose(client) {
                speak("Connection closed");
            },
            onError(client) {
                speak("error");
            },
        });
    }
    initialize(): void {}
    async onPush(): Promise<void> {
        speak("Welcome!");
    }
    onCover(): void {}
    onUncover(): void {
        // this.player.updateListenerPosition();
    }
    onPop(): void {
        this.networkClient.close();
    }
    update(delta: number, events: UIEvent[]): void {
        if (this.blocked) {
            return;
        }
        for (let event of events) {
            if (event instanceof KeyboardEvent) {
                let { code } = event;
                switch (event.type) {
                    case "keydown":
                        this.heldKeys[code] = event;
                        if (code in this.onKeyPress) {
                            this.onKeyPress[code](event);
                        }
                        break;
                    case "keyup":
                        delete this.heldKeys[code];
                        if (code in this.onKeyRelease) {
                            this.onKeyRelease[code](event);
                        }
                        break;
                }
            }
        }
        for (let code of Object.keys(this.heldKeys)) {
            if (code in this.onKeyDown) {
                this.onKeyDown[code](this.heldKeys[code]);
            }
        }
    }
}
