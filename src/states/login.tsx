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
    private askForUsername: boolean = true;
    constructor(
        game: Game,
        onSubmit: onSubmitCallback,
        askForUsername: boolean = true
    ) {
        super(game);
        this.onSubmit = onSubmit;
        this.askForUsername = askForUsername;
        this.setupGui();
    }
    onEscape(): void {
        this.game.popState();
    }
    private setupGui(): void {
        this.gui = (
            <LoginForm
                askForUsername={this.askForUsername}
                onSubmit={(info) => {
                    this.onSubmit(this.game, info);
                }}
            />
        );
    }
}
