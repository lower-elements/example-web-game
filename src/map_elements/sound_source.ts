import AudioSource from "../audio_source";
import Entity from "../entities/entity";
import { EventCallback } from "../event_emitter";
import Game from "../game";
import BoundedBox from "./bounded_box";

export default class SoundSource extends BoundedBox {
    private sound: AudioSource;
    private gainNode: GainNode;
    private pannerNode: PannerNode;
    private updateEventCallback: EventCallback<Entity>;
    private ref: Entity;
    private audioContext: AudioContext;
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
        this.sound = new AudioSource(game.audioContext, soundPath, true, false);
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
        this.sound.mediaElement.autoplay = true;
    }
    updateRef(x: number, y: number, z: number): void {
        const position = this.closestPointTo({ x: x, y: y, z: z });
        const duration = 0.04;
        const currentTime = this.audioContext.currentTime;
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
}
