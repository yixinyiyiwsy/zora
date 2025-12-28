export enum Genre {
  XIANXIA = '仙侠/修真',
  URBAN = '都市/系统',
  SCIFI = '科幻/诸天无限',
  FANTASY = '奇幻/西幻',
  HISTORY = '历史/架空',
  GAME = '游戏/虚拟网游',
}

export enum Tone {
  FACE_SLAPPING = '打脸/爽文',
  COMEDY = '轻松/搞笑',
  DARK = '黑暗/杀伐果断',
  TRADITIONAL = '慢热/传统',
  INTRIGUE = '权谋/智斗',
  TRAGEDY = '虐主/致郁',
}

export interface Idea {
  title: string;
  hook: string;
  goldfinger: string; // The "Cheat" or unique advantage
  mainConflict: string;
  targetAudience: string;
}

export interface Character {
  name: string;
  role: string;
  archetype: string;
  personality: string;
  backstory: string;
  cheat_ability?: string; // Optional specific ability
}

export interface Chapter {
  number: number;
  title: string;
  summary: string;
  pacing: '快' | '中' | '慢';
  keyEvent: string;
}

export interface SpecificSuggestion {
  original: string;   // The text segment identified as AI-like
  suggestion: string; // The proposed human-like change
  alternatives: string[]; // Other possible changes
  reason: string;     // Why this change is better
}

export interface AnalysisResult {
  score: number; // 0-100, 100 being completely AI-like
  verdict: string; // e.g., "一眼假", "略显生硬", "浑然天成"
  humanTraits: string[]; // Features that look human
  aiTraits: string[]; // Features that look like AI
  suggestions: SpecificSuggestion[];
}

export interface RankingBook {
  rank: number;
  title: string;
  author: string;
  genre: string;
  heat: string; // e.g. "100万月票"
  summary: string;
  highlights: string; // Hook/Why it's popular
  coverUrl?: string; // Optional
}

export interface RankingCategory {
  name: string; // e.g., "月票榜"
  books: RankingBook[];
}

export interface RankingResult {
  categories: RankingCategory[]; 
  trendAnalysis: string; 
  sources: { title: string; uri: string }[]; 
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
}