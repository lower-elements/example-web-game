import speak from "./speech";

export enum SwitchDirection {
    forward,
    backward,
    top,
    bottum,
}
export default class BufferManager {
    private buffers: Buffer[] = [];
    private currentIndex: number = 0;
    constructor(buffers: Buffer[] = []) {
        this.insertBuffer(new Buffer("Main"));
        buffers.forEach((buffer) => this.insertBuffer(buffer));
    }
    insertBuffer(buffer: Buffer): Buffer {
        this.buffers.push(buffer);
        return buffer;
    }
    get currentBuffer(): Buffer {
        return this.buffers[this.currentIndex];
    }
    setIndex(index: number): Buffer {
        if (index >= 0 && index <this.buffers.length) {
            this.currentIndex = index;
        }
        return this.currentBuffer;
    }
    move(direction: SwitchDirection): Buffer {
        switch (direction) {
            case SwitchDirection.forward:
                return this.setIndex(this.currentIndex + 1);
            case SwitchDirection.backward:
                return this.setIndex(this.currentIndex - 1);
            case SwitchDirection.top:
                return this.setIndex(0);
            case SwitchDirection.bottum:
                return this.setIndex(this.buffers.length - 1);
        }
    }
    speakCurrentBuffer(): void {
        speak(`${this.currentBuffer.name}. ${this.currentBuffer.length}`);
    }
    speakCurrentBufferItem(): void {
        const content = this.currentBuffer.currentItem?.content;
        if (content) {
            speak(content);
        }
    }
    getBufferByName(name: string): Buffer | null {
        for (let buffer of this.buffers) {
            if (buffer.name === name) {
                return buffer;
            }
        }
        return null;
    }
    insertIntoBuffer(buffer: Buffer, item: BufferItem): BufferItem {
        this.buffers[0].insertItem(item);
        return buffer.insertItem(item);
    }
}
export class Buffer {
    readonly name: string;
    private items: BufferItem[] = [];
    private currentIndex: number = 0;
    constructor(name: string) {
        this.name = name;
    }
    get length(): number {
        return this.items.length;
    }
    insertItem(item: BufferItem): BufferItem {
        this.items.push(item);
        return item;
    }
    get currentItem(): BufferItem | null {
        try {
            return this.items[this.currentIndex];
        } catch (err) {
            return null;
        }
    }
    setIndex(index: number): BufferItem | null {
        if (index >= 0 && index < this.items.length) {
            this.currentIndex = index;
        }
        return this.currentItem;
    }
    move(direction: SwitchDirection): BufferItem | null {
        switch (direction) {
            case SwitchDirection.forward:
                return this.setIndex(this.currentIndex + 1);
            case SwitchDirection.backward:
                return this.setIndex(this.currentIndex - 1);
            case SwitchDirection.top:
                return this.setIndex(0);
            case SwitchDirection.bottum:
                return this.setIndex(this.items.length - 1);
        }
    }
}
export class BufferItem {
    content: string;
    constructor(content: string) {
        this.content = content;
    }
}
