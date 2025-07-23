export class SoundManager {
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public async loadSound(name: string, url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.sounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  public playSound(name: string, volume: number = 1) {
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
