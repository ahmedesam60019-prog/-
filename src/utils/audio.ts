// Pure Web Audio API Ambient Sound Generator and Focus Chime
// Does not rely on external audio files that could fail or be blocked.

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientNodes: Map<
    string,
    {
      gainNode: GainNode;
      sources: (AudioNode | number)[];
      cleanup: () => void;
    }
  > = new Map();

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play gentle completion bell chime
  public playChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Harmonic chords (E major pentatonic for pleasant relaxation)
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.9);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Start ambient sound
  public startAmbient(type: 'rain' | 'waves' | 'whitenoise' | 'binaural', volume = 0.5) {
    this.stopAmbient(type);
    try {
      const ctx = this.getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'whitenoise') {
        // Pink/Brownish noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        this.ambientNodes.set(type, {
          gainNode: masterGain,
          sources: [whiteNoise, filter],
          cleanup: () => {
            try {
              whiteNoise.stop();
              whiteNoise.disconnect();
              filter.disconnect();
            } catch (_) {}
          },
        });
      } else if (type === 'rain') {
        // Gentle Rain simulation
        const bufferSize = ctx.sampleRate * 3;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.setValueAtTime(1000, ctx.currentTime);
        rainFilter.Q.setValueAtTime(0.6, ctx.currentTime);

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(300, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(highpass);
        highpass.connect(masterGain);
        rainSource.start();

        this.ambientNodes.set(type, {
          gainNode: masterGain,
          sources: [rainSource, rainFilter, highpass],
          cleanup: () => {
            try {
              rainSource.stop();
              rainSource.disconnect();
              rainFilter.disconnect();
              highpass.disconnect();
            } catch (_) {}
          },
        });
      } else if (type === 'waves') {
        // Ocean swell waves
        const bufferSize = ctx.sampleRate * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.25;
        }

        const waveSource = ctx.createBufferSource();
        waveSource.buffer = noiseBuffer;
        waveSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        // LFO for wave swelling
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec swell
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        waveSource.connect(filter);
        filter.connect(masterGain);

        waveSource.start();
        lfo.start();

        this.ambientNodes.set(type, {
          gainNode: masterGain,
          sources: [waveSource, filter, lfo, lfoGain],
          cleanup: () => {
            try {
              waveSource.stop();
              lfo.stop();
              waveSource.disconnect();
              filter.disconnect();
              lfo.disconnect();
            } catch (_) {}
          },
        });
      } else if (type === 'binaural') {
        // 40Hz Gamma Focus Beats (200Hz Left, 240Hz Right)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);

        oscL.connect(merger, 0, 0); // left channel
        oscR.connect(merger, 0, 1); // right channel

        const softFilter = ctx.createGain();
        softFilter.gain.setValueAtTime(0.35, ctx.currentTime);

        merger.connect(softFilter);
        softFilter.connect(masterGain);

        oscL.start();
        oscR.start();

        this.ambientNodes.set(type, {
          gainNode: masterGain,
          sources: [oscL, oscR, merger, softFilter],
          cleanup: () => {
            try {
              oscL.stop();
              oscR.stop();
              oscL.disconnect();
              oscR.disconnect();
              merger.disconnect();
            } catch (_) {}
          },
        });
      }
    } catch (e) {
      console.warn('Error starting ambient sound:', e);
    }
  }

  // Update volume for active ambient sound
  public setVolume(type: string, volume: number) {
    const node = this.ambientNodes.get(type);
    if (node && this.ctx) {
      node.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  // Stop ambient sound
  public stopAmbient(type: string) {
    const node = this.ambientNodes.get(type);
    if (node) {
      node.cleanup();
      try {
        node.gainNode.disconnect();
      } catch (_) {}
      this.ambientNodes.delete(type);
    }
  }

  public stopAll() {
    this.ambientNodes.forEach((node) => {
      node.cleanup();
      try {
        node.gainNode.disconnect();
      } catch (_) {}
    });
    this.ambientNodes.clear();
  }

  public isPlaying(type: string): boolean {
    return this.ambientNodes.has(type);
  }
}

export const soundManager = new SoundManager();
