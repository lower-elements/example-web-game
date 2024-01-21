import React from "react";
import Game from "../game";
import LoginForm, { LoginInfo } from "../gui/login";
import State from "./state";
type onSubmitCallback = (game: Game, info: LoginInfo) => void;
/**
 * Represents a state who's job is to collect user account information, passing that into a callback.
 */
export default class LoginState extends State {
    private onSubmit: onSubmitCallback;
    constructor(game: Game, onSubmit: onSubmitCallback) {
        super(game);
        this.onSubmit = onSubmit;
        this.setupGui();
    }
    update(delta: number, events: UIEvent[]): void {
        for (event of events) {
            if (
                event instanceof KeyboardEvent &&
                event.type === "keydown" &&
                event.code === "Escape"
            ) {
                this.game.popState();
            }
        }
    }
    private setupGui(): void {
        this.gui = (
            <LoginForm
                onSubmit={(info) => {
                    this.onSubmit(this.game, info);
                }}
            />
        );
    }
}
