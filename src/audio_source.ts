/**
 * Represents an audio source for playing a sound.
 */
export default class AudioSource {
    /**
     * The {mediaElement} used for playback. Useful for controling playback.
     */
    public mediaElement: HTMLAudioElement;
    private source: MediaElementAudioSourceNode;
    private isConnectedToSomething: boolean = false;
    constructor(
        context: AudioContext,
        path: string,
        looping: boolean = false,
        autoConnectToSpeakers: boolean = true
    ) {
        this.mediaElement = new Audio(`sounds/${path}`);
        this.mediaElement.loop = looping;
        this.source = new MediaElementAudioSourceNode(context, {
            mediaElement: this.mediaElement,
        });
        if (autoConnectToSpeakers) {
            this.source.connect(context.destination);
        } else {
            this.isConnectedToSomething = false;
        }
    }
    /**
     * Plays the audio, or if its playing, restart from the start.
     */
    play(): void {
        this.mediaElement.currentTime = 0;
        this.mediaElement.play();
    }
    pause(): void {
        this.mediaElement.pause();
    }
    resume(): void {
        this.mediaElement.play();
    }
    stop(): void {
        this.mediaElement.pause();
        this.mediaElement.currentTime = 0;
    }
    connect(
        dist: AudioNode,
        output: number | undefined = undefined,
        input: number | undefined = undefined
    ): void {
        if (this.isConnectedToSomething) {
            this.disconnect(this.source.context.destination);
            this.isConnectedToSomething = false;
        }
        this.source.connect(dist, output, input);
    }
    disconnect(dist: AudioNode): void {
        this.source.disconnect(dist);
    }
}
