import { Idea, Chapter, Character } from "../types";

const STORAGE_KEY = 'qidian_architect_project_v1';

export interface ProjectState {
  idea: Idea | null;
  outline: Chapter[];
  characters: Character[];
  content: string;
  lastModified: number;
}

const DEFAULT_STATE: ProjectState = {
  idea: null,
  outline: [],
  characters: [],
  content: "",
  lastModified: Date.now(),
};

export const saveProject = (
  idea: Idea | null,
  outline: Chapter[],
  characters: Character[],
  content: string
): void => {
  try {
    const state: ProjectState = {
      idea,
      outline,
      characters,
      content,
      lastModified: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log(`[Storage] Project saved at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error("[Storage] Failed to save project:", error);
  }
};

export const loadProject = (): ProjectState => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return DEFAULT_STATE;
    return JSON.parse(json) as ProjectState;
  } catch (error) {
    console.error("[Storage] Failed to load project:", error);
    return DEFAULT_STATE;
  }
};

export const clearProject = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportProjectToTxt = (state: ProjectState): void => {
    if (!state.idea) return;
    
    let text = `书名：${state.idea.title}\n`;
    text += `核心爽点：${state.idea.hook}\n`;
    text += `金手指：${state.idea.goldfinger}\n\n`;
    
    text += `=== 角色设定 ===\n`;
    state.characters.forEach(c => {
        text += `${c.name} (${c.role}): ${c.personality}\n`;
    });
    text += `\n=== 大纲 ===\n`;
    state.outline.forEach(c => {
        text += `第${c.number}章 ${c.title}: ${c.summary}\n`;
    });
    
    text += `\n=== 正文 ===\n`;
    text += state.content;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.idea.title || 'novel'}_backup.txt`;
    link.click();
    URL.revokeObjectURL(url);
};
