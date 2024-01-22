import State from "./state";
import Player from "../entities/player";
import Game from "../game";
import Map from "../map";
import speak from "../speech";
import InputBox from "../gui/input_box";
import React from "react";
import { replaceWithMainMenu } from "../menus";
type KeyHandlers = {
    [key: string]: (event: KeyboardEvent) => void;
};
type HeldKeys = {
    [key: string]: KeyboardEvent;
};

export default class Gameplay extends State {
    private map: Map;
    player: Player;
    private blocked: boolean = false;
    private heldKeys: HeldKeys = {};
    private onKeyPress: KeyHandlers = {
        Escape: (event) => {
            replaceWithMainMenu(this.game);
        },
        KeyC: (event) => {
            speak(`${this.player.x}, ${this.player.y}, ${this.player.z}`);
        },
    };
    private onKeyRelease: KeyHandlers = {};
    private onKeyDown: KeyHandlers = {
        KeyW: (event) => {
            if (this.player.canMove) {
                this.player.move(
                    this.player.x,
                    this.player.y + 1,
                    this.player.z
                );
            }
        },
        KeyD: (event) => {
            if (this.player.canMove) {
                this.player.move(
                    this.player.x + 1,
                    this.player.y,
                    this.player.z
                );
            }
        },
        KeyS: (event) => {
            if (this.player.canMove) {
                this.player.move(
                    this.player.x,
                    this.player.y - 1,
                    this.player.z
                );
            }
        },
        KeyA: (event) => {
            if (this.player.canMove) {
                this.player.move(
                    this.player.x - 1,
                    this.player.y,
                    this.player.z
                );
            }
        },
    };
    constructor(game: Game) {
        super(game);
        this.map = new Map(this, 0, 70, 0, 70, 0, 10);
        this.player = new Player(this.game, 0, 0, 0, this.map);
        this.map.spawnPlatform(0, 70, 0, 70, 0, 0, "grass");
        this.map.spawnPlatform(30, 60, 30, 60, 0, 0, "mud");
        this.map.spawnPlatform(36, 55, 36, 55, 0, 0, "water");
        this.map.spawnSoundSource(0, 70, 0, 70, 0, 70, "ambience/birds.ogg");
        this.map.spawnSoundSource(36, 55, 36, 55, 0, 70, "ambience/pond.ogg");
    }
    initialize(): void {}
    async onPush(): Promise<void> {
        speak("Welcome!");
        this.player.updateListenerPosition();
        this.blocked = true;
        await this.map.load();
        this.blocked = false;
    }
    onCover(): void {}
    onUncover(): void {
        this.player.updateListenerPosition();
    }
    onPop(): void {
        this.map.destroy();
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
