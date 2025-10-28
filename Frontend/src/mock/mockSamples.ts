import type {  SamplesFromPackDTO } from "../types"; 

// helper to convert "m:ss" → number (seconds)
function toSeconds(d: string | number): number {
  if (typeof d === "number") return d;
  const [m, s] = d.split(":").map(Number);
  return m * 60 + s;
}

// raw mock data (копираме твоите 1:1)
const rawSamples: Array<Omit<SamplesFromPackDTO, "duration"> & { duration: string | number }> = [
  {
    id: "1",
    name: "Afro_Percussion_Loop_125bpm",
    duration: "0:08",
    bpm: 125,
    key: "Am",
    genre: "Afro House",
    instrument: "Percussion",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 2.99
  },
  {
    id: "2",
    name: "Deep_Bass_One_Shot",
    duration: "0:03",
    key: "C",
    genre: "Deep House",
    instrument: "Bass",
    sampleType: "oneshot",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 1.99
  },
  {
    id: "3",
    name: "Vocal_Chant_Loop_120bpm",
    duration: "0:16",
    bpm: 120,
    key: "Gm",
    genre: "Afro House",
    instrument: "Vocals",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 3.99
  },
  {
    id: "4",
    name: "Tech_Kick_Punchy",
    duration: "0:01",
    genre: "Tech House",
    instrument: "Drums",
    sampleType: "oneshot",
    audioUrl: "#",
    packName: "Tech House Essentials",
    packId: "2",
    artist: "Defected Records",
    price: 1.49
  },
  {
    id: "5",
    name: "Shaker_Loop_125bpm",
    duration: "0:04",
    bpm: 125,
    genre: "Afro House",
    instrument: "Percussion",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 1.99
  },
  {
    id: "6",
    name: "Synth_Pad_Ambient_Dm",
    duration: "0:32",
    bpm: 120,
    key: "Dm",
    genre: "Deep House",
    instrument: "Synth",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Deep House Collection",
    packId: "3",
    artist: "Anjunadeep",
    price: 4.99
  },
  {
    id: "7",
    name: "Hihat_Roll_Pattern_128",
    duration: "0:02",
    bpm: 128,
    genre: "Tech House",
    instrument: "Drums",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Tech House Essentials",
    packId: "2",
    artist: "Defected Records",
    price: 1.99
  },
  {
    id: "8",
    name: "Marimba_Melody_Loop_F",
    duration: "0:16",
    bpm: 122,
    key: "F",
    genre: "Afro House",
    instrument: "Marimba",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 2.99
  },
  {
    id: "9",
    name: "Bass_Groove_Em",
    duration: "0:08",
    bpm: 124,
    key: "Em",
    genre: "Deep House",
    instrument: "Bass",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Deep House Collection",
    packId: "3",
    artist: "Anjunadeep",
    price: 2.49
  },
  {
    id: "10",
    name: "Clap_One_Shot_Crisp",
    duration: "0:01",
    genre: "Tech House",
    instrument: "Drums",
    sampleType: "oneshot",
    audioUrl: "#",
    packName: "Tech House Essentials",
    packId: "2",
    artist: "Defected Records",
    price: 0.99
  },
  {
    id: "11",
    name: "Vocal_Sample_Soulful",
    duration: "0:12",
    bpm: 120,
    key: "G",
    genre: "Deep House",
    instrument: "Vocals",
    sampleType: "oneshot",
    audioUrl: "#",
    packName: "Deep House Collection",
    packId: "3",
    artist: "Anjunadeep",
    price: 3.99
  },
  {
    id: "12",
    name: "Percussion_Conga_Loop",
    duration: "0:08",
    bpm: 126,
    genre: "Afro House",
    instrument: "Percussion",
    sampleType: "loop",
    audioUrl: "#",
    packName: "Essential Afro House",
    packId: "1",
    artist: "Toolroom Records",
    price: 2.49
  }
];

// ✅ FINAL EXPORT — normalized durations (number)
export const mockSamples: SamplesFromPackDTO[] = rawSamples.map(s => ({
  ...s,
  duration: toSeconds(s.duration),
}));
