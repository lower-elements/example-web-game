import React from "react";
import Game from "../game";
import PeopleList, { Person } from "../gui/peopleList";
import State from "./state";

export default class ServerInfo extends State {
    private people: Person[];
    constructor(game: Game, people: Person[]) {
        super(game);
        this.people = people;
        this.gui = (
            <div role="application" autoFocus aria-label="Server information">
                <PeopleList people={people} AutoFocus />
            </div>
        );
    }
    onEscape(): void {
        this.game.popState();
    }
}
