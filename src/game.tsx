import { Component, PropsWithRef, ReactNode } from "react";
import State from "./states/state";
import React from "react";
import { replaceWithMainMenu } from "./menus";
interface GameState {
    fps: number;
    currentGui: ReactNode | null;
}
interface GameProps {
    gameArea: HTMLDivElement;
}
export default class Game extends Component<
    PropsWithRef<GameProps>,
    GameState
> {
    static noState = null;
    audioContext: AudioContext;
    private events: KeyboardEvent[] = [];
    private stack: State[] = [];
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    state: GameState = { currentGui: Game.noState, fps: 0 };
    private gameArea: HTMLDivElement;
    constructor(props: PropsWithRef<GameProps>) {
        super(props);
        this.gameArea = props.gameArea;
        this.audioContext = new AudioContext();
        this.setListenerOrientation(0);
        replaceWithMainMenu(this);
        this.gameLoop();
        this.subscribeToEvents();
    }
    private updateGameArea(shouldBeVisible: boolean): void {
        if (shouldBeVisible) {
            this.gameArea.hidden = false;
            this.gameArea.focus();
        } else {
            this.gameArea.hidden = true;
        }
    }
    render(): React.ReactNode {
        return (
            <div>
                <p>{this.state.fps} FPS</p>
                {this.state.currentGui}
            </div>
        );
    }
    private update(): void {
        if (this.stack.length > 0) {
            let currentState = this.stack[this.stack.length - 1];
            const { gui } = currentState;
            this.setState({ currentGui: gui });
            this.updateGameArea(!gui);
        }
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
        this.update();
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
        this.update();
        return result;
    }
    popStatesUntil<T extends State>(subtype?: new () => T): State | undefined {
        let result: State | undefined;
        while (this.stack.length > 0) {
            result = this.stack[this.stack.length - 1];
            result.onPop();
            this.stack.pop();
            if (subtype && result instanceof subtype) {
                break;
            }
        }
        if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].onUncover();
        }
        this.update();
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
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.frameCount++;
        if (deltaTime >= 1000) {
            // Update FPS every second
            const fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.lastFrameTime = currentTime;
            this.frameCount = 0;
            this.setState({ fps: fps });
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    private addEvent(event: KeyboardEvent): void {
        this.events.push(event);
    }
    private subscribeToEvents(): void {
        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                this.stack.length > 0 &&
                !event.repeat
            ) {
                const state = this.stack[this.stack.length - 1];
                state.onEscape();
            }
        });
        const eventHandler = this.addEvent.bind(this);
        this.gameArea.onkeydown = eventHandler;
        this.gameArea.onkeyup = eventHandler;
    }
}
