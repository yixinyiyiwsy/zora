import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Genre, Tone, Idea, Character, Chapter, AnalysisResult, RankingResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';

/**
 * Generates a high-concept web novel idea based on Qidian tropes.
 * Accepts string for genre and tone to support custom user inputs.
 */
export const generateNovelIdea = async (genre: string, tone: string): Promise<Idea> => {
  const prompt = `
    你也是起点中文网的白金作家。
    请在 "${genre}" 分类下，以 "${tone}" 的基调，生成一个具有爆款潜质的网文创意。
    
    必须符合当前市场风向（黄金三章、爽文节奏）：
    1. 必须要有一个强力的“金手指”（Goldfinger/Cheat/系统/独特优势）。
    2. 必须要有清晰的“爽点”或核心看点（Hook）。
    3. 书名要吸睛（网文风格，长标题）。
    
    请以 JSON 格式输出。内容必须是中文。
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "吸睛的网文书名" },
      hook: { type: Type.STRING, description: "一句话核心看点/爽点" },
      goldfinger: { type: Type.STRING, description: "具体的金手指设定（系统、宝物、天赋等）" },
      mainConflict: { type: Type.STRING, description: "主要矛盾或最终目标" },
      targetAudience: { type: Type.STRING, description: "目标读者群体（例如：'喜欢快节奏升级流的读者'）" },
    },
    required: ["title", "hook", "goldfinger", "mainConflict", "targetAudience"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "你是一位资深的起点中文网网文编辑和风向分析师，精通网文套路。",
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as Idea;
};

/**
 * Fetches current Qidian rankings using Google Search Grounding and returns structured JSON.
 */
export const fetchQidianRankings = async (): Promise<RankingResult> => {
  const prompt = `
    请利用 Google Search 搜索“起点中文网”最新的榜单数据（请确保数据尽可能新）。
    
    任务：
    1. 搜集以下 6 个主要榜单：
       - 月票榜 (Monthly Ticket)
       - 畅销榜 (Best Sellers)
       - 阅读指数榜 (Reading Index)
       - 推荐票榜 (Recommended)
       - 收藏榜 (Favorites)
       - 完本榜 (Finished)
    2. 对于每个榜单，提取前 6 本书。
    3. 每本书需要提取：排名、书名、作者、类型、热度数值（如月票数）、简介（一句话概括）、核心看点（为什么火？）。
    4. **关键**：请尽力寻找每本书的封面图片URL (coverUrl)。
       - 优先寻找起点官网(qidian.com)或百科的图片链接。
       - 必须是以 http 开头的有效图片链接。
       - 如果找不到确切图片，请留空，不要编造。
    5. 对当前的整体流行趋势写一段简短的分析 (trendAnalysis)。
    
    输出要求：
    必须是符合 Schema 的 JSON 格式。
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "榜单名称，如'月票榜'" },
            books: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  heat: { type: Type.STRING, description: "热度数据，如'12万月票'" },
                  summary: { type: Type.STRING, description: "简短剧情概括" },
                  highlights: { type: Type.STRING, description: "核心看点/爽点分析" },
                  coverUrl: { type: Type.STRING, description: "Optional image URL if found, otherwise empty" }
                },
                required: ["rank", "title", "author", "genre", "heat", "summary", "highlights"]
              }
            }
          },
          required: ["name", "books"]
        }
      },
      trendAnalysis: { type: Type.STRING, description: "当前网文市场流行趋势分析" }
    },
    required: ["categories", "trendAnalysis"]
  };

  const response = await ai.models.generateContent({
    model: MODEL_FLASH, 
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.text || "{}";
  let parsedData;
  try {
    parsedData = JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse ranking data.");
  }

  // Extract sources
  const sources: { title: string; uri: string }[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }

  return {
    categories: parsedData.categories || [],
    trendAnalysis: parsedData.trendAnalysis || "暂无趋势分析",
    sources
  };
};

/**
 * Creates a "Golden 3 Chapters" outline or a general structure.
 */
export const generateOutline = async (idea: Idea, count: number = 5): Promise<Chapter[]> => {
  const prompt = `
    为以下起点网文创意生成前 ${count} 章的大纲：
    书名：${idea.title}
    金手指：${idea.goldfinger}
    看点：${idea.hook}

    重要要求：前三章必须符合“黄金三章”定律：
    1. 第一章：主角登场，展示凄惨/受压迫的现状，或巨大的危机，引出期待感。
    2. 第一章或第二章：金手指（系统/奇遇）激活，主角获得翻盘希望。
    3. 第三章：小高潮/打脸情节，展示金手指的威力，确立爽点。
    
    保持快节奏。内容必须是中文。
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        number: { type: Type.INTEGER },
        title: { type: Type.STRING, description: "章节名" },
        summary: { type: Type.STRING, description: "章节剧情摘要" },
        pacing: { type: Type.STRING, enum: ["快", "中", "慢"] },
        keyEvent: { type: Type.STRING, description: "本章关键事件/爽点" },
      },
      required: ["number", "title", "summary", "pacing", "keyEvent"],
    },
  };

  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as Chapter[];
};

/**
 * Generates a character profile tailored for web novels, optionally using the outline.
 */
export const generateCharacter = async (role: string, genre: string, outline?: Chapter[]): Promise<Character> => {
  let contextPrompt = "";
  if (outline && outline.length > 0) {
    const outlineStr = outline.map(c => `第${c.number}章 ${c.title}: ${c.summary}`).join('\n');
    contextPrompt = `
      【现有大纲剧情参考】
      ${outlineStr}
      
      请根据上述大纲剧情来设计这个角色。如果大纲中已经暗示了该角色的存在（例如大纲里提到的反派或配角），请直接完善该角色的设定，使其与剧情严丝合缝。
    `;
  }

  const prompt = `
    为一部 ${genre} 小说创建一个 ${role} 角色。
    ${contextPrompt}

    - 如果是主角：需要有代入感，性格坚毅或腹黑，适合该流派。
    - 如果是反派：需要有具体的仇恨拉取点（如富二代/嚣张/阴险）。
    - 如果是女主/男主：需要有独特的人设标签（如高冷、傲娇、温柔）。
    
    内容必须是中文。
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "角色名字" },
      role: { type: Type.STRING, description: "角色定位" },
      archetype: { type: Type.STRING, description: "角色原型/模板 (例如：'废柴逆袭', '重生仙尊')" },
      personality: { type: Type.STRING, description: "性格描述" },
      backstory: { type: Type.STRING, description: "背景故事" },
      cheat_ability: { type: Type.STRING, description: "特殊能力/天赋（可选）" },
    },
    required: ["name", "role", "archetype", "personality", "backstory"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as Character;
};

