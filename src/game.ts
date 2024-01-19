import speak from "./speech";
import Gameplay from "./states/gameplay";
import Menu from "./states/menu";
import State from "./states/state";
export default class Game {
    audioContext: AudioContext;
    gameContent: HTMLDivElement;
    private events: UIEvent[] = [];
    private stack: State[] = [];
    constructor(gameContent: HTMLDivElement) {
        this.gameContent = gameContent;
        this.audioContext = new AudioContext();
        this.subscribeToEvents();
        this.setListenerOrientation(0);
    }
    setListenerOrientation(degrees: number): void {
        const rad: number = (degrees / 180.0) * Math.PI;
        this.audioContext.listener.setOrientation(
            Math.sin(rad),
            Math.cos(rad),
            0,
            0,
            0,
            1
        );
    }
    setListenerPosition(x: number, y: number, z: number): void {
        this.audioContext.listener.positionX.value = x;
        this.audioContext.listener.positionY.value = y;
        this.audioContext.listener.positionZ.value = z;
    }
    pushState(st: State): State {
        if (this.stack.length > 0) {
            const previousState = this.stack[this.stack.length - 1];
            previousState.onCover();
        }
        st.onPush();
        this.stack.push(st);
        return st;
    }
    popState(): State {
        let result: State;
        result = this.stack[this.stack.length - 1];
        result.onPop();
        this.stack.pop();
        if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].onUncover();
        }
        return result;
    }
    replaceState(state: State): void {
        if (this.stack.length > 0) {
            this.popState();
        }
        this.pushState(state);
    }
    gameLoop() {
        if (this.stack.length > 0) {
            let currentState = this.stack[this.stack.length - 1];
            currentState.update(16.6, this.events);
        }
        this.events.length = 0;
        requestAnimationFrame(() => this.gameLoop());
    }
    private addEvent(event: UIEvent): void {
        this.events.push(event);
        event.stopPropagation();
    }
    private subscribeToEvents() {
        const eventHandler = this.addEvent.bind(this);
        this.gameContent.addEventListener("keydown", eventHandler);
        this.gameContent.addEventListener("keyup", eventHandler);
    }
    replaceWithMainMenu() {
        const menu = new Menu(this, "main menu");
        menu.setItems([
            {
                label: "play",
                callback(game, menu) {
                    game.replaceState(new Gameplay(game));
                },
            },
        ]);
        this.replaceState(menu);
    }
}
