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
  error: string | null;
  isLoading: boolean;
  buffering: boolean;
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
  error: null,
  isLoading: false,
  buffering: false,
});

// Audio element instance (singleton)
let audioElement: HTMLAudioElement | null = null;
let previousVolume = 1;

// Audio cache - stores audio blobs with URL as key
const audioCache = new Map<string, { blob: Blob; url: string; timestamp: number }>();
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_SIZE = 100; // Max 100 cached files

// Initialize audio element
const getAudioElement = (): HTMLAudioElement => {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'none'; // We'll handle preloading manually
    
    // Setup event listeners
    audioElement.addEventListener('loadeddata', () => {
      console.log('Audio loaded data');
      audioPlayerStore.buffering = false;
    });
    
    audioElement.addEventListener('canplay', () => {
      console.log('Audio can play');
      audioPlayerStore.buffering = false;
    });
    
    audioElement.addEventListener('canplaythrough', () => {
      console.log('Audio can play through');
      audioPlayerStore.buffering = false;
    });
    
    audioElement.addEventListener('waiting', () => {
      console.log('Audio waiting/buffering');
      audioPlayerStore.buffering = true;
    });
    
    audioElement.addEventListener('playing', () => {
      console.log('Audio playing');
      audioPlayerStore.buffering = false;
    });
    
    audioElement.addEventListener('loadedmetadata', () => {
      console.log('Audio metadata loaded, duration:', audioElement!.duration);
      audioPlayerStore.duration = audioElement!.duration || 0;
      audioPlayerStore.isLoading = false;
    });
    
    audioElement.addEventListener('loadstart', () => {
      console.log('Audio loading started...');
      audioPlayerStore.isLoading = true;
      audioPlayerStore.error = null;
    });
    
    audioElement.addEventListener('timeupdate', () => {
      audioPlayerStore.currentTime = audioElement!.currentTime;
    });
    
    audioElement.addEventListener('ended', () => {
      console.log('Audio playback ended');
      audioPlayerStore.isPlaying = false;
      audioPlayerStore.currentTime = 0;
    });
    
    audioElement.addEventListener('play', () => {
      console.log('Audio playback started');
      audioPlayerStore.isPlaying = true;
      audioPlayerStore.error = null;
    });
    
    audioElement.addEventListener('pause', () => {
      console.log('Audio playback paused');
      audioPlayerStore.isPlaying = false;
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      console.error('Audio error details:', audioElement?.error);
      
      let errorMessage = 'Audio playback error';
      if (audioElement?.error) {
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Playback was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
          default:
            errorMessage = `Audio error (code: ${audioElement.error.code})`;
        }
      }
      
      audioPlayerStore.error = errorMessage;
      audioPlayerStore.isPlaying = false;
      audioPlayerStore.isLoading = false;
      audioPlayerStore.buffering = false;
    });
  }
  
  return audioElement;
};

// Cache management
const cleanupCache = () => {
  const now = Date.now();
  const entries = Array.from(audioCache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_MAX_AGE) {
      URL.revokeObjectURL(value.url);
      audioCache.delete(key);
    }
  });
  
  // If still too large, remove oldest entries
  if (audioCache.size > CACHE_MAX_SIZE) {
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = sorted.slice(0, audioCache.size - CACHE_MAX_SIZE);
    toRemove.forEach(([key]) => {
      URL.revokeObjectURL(audioCache.get(key)!.url);
      audioCache.delete(key);
    });
  }
};

