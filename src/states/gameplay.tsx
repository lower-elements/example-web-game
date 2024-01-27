import State from "./state";
import Player from "../entities/player";
import Game from "../game";
import Map from "../map";
import speak from "../speech";
import { replaceWithMainMenu } from "../menus";
import Client from "../network";
import ChatState from "./chat";
import BufferManager, { SwitchDirection } from "../buffer";
import { ExportedMap } from "../exported_map_types";
import { Point } from "../map_elements/bounded_box";
type KeyHandlers = {
    [key: string]: (event: KeyboardEvent) => void;
};
type HeldKeys = {
    [key: string]: KeyboardEvent;
};

export default class Gameplay extends State {
    player: Player | null = null;
    map: Map | null = null;
    readonly bufferManager: BufferManager = new BufferManager();
    private blocked: boolean = false;
    private heldKeys: HeldKeys = {};
    private networkClient: Client;
    constructor(game: Game) {
        super(game);
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : "";
        this.networkClient = new Client(this, {
            url: `${protocol}//${host}${port}`,
            onOpen(client) {
                speak("Welcome!");
            },
            onClose(client) {
                game.popStatesUntil<Gameplay>();
                replaceWithMainMenu(game);
                speak("Connection closed");
            },
            onError(client) {
                game.popStatesUntil<Gameplay>();
                replaceWithMainMenu(game);
                speak("error");
            },
        });
    }
    initialize(): void {}
    async onPush(): Promise<void> {
        speak("Connecting...");
    }
    onCover(): void {
        this.heldKeys = {};
    }
    onUncover(): void {
        this.player?.updateListenerPosition();
    }
    onPop(): void {
        this.map?.destroy();
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
    private destroyMap(): void {
        this.map?.destroy();
        this.map = null;
        this.player = null;
    }
    private setMap(
        map: Map,
        position: { x?: number; y?: number; z?: number }
    ): void {
        if (this.map) {
            this.destroyMap();
        }
        this.map = map;
        this.player = new Player(
            this.game,
            position.x,
            position.y,
            position.z,
            this.map
        );
    }
    async loadMap(map: ExportedMap, position: Point): Promise<void> {
        this.setMap(
            new Map(
                this,
                map.minx,
                map.maxx,
                map.miny,
                map.maxy,
                map.minz,
                map.maxz,
                map
            ),
            position
        );
        this.blocked = true;
        try {
            this.player?.updateListenerPosition();
            await this.map?.loadFromDump(map);
        } catch (err) {
            console.log(err);
        } finally {
            this.blocked = false;
        }
    }
    private onKeyPress: KeyHandlers = {
        Escape: (event) => {
            !event.repeat && replaceWithMainMenu(this.game);
        },
        Slash: (event) =>
            !event.repeat &&
            this.game.pushState(new ChatState(this.game, this.networkClient)),
        BracketLeft: (event) => {
            this.bufferManager.move(
                event.shiftKey ? SwitchDirection.top : SwitchDirection.backward
            );
            this.bufferManager.speakCurrentBuffer();
        },
        BracketRight: (event) => {
            this.bufferManager.move(
                event.shiftKey
                    ? SwitchDirection.bottum
                    : SwitchDirection.forward
            );
            this.bufferManager.speakCurrentBuffer();
        },
        Comma: (event) => {
            this.bufferManager.currentBuffer.move(
                event.shiftKey ? SwitchDirection.top : SwitchDirection.backward
            );
            this.bufferManager.speakCurrentBufferItem();
        },
        Period: (event) => {
            this.bufferManager.currentBuffer.move(
                event.shiftKey
                    ? SwitchDirection.bottum
                    : SwitchDirection.forward
            );
            this.bufferManager.speakCurrentBufferItem();
        },
        KeyC: () => {
            this.player &&
                speak(`${this.player.x}, ${this.player.y}, ${this.player.z}`);
        },
    };
    private onKeyRelease: KeyHandlers = {};
    private onKeyDown: KeyHandlers = {
        KeyW: () => {
            if (this.player && this.player.canMove) {
                this.player.move(
                    this.player.x,
                    this.player.y + 1,
                    this.player.z
                );
            }
        },
        KeyD: () => {
            if (this.player && this.player.canMove) {
                this.player.move(
                    this.player.x + 1,
                    this.player.y,
                    this.player.z
                );
            }
        },
        KeyS: () => {
            if (this.player && this.player.canMove) {
                this.player.move(
                    this.player.x,
                    this.player.y - 1,
                    this.player.z
                );
            }
        },
        KeyA: () => {
            if (this.player && this.player.canMove) {
                this.player.move(
                    this.player.x - 1,
                    this.player.y,
                    this.player.z
                );
            }
        },
    };
}
