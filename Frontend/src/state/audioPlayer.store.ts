// src/stores/audioPlayer.store.ts
import { proxy, subscribe } from 'valtio';
import { SamplesFromPackDTO } from '../types';

interface AudioPlayerState {
  currentSample: SamplesFromPackDTO | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}


// Create the store
export const audioPlayerStore = proxy<AudioPlayerState>({
  currentSample: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
});

// Audio element instance (singleton)
let audioElement: HTMLAudioElement | null = null;
let previousVolume = 1;

// Initialize audio element
const getAudioElement = (): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
    
    // Setup event listeners
    audioElement.addEventListener('timeupdate', () => {
      audioPlayerStore.currentTime = audioElement!.currentTime;
    });
    
    audioElement.addEventListener('durationchange', () => {
      audioPlayerStore.duration = audioElement!.duration;
    });
    
    audioElement.addEventListener('ended', () => {
      audioPlayerStore.isPlaying = false;
      audioPlayerStore.currentTime = 0;
    });
    
    audioElement.addEventListener('play', () => {
      audioPlayerStore.isPlaying = true;
    });
    
    audioElement.addEventListener('pause', () => {
      audioPlayerStore.isPlaying = false;
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      audioPlayerStore.isPlaying = false;
    });
  }
  
  return audioElement;
};

// Actions
export const audioPlayerActions = {
  /**
   * Play a sample
   */
  playSample: (sample: SamplesFromPackDTO) => {
    const audio = getAudioElement();
    
    // If same sample, just toggle play/pause
    if (audioPlayerStore.currentSample?.id === sample.id) {
      if (audioPlayerStore.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      return;
    }
    
    // Load and play new sample
    audio.src = sample.audioUrl;
    audio.volume = audioPlayerStore.volume;
    audio.muted = audioPlayerStore.isMuted;
    audio.playbackRate = audioPlayerStore.playbackRate;
    
    audioPlayerStore.currentSample = sample;
    audioPlayerStore.currentTime = 0;
    
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
      audioPlayerStore.isPlaying = false;
    });
  },

  /**
   * Pause current sample
   */
  pause: () => {
    const audio = getAudioElement();
    if (audioPlayerStore.isPlaying) {
      audio.pause();
    }
  },

  /**
   * Resume current sample
   */
  resume: () => {
    const audio = getAudioElement();
    if (!audioPlayerStore.isPlaying && audioPlayerStore.currentSample) {
      audio.play().catch(console.error);
    }
  },

  /**
   * Stop and reset
   */
  stop: () => {
    const audio = getAudioElement();
    audio.pause();
    audio.currentTime = 0;
    audioPlayerStore.currentTime = 0;
    audioPlayerStore.isPlaying = false;
  },

  /**
   * Seek to specific time
   */
  seek: (time: number) => {
    const audio = getAudioElement();
    audio.currentTime = time;
    audioPlayerStore.currentTime = time;
  },

  /**
   * Set volume
   */
  setVolume: (volume: number) => {
    const audio = getAudioElement();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    audioPlayerStore.volume = clampedVolume;
    audio.volume = clampedVolume;
    
    // Update mute state based on volume
    if (clampedVolume === 0 && !audioPlayerStore.isMuted) {
      audioPlayerStore.isMuted = true;
    } else if (clampedVolume > 0 && audioPlayerStore.isMuted) {
      audioPlayerStore.isMuted = false;
    }
  },

  /**
   * Toggle mute
   */
  toggleMute: () => {
    const audio = getAudioElement();
    
    if (audioPlayerStore.isMuted) {
      // Unmute: restore previous volume
      audio.muted = false;
      audio.volume = previousVolume;
      audioPlayerStore.volume = previousVolume;
      audioPlayerStore.isMuted = false;
    } else {
      // Mute: save current volume
      previousVolume = audioPlayerStore.volume;
      audio.muted = true;
      audioPlayerStore.isMuted = true;
    }
  },

  /**
   * Set playback rate
   */
  setPlaybackRate: (rate: number) => {
    const audio = getAudioElement();
    const clampedRate = Math.max(0.25, Math.min(2, rate));
    
    audioPlayerStore.playbackRate = clampedRate;
    audio.playbackRate = clampedRate;
  },
};

// Utility function to format time
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Subscribe to changes (optional - for debugging or side effects)
if (typeof window !== 'undefined') {
  subscribe(audioPlayerStore, () => {
    // You can add side effects here if needed
    // console.log('Audio player state changed:', audioPlayerStore);
  });
}