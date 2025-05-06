// SoundContext.jsx
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import WorkerContext from "../worker-context";

import {loadSounds, playSound, setMasterVolume as applyToAudioContext} from './sound-manager';
import {useWorkerClient} from "../../general/client";
import { playMusic } from './sound-manager';

const tracks = ['music:track3', 'music:track1', 'music:track2'];

const SoundContext = createContext();

const defaultVolumes = {
    master: 0.5,
    sounds: 0.5,
    music: 0.1,
};

export const SoundProvider = ({ children }) => {
    const [volumes, setVolumes] = useState(defaultVolumes);
    const worker = useContext(WorkerContext);
    const { sendData, onMessage } = useWorkerClient(worker);
    const currentMusicIndexRef = useRef(0);
    const currentSourceRef = useRef(null);
    const [soundsLoaded, setSoundsLoaded] = useState(false);


    useEffect(() => {
        console.log('soundsLoaded: ', soundsLoaded);
        if (!tracks.length || !soundsLoaded) return;

        const startTrack = (index) => {
            const source = playMusic(tracks[index]);
            if (source) {
                source.onended = () => {
                    const next = (index + 1) % tracks.length;
                    currentMusicIndexRef.current = next;
                    startTrack(next);
                };
                currentSourceRef.current = source;
            }
        };

        startTrack(currentMusicIndexRef.current);

        console.log('Starting: ', currentMusicIndexRef.current, currentSourceRef.current);

        return () => {
            if (currentSourceRef.current) {
                currentSourceRef.current.onended = null;
                currentSourceRef.current.stop();
            }
        };
    }, [soundsLoaded]);

    useEffect(() => {
        // console.log('Vols: ', volumes);
        applyToAudioContext(volumes); // оновлює всі volumeNodes, в т.ч. music
    }, [volumes.music, volumes.master, volumes.sounds]);


    useEffect(() => {

        loadSounds({
            action_levelup: 'sounds/action_levelup.wav',
            selection: 'sounds/selection_v2.wav',
            hero_levelup: 'sounds/hero_levelup_v2.wav',
            purchase: 'sounds/purchase_v2.wav',
            cast_spell: 'sounds/cast_spell.wav',
            click: 'sounds/click.wav',
            'music:track1': 'music/idle_awakening_main_theme_01.ogg',
            'music:track2': 'music/idle_awakening_main_theme_02.ogg',
            'music:track3': 'music/idle_awakening_main_theme_03.ogg',
        }).then(() => setSoundsLoaded(true));
    }, []);

    const initializeVolumes = () => {
        console.log('INITIALIZING SOUNDS VOLUMES');
        sendData('query-settings', { prefix: 'sounds' });
    };

    onMessage('settings-sounds', (data) => {
        const sounds = {};
        ['master', 'sounds', 'music'].forEach((key) => {
            const keyInPr = `${key}Volume`;
            if(keyInPr in data) {
                sounds[key] = +data[keyInPr];
            } else {
                sounds[key] = (key === 'music') ? 0.2 : 0.4;
                sendData('set-setting', { key: keyInPr, value: sounds[key] });
            }
        });

        console.log('soundsWhereSetTo: ', sounds);

        setVolumes((prev) => {
            const newState = { ...prev, ...sounds };
            applyToAudioContext(newState);
            return newState;
        });
    });

    onMessage('play-sound', ({ key }) => {
        playSound(key);
    });

    const setVolume = (type, value) => {
        setVolumes((prev) => {
            const newState = { ...prev, [type]: value };
            applyToAudioContext(newState);
            return newState;
        });
        console.log('Send: ', { key: `${type}Volume`, value })
        sendData('set-setting', { key: `${type}Volume`, value });
        // localStorage.setItem(`${type}Volume`, value);
    };

    return (
        <SoundContext.Provider value={{ volumes, setVolume, initializeVolumes }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
