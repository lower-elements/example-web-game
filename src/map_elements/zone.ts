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
}
