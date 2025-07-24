export class SoundManager {
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};
  private unlocked = false;
  private masterVolume = 0.015;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.addUnlockListeners();
  }

  private addUnlockListeners() {
    const unlock = () => {
      this.audioContext.resume();
      this.unlocked = true;
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  public unlock() {
    if (!this.unlocked) {
      this.audioContext.resume();
      this.unlocked = true;
    }
  }

  private createToneBuffer(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    }
    return buffer;
  }

  private createSquareBuffer(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
      data[i] = value >= 0 ? 1 : -1;
    }
    return buffer;
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 0.5 - 1;
    }
    return buffer;
  }

  public createTone(name: string, frequency: number, duration: number) {
    this.sounds[name] = this.createToneBuffer(frequency, duration);
  }

  public createSquareTone(name: string, frequency: number, duration: number) {
    this.sounds[name] = this.createSquareBuffer(frequency, duration);
  }

  public createNoise(name: string, duration: number) {
    this.sounds[name] = this.createNoiseBuffer(duration);
  }

  public playSound(name: string, volume: number = 1) {
    if (!this.unlocked) return;
    const sound = this.sounds[name];
    if (sound) {
      const source = this.audioContext.createBufferSource();
      source.buffer = sound;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.masterVolume;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    }
  }
}
