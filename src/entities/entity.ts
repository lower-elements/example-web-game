import { Timer, randint } from "../utils";
import Map from "../map";
import AudioSource from "../audio_source";
import Game from "../game";
import EventEmitter from "../event_emitter";
export default class Entity extends EventEmitter<Entity> {
    protected game: Game;
    protected audioContext: AudioContext;
    protected gainNode: GainNode;
    protected pannerNode: PannerNode;
    protected isRewired: boolean = false;
    protected _x: number = 0;
    protected _y: number = 0;
    protected _z: number = 0;
    protected map: Map;
    protected movementTimer: Timer = new Timer();
    protected normalMovementTime: number = 277;
    constructor(game: Game, x = 0, y = 0, z = 0, map: Map) {
        super();
        this.game = game;
        this.audioContext = game.audioContext;
        this.gainNode = this.audioContext.createGain();
        this.pannerNode = this.audioContext.createPanner();
        this.pannerNode.panningModel = "HRTF";
        this.pannerNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this._x = x;
        this._y = y;
        this._z = z;
        this.pannerNode.positionX.value = x;
        this.pannerNode.positionY.value = y;
        this.pannerNode.positionZ.value = z;
        this.map = map;
    }
    rewireOutput(dist: AudioNode | null) {
        this.gainNode.disconnect();
        if (dist === null && this.isRewired) {
            this.gainNode.connect(this.audioContext.destination);
            this.isRewired = false;
        } else if (dist) {
            this.gainNode.connect(dist);
            this.isRewired = true;
        }
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
        this.pannerNode.positionX.linearRampToValueAtTime(
            value,
            this.audioContext.currentTime + 0.02
        );
    }
    set y(value: number) {
        this._y = value;
        this.pannerNode.positionY.linearRampToValueAtTime(
            value,
            this.audioContext.currentTime + 0.02
        );
    }
    set z(value: number) {
        this._z = value;
        this.pannerNode.positionZ.linearRampToValueAtTime(
            value,
            this.audioContext.currentTime + 0.02
        );
    }
    attachSound(sound: AudioSource): void {
        sound.connect(this.pannerNode, undefined, undefined);
    }
    playSound(path: string, looping: boolean = false): AudioSource {
        let source = new AudioSource(this.audioContext, path, looping, false);
        this.attachSound(source);
        source.play();
        return source;
    }
    setPosition(
        x: number,
        y: number,
        z: number,
        playSound: boolean = true
    ): void {
        if (!this.map.inBound(x, y, z)) return;
        this.movementTimer.restart();
        this.x = x;
        this.y = y;
        this.z = z;
        let platform = this.map.getPlatformAt(x, y, z);
        let result = platform ? platform.type : "air";
        if (playSound && result != "air") {
            this.playSound(`steps/${result}/${randint(1, 5)}.ogg`);
        }
        this.fireEvent("move");
    }
    get canMove(): boolean {
        return (this.movementTimer.elapsed ?? 0) >= this.normalMovementTime;
    }
    protected fireEvent(event: string) {
        this.emit(event, this);
    }
}
