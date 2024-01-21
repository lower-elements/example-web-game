import { QuadTreeSet, Shape } from "fast-quadtree-ts";
import BoundedBox from "./map_elements/bounded_box";
import Platform from "./map_elements/platform";
import SoundSource from "./map_elements/sound_source";
import Zone from "./map_elements/zone";
import Gameplay from "./states/gameplay";
import Entity from "./entities/entity";
/**
 * Represents the game's world map, with functions to spawning and querying map elements such as platforms, sound sources, zones, and entities.
 */
export default class Map extends BoundedBox {
    private platforms: Platform[] = [];
    private zones: Zone[] = [];
    private soundSources: SoundSource[] = [];
    entities: QuadTreeSet<Entity>;
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
        maxz: number
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.gameplay = gameplay;
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
    private loadFootsteps(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.platforms.length) {
                return resolve();
            }
            const preloaders: HTMLAudioElement[] = [];
            for (let platform of this.platforms) {
                for (let index = 1; index <= 5; index++) {
                    preloaders.push(
                        new Audio(`sounds/steps/${platform.type}/${index}.ogg`)
                    );
                }
            }
            function areAllFootstepsReady(): boolean {
                for (let preloader of preloaders) {
                    if (preloader.readyState < 4) {
                        return false;
                    }
                }
                return true;
            }
            for (let preloader of preloaders) {
                preloader.addEventListener(
                    "canplaythrough",
                    (_) => {
                        if (areAllFootstepsReady()) {
                            resolve();
                        }
                    },
                    { once: true }
                );
            }
            if (areAllFootstepsReady()) {
                resolve();
            }
        });
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
        return entity;
    }
    removeEntity(entity: Entity): boolean {
        return this.entities.delete(entity);
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
            this.gameplay.player,
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
}
