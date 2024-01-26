import { ExportedBoundedBox, ExportedPlatform } from "../exported_map_types";
import BoundedBox from "./bounded_box";

export default class Platform extends BoundedBox {
    type: string;

    constructor(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        type: string = "air"
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.type = type;
    }
    dump(): ExportedPlatform {
        return {
            ...super.dump(),
            type: this.type,
        };
    }
    static loadFromDump(data: ExportedPlatform): Platform {
        return new Platform(
            data.minx,
            data.maxx,
            data.miny,
            data.maxy,
            data.minz,
            data.maxz,
            data.type
        );
    }
}
