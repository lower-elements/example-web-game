import AudioSource from "./audio_source";

export default class SoundEmitter {
    protected audioContext: AudioContext;
    private gainNode: GainNode;
    private pannerNode: PannerNode;
    private isRewired: boolean = false;
    private animatePanning: boolean;
    private panningAnimationDuration = 0.02;

    constructor(
        audioContext: AudioContext,
        x: number = 0,
        y: number = 0,
        z: number = 0,
        hrtf: boolean = true,
        animatePanning: boolean = true
    ) {
        this.audioContext = audioContext;
        this.gainNode = this.audioContext.createGain();
        this.pannerNode = this.audioContext.createPanner();
        this.pannerNode.panningModel = hrtf ? "HRTF" : "equalpower";
        this.pannerNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.pannerNode.positionX.value = x;
        this.pannerNode.positionY.value = y;
        this.pannerNode.positionZ.value = z;
        this.animatePanning = animatePanning;
    }
    rewireOutput(dist: AudioNode | null) {
        this.gainNode.disconnect();
        if (dist === null && this.isRewired) {
            this.gainNode.connect(this.audioContext.destination);
            this.isRewired = false;
        } else if (dist) {
            this.gainNode.connect(dist);
            this.isRewired = true;
        }
    }
    get x(): number {
        return this.pannerNode.positionX.value;
    }
    get y(): number {
        return this.pannerNode.positionY.value;
    }
    get z(): number {
        return this.pannerNode.positionZ.value;
    }
    set x(value: number) {
        if (this.animatePanning) {
            this.pannerNode.positionX.linearRampToValueAtTime(
                value,
                this.audioContext.currentTime + this.panningAnimationDuration
            );
        } else this.pannerNode.positionX.value = value;
    }
    set y(value: number) {
        if (this.animatePanning) {
            this.pannerNode.positionY.linearRampToValueAtTime(
                value,
                this.audioContext.currentTime + this.panningAnimationDuration
            );
        } else this.pannerNode.positionY.value = value;
    }
    set z(value: number) {
        if (this.animatePanning) {
            this.pannerNode.positionZ.linearRampToValueAtTime(
                value,
                this.audioContext.currentTime + this.panningAnimationDuration
            );
        } else this.pannerNode.positionZ.value = value;
    }
    attachSound(sound: AudioSource): void {
        sound.connect(this.pannerNode);
    }
    playSound(path: string, looping: boolean = false): AudioSource {
        let source = new AudioSource(this.audioContext, path, looping, false);
        this.attachSound(source);
        source.play();
        return source;
    }
}
