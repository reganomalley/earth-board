/**
 * Simple sound effects using Web Audio API
 */

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Check localStorage for saved preference
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedPref = localStorage.getItem('earthboard_sound_enabled');
      this.enabled = savedPref !== 'false'; // Default to true
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play a subtle "pop" sound when placing objects
   */
  playPop() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  /**
   * Play a soft "whoosh" for drawing strokes
   */
  playWhoosh() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('earthboard_sound_enabled', String(this.enabled));
    return this.enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set sound enabled state
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('earthboard_sound_enabled', String(enabled));
  }
}

// Singleton instance
export const soundSystem = new SoundSystem();
