type Point = {x: number, y: number, z: number};
export default class BoundedBox {
    minx: number;
    maxx: number;
    miny: number;
    maxy: number;
    minz: number;
    maxz: number;
    center: Point;
    size: Point;

    constructor(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        minz: number,
        maxz: number
    ) {
        this.minx = minx;
        this.maxx = maxx;
        this.miny = miny;
        this.maxy = maxy;
        this.minz = minz;
        this.maxz = maxz;
        this.center = this.calculateCenter();
        this.size = this.calculateSize();
    }

    inBound(x: number, y: number, z: number): boolean {
        return (
            x >= this.minx &&
            x <= this.maxx &&
            y >= this.miny &&
            y <= this.maxy &&
            z >= this.minz &&
            z <= this.maxz
        );
    }
    closestPointTo(point: { x: number; y: number; z: number }): {
        x: number;
        y: number;
        z: number;
    } {
        const closestX = Math.max(this.minx, Math.min(point.x, this.maxx));
        const closestY = Math.max(this.miny, Math.min(point.y, this.maxy));
        const closestZ = Math.max(this.minz, Math.min(point.z, this.maxz));
        return { x: closestX, y: closestY, z: closestZ };
    }
    intersects(otherBox: BoundedBox): boolean {
        return !(
            this.maxx < otherBox.minx ||
            this.minx > otherBox.maxx ||
            this.maxy < otherBox.miny ||
            this.miny > otherBox.maxy ||
            this.maxz < otherBox.minz ||
            this.minz > otherBox.maxz
        );
    }
    private calculateCenter(): Point {
        const centerX = (this.minx + this.maxx) / 2;
        const centerY = (this.miny + this.maxy) / 2;
        const centerZ = (this.minz + this.maxz) / 2;
        return { x: centerX, y: centerY, z: centerZ };
    }
    private calculateSize(): Point{
        return {x: this.maxx-this.minx, y: this.maxy-this.miny, z: this.maxz-this.minz}
    }
    translate(offsetX: number, offsetY: number, offsetZ: number): void {
        this.minx += offsetX;
        this.maxx += offsetX;
        this.miny += offsetY;
        this.maxy += offsetY;
        this.minz += offsetZ;
        this.maxz += offsetZ;
    }
    update(delta: number): void {}
    destroy(): void {}
}
