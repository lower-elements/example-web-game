import { Component, ReactElement, ReactNode } from "react";
import speak from "./speech";
import Gameplay from "./states/gameplay";
import Menu from "./states/menu";
import State from "./states/state";
import React from "react";
import LoginState from "./states/login";
import { replaceWithMainMenu } from "./menus";
interface GameProps {
    gameContainer: HTMLDivElement;
}
interface GameState {
    fps: number;
    currentGui: ReactNode | null;
}
export default class Game extends Component<GameProps, GameState> {
    static noState = null;
    audioContext: AudioContext;
    private events: UIEvent[] = [];
    private stack: State[] = [];
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    state: GameState = { currentGui: Game.noState, fps: 0 };
    gameContainer: HTMLDivElement;
    constructor(props: GameProps) {
        super(props);
        this.gameContainer = props.gameContainer;
        this.audioContext = new AudioContext();
        this.subscribeToEvents();
        this.setListenerOrientation(0);
        replaceWithMainMenu(this);
        this.gameLoop();
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
            if (!gui) {
                this.props.gameContainer.focus();
            }
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
    private addEvent(event: UIEvent): void {
        this.events.push(event);
        event.stopPropagation();
    }
    private subscribeToEvents() {
        const eventHandler = this.addEvent.bind(this);
        this.gameContainer.onkeydown = eventHandler;
        this.gameContainer.onkeyup = eventHandler;
    }
    private unsubscribeFromEvents() {
        this.gameContainer.onkeydown = null;
        this.gameContainer.onkeyup = null;
    }
}
