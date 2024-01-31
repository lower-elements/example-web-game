import State from "./state";
import AudioSource from "../audio/audio_source";
import speak from "../speech";
import Game from "../game";
import createOneShotSound from "../audio/one_shot_sound";
export default class Menu extends State {
    private title: string;
    private items: MenuItem[] = [];
    private index: number = -1;
    private moveSoundPath: string = "menu/move.ogg";
    private openSoundPath: string = "menu/open.ogg";
    constructor(game: Game, title: string) {
        super(game);
        this.title = title;
    }
    setItems(items: MenuItem[]): void {
        this.items = items;
        this.resetIndex();
    }
    resetIndex(): void {
        if (this.items.length === 0) {
            this.index = -1;
        } else {
            this.index = 0;
        }
    }
    initialize(): void {}
    async onPush(): Promise<void> {
        await createOneShotSound(
            this.game.audioContext,
            this.openSoundPath,
            true
        );
        speak(this.title, true);
    }
    onPop(): void {}
    onCover(): void {}
    onUncover(): void {
        this.setIndex(this.index);
    }
    update(delta: number, events: KeyboardEvent[]): void {
        for (const event of events) {
            if (this.items.length > 0 && event.type === "keydown") {
                switch (event.code) {
                    case "ArrowUp":
                        this.setIndex(this.index - 1);
                        event.preventDefault();
                        break;
                    case "ArrowDown":
                        this.setIndex(this.index + 1);
                        event.preventDefault();
                        break;
                    case "Enter":
                        this.activateSelectedItem();
                        event.preventDefault();
                        break;
                }
            }
        }
    }
    activateSelectedItem() {
        this.items[this.index].callback(this.game, this);
    }
    async setIndex(index: number): Promise<void> {
        if (this.items.length === 0) {
            return;
        }
        this.index =
            ((index % this.items.length) + this.items.length) %
            this.items.length;
        this.speakCurrentItem();
        await createOneShotSound(
            this.game.audioContext,
            this.moveSoundPath,
            true
        );
    }
    speakCurrentItem(interupt: boolean = true): void {
        if (this.index >= 0) {
            speak(this.items[this.index].label, interupt);
        }
    }
}
export interface MenuItem {
    label: string;
    callback: (game: Game, menu: Menu) => void;
}
