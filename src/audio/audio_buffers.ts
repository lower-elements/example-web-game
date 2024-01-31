let globalBuffers: Record<string, AudioBuffer> = {};
export default async function getBuffer(
    context: AudioContext,
    path: string,
    useCache: boolean = true
): Promise<AudioBuffer> {
    if (useCache && path in globalBuffers) {
        return globalBuffers[path];
    }
    const request = await fetch(`sounds/${path}`);
    const buffer = await context.decodeAudioData(await request.arrayBuffer());
    if (useCache) {
        globalBuffers[path] = buffer;
    }
    return buffer;
}
