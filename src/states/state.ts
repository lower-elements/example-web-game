import Game from "../game";
export default interface State {
    initialize(): void;
    onPush(): void;
    onCover(): void;
    onUncover(): void;
    onPop(): void;
    update(delta: number, events: UIEvent[]): void;
}
