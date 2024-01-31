import getBuffer from "./audio_buffers";
export default async function createOneShotSound(
    context: AudioContext,
    path: string,
    shouldAutoPlay: boolean = false
) {
    const buffer = await getBuffer(context, path);
    const source = context.createBufferSource();
    source.buffer = buffer;
    if (shouldAutoPlay) {
        source.connect(context.destination);
        source.start();
    }
    return source;
}
