export interface ExportedBoundedBox {
    minx: number;
    maxx: number;
    miny: number;
    maxy: number;
    minz: number;
    maxz: number;
}
export interface ExportedPlatform extends ExportedBoundedBox {
    type: string;
}
export interface ExportedZone extends ExportedBoundedBox {
    text: string;
}
export interface ExportedSoundSource extends ExportedBoundedBox {
    soundPath: string;
    volume: number;
}
export interface ExportedMap extends ExportedBoundedBox{
    platforms: ExportedPlatform[];
    zones: ExportedZone[];
    soundSources: ExportedSoundSource[];
}
