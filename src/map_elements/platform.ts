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
}
