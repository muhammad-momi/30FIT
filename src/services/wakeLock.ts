// Screen Wake Lock API service to keep screen on during active workouts
class WakeLockService {
  private sentinel: WakeLockSentinel | null = null;
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.sentinel) {
      this.release();
    }
  }

  public async request(): Promise<boolean> {
    if (!this.isEnabled) return false;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch {
      this.sentinel = null;
      return false;
    }
  }

  public release() {
    if (this.sentinel) {
      this.sentinel.release().catch(() => {});
      this.sentinel = null;
    }
  }
}

export const wakeLockService = new WakeLockService();
