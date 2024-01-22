import Game from "./game";
import Gameplay from "./states/gameplay";
import LoginState from "./states/login";
import Menu from "./states/menu";

export function replaceWithMainMenu(game: Game) {
    const menu = new Menu(game, "main menu");
    menu.setItems([
        {
            label: "play",
            callback(game) {
                game.replaceState(new Gameplay(game));
            },
        },
        {
            label: "Create a new account",
            callback(game, menu) {
                game.pushState(
                    new LoginState(game, async (_, info) => {
                        const result = await fetch("/signup", {
                            method: "post",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(info),
                        });
                        if (result.ok) {
                            alert("Account created successfully.");
                            game.popState();
                        } else {
                            const response = await result.json();
                            alert(`error: ${response.message}`);
                        }
                    })
                );
            },
        },
    ]);
    game.replaceState(menu);
}
