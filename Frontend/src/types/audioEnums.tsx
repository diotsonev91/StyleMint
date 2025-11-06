// Musical Key enum
export enum MusicalKey {
  C = "C",
  C_SHARP = "C_SHARP", 
  D = "D",
  D_SHARP = "D_SHARP",
  E = "E",
  F = "F",
  F_SHARP = "F_SHARP",
  G = "G",
  G_SHARP = "G_SHARP",
  A = "A",
  A_SHARP = "A_SHARP",
  B = "B"
}

// Musical Scale enum
export enum MusicalScale {
  MAJOR = "MAJOR",
  MINOR = "MINOR",
  OTHER = "OTHER"
}

// Sample Type enum
export enum SampleType {
  LOOP = "LOOP",
  ONESHOT = "ONESHOT"
}

// Genre enum
export enum Genre {
  DNB = "DNB",
  DUBSTEP = "DUBSTEP",
  TRAP = "TRAP",
  CINEMATIC = "CINEMATIC",
  EDM = "EDM",
  POP = "POP",
  HOUSE = "HOUSE",
  BOOM_BAP = "BOOM_BAP",
  RNB = "RNB",
  SOUL = "SOUL",
  TECHNO = "TECHNO",
  TRANCE = "TRANCE",
  CLASSICAL = "CLASSICAL",
  FUNK = "FUNK",
  ROCK = "ROCK",
  JAZZ = "JAZZ",
  REGGAE = "REGGEE",
  HIP_HOP = "HIP_HOP"
}

// Instrument Group enum
export enum InstrumentGroup {
  BASS = "BASS",
  DRUMS = "DRUMS",
  FX = "FX",
  GUITARS = "GUITARS",
  KEYS = "KEYS",
  PERCUSSION = "PERCUSSION",
  PITCHED_PERCUSSION = "PITCHED_PERCUSSION",
  SAMPLE_CHOPS = "SAMPLE_CHOPS",
  STRINGS = "STRINGS",
  SYNTHS = "SYNTHS",
  VOCALS = "VOCALS",
  WIND_AND_BRASS = "WIND_AND_BRASS"
}

// Helper functions for display names
export const getMusicalKeyDisplayName = (key: MusicalKey): string => {
  const displayNames: Record<MusicalKey, string> = {
    [MusicalKey.C]: "C",
    [MusicalKey.C_SHARP]: "C#",
    [MusicalKey.D]: "D",
    [MusicalKey.D_SHARP]: "D#",
    [MusicalKey.E]: "E",
    [MusicalKey.F]: "F",
    [MusicalKey.F_SHARP]: "F#",
    [MusicalKey.G]: "G",
    [MusicalKey.G_SHARP]: "G#",
    [MusicalKey.A]: "A",
    [MusicalKey.A_SHARP]: "A#",
    [MusicalKey.B]: "B"
  };
  return displayNames[key];
};

export const getMusicalScaleDisplayName = (scale: MusicalScale): string => {
  const displayNames: Record<MusicalScale, string> = {
    [MusicalScale.MAJOR]: "Major",
    [MusicalScale.MINOR]: "Minor",
    [MusicalScale.OTHER]: "Other"
  };
  return displayNames[scale];
};

export const getSampleTypeDisplayName = (type: SampleType): string => {
  const displayNames: Record<SampleType, string> = {
    [SampleType.LOOP]: "Loop",
    [SampleType.ONESHOT]: "One Shot"
  };
  return displayNames[type];
};

export const getInstrumentGroupDisplayName = (group: InstrumentGroup): string => {
  const displayNames: Record<InstrumentGroup, string> = {
    [InstrumentGroup.BASS]: "Bass",
    [InstrumentGroup.DRUMS]: "Drums",
    [InstrumentGroup.FX]: "FX",
    [InstrumentGroup.GUITARS]: "Guitars",
    [InstrumentGroup.KEYS]: "Keys",
    [InstrumentGroup.PERCUSSION]: "Percussion",
    [InstrumentGroup.PITCHED_PERCUSSION]: "Pitched Percussion",
    [InstrumentGroup.SAMPLE_CHOPS]: "Sample Chops",
    [InstrumentGroup.STRINGS]: "Strings",
    [InstrumentGroup.SYNTHS]: "Synths",
    [InstrumentGroup.VOCALS]: "Vocals",
    [InstrumentGroup.WIND_AND_BRASS]: "Wind & Brass"
  };
  return displayNames[group];
};