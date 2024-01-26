import AudioSource from "../audio_source";
import Entity from "../entities/entity";
import EventEmitter, { EventCallback } from "../event_emitter";
import { ExportedSoundSource } from "../exported_map_types";
import Game from "../game";
import BoundedBox from "./bounded_box";

export default class SoundSource extends BoundedBox {
    private sound: AudioSource;
    private gainNode: GainNode;
    private pannerNode: PannerNode;
    private updateEventCallback: EventCallback<Entity>;
    private ref: Entity;
    private audioContext: AudioContext;
    private soundPath: string;
    private volume: number;
    events: EventEmitter<SoundSource> = new EventEmitter<SoundSource>();
    ready: boolean = false;
    constructor(
        game: Game,
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        soundPath: string,
        ref: Entity,
        volume: number = 0.8
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.audioContext = game.audioContext;
        this.soundPath = soundPath;
        this.volume = volume;
        this.sound = new AudioSource(game.audioContext, soundPath, true, false);
        this.sound.mediaElement.addEventListener(
            "canplaythrough",
            (event) => {
                this.ready = true;
                this.events.emit("ready", this);
            },
            { once: true }
        );
        this.gainNode = game.audioContext.createGain();
        this.gainNode.gain.value = volume;
        this.pannerNode = game.audioContext.createPanner();
        this.pannerNode.panningModel = "HRTF";
        this.sound.connect(this.pannerNode, undefined, undefined);
        this.ref = ref;
        this.updateRef(ref.x, ref.y, ref.z);
        this.pannerNode
            .connect(this.gainNode)
            .connect(game.audioContext.destination);
        this.updateEventCallback = (entity) =>
            this.updateRef(entity.x, entity.y, entity.z);
        ref.on("move", this.updateEventCallback);
    }
    updateRef(x: number, y: number, z: number): void {
        const position = this.closestPointTo({ x: x, y: y, z: z });
        const { currentTime } = this.audioContext;
        this.pannerNode.positionX.value = position.x;
        this.pannerNode.positionY.value = position.y;
        this.pannerNode.positionZ.value = position.z;
    }
    play(): void {
        this.sound.play();
    }
    pause(): void {
        this.sound.pause();
    }
    destroy() {
        this.ref.cancel("move", this.updateEventCallback);
        this.sound.stop();
    }
    dump(): ExportedSoundSource {
        return {
            ...super.dump(),
            soundPath: this.soundPath,
            volume: this.volume,
        };
    }
    static loadFromDump(
        data: ExportedSoundSource,
        game: Game,
        ref: Entity
    ): SoundSource {
        return new SoundSource(
            game,
            data.minx,
            data.maxx,
            data.miny,
            data.maxy,
            data.minz,
            data.maxz,
            data.soundPath,
            ref
        );
    }
}
