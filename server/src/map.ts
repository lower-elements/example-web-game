import { QuadTreeSet, Shape } from "fast-quadtree-ts";
import BoundedBox from "./map_elements/bounded_box";
import Platform from "./map_elements/platform";
import Zone from "./map_elements/zone";
import Entity from "./entities/entity";
import { ExportedBoundedBox, ExportedMap } from "./exported_map_types";
import Server from "./server";
import User from "./user";
import Player from "./entities/player";
/**
 * Represents the game's world map, with functions to spawning and querying map elements such as platforms, sound sources, zones, and entities.
 */
export default class Map extends BoundedBox {
    private platforms: Platform[] = [];
    private zones: Zone[] = [];
    private loadedData: Object = {};
    private players: Set<Player> = new Set();
    entities: QuadTreeSet<Entity>;
    private server: Server;
    protected get allElements(): BoundedBox[] {
        return [...this.platforms, ...this.zones];
    }
    constructor(
        server: Server,
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        loadedData?: Object
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.server = server;
        this.loadedData = loadedData ?? {};
        this.entities = new QuadTreeSet<Entity>(
            { center: this.center, size: this.size },
            {
                unitKeyGetter: (vec, entity) => (entity ? entity.id : 0),
                unitPositionGetter: (entity) => entity,
            }
        );
    }
    sendEventToAll(
        event: string,
        data: Record<string, any>,
        excluding: string[] = []
    ): void {
        this.players.forEach(
            (player) =>
                !excluding.includes(player.user.info.username) &&
                player.user.sendEvent(event, data)
        );
    }
    async load(): Promise<void> {}
    /**
     * Returns a generator iterating over all the entities inside a specific range.
     */
    *getEntitiesIn(between: BoundedBox): Generator<Entity> {
        for (let { vec, unit } of this.entities.queryIteratable({
            center: between.center,
            size: between.size,
            type: "rectangle",
        })) {
            if (unit.z >= between.minz && unit.z <= between.maxz) {
                yield unit;
            }
        }
    }
    addEntity(entity: Entity): Entity {
        // Tell everyone about the new entity.
        this.sendEventToAll("spawnEntities", {
            entities: [
                { id: entity.id, x: entity.x, y: entity.y, z: entity.z },
            ],
        });
        if (entity instanceof Player) {
            // Tell the new player about everything else in the map.
            this.sendEntitiesToPlayer(entity);
            this.players.add(entity);
        }
        this.entities.add(entity);
        return entity;
    }
    sendEntitiesToPlayer(player: Player) {
        const everythingElse: Object[] = [];
        this.entities.forEach((otherEntity) => {
            everythingElse.push({
                id: otherEntity.id,
                x: otherEntity.x,
                y: otherEntity.y,
                z: otherEntity.z,
            });
        });
        player.user.sendEvent("spawnEntities", {
            entities: everythingElse,
        });
    }
    removeEntity(entity: Entity): boolean {
        if (this.entities.delete(entity)) {
            if (entity instanceof Player) {
                this.players.delete(entity);
            }
            // Tell all of the players to remove this entity.
            this.sendEventToAll("removeEntities", {
                entities: [entity.id],
            });
            return true;
        }
        return false;
    }
    spawnPlatform(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        type: string = "air"
    ): Platform {
        const platform = new Platform(minx, maxx, miny, maxy, minz, maxz, type);
        this.platforms.push(platform);
        return platform;
    }

    spawnZone(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        text: string = "nowhere"
    ): Zone {
        const zone = new Zone(minx, maxx, miny, maxy, minz, maxz, text);
        this.zones.push(zone);
        return zone;
    }
    private getElementAt<T extends BoundedBox>(
        x: number,
        y: number,
        z: number,
        elements: T[]
    ): T | null {
        for (let element of elements.slice().reverse()) {
            if (element.inBound(x, y, z)) {
                return element;
            }
        }
        return null;
    }

    getPlatformAt(x: number, y: number, z: number): Platform | null {
        return this.getElementAt(x, y, z, this.platforms);
    }

    getZoneAt(x: number, y: number, z: number): Zone | null {
        return this.getElementAt(x, y, z, this.zones);
    }
    update(delta: number): void {
        this.allElements.forEach((element) => element.update(delta));
    }
    destroy(): void {
        this.allElements.forEach((element) => element.destroy());
        this.destroyAllEntities();
    }
    destroyAllEntities() {
        const entitiesToDestroy: Entity[] = [];
        this.entities.forEach((entity) => entitiesToDestroy.push(entity));
        entitiesToDestroy.forEach((entity) => entity.destroy());
    }
    dump(): ExportedMap {
        return {
            ...(this.loadedData as ExportedMap),
            ...super.dump(),
            platforms: dumpArray(this.platforms),
            zones: dumpArray(this.zones),
        };
    }
    async loadFromDump(data: ExportedMap): Promise<void> {
        this.minx = data.minx;
        this.maxy = data.maxx;
        this.miny = data.miny;
        this.maxy = data.maxy;
        this.minz = data.minz;
        this.maxz = data.maxz;
        this.platforms = data.platforms.map((element) =>
            Platform.loadFromDump(element)
        );
        this.zones = data.zones.map((element) => Zone.loadFromDump(element));
        await this.load();
    }
}
function dumpArray(arr: any[]): any[] {
    return arr.map((element) => element.dump());
}
