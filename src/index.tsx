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
    let content= document.getElementById("content") as HTMLDivElement;
    const game = <Game gameContainer={div} />;
    ReactDOM.render(game, content);
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("test")!.onclick = initialize;
});
