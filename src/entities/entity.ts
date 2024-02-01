import { Timer, randint } from "../utils";
import Map from "../map";
import AudioSource from "../audio/audio_source";
import Game from "../game";
import EventEmitter from "../event_emitter";
import SoundEmitter from "../audio/sound_emitter";
export default class Entity extends EventEmitter<Entity> {
    protected game: Game;
    protected _x: number = 0;
    protected _y: number = 0;
    protected _z: number = 0;
    protected map: Map;
    protected movementTimer: Timer = new Timer();
    protected normalMovementTime: number = 277;
    protected soundEmitter: SoundEmitter;
    id: string;
    constructor(
        game: Game,
        id: string,
        x = 0,
        y = 0,
        z = 0,
        map: Map,
        animatePanning: boolean = true
    ) {
        super();
        this.game = game;
        this.id = id;
        this._x = x;
        this._y = y;
        this._z = z;
        this.map = map;
        this.soundEmitter = new SoundEmitter(
            game.audioContext,
            x,
            y,
            z,
            true,
            animatePanning
        );
        this.map.addEntity(this);
    }
    rewireOutput(dist: AudioNode | null) {
        return this.soundEmitter.rewireOutput(dist);
    }
    attachSound(sound: AudioSource): void {
        return this.soundEmitter.attachSound(sound);
    }
    playSound(path: string, looping: boolean = false): AudioSource {
        return this.soundEmitter.playSound(path, looping);
    }
    playSoundOneShot(
        path: string,
        looping: boolean = false
    ): Promise<AudioBufferSourceNode> {
        return this.soundEmitter.playSoundOneShot(path, looping);
    }
    get x(): number {
        return this._x;
    }
    get y(): number {
        return this._y;
    }
    get z(): number {
        return this._z;
    }
    set x(value: number) {
        this._x = value;
        this.soundEmitter.x = value;
    }
    set y(value: number) {
        this._y = value;
        this.soundEmitter.y = value;
    }
    set z(value: number) {
        this._z = value;
        this.soundEmitter.z = value;
    }
    move(x: number, y: number, z: number, playSound: boolean = true): void {
        if (!this.map.inBound(x, y, z)) {
            return;
        }
        if (!this.map.entities.move(this, this)) {
            return;
        }
        this.movementTimer.restart();
        this.x = x;
        this.y = y;
        this.z = z;
        let platform = this.map.getPlatformAt(x, y, z);
        let result = platform ? platform.type : "air";
        if (playSound && result != "air") {
            this.playSoundOneShot(`steps/${result}/${randint(1, 5)}.ogg`);
        }
        this.fireEvent("move");
    }
    get canMove(): boolean {
        return (this.movementTimer.elapsed ?? 0) >= this.normalMovementTime;
    }
    protected fireEvent(event: string) {
        this.emit(event, this);
    }
    isSamePosition(other: { x: number; y: number; z: number }): boolean {
        return other.x === this.x && other.y === this.y && other.z === this.z;
    }
    destroy() {
        this.map.removeEntity(this);
    }
}
