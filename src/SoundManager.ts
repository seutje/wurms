export class SoundManager {
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};
  private unlocked = false;

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

  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public createTone(name: string, frequency: number, duration: number) {
    this.sounds[name] = this.createToneBuffer(frequency, duration);
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
      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    }
  }
}
