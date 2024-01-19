let speech_normal: HTMLElement | null;
let speech_interupt: HTMLElement | null;
let counter: number = 0;
document.addEventListener("DOMContentLoaded", function () {
    speech_normal = document.getElementById("speech_normal");
    speech_interupt = document.getElementById("speech_interupt");
});
export default function speak(text: string, interupt: boolean = true) {
    let textElement = document.createElement("span");
    textElement.id = (++counter).toString();
    textElement.innerText = text;
    let containingElement = interupt ? speech_interupt : speech_normal;
    containingElement?.appendChild(textElement);
    if (
        containingElement!.children.length >= 2 &&
        containingElement!.firstChild
    ) {
        containingElement!.removeChild(containingElement!.firstChild);
    }
}
