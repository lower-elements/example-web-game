import Game from "./game";
import Client from "./network";
import speak from "./speech";
import Gameplay from "./states/gameplay";
import { Buffer, BufferItem } from "./buffer";
import { ExportedMap } from "./exported_map_types";
import Entity from "./entities/entity";
import Player from "./entities/player";
import AudioSource from "./audio/audio_source";
import ServerInfo from "./states/server_info";
import createOneShotSound from "./audio/one_shot_sound";
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
        async speak(data) {
            if (data.sound) {
                await createOneShotSound(
                    this.game.audioContext,
                    data.sound,
                    true
                );
            }
            speak(data.text ?? "", data.interupt ?? true);
            if (data.buffer) {
                let buffer =
                    this.gameplay.bufferManager.getBufferByName(data.buffer) ??
                    this.gameplay.bufferManager.insertBuffer(
                        new Buffer(data.buffer)
                    );
                this.gameplay.bufferManager.insertIntoBuffer(
                    buffer,
                    new BufferItem(data.text ?? "")
                );
            }
        },
        loadMap(data) {
            this.gameplay.loadMap(data.map, data.position);
            if (this.gameplay.player) {
                this.gameplay.player.id = data.playerId ?? "player";
            }
        },
        spawnEntities(data) {
            for (let entity of data.entities) {
                this.gameplay.map?.addEntity(
                    new Entity(
                        this.game,
                        entity.id,
                        entity.x,
                        entity.y,
                        entity.z,
                        this.gameplay.map
                    )
                );
            }
        },
        removeEntities(data) {
            for (let id of data.entities) {
                let entity = this.gameplay.map?.getEntityById(id);
                if (entity) {
                    this.gameplay.map?.removeEntity(entity);
                }
            }
        },
        entityPlaySound(data) {
            this.gameplay.map
                ?.getEntityById(data.id)
                ?.playSound(data.path, data.looping);
        },
        entityMove(data) {
            let entity = this.gameplay.map?.getEntityById(data.id);
            if (!entity && data.id === this.gameplay.player?.id) {
                entity = this.gameplay.player ?? undefined;
            }
            if (
                entity &&
                !entity.isSamePosition({ x: data.x, y: data.y, z: data.z })
            ) {
                entity.move(
                    data.x,
                    data.y,
                    data.z,
                    data.playSound && !(entity instanceof Player),
                    false
                );
            }
        },
        serverInfo(data) {
            this.game.pushState(new ServerInfo(this.game, data.onlineList));
        },
    };
}
