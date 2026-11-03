// Haptic feedback utility using navigator.vibrate
export function triggerHaptic(pattern: number | number[] = 50, enabled: boolean = true) {
  if (!enabled) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }
}
