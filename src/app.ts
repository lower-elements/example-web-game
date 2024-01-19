import speak from "./speech";
import Game from "./game";
import Menu, { MenuItem } from "./states/menu";
function initialize() {
    let div = document.getElementById("game") as HTMLDivElement;
    div.style.display = "block";
    div.focus();
    document.getElementById("test")!.style.display = "none";
    const game = new Game(div);
    game.replaceWithMainMenu();
    game.gameLoop();
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("test")!.onclick = initialize;
});