// Get cached audio or fetch and cache it
const getCachedAudio = async (audioUrl: string): Promise<string> => {
  cleanupCache();
  
  // Check cache first
  const cached = audioCache.get(audioUrl);
  if (cached) {
    console.log('Using cached audio:', audioUrl);
    return cached.url;
  }
  
  console.log('Fetching and caching audio:', audioUrl);
  
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl, {
      headers: {
        'Accept': 'audio/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create object URL
    const objectUrl = URL.createObjectURL(blob);
    
    // Cache it
    audioCache.set(audioUrl, {
      blob,
      url: objectUrl,
      timestamp: Date.now()
    });
    
    console.log('Audio cached successfully, cache size:', audioCache.size);
    return objectUrl;
    
  } catch (error) {
    console.error('Error caching audio:', error);
    throw error;
  }
};

// Preload audio for faster playback
const preloadAudio = async (audioUrl: string): Promise<void> => {
  try {
    await getCachedAudio(audioUrl);
    console.log('Audio preloaded:', audioUrl);
  } catch (error) {
    console.error('Error preloading audio:', error);
  }
};

// Preload multiple samples
const preloadSamples = async (samples: SamplesFromPackDTO[]): Promise<void> => {
  console.log('Preloading', samples.length, 'samples...');
  
  // Preload first 3 samples immediately, rest in background
  const immediateSamples = samples.slice(0, 3);
  const backgroundSamples = samples.slice(3);
  
  // Preload immediate samples
  await Promise.allSettled(
    immediateSamples.map(sample => preloadAudio(sample.audioUrl))
  );
  
  // Preload background samples without waiting
  backgroundSamples.forEach(sample => {
    preloadAudio(sample.audioUrl).catch(() => {
      // Silent fail for background preloading
    });
  });
};

// Actions
export const audioPlayerActions = {
  /**
   * Play a sample with caching
   */
  playSample: async (sample: SamplesFromPackDTO) => {
    const audio = getAudioElement();
    
    // Clear previous state
    audioPlayerStore.error = null;
    audioPlayerStore.isLoading = true;
    audioPlayerStore.buffering = false;
    
    console.log('Playing sample with cache:', sample.name);
    
    // If same sample, just toggle play/pause
    if (audioPlayerStore.currentSample?.id === sample.id && audio.src) {
      if (audioPlayerStore.isPlaying) {
        audio.pause();
        audioPlayerStore.isLoading = false;
      } else {
        try {
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          audioPlayerStore.error = `Play failed: ${error}`;
          audioPlayerStore.isPlaying = false;
        } finally {
          audioPlayerStore.isLoading = false;
        }
      }
      return;
    }
    
    // Stop current audio
    audio.pause();
    audio.currentTime = 0;
    
    try {
      // Get cached audio URL
      console.log('Getting cached audio URL...');
      const cachedUrl = await getCachedAudio(sample.audioUrl);
      
      // Reset audio element
      audio.src = '';
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Configure audio
      audio.src = cachedUrl;
      audio.volume = audioPlayerStore.volume;
      audio.muted = audioPlayerStore.isMuted;
      audio.playbackRate = audioPlayerStore.playbackRate;
      audio.preload = 'auto';
      
      audioPlayerStore.currentSample = sample;
      audioPlayerStore.currentTime = 0;
      audioPlayerStore.isLoading = true;
      
      console.log('Starting playback...');
      
      // Play immediately - no waiting for events since it's cached
      await audio.play();
      
      console.log('Playback started successfully');
      audioPlayerStore.isPlaying = true;
      
    } catch (error) {
      console.error('Error playing cached audio:', error);
      audioPlayerStore.error = `Playback failed: ${error}`;
      audioPlayerStore.isPlaying = false;
    } finally {
      audioPlayerStore.isLoading = false;
    }
  },

  /**
   * Fast play - assumes audio is already cached
   */
  playSampleFast: async (sample: SamplesFromPackDTO) => {
    const audio = getAudioElement();
    
    // Stop current audio
    audio.pause();
    audio.currentTime = 0;
    
    try {
      // Try to get from cache first
      const cached = audioCache.get(sample.audioUrl);
      if (!cached) {
        throw new Error('Audio not cached');
      }
      
      // Quick reset
      audio.src = cached.url;
      audio.volume = audioPlayerStore.volume;
      
      audioPlayerStore.currentSample = sample;
      audioPlayerStore.currentTime = 0;
      audioPlayerStore.isLoading = false;
      
      // Play immediately
      await audio.play();
      audioPlayerStore.isPlaying = true;
      
    } catch (error) {
      console.error('Fast play failed, falling back to normal play:', error);
      // Fall back to normal play
      await audioPlayerActions.playSample(sample);
    }
  },

  /**
   * Preload specific samples
   */
  preloadSamples: async (samples: SamplesFromPackDTO[]) => {
    return preloadSamples(samples);
  },

  /**
   * Preload a single sample
   */
  preloadSample: async (sample: SamplesFromPackDTO) => {
    return preloadAudio(sample.audioUrl);
  },

  /**
   * Clear audio cache
   */
  clearCache: () => {
    audioCache.forEach((value) => {
      URL.revokeObjectURL(value.url);
    });
    audioCache.clear();
    console.log('Audio cache cleared');
  },

  /**
   * Get cache info
   */
  getCacheInfo: () => {
    return {
      size: audioCache.size,
      entries: Array.from(audioCache.keys())
    };
  },

  /**
   * Pause current sample
   */
  pause: () => {
    const audio = getAudioElement();
    audio.pause();
  },

  /**
   * Resume current sample
   */
  resume: async () => {
    const audio = getAudioElement();
    if (!audioPlayerStore.isPlaying && audioPlayerStore.currentSample) {
      try {
        await audio.play();
      } catch (error) {
        console.error('Error resuming audio:', error);
        audioPlayerStore.error = 'Failed to resume audio';
        audioPlayerStore.isPlaying = false;
      }
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
    audioPlayerStore.error = null;
    audioPlayerStore.isLoading = false;
    audioPlayerStore.buffering = false;
  },

  /**
   * Seek to specific time
   */
  seek: (time: number) => {
    const audio = getAudioElement();
    if (audio.duration) {
      const seekTime = Math.max(0, Math.min(time, audio.duration));
      audio.currentTime = seekTime;
      audioPlayerStore.currentTime = seekTime;
    }
  },

  /**
   * Set volume
   */
  setVolume: (volume: number) => {
    const audio = getAudioElement();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioPlayerStore.volume = clampedVolume;
    audio.volume = clampedVolume;
  },

  /**
   * Toggle mute
   */
  toggleMute: () => {
    const audio = getAudioElement();
    if (audioPlayerStore.isMuted) {
      audio.muted = false;
      audioPlayerStore.volume = previousVolume;
      audioPlayerStore.isMuted = false;
    } else {
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
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    audioPlayerStore.playbackRate = clampedRate;
    audio.playbackRate = clampedRate;
  },

  /**
   * Clear error
   */
  clearError: () => {
    audioPlayerStore.error = null;
  }
};

// Utility function to format time
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Subscribe to changes
if (typeof window !== 'undefined') {
  subscribe(audioPlayerStore, () => {
    // Optional debugging
  });
}