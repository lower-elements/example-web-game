import Entity from "./entity";
import { Timer, randint } from "../utils";
import Map from "../map";
import Server from "../server";
import User from "../user";
export default class Player extends Entity {
    protected _facing: number = 0;
    user: User;
    constructor(
        server: Server,
        user: User,
        x: number = 0,
        y: number = 0,
        z: number = 0,
        map: Map
    ) {
        super(server, `PLAYER${user.info.normalizedUsername}`, x, y, z, map);
        this.user = user;
        user.setPlayer(this);
        this.map.addEntity(this);
    }
    get facing(): number {
        return this._facing;
    }
    setFacing(value: number) {
        this._facing = value;
    }
    changeMap(newMap: Map): void {
        this.map.removeEntity(this);
        this.reloadMap();
        this.map = newMap;
        newMap.addEntity(this);
    }
    reloadMap(resendEntities: boolean = false): void {
        this.user.sendEvent("loadMap", {
            map: this.map.dump(),
            position: { x: this.x, y: this.y, z: this.z },
            playerId: this.id,
        });
        if (resendEntities) {
            this.map.sendEntitiesToPlayer(this);
        }
    }
}
