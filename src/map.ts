import BoundedBox from "./map_elements/bounded_box";
import Platform from "./map_elements/platform";
import SoundSource from "./map_elements/sound_source";
import Zone from "./map_elements/zone";
import Gameplay from "./states/gameplay";

export default class Map extends BoundedBox {
    private platforms: Platform[] = [];
    private zones: Zone[] = [];
    private soundSources: SoundSource[] = [];
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
        const result = this.getElementAt(x, y, z, this.platforms);
        return result;
    }

    getZoneAt(x: number, y: number, z: number): Zone | null {
        const result = this.getElementAt(x, y, z, this.zones);
        return result;
    }
    getSoundSourceAt(x: number, y: number, z: number): SoundSource | null {
        const result = this.getElementAt(x, y, z, this.soundSources);
        return result;
    }
    update(delta: number): void {
        this.allElements.forEach((element) => element.update(delta));
    }
    destroy(): void {
        this.allElements.forEach((element) => element.destroy());
    }
}
