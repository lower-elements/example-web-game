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
        super(game, x, y, z, map);
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
        this._x = value;
        this.pannerNode.positionX.value = value;
        this.updateListenerPosition();
    }
    set y(value: number) {
        this._y = value;
        this.pannerNode.positionY.value = value;
        this.updateListenerPosition();
    }
    set z(value: number) {
        this._z = value;
        this.pannerNode.positionZ.value = value;
        this.updateListenerPosition();
    }
}
