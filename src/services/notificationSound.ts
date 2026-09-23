import Sound from 'react-native-sound';

let chime: Sound | null = null;
let loading = false;

/**
 * Bundled buzzer file shared by every Agency incident alert.
 * To swap the buzzer sound later, replace this one filename only —
 * the file must exist in android/app/src/main/res/raw/ and the iOS bundle.
 */
export const INCIDENT_BUZZER_FILE = 'notification_chime.mp3';

const BURST_COUNT = 3;
const BURST_GAP_MS = 900;

/** Plays the packaged notification chime without interrupting the device's audio. */
export const playNotificationChime = () => {
  if (chime?.isLoaded()) {
    chime.stop(() => chime?.play());
    return;
  }
  if (loading) return;
  loading = true;
  Sound.setCategory('Ambient', true);
  const loadedChime = new Sound(
    INCIDENT_BUZZER_FILE,
    Sound.MAIN_BUNDLE,
    error => {
      loading = false;
      if (error) {
        loadedChime.release();
        return;
      }
      chime = loadedChime;
      chime.play();
    },
  );
};

/** Agency incident buzzer: plays the bundled file BURST_COUNT times in a row. */
export const playIncidentBuzzer = () => {
  const playBurst = (remaining: number) => {
    if (remaining <= 0) return;
    playNotificationChime();
    if (remaining > 1) {
      setTimeout(() => playBurst(remaining - 1), BURST_GAP_MS);
    }
  };
  playBurst(BURST_COUNT);
};
