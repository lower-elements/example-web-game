import Entity from "./entity";
import { Timer, randint } from "../utils";
import Map from "../map";
import AudioSource from "../audio_source";
import Game from "../game";
export default class Player extends Entity {
    protected _facing: number = 0;
    constructor(
        game: Game,
        x: number = 0,
        y: number = 0,
        z: number = 0,
        map: Map
    ) {
        super(game, x, y, z, map, false);
    }
    private updateListenerPosition() {
        this.game.setListenerPosition(this.x, this.y, this.z);
    }
    get facing(): number {
        return this.facing;
    }
    setFacing(value: number) {
        this._facing = value;
        this.game.setListenerOrientation(value);
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
        super.x = value;
        this.updateListenerPosition();
    }
    set y(value: number) {
        super.y = value;
        this.updateListenerPosition();
    }
    set z(value: number) {
        super.z = value;
        this.updateListenerPosition();
    }
}
