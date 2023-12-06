let ac, samples;

async function fetchSample(filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ac.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

export async function initSfx() {
    if (ac) return;
    ac = new AudioContext();

    const nameUrlMap = {
        boardStart:        '/sfx/board-start.mp3',        // START/RESET
        dragSlide:         '/sfx/drag-slide.mp3',         // CRAPPY (REGULAR MOVE)
        move:              '/sfx/move.mp3',               // CAPTURE
        notificationSound: '/sfx/notification-sound.mp3', // CHECK
        wrongAnswer:       '/sfx/wrong-answer.mp3',       // CHECK?
        fanfareTrumpets:   '/sfx/fanfare-trumpets.mp3',   // CHECK MATE
    };

    samples = {};
    for (const [name, url] of Object.entries(nameUrlMap)) {
        try {
            const sample = await fetchSample(url);
            samples[name] = sample;
            // console.log(`loaded ${name} with ${url} (${sample.duration.toFixed(2)} s)`);
        } catch (err) {
            console.error(`error loading ${name} with ${url}`);
        }
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
export function playSample(name, volume = 1) {
    // console.log(`play ${name}`);
    if (!ac || !samples) return;
    
    const audioBuffer = samples[name];
    if (!audioBuffer) return;

    const gainNode = ac.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ac.destination);

    const sampleSource = new AudioBufferSourceNode(ac, {
        buffer: audioBuffer,
        playbackRate: 1,
    });

    sampleSource.connect(gainNode);
    sampleSource.start(0);
}
