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

  public async loadSound(name: string, url: string) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.sounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name} from ${url}`, error);
    }
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
