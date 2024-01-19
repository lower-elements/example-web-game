export function randint(min: number, max: number): number {
    // Ensure min and max are integers
    const minInt = Math.ceil(min);
    const maxInt = Math.floor(max);

    // Ensure min is less than or equal to max
    if (minInt > maxInt) {
        throw new Error("Min value must be less than or equal to max value");
    }

    // Generate a random integer within the specified range
    return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}
export class Timer {
    private startTime: number | null;
    private endTime: number | null;

    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.start();
    }

    start(): void {
        this.startTime = Date.now();
        this.endTime = null;
    }

    stop(): void {
        if (this.startTime !== null && this.endTime === null) {
            this.endTime = Date.now();
        }
    }

    restart(): void {
        this.startTime = Date.now();
        this.endTime = null;
    }

    get elapsed(): number | null {
        if (this.startTime !== null) {
            const end = this.endTime !== null ? this.endTime : Date.now();
            return end - this.startTime;
        }
        return null;
    }
}
