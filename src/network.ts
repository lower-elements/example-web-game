import EventHandler from "./event_handler";
import Gameplay from "./states/gameplay";

/**
 * Represents the json events the client and server exchange.
 */
interface Event {
    event: string;
    data: Object;
}
type networkStatusCallback = ((client: Client) => void) | null;

export default class Client {
    private ws: WebSocket;
    private eventHandler: EventHandler;
    constructor(
        gameplay: Gameplay,
        {
            url,
            onOpen = null,
            onClose = null,
            onError = null,
        }: {
            url: string;
            onOpen?: networkStatusCallback;
            onClose?: networkStatusCallback;
            onError?: networkStatusCallback;
        }
    ) {
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";
        if (onOpen) {
            this.ws.onopen = () => onOpen(this);
        }
        this.eventHandler = new EventHandler(gameplay, this);
        this.ws.onmessage = (evt) => {
            this.handleMessage(evt.data);
        };
        if (onClose) {
            this.ws.onclose = () => onClose(this);
        }
        if (onError) {
            this.ws.onerror = () => onError(this);
        }
    }
    sendEvent(event: string, data: Object) {
        this.ws.send(JSON.stringify({ event: event, data: data }));
    }
    sendBinary(data: ArrayBufferLike | Blob | ArrayBufferView) {
        this.ws.send(data);
    }
    private handleMessage(message: string | ArrayBuffer): void {
        const isBinary = message instanceof ArrayBuffer;
        if (!isBinary) {
            let data: Event = JSON.parse(message.toString());
            this.eventHandler.triggerEvent(data.event, data.data);
        } else {
        }
    }
    close(): void {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.onopen = null;
        this.ws.close();
    }
}
