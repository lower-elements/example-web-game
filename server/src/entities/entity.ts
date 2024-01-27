import { Timer, randint } from "../utils";
import Map from "../map";
import EventEmitter from "../event_emitter";
import Server from "../server";
export default class Entity extends EventEmitter<Entity> {
    protected server: Server;
    protected _x: number = 0;
    protected _y: number = 0;
    protected _z: number = 0;
    protected map: Map;
    protected movementTimer: Timer = new Timer();
    protected normalMovementTime: number = 277;
    private _id: string;
    constructor(server: Server, id: string, x = 0, y = 0, z = 0, map: Map) {
        super();
        this.server = server;
        this._id = id;
        this._x = x;
        this._y = y;
        this._z = z;
        this.map = map;
    }
    get id(): string {
        return `ENTITYID${this._id}`;
    }
    set id(value: string) {
        this._id = value;
    }
    playSound(
        path: string,
        looping: boolean = false,
        excludeMe: boolean = false
    ): void {
        this.map.sendEventToAll(
            "entityPlaySound",
            {
                id: this._id,
                path: path,
                looping: looping,
            },
            excludeMe ? [this._id] : []
        );
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
    }
    set y(value: number) {
        this._y = value;
    }
    set z(value: number) {
        this._z = value;
    }
    move(
        x: number,
        y: number,
        z: number,
        playSound: boolean = true,
        shouldSendMovementEvent: boolean = true
    ): void {
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
        this.fireEvent("move");
        if (shouldSendMovementEvent) {
            this.sendMovementEvent(playSound);
        }
    }
    sendMovementEvent(playSound: boolean = true): void {
        this.map.sendEventToAll("entityMove", {
            id: this.id,
            x: this.x,
            y: this.y,
            z: this.z,
            playSound: playSound,
        });
    }
    get canMove(): boolean {
        return (this.movementTimer.elapsed ?? 0) >= this.normalMovementTime;
    }
    protected fireEvent(event: string) {
        this.emit(event, this);
    }
    destroy() {
        this.map.removeEntity(this);
    }
}
