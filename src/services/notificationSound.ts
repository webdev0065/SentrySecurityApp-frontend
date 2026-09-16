import Sound from 'react-native-sound';

let chime: Sound | null = null;
let loading = false;

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
    'notification_chime.mp3',
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