/**
 * Editor Helper: Continue text or Polish text.
 */
export const assistWriting = async (
  currentText: string, 
  instruction: 'continue' | 'polish' | 'describe', 
  contextData: { idea: Idea | null, characters: Character[], outline: Chapter[] }
): Promise<string> => {
  let userPrompt = "";
  
  // Construct a Rich Context string from the data
  let worldContext = "";
  if (contextData.idea) {
    worldContext += `小说名：《${contextData.idea.title}》。核心爽点：${contextData.idea.hook}。金手指：${contextData.idea.goldfinger}。\n`;
  }
  if (contextData.characters.length > 0) {
    worldContext += `主要角色：${contextData.characters.map(c => `${c.name}(${c.role}, ${c.personality})`).join('、')}。\n`;
  }
  if (contextData.outline.length > 0) {
    worldContext += `近期大纲参考：${contextData.outline.slice(0, 3).map(c => c.summary).join(' -> ')}。\n`;
  }

  const baseInstruction = "你是一个专业的网文写手助手。请模仿起点中文网的白金大神风格：节奏快、有代入感、情绪调动强。";

  if (instruction === 'continue') {
    userPrompt = `
      ${baseInstruction}
      
      【当前世界观与设定】
      ${worldContext || '无特定设定，通用网文风格。'}

      【任务】
      请续写以下剧情（约200-300字）。
      要求：
      1. 紧接上文，逻辑通顺。
      2. 尽量使用已有角色，不要随意创造路人甲。
      3. 保持爽文节奏。

      【现有文本】
      ${currentText}
    `;
  } else if (instruction === 'polish') {
    userPrompt = `
      ${baseInstruction}

      【任务】
      请润色以下文本。
      要求：
      1. 去除AI味，增加口语化和画面感。
      2. 强化情绪冲突。
      3. 修复语病。

      【文本】
      ${currentText}
    `;
  } else if (instruction === 'describe') {
    userPrompt = `
      ${baseInstruction}
      
      【当前设定】
      ${worldContext}

      【任务】
      基于上下文写一段生动的描写（场景、打斗招式或人物外貌）。
      要求：画面感强，用词精准，控制在100字以内。

      【上下文】
      ${currentText.slice(-300)}
    `;
  }

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: userPrompt,
    config: {
      // Plain text response
    },
  });

  return response.text || "";
};

/**
 * Zhuque AI Inspection: Analyzes text for "AI flavor".
 */
export const analyzeZhuque = async (text: string): Promise<AnalysisResult> => {
  const prompt = `
    你现在是“朱雀AI检测助手”，专门服务于网文作者。你的任务是检测这段文本是否具有浓重的“AI味”（GPT味），并区分哪些是“人工特征”，哪些是“AI特征”。
    
    “AI味”的典型特征：
    1. 滥用逻辑连接词（首先、其次、综上所述）。
    2. 缺乏情绪起伏，语气过于平铺直叙或理中客。
    3. 描写华丽但空洞，缺乏具体的感官细节。
    4. 喜欢用长难句，缺乏网文的短句节奏感。
    
    “人工特征”的典型特征：
    1. 口语化、俚语或网络热梗的使用。
    2. 强烈的情绪表达（愤怒、嘲讽等）。
    3. 非常具体的细节描写（动作、神态）。
    
    请输出JSON：
    1. score: 0-100的评分（分数越高代表越像AI，越不适合网文）。
    2. verdict: 简短评价，如“一眼假”、“略显生硬”、“浑然天成”。
    3. humanTraits: 列表，文本中保留的人工写作特征。
    4. aiTraits: 列表，文本中暴露的AI写作特征。
    5. suggestions: 列表，包含具体的修改建议对象。
       - original: 原文中有问题的片段。
       - suggestion: 最推荐的修改方案。
       - alternatives: 1-2个其他的修改备选方案。
       - reason: 为什么这样改更好。
    请至少提供2-3条具体到句子的修改建议。

    输入文本：
    ${text}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "0-100分，分数越高越像AI" },
      verdict: { type: Type.STRING, description: "简短评价" },
      humanTraits: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "检测到的人工特征列表" 
      },
      aiTraits: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "检测到的AI/GPT特征列表" 
      },
      suggestions: { 
        type: Type.ARRAY, 
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING, description: "原文片段" },
            suggestion: { type: Type.STRING, description: "首选修改建议" },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "备选修改建议" },
            reason: { type: Type.STRING, description: "修改理由" }
          },
          required: ["original", "suggestion", "alternatives", "reason"]
        },
        description: "具体的修改建议" 
      },
    },
    required: ["score", "verdict", "humanTraits", "aiTraits", "suggestions"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as AnalysisResult;
};