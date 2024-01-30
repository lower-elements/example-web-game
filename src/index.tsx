import speak from "./speech";
import Game from "./game";
import Menu, { MenuItem } from "./states/menu";
import ReactDOM from "react-dom";
import React, { useRef, useEffect } from "react";

function initialize() {
    let div = document.getElementById("game") as HTMLDivElement;
    div.style.display = "block";
    div.focus();
    document.getElementById("test")!.style.display = "none";
    const game = (
        <Game
            gameArea={document.getElementById("game-area") as HTMLDivElement}
        />
    );
    ReactDOM.render(game, div);
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("test")!.onclick = initialize;
});
