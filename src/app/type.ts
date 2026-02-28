// src/types.ts

export interface Counter {
  name: string;
  reason: string;
}

export interface PowerTags {
  tankiness: number; // 1-5
  damage: number;    // 1-5
  cc: number;        // 1-5
  mobility: number;  // 1-5
  utility: number;   // 1-5
}

export interface Champion {
  id: string;
  name: string;
  role: string[]; // Array perché un champ può essere Top e Mid
  image: string;
  damageType: 'AD' | 'AP' | 'Hybrid' | 'Tank'; 
  tags: PowerTags;
  counters: Counter[];
}