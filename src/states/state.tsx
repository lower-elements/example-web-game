import { ReactNode} from "react";
import Game from "../game";
export default class State {
    gui: ReactNode | null = null;
    game: Game;
    constructor(game: Game) {
        this.game = game;
    }
    initialize(): void {}
    onPush(): void {}
    onCover(): void {}
    onUncover(): void {}
    onPop(): void {}
    onEscape(): void {}
    update(delta: number, events: KeyboardEvent[]): void {}
}
