const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {};
const volumeNodes = {};

let masterVolume = 1;
let soundsVolume = 0.5;
let musicVolume = 0.5;

const getMitiByKey = key => {
    if(key === 'music:track1') return 0.075;
    // if(key === 'music:track5') return 0.3;
    // if(key === 'music:track4') return 0.2;
    return 0.15;
}

export const setMasterVolume = ({ master, sounds, music }) => {
    masterVolume = master;
    soundsVolume = sounds;
    musicVolume = music;

    for (const key in volumeNodes) {
        const node = volumeNodes[key];
        if (key.startsWith('music:')) {
            node.gain.value = master * music * getMitiByKey(key);
        } else {
            node.gain.value = master * sounds;
        }
    }
};

export const loadSounds = async (soundMap) => {
    const entries = await Promise.all(
        Object.entries(soundMap).map(async ([key, url]) => {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const gainNode = audioContext.createGain();
            gainNode.gain.value = key.startsWith('music:')
                ? masterVolume * musicVolume * getMitiByKey(key)
                : masterVolume * soundsVolume;
            gainNode.connect(audioContext.destination);
            volumeNodes[key] = gainNode;

            return [key, audioBuffer];
        })
    );
    entries.forEach(([key, buffer]) => {
        sounds[key] = buffer;
    });
    return sounds;
};

const lastPlayedTimestamps = {};
const COOLDOWN_MS = 2000; // 2 секунди

export const playSound = (key) => {
    const now = Date.now();

    // Якщо останній запуск був менше ніж 2 секунди тому — не граємо
    if (lastPlayedTimestamps[key] && now - lastPlayedTimestamps[key] < COOLDOWN_MS) {
        return;
    }

    // Зберігаємо час запуску
    lastPlayedTimestamps[key] = now;

    const buffer = sounds[key];
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(volumeNodes[key]);
    source.start(0);
};

let currentMusicSource = null;

export const playMusic = (key) => {
    if (!sounds[key]) return;
    if (currentMusicSource) currentMusicSource.stop();

    const source = audioContext.createBufferSource();
    source.buffer = sounds[key];
    source.loop = false; // ми самі вручну переключаємо

    source.connect(volumeNodes[key]);
    source.start(0);
    currentMusicSource = source;

    return source;
};

export const resumeAudioContext = () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
};