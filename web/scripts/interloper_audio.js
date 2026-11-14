
const AUDIO_EFFECTS = {
    underwater: true,
    forestEcho: true,
    drunk: false
};

const AUDIO_SPATIAL = {
    x: 0.25,
    y: 0,
    z: -1.5
};

class AudioEffects {
    constructor() {
        this.context = new AudioContext();

        this.videoGraphs = new Map();
    }

    createStage(buildEffect) {
        const context = this.context;

        const input = context.createGain();
        const output = context.createGain();

        const stage = buildEffect(context, input, output);

        return {
            input,
            output,

            setEnabled(enabled) {
                stage.setEnabled(enabled);
            }
        };
    }

    createUnderwater() {
        return this.createStage((context, input, output) => {
            const dry = context.createGain();
            const wet = context.createGain();

            const lowpass = context.createBiquadFilter();

            lowpass.type = "lowpass";
            lowpass.frequency.value = 550;
            lowpass.Q.value = 0.8;

            input.connect(dry);
            dry.connect(output);

            input.connect(lowpass);
            lowpass.connect(wet);
            wet.connect(output);

            return {
                setEnabled(enabled) {
                    dry.gain.value = enabled ? 0 : 1;
                    wet.gain.value = enabled ? 1 : 0;
                }
            };
        });
    }

    createForestEcho() {
        return this.createStage((context, input, output) => {
            const dry = context.createGain();
            const wet1 = context.createGain();
            const wet2 = context.createGain();

            const delay1 = context.createDelay(1);
            const delay2 = context.createDelay(1);

            const feedback1 = context.createGain();
            const feedback2 = context.createGain();

            const damping1 = context.createBiquadFilter();
            const damping2 = context.createBiquadFilter();

            delay1.delayTime.value = 0.08;
            delay2.delayTime.value = 0.16;

            feedback1.gain.value = 0.20;
            feedback2.gain.value = 0.12;

            damping1.type = "lowpass";
            damping2.type = "lowpass";

            damping1.frequency.value = 2400;
            damping2.frequency.value = 1700;

            wet1.gain.value = 0.16;
            wet2.gain.value = 0.10;

            // Dry signal.
            input.connect(dry);
            dry.connect(output);

            // First echo.
            input.connect(delay1);
            delay1.connect(damping1);
            damping1.connect(wet1);
            wet1.connect(output);

            damping1.connect(feedback1);
            feedback1.connect(delay1);

            // Second echo.
            input.connect(delay2);
            delay2.connect(damping2);
            damping2.connect(wet2);
            wet2.connect(output);

            damping2.connect(feedback2);
            feedback2.connect(delay2);

            return {
                setEnabled(enabled) {
                    dry.gain.value = enabled ? 0.85 : 1;
                    wet1.gain.value = enabled ? 0.16 : 0;
                    wet2.gain.value = enabled ? 0.10 : 0;
                }
            };
        });
    }

    createDrunkEffect() {
        return this.createStage((context, input, output) => {
            const dry = context.createGain();
            const wet = context.createGain();

            const bandpass = context.createBiquadFilter();
            const distortion = context.createWaveShaper();
            const tremolo = context.createGain();

            const oscillator = context.createOscillator();
            const modulation = context.createGain();

            // Narrow, moving frequency band.
            bandpass.type = "bandpass";
            bandpass.frequency.value = 900;
            bandpass.Q.value = 5;

            // Heavy distortion.
            const curve = new Float32Array(4096);

            for (let i = 0; i < curve.length; i++) {
                const x = (i * 2) / (curve.length - 1) - 1;

                curve[i] = Math.tanh(x * 8);
            }

            distortion.curve = curve;
            distortion.oversample = "4x";

            // Amplitude modulation.
            tremolo.gain.value = 0.55;

            oscillator.type = "sine";
            oscillator.frequency.value = 5.5;

            modulation.gain.value = 0.45;

            oscillator.connect(modulation);
            modulation.connect(tremolo.gain);

            oscillator.start();

            // Effect chain.
            input.connect(dry);
            dry.connect(output);

            input.connect(bandpass);
            bandpass.connect(distortion);
            distortion.connect(tremolo);
            tremolo.connect(wet);
            wet.connect(output);

            return {
                setEnabled(enabled) {
                    dry.gain.value = enabled ? 0 : 1;
                    wet.gain.value = enabled ? 1 : 0;
                }
            };
        });
    }

    createVideoGraph(video) {
        const context = this.context;

        // Original video audio source.
        const source = context.createMediaElementSource(video);

        // Force stereo -> mono conversion.
        const mono = context.createGain();

        mono.channelCount = 1;
        mono.channelCountMode = "explicit";
        mono.channelInterpretation = "speakers";

        // Recreate stereo with 3D positioning.
        const spatial = context.createPanner();

        spatial.panningModel = "HRTF";
        spatial.distanceModel = "inverse";

        spatial.refDistance = 1;
        spatial.maxDistance = 10000;
        spatial.rolloffFactor = 0;

        if (spatial.positionX) {
            spatial.positionX.value = AUDIO_SPATIAL.x;
            spatial.positionY.value = AUDIO_SPATIAL.y;
            spatial.positionZ.value = AUDIO_SPATIAL.z;
        } else {
            spatial.setPosition(
                AUDIO_SPATIAL.x,
                AUDIO_SPATIAL.y,
                AUDIO_SPATIAL.z
            );
        }

        // Create effect stages.
        const underwater = this.createUnderwater();
        const forestEcho = this.createForestEcho();
        const drunk = this.createDrunkEffect();

        // Connect the complete audio chain.
        source.connect(mono);
        mono.connect(spatial);

        spatial.connect(underwater.input);
        underwater.output.connect(forestEcho.input);

        forestEcho.output.connect(drunk.input);
        drunk.output.connect(context.destination);

        // Initial configuration.
        underwater.setEnabled(AUDIO_EFFECTS.underwater);
        forestEcho.setEnabled(AUDIO_EFFECTS.forestEcho);
        drunk.setEnabled(AUDIO_EFFECTS.drunk);

        this.videoGraphs.set(video, {
            underwater,
            forestEcho,
            drunk
        });
    }

    initialize() {
        document.querySelectorAll("video").forEach(video => {
            this.createVideoGraph(video);
        });
    }

    async activate() {
        // Resume Web Audio after the user's interaction.
        const resumePromise = this.context.resume();

        // Enable audio on all video elements.
        const playPromises = [];

        for (const video of document.querySelectorAll("video")) {
            video.muted = false;
            video.volume = 1;

            playPromises.push(
                video.play().catch(error => {
                    console.warn("Video playback error:", error);
                })
            );
        }

        await resumePromise;
        await Promise.all(playPromises);
    }

    setEffect(effect, enabled) {
        if (!(effect in AUDIO_EFFECTS)) {
            throw new Error(`Unknown audio effect: ${effect}`);
        }

        AUDIO_EFFECTS[effect] = enabled;

        for (const graph of this.videoGraphs.values()) {
            graph[effect].setEnabled(enabled);
        }
    }
}

window.audioEffects = new AudioEffects();
window.audioEffects.initialize();
