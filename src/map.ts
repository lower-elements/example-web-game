import { QuadTreeSet, Shape } from "fast-quadtree-ts";
import BoundedBox from "./map_elements/bounded_box";
import Platform from "./map_elements/platform";
import SoundSource from "./map_elements/sound_source";
import Zone from "./map_elements/zone";
import Gameplay from "./states/gameplay";
import Entity from "./entities/entity";
import { ExportedBoundedBox, ExportedMap } from "./exported_map_types";
import getBuffer from "./audio/audio_buffers";
/**
 * Represents the game's world map, with functions to spawning and querying map elements such as platforms, sound sources, zones, and entities.
 */
export default class Map extends BoundedBox {
    private platforms: Platform[] = [];
    private zones: Zone[] = [];
    private soundSources: SoundSource[] = [];
    private loadedData: Object = {};
    entities: QuadTreeSet<Entity>;
    private idToEntityMap: Record<string, Entity> = {};
    private gameplay: Gameplay;
    protected get allElements(): BoundedBox[] {
        return [...this.platforms, ...this.zones, ...this.soundSources];
    }
    constructor(
        gameplay: Gameplay,
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        loadedData?: Object
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.gameplay = gameplay;
        this.loadedData = loadedData ?? {};
        this.entities = new QuadTreeSet<Entity>(
            { center: this.center, size: this.size },
            {
                unitKeyGetter: (vec, entity) => (entity ? entity.id : 0),
                unitPositionGetter: (entity) => entity,
            }
        );
    }
    private areAllSoundSourcesReady(): boolean {
        for (let source of this.soundSources) {
            if (!source.ready) {
                return false;
            }
        }
        return true;
    }
    /**
     * Resolves once all audio assets this map needs have been preloaded, or preloaded enough of them for smooth gameplay, and also initializes playback of the sound sources.
     *
     * Rejects if this operation fails.
     */
    async load(): Promise<void> {
        await this.loadFootsteps();
        await this.loadSoundSources();
        this.soundSources.forEach((source) => source.play());
    }
    private loadSoundSources(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.soundSources.length) {
                return resolve();
            }
            for (let source of this.soundSources) {
                source.events.once("ready", (_) => {
                    if (this.areAllSoundSourcesReady()) {
                        resolve();
                    }
                });
            }
            if (this.areAllSoundSourcesReady()) {
                resolve();
            }
        });
    }
    private async loadFootsteps(): Promise<void> {
        const promises: Promise<AudioBuffer>[] = [];
        const alreadyCheckedTypes: string[] = [];
        for (let platform of this.platforms) {
            if (alreadyCheckedTypes.includes(platform.type)) {
                continue;
            }
            alreadyCheckedTypes.push(platform.type);
            for (let index = 1; index <= 5; index++) {
                promises.push(
                    getBuffer(
                        this.gameplay.game.audioContext,
                        `steps/${platform.type}/${index}.ogg`
                    )
                );
            }
        }
        await Promise.all(promises);
    }
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
        this.entities.add(entity);
        this.idToEntityMap[entity.id] = entity;
        return entity;
    }
    removeEntity(entity: Entity): boolean {
        delete this.idToEntityMap[entity.id];
        return this.entities.delete(entity);
    }
    getEntityById(id: string): Entity | undefined {
        return this.idToEntityMap[id];
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

    spawnSoundSource(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        path: string,
        volume: number = 0.9
    ): SoundSource {
        const soundSource = new SoundSource(
            this.gameplay.game,
            minx,
            maxx,
            miny,
            maxy,
            minz,
            maxz,
            path,
            this.gameplay.player!,
            volume
        );
        this.soundSources.push(soundSource);
        return soundSource;
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
    getSoundSourceAt(x: number, y: number, z: number): SoundSource | null {
        return this.getElementAt(x, y, z, this.soundSources);
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
            ...this.loadedData,
            ...super.dump(),
            platforms: dumpArray(this.platforms),
            zones: dumpArray(this.zones),
            soundSources: dumpArray(this.soundSources),
        };
    }
    async loadFromDump(data: ExportedMap): Promise<void> {
        this.minx = data.minx;
        this.maxy = data.maxx;
        this.miny = data.miny;
        this.maxy = data.maxy;
        this.minz = data.minz;
        this.maxz = data.maxz;
        this.platforms = (data.platforms ?? []).map((element) =>
            Platform.loadFromDump(element)
        );
        this.zones = (data.zones ?? []).map((element) =>
            Zone.loadFromDump(element)
        );
        this.soundSources = (data.soundSources ?? []).map((element) =>
            SoundSource.loadFromDump(
                element,
                this.gameplay.game,
                this.gameplay.player!
            )
        );
        await this.load();
    }
}
function dumpArray(arr: any[]): any[] {
    return arr.map((element) => element.dump());
}
