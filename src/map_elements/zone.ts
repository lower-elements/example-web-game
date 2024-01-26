import { ExportedZone } from "../exported_map_types";
import BoundedBox from "./bounded_box";

export default class Zone extends BoundedBox {
    text: string;

    constructor(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number,
        text: string = "nowhere"
    ) {
        super(minx, maxx, miny, maxy, minz, maxz);
        this.text = text;
    }
    dump(): ExportedZone {
        return {
            ...super.dump(),
            text: this.text,
        };
    }
    static loadFromDump(data: ExportedZone): Zone {
        return new Zone(
            data.minx,
            data.maxx,
            data.miny,
            data.maxy,
            data.minz,
            data.maxz,
            data.text
        );
    }
}
