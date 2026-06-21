/**
 * System-wide Voice customization and synthesis controller.
 * Standardizes browser TTS properties, pitch, speed, and cancels previous utterances correctly on navigation/clicks.
 */
export class VoiceSystem {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Checks if critical speech synthesis functionality exists.
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Speak out custom dialogue text lines using browser SpeechSynthesis configuration parameters.
   */
  public static speak(
    text: string, 
    options?: {
      pitch?: number;
      rate?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (!this.isSupported()) {
      options?.onError?.();
      return;
    }

    try {
      this.cancel();

      // Create stable utterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;

      // Extract details from persistent storage or default configurations
      const storedVoiceURI = options?.voiceURI || localStorage.getItem('selected_voice_uri') || null;
      const storedPitch = options?.pitch ?? parseFloat(localStorage.getItem('selected_pitch') || '1');
      const storedRate = options?.rate ?? parseFloat(localStorage.getItem('selected_rate') || '1.05');

      utterance.pitch = storedPitch;
      utterance.rate = storedRate;

      if (storedVoiceURI) {
        const allVoices = window.speechSynthesis.getVoices();
        const matchedVoice = allVoices.find((v) => v.voiceURI === storedVoiceURI);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      // Hook callback handlers
      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        options?.onError?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('[Voice System] Vocalization play failed safely:', error);
      options?.onError?.();
    }
  }

  /**
   * Instantly stops any spoken voice outputs.
   */
  public static cancel(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
        this.activeUtterance = null;
      } catch (error) {
        console.warn('[Voice System] Cancellation failed:', error);
      }
    }
  }

  /**
   * Get all registered system voices available inside user's client environment.
   */
  public static getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }
}
