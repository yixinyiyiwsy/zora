import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Users, 
  FileText, 
  PenTool, 
  Save, 
  Zap, 
  TrendingUp,
  ChevronRight,
  Loader2,
  Swords,
  ScrollText,
  Wand2,
  Flame, 
  AlertTriangle,
  CheckCircle2,
  Bot,
  User,
  ArrowRight,
  RefreshCcw,
  MousePointerClick,
  X,
  Copy,
  Check,
  Download,
  Trash2,
  Smartphone,
  Upload,
  Trophy,
  ExternalLink,
  Book,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Genre, Tone, Idea, Character, Chapter, GenerationState, AnalysisResult, SpecificSuggestion, RankingResult, RankingBook } from './types';
import * as geminiService from './services/geminiService';
import * as storageService from './services/storage';

// --- Sub-Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium tracking-wide">{label}</span>
  </button>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h2>
    <p className="text-slate-400">{subtitle}</p>
  </div>
);

const LoadingButton = ({ isLoading, onClick, children, icon: Icon, className = "" }: any) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (Icon && <Icon size={20} />)}
    {children}
  </button>
);

// --- Ranking Item Component ---
const RankingBookCard = ({ book }: { book: RankingBook }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Helper to get a consistent color gradient based on rank
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-orange-500 text-white";
    if (rank === 2) return "from-slate-300 to-slate-400 text-slate-800";
    if (rank === 3) return "from-amber-600 to-amber-700 text-amber-100";
    return "from-slate-700 to-slate-800 text-slate-400";
  }

  // Generate a deterministic color for fallback cover based on title length
  const getFallbackColor = () => {
    const colors = [
      'bg-emerald-800', 'bg-blue-800', 'bg-indigo-800', 'bg-purple-800', 'bg-rose-800', 'bg-cyan-800'
    ];
    return colors[book.title.length % colors.length];
  }

  return (
    <div 
      className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-indigo-500/50 cursor-pointer group ${expanded ? 'ring-2 ring-indigo-500/30' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex">
        {/* Rank & Cover */}
        <div className="w-24 h-32 shrink-0 bg-slate-900 relative shadow-md overflow-hidden">
           {book.coverUrl && !imgError ? (
               <img 
                 src={book.coverUrl} 
                 alt={book.title} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 onError={() => setImgError(true)}
               />
           ) : (
               <div className={`w-full h-full ${getFallbackColor()} flex flex-col items-center justify-center p-2 text-center border-r border-slate-600`}>
                   <Book size={24} className="text-white/50 mb-2" />
                   <span className="text-xs font-serif text-white/90 leading-tight font-bold line-clamp-3">
                     {book.title}
                   </span>
               </div>
           )}
           
           {/* Rank Badge */}
           <div className={`absolute top-0 left-0 px-2 py-1 rounded-br-lg text-xs font-bold shadow-lg bg-gradient-to-r z-20 ${getRankColor(book.rank)}`}>
             #{book.rank}
           </div>
        </div>

        {/* Main Info */}
        <div className="flex-1 p-3 flex flex-col justify-between h-32">
           <div className="overflow-hidden">
             <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-white text-lg leading-tight line-clamp-1">{book.title}</h4>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="text-slate-200">{book.author}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>{book.genre}</span>
             </div>
             <div className="inline-flex items-center gap-1 text-red-400 text-xs font-bold bg-red-900/10 px-2 py-1 rounded border border-red-900/20">
                <Flame size={12} fill="currentColor" /> {book.heat}
             </div>
           </div>
           
           <div className="flex items-center justify-between text-xs text-indigo-400 pt-2 border-t border-slate-700/50">
              <span className="flex items-center gap-1">
                 {expanded ? '收起详情' : '点击查看简介与看点'}
              </span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
           </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="bg-slate-900/50 p-4 border-t border-slate-700 space-y-3 animate-fade-in-down">
           <div>
             <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">简介</span>
             <p className="text-slate-300 text-sm leading-relaxed">{book.summary}</p>
           </div>
           <div>
             <span className="text-indigo-400 text-xs font-bold uppercase mb-1 block flex items-center gap-1"><Zap size={12}/> 核心看点</span>
             <p className="text-indigo-200 text-sm leading-relaxed bg-indigo-900/10 p-2 rounded border border-indigo-500/20">
               {book.highlights}
             </p>
           </div>
        </div>
      )}
    </div>
  );
};


// --- Suggestion Item Component ---

const SuggestionItem = ({ 
  s, 
  onJump, 
  onReplace, 
  onIgnore 
}: { 
  s: SpecificSuggestion, 
  onJump: (text: string) => void, 
  onReplace: (original: string, replacement: string) => void,
  onIgnore: () => void 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState(s.suggestion);

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 text-xs transition-all hover:border-slate-600">
      
      {/* Original Text Section */}
      <div 
        className="mb-3 cursor-pointer group" 
        onClick={() => onJump(s.original)}
        title="点击在编辑器中定位 (Click to locate in editor)"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded text-[10px]">原文</span>
          <MousePointerClick size={10} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
        <span className="text-slate-300 line-through decoration-red-500/50 decoration-2 group-hover:text-indigo-300 transition-colors bg-red-500/0 group-hover:bg-red-500/10 rounded px-1 -ml-1">
          {s.original}
        </span>
      </div>

      {/* Suggestion Section */}
      <div className="flex items-start gap-2 mb-2 relative">
        <ArrowRight size={12} className="text-slate-600 mt-0.5 shrink-0" />
        <div className="w-full">
           <div 
             className="cursor-pointer hover:bg-slate-800 rounded p-1 -ml-1 transition-colors"
             onClick={() => setShowActions(!showActions)}
           >
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded text-[10px]">建议</span>
                <span className="text-[10px] text-slate-500">{showActions ? '收起' : '点击展开操作'}</span>
              </div>
              <span className="text-emerald-100 font-medium block">{selectedReplacement}</span>
           </div>

           {/* Dropdown Actions */}
           {showActions && (
             <div className="mt-3 bg-slate-800 rounded-lg p-2 border border-slate-600 shadow-xl animate-fade-in-up space-y-2">
               
               {/* Main Replace Button */}
               <button 
                 onClick={() => { onReplace(s.original, selectedReplacement); setShowActions(false); }}
                 className="w-full flex items-center gap-2 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
               >
                 <Check size={12} /> 替换原文 (Replace)
               </button>

               {/* Alternatives List */}
               {s.alternatives && s.alternatives.length > 0 && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 mb-1">其他备选方案:</p>
                    {s.alternatives.map((alt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedReplacement(alt)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] mb-1 truncate ${selectedReplacement === alt ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-700'}`}
                      >
                        {alt}
                      </button>
                    ))}
                    <button 
                        onClick={() => setSelectedReplacement(s.suggestion)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] mb-1 truncate ${selectedReplacement === s.suggestion ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-700'}`}
                      >
                        {s.suggestion} (首选)
                      </button>
                  </div>
               )}

               <div className="flex gap-2 pt-2 border-t border-slate-700">
                  <button 
                    onClick={onIgnore}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[11px]"
                  >
                    <X size={12} /> 忽略
                  </button>
               </div>
             </div>
           )}
        </div>
      </div>
      
      <div className="text-[10px] text-slate-500 mt-1 italic border-t border-slate-800 pt-1">
         💡 {s.reason}
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'idea' | 'outline' | 'characters' | 'write' | 'ranking'>('idea');
  
  // App State
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [outline, setOutline] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editorContent, setEditorContent] = useState<string>("");
  const [lastSaved, setLastSaved] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // PWA install prompt
  
  // Generation States
  const [ideaState, setIdeaState] = useState<GenerationState>({ isLoading: false, error: null });
  const [outlineState, setOutlineState] = useState<GenerationState>({ isLoading: false, error: null });
  const [charState, setCharState] = useState<GenerationState>({ isLoading: false, error: null });
  const [editorState, setEditorState] = useState<GenerationState>({ isLoading: false, error: null });
  const [zhuqueState, setZhuqueState] = useState<{ isLoading: boolean, error: string | null, result: AnalysisResult | null, ignoredIndices: number[] }>({ isLoading: false, error: null, result: null, ignoredIndices: [] });
  const [rankingState, setRankingState] = useState<{ isLoading: boolean, error: string | null, data: RankingResult | null }>({ isLoading: false, error: null, data: null });
  
  // Ranking Tab State
  const [activeRankingCategory, setActiveRankingCategory] = useState<number>(0);

  // Input States
  const [selectedGenre, setSelectedGenre] = useState<string>(Genre.XIANXIA);
  const [customGenre, setCustomGenre] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<string>(Tone.FACE_SLAPPING);
  const [customTone, setCustomTone] = useState<string>("");
  
  const [newCharRole, setNewCharRole] = useState<string>("主角");
  const [useOutlineForChar, setUseOutlineForChar] = useState<boolean>(true);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects (The "Backend" Persistence & PWA) ---

  useEffect(() => {
    // Storage Load
    const saved = storageService.loadProject();
    if (saved) {
      if (saved.idea) setCurrentIdea(saved.idea);
      if (saved.outline) setOutline(saved.outline);
      if (saved.characters) setCharacters(saved.characters);
      if (saved.content) setEditorContent(saved.content);
      if (saved.lastModified) setLastSaved(new Date(saved.lastModified).toLocaleTimeString());
    }

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Captured PWA install prompt");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-save logic (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave(true);
    }, 5000); 

    return () => clearTimeout(timer);
  }, [currentIdea, outline, characters, editorContent]);

  // --- Handlers ---

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSave = (silent = false) => {
    storageService.saveProject(currentIdea, outline, characters, editorContent);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleClearProject = () => {
    if (confirm("确定要清空所有数据吗？此操作无法撤销。")) {
      storageService.clearProject();
      setCurrentIdea(null);
      setOutline([]);
      setCharacters([]);
      setEditorContent("");
      setLastSaved("");
    }
  };

  const handleExport = () => {
    storageService.exportProjectToTxt({
      idea: currentIdea,
      outline,
      characters,
      content: editorContent,
      lastModified: Date.now()
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        if (editorContent.length > 50 && !window.confirm("导入文件将覆盖当前编辑框内容，确定要继续吗？")) {
           event.target.value = ''; 
           return;
        }
        setEditorContent(text);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const handleGenerateIdea = async () => {
    setIdeaState({ isLoading: true, error: null });
    
    // Determine final genre and tone
    const finalGenre = selectedGenre === 'Custom' ? customGenre : selectedGenre;
    const finalTone = selectedTone === 'Custom' ? customTone : selectedTone;

    if (!finalGenre || !finalTone) {
        setIdeaState({ isLoading: false, error: "请填写完整的分类和基调" });
        return;
    }

    try {
      const idea = await geminiService.generateNovelIdea(finalGenre, finalTone);
      setCurrentIdea(idea);
    } catch (e: any) {
      setIdeaState({ isLoading: false, error: e.message });
    } finally {
      setIdeaState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleGenerateOutline = async () => {
    if (!currentIdea) {
      setOutlineState({ isLoading: false, error: "请先生成小说创意。" });
      return;
    }
    setOutlineState({ isLoading: true, error: null });
    try {
      const chapters = await geminiService.generateOutline(currentIdea);
      setOutline(chapters);
    } catch (e: any) {
      setOutlineState({ isLoading: false, error: e.message });
    } finally {
      setOutlineState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleGenerateCharacter = async () => {
    setCharState({ isLoading: true, error: null });
    try {
      // Pass the outline if the checkbox is checked AND outline exists
      const outlineContext = (useOutlineForChar && outline.length > 0) ? outline : undefined;
      const finalGenre = selectedGenre === 'Custom' ? customGenre : selectedGenre;
      const char = await geminiService.generateCharacter(newCharRole, finalGenre, outlineContext);
      setCharacters(prev => [...prev, char]);
    } catch (e: any) {
      setCharState({ isLoading: false, error: e.message });
    } finally {
      setCharState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleFetchRankings = async () => {
    setRankingState({ isLoading: true, error: null, data: null });
    setActiveRankingCategory(0); // Reset tab
    try {
      const result = await geminiService.fetchQidianRankings();
      setRankingState({ isLoading: false, error: null, data: result });
    } catch (e: any) {
      setRankingState({ isLoading: false, error: e.message, data: null });
    }
  };

  const handleEditorAssist = async (type: 'continue' | 'polish' | 'describe') => {
    setEditorState({ isLoading: true, error: null });
    try {
      const contextData = {
        idea: currentIdea,
        characters: characters,
        outline: outline
      };
      
      const result = await geminiService.assistWriting(editorContent, type, contextData);
      
      if (type === 'polish') {
        setEditorContent(prev => prev + `\n\n--- 润色版本 ---\n${result}\n----------------------\n`);
      } else {
        setEditorContent(prev => prev + (prev.endsWith(' ') ? '' : ' ') + result);
      }
    } catch (e: any) {
      setEditorState({ isLoading: false, error: e.message });
    } finally {
      setEditorState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleZhuqueCheck = async () => {
    if (!editorContent || editorContent.length < 50) {
      setZhuqueState({ isLoading: false, error: "请至少输入50字进行检测。", result: null, ignoredIndices: [] });
      return;
    }
    setZhuqueState({ isLoading: true, error: null, result: null, ignoredIndices: [] });
    try {
      const result = await geminiService.analyzeZhuque(editorContent);
      setZhuqueState({ isLoading: false, error: null, result, ignoredIndices: [] });
    } catch (e: any) {
      setZhuqueState({ isLoading: false, error: e.message, result: null, ignoredIndices: [] });
    }
  };

  // Zhuque Helper Functions
  const jumpToText = (text: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const content = textarea.value;
    const index = content.indexOf(text);
    
    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + text.length);
      // Simple scroll calc
      const lines = content.substring(0, index).split("\n").length;
      const lineHeight = 28; // approx line height in px
      textarea.scrollTop = Math.max(0, (lines * lineHeight) - 100);
    } else {
      alert("未在编辑器中找到该片段 (可能已被修改)");
    }
  };

  const replaceText = (original: string, replacement: string) => {
    setEditorContent(prev => prev.replace(original, replacement));
  };

  const ignoreSuggestion = (index: number) => {
    setZhuqueState(prev => ({
      ...prev,
      ignoredIndices: [...prev.ignoredIndices, index]
    }));
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col hidden md:flex bg-slate-950/50">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">起点造梦机</h1>
            <p className="text-xs text-indigo-400">白金作家助手</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={Sparkles} 
            label="创意工坊" 
            active={activeTab === 'idea'} 
            onClick={() => setActiveTab('idea')} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="大纲生成" 
            active={activeTab === 'outline'} 
            onClick={() => setActiveTab('outline')} 
          />
          <SidebarItem 
            icon={Users} 
            label="角色设定" 
            active={activeTab === 'characters'} 
            onClick={() => setActiveTab('characters')} 
          />
          <SidebarItem 
            icon={PenTool} 
            label="写作助手" 
            active={activeTab === 'write'} 
            onClick={() => setActiveTab('write')} 
          />
          <SidebarItem 
            icon={Trophy} 
            label="榜单风向" 
            active={activeTab === 'ranking'} 
            onClick={() => setActiveTab('ranking')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
           {/* PWA Install Button */}
           {deferredPrompt && (
              <button 
                onClick={handleInstallApp}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 animate-fade-in-up"
              >
                <Smartphone size={18} /> 安装手机版APP
              </button>
           )}

           <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 space-y-2">
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Project Storage</span>
                {lastSaved && <span className="text-[10px] text-emerald-400">{lastSaved}</span>}
             </div>
             <div className="flex gap-2">
                <button onClick={() => handleSave()} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-xs border border-slate-700 transition-colors">
                   保存
                </button>
                <button onClick={handleExport} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-xs border border-slate-700 transition-colors" title="导出txt">
                   导出
                </button>
             </div>
             <button onClick={handleClearProject} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-xs border border-red-900/30 transition-colors flex items-center justify-center gap-1">
                   <Trash2 size={10} /> 重置项目
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-900 relative">
        <div className="max-w-5xl mx-auto p-6 md:p-12">

          {/* Tab: Idea Forge */}
          {activeTab === 'idea' && (
            <div className="animate-fade-in-up">
              <SectionHeader 
                title="创意工坊" 
                subtitle="生成符合起点市场风向的爆款网文创意。" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  {/* Genre Selection */}
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">小说分类</label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.values(Genre).map((g) => (
                        <button
                          key={g}
                          onClick={() => { setSelectedGenre(g); setCustomGenre(""); }}
                          className={`text-left px-4 py-3 rounded-lg border transition-all ${
                            selectedGenre === g 
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                      {/* Custom Genre Button */}
                      <button
                          onClick={() => setSelectedGenre("Custom")}
                          className={`text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
                            selectedGenre === "Custom"
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <PenTool size={16} /> 自定义分类...
                      </button>
                      
                      {selectedGenre === "Custom" && (
                         <input 
                           type="text"
                           value={customGenre}
                           onChange={(e) => setCustomGenre(e.target.value)}
                           placeholder="输入自定义分类 (如：赛博修真)..."
                           className="w-full mt-2 bg-slate-900 text-white px-4 py-2 rounded-lg border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 animate-fade-in-up"
                           autoFocus
                         />
                      )}
                    </div>
                  </div>
                  
                  {/* Tone Selection */}
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">故事基调</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(Tone).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setSelectedTone(t); setCustomTone(""); }}
                          className={`px-3 py-2 rounded-md text-sm transition-all ${
                            selectedTone === t
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                          onClick={() => setSelectedTone("Custom")}
                          className={`px-3 py-2 rounded-md text-sm transition-all border border-dashed ${
                            selectedTone === "Custom"
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          自定义...
                      </button>
                    </div>
                    {selectedTone === "Custom" && (
                       <input 
                         type="text"
                         value={customTone}
                         onChange={(e) => setCustomTone(e.target.value)}
                         placeholder="输入自定义基调 (如：克苏鲁风)..."
                         className="w-full mt-3 bg-slate-900 text-white px-4 py-2 rounded-lg border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 animate-fade-in-up"
                         autoFocus
                       />
                    )}
                  </div>

                  <LoadingButton 
                    isLoading={ideaState.isLoading} 
                    onClick={handleGenerateIdea}
                    icon={Sparkles}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  >
                    生成爆款创意
                  </LoadingButton>
                  
                  {ideaState.error && <div className="text-red-400 text-sm mt-2">{ideaState.error}</div>}
                </div>

                {/* Result Card */}
                <div className="relative">
                  {currentIdea ? (
                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl h-full">
                        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          爆款潜质
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6 leading-snug">{currentIdea.title}</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                              <Zap size={18} /> 核心看点 (Hook)
                            </h4>
                            <p className="text-slate-300 leading-relaxed">{currentIdea.hook}</p>
                          </div>
                          <div>
                            <h4 className="flex items-center gap-2 text-yellow-500 font-semibold mb-2">
                              <Swords size={18} /> 金手指 (Goldfinger)
                            </h4>
                            <p className="text-slate-300 leading-relaxed">{currentIdea.goldfinger}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                             <div>
                                <h5 className="text-slate-500 text-xs uppercase font-bold mb-1">主要冲突</h5>
                                <p className="text-slate-400 text-sm">{currentIdea.mainConflict}</p>
                             </div>
                             <div>
                                <h5 className="text-slate-500 text-xs uppercase font-bold mb-1">目标读者</h5>
                                <p className="text-slate-400 text-sm">{currentIdea.targetAudience}</p>
                             </div>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                           <button 
                             onClick={() => setActiveTab('outline')}
                             className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                           >
                             下一步：生成大纲 <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                  ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                      <div>
                        <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                        <p>选择分类和基调，点击生成，创造你的下一部成神之作。</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Tab: Ranking / Leaderboard */}
          {activeTab === 'ranking' && (
             <div className="animate-fade-in-up h-[calc(100vh-100px)] flex flex-col">
                <SectionHeader 
                  title="起点风向标" 
                  subtitle="实时获取起点中文网最新榜单，把握市场脉搏。" 
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                   {/* Left Control Panel */}
                   <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500" /> 榜单查询
                         </h3>
                         <p className="text-slate-400 text-sm mb-6">
                            AI 将实时联网检索起点中文网的月票榜、畅销榜及阅读指数榜，并为您分析当前的热门题材趋势。
                         </p>
                         
                         <LoadingButton 
                            isLoading={rankingState.isLoading} 
                            onClick={handleFetchRankings}
                            icon={RefreshCcw}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                          >
                            获取最新榜单
                          </LoadingButton>
                          
                          {rankingState.error && (
                             <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-300 text-xs">
                                Error: {rankingState.error}
                             </div>
                          )}
                      </div>

                      {rankingState.data?.trendAnalysis && (
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                          <h4 className="text-sm font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                             <TrendingUp size={16} /> 市场趋势分析
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {rankingState.data.trendAnalysis}
                          </p>
                        </div>
                      )}

                      {rankingState.data?.sources && rankingState.data.sources.length > 0 && (
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                           <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">数据来源</h4>
                           <ul className="space-y-2">
                              {rankingState.data.sources.map((source, idx) => (
                                <li key={idx} className="truncate">
                                   <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-indigo-400 hover:underline">
                                      <ExternalLink size={10} /> {source.title}
                                   </a>
                                </li>
                              ))}
                           </ul>
                        </div>
                      )}
                   </div>

                   {/* Right Content Panel (Ranking Lists) */}
                   <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                      {rankingState.data ? (
                         <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
                            
                            {/* Tabs */}
                            <div className="flex border-b border-slate-700 bg-slate-800/50 p-2 gap-2 overflow-x-auto">
                               {rankingState.data.categories.map((cat, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveRankingCategory(idx)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                       activeRankingCategory === idx 
                                       ? 'bg-indigo-600 text-white shadow' 
                                       : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                  >
                                     {cat.name}
                                  </button>
                               ))}
                            </div>

                            {/* List content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                               {rankingState.data.categories[activeRankingCategory]?.books.map((book) => (
                                  <RankingBookCard key={book.rank} book={book} />
                               ))}
                            </div>

                         </div>
                      ) : (
                         <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 bg-slate-800/30">
                            {rankingState.isLoading ? (
                               <div className="text-center space-y-4">
                                  <Loader2 size={48} className="animate-spin mx-auto text-indigo-500" />
                                  <p>正在联网搜索起点最新数据...</p>
                                  <p className="text-xs text-slate-600">这可能需要几秒钟时间</p>
                               </div>
                            ) : (
                               <div className="text-center">
                                  <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                  <p>点击左侧按钮获取实时榜单。</p>
                               </div>
                            )}
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* Tab: Outline Master */}
          {activeTab === 'outline' && (
            <div className="animate-fade-in-up">
              <SectionHeader 
                title="大纲生成" 
                subtitle="构建“黄金三章”，牢牢抓住读者眼球。" 
              />

              {!currentIdea ? (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-lg flex items-center gap-3 mb-6">
                    <span className="text-2xl">⚠️</span>
                    <p>你还没有生成小说创意，请先前往“创意工坊”。</p>
                 </div>
              ) : (
                <div className="mb-6 flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
                   <div>
                      <span className="text-slate-400 text-sm">当前作品：</span>
                      <h3 className="text-lg font-bold text-white">{currentIdea.title}</h3>
                   </div>
                   <LoadingButton 
                    isLoading={outlineState.isLoading} 
                    onClick={handleGenerateOutline}
                    icon={TrendingUp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    生成黄金三章大纲
                  </LoadingButton>
                </div>
              )}

              {outlineState.error && <div className="text-red-400 mb-4">{outlineState.error}</div>}

              <div className="space-y-4">
                {outline.length > 0 ? (
                  outline.map((chapter) => (
                    <div key={chapter.number} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="inline-block bg-slate-900 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                            第 {chapter.number} 章
                          </span>
                          <h4 className="text-xl font-bold text-white">{chapter.title}</h4>
                        </div>
                        <div className="flex gap-2">
                           <span className={`px-2 py-1 rounded text-xs font-medium border ${
                             chapter.pacing === '快' ? 'border-red-900/50 bg-red-900/20 text-red-400' :
                             chapter.pacing === '中' ? 'border-yellow-900/50 bg-yellow-900/20 text-yellow-400' :
                             'border-blue-900/50 bg-blue-900/20 text-blue-400'
                           }`}>
                             {chapter.pacing} 节奏
                           </span>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-4">{chapter.summary}</p>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-indigo-400 text-sm font-bold mr-2">关键爽点/事件:</span>
                        <span className="text-slate-400 text-sm">{chapter.keyEvent}</span>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                     <p className="text-slate-500">暂无大纲。</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Character Lab */}
          {activeTab === 'characters' && (
            <div className="animate-fade-in-up">
              <SectionHeader 
                title="角色设定" 
                subtitle="打造令人印象深刻的主角和反派。" 
              />

              <div className="flex flex-wrap gap-4 mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700 items-center">
                 <select 
                  value={newCharRole}
                  onChange={(e) => setNewCharRole(e.target.value)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 outline-none"
                 >
                   <option value="主角">主角</option>
                   <option value="反派">反派 (富二代/宗门天骄)</option>
                   <option value="反派">反派 (老怪物)</option>
                   <option value="女主">女主角</option>
                   <option value="死党">胖子死党</option>
                   <option value="配角">关键配角</option>
                 </select>

                 {/* Outline Checkbox */}
                 {outline.length > 0 && (
                   <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={useOutlineForChar} 
                        onChange={(e) => setUseOutlineForChar(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                      />
                      <span>参考现有大纲</span>
                   </label>
                 )}

                 <LoadingButton 
                    isLoading={charState.isLoading} 
                    onClick={handleGenerateCharacter}
                    icon={Users}
                    className="bg-purple-600 hover:bg-purple-500 text-white ml-auto"
                  >
                    生成角色
                  </LoadingButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {characters.map((char, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Users size={64} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-white">{char.name}</h3>
                        <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-300 uppercase">
                          {char.role}
                        </span>
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        <div>
                          <span className="text-slate-500 block mb-1">原型模板</span>
                          <span className="text-indigo-300 font-medium">{char.archetype}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">性格特征</span>
                          <p className="text-slate-300">{char.personality}</p>
                        </div>
                        {char.cheat_ability && (
                          <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                            <span className="text-indigo-400 block mb-1 font-bold">特殊能力/金手指</span>
                            <p className="text-indigo-200">{char.cheat_ability}</p>
                          </div>
                        )}
                         <div>
                          <span className="text-slate-500 block mb-1">背景故事</span>
                          <p className="text-slate-400 leading-relaxed">{char.backstory}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {characters.length === 0 && (
                   <div className="col-span-full text-center py-12 text-slate-500">
                     暂无角色数据。
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Writer's Studio */}
          {activeTab === 'write' && (
            <div className="h-full flex flex-col animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-white">写作助手</h2>
                 <div className="flex gap-2">
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.md"
                    />
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 hover:border-indigo-500" 
                      title="导入本地文件 (txt/md)"
                    >
                       <Upload size={18} />
                       <span className="hidden sm:inline text-sm font-medium">导入</span>
                    </button>

                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 hover:border-emerald-500" 
                      title="导出为TXT"
                    >
                       <Download size={18} />
                       <span className="hidden sm:inline text-sm font-medium">导出</span>
                    </button>

                    <button 
                      onClick={() => handleSave()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg shadow-indigo-900/20" 
                      title="保存到浏览器存储"
                    >
                       <Save size={18} />
                       <span className="hidden sm:inline text-sm font-medium">保存</span>
                    </button>
                 </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
                 <div className="flex-1 relative flex flex-col">
                    <textarea
                      ref={editorRef}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="开始撰写你的传奇…… 或者让AI帮你开头。"
                      className="w-full flex-1 bg-slate-800 text-slate-200 p-6 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed font-serif text-lg shadow-inner"
                    />
                    {editorState.isLoading && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <div className="bg-slate-800 px-6 py-4 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-3">
                           <Loader2 className="animate-spin text-indigo-500" />
                           <span className="font-medium text-slate-200">AI 正在码字中...</span>
                        </div>
                      </div>
                    )}
                 </div>

                 {/* AI Toolbar */}
                 <div className="w-full md:w-80 flex flex-col gap-3 overflow-y-auto pr-1">
                    {/* Zhuque AI Panel */}
                    <div className={`bg-slate-800 rounded-xl border relative overflow-hidden transition-all ${zhuqueState.result ? 'border-orange-500/40 shadow-orange-500/10 shadow-lg' : 'border-orange-500/20'}`}>
                       {!zhuqueState.result ? (
                         <div className="p-4">
                           <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full pointer-events-none"></div>
                           <h3 className="text-sm font-bold text-orange-400 uppercase mb-4 flex items-center gap-2">
                             <Flame size={16} fill="currentColor" /> 朱雀检测 (Zhuque)
                           </h3>
                           <div className="space-y-3">
                             <p className="text-xs text-slate-400">检测你的文本是否过于“AI化”，并提供网文优化建议。</p>
                             <button 
                               onClick={handleZhuqueCheck}
                               disabled={zhuqueState.isLoading}
                               className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                             >
                               {zhuqueState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Flame size={16} />}
                               开始检测
                             </button>
                             {zhuqueState.error && <div className="text-red-400 text-xs">{zhuqueState.error}</div>}
                           </div>
                         </div>
                       ) : (
                         <div className="flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                              <div className="flex items-center justify-between mb-2">
                                 <h3 className="text-sm font-bold text-orange-400 uppercase flex items-center gap-2">
                                   <Flame size={16} fill="currentColor" /> 检测报告
                                 </h3>
                                 <div className={`text-xl font-bold ${zhuqueState.result.score > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                                   {zhuqueState.result.score}分
                                 </div>
                              </div>
                              
                              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden mb-3">
                                 <div 
                                   className={`h-full transition-all duration-1000 ${zhuqueState.result.score > 60 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                   style={{ width: `${zhuqueState.result.score}%` }}
                                 ></div>
                              </div>
                              <div className="text-center text-sm font-medium text-white bg-slate-800 py-1 rounded border border-slate-700">
                                {zhuqueState.result.verdict}
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                               {/* Traits */}
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-emerald-900/20 p-2 rounded border border-emerald-500/20">
                                     <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                                        <User size={12} /> 人工特征
                                     </div>
                                     <ul className="text-[10px] text-emerald-200 list-disc pl-3 space-y-0.5">
                                        {zhuqueState.result.humanTraits.map((t,i) => <li key={i}>{t}</li>)}
                                     </ul>
                                  </div>
                                  <div className="bg-red-900/20 p-2 rounded border border-red-500/20">
                                     <div className="flex items-center gap-1 text-red-400 text-xs font-bold mb-1">
                                        <Bot size={12} /> AI特征/疑似
                                     </div>
                                     <ul className="text-[10px] text-red-200 list-disc pl-3 space-y-0.5">
                                        {zhuqueState.result.aiTraits.map((t,i) => <li key={i}>{t}</li>)}
                                     </ul>
                                  </div>
                               </div>

                               {/* Suggestions */}
                               <div className="space-y-3">
                                  <div className="text-xs text-slate-500 font-bold uppercase sticky top-0 bg-slate-800 py-1">具体优化建议</div>
                                  {zhuqueState.result.suggestions
                                    .map((s, i) => ({ s, originalIndex: i })) // Keep track of original index
                                    .filter(({ originalIndex }) => !zhuqueState.ignoredIndices.includes(originalIndex))
                                    .map(({ s, originalIndex }) => (
                                      <SuggestionItem 
                                        key={originalIndex} 
                                        s={s} 
                                        onJump={jumpToText}
                                        onReplace={replaceText}
                                        onIgnore={() => ignoreSuggestion(originalIndex)}
                                      />
                                  ))}
                                  {zhuqueState.result.suggestions.length === zhuqueState.ignoredIndices.length && (
                                    <div className="text-center text-slate-500 text-xs py-4">没有更多建议了 🎉</div>
                                  )}
                               </div>
                            </div>
                            
                            <div className="p-3 border-t border-slate-700 bg-slate-900/30">
                              <button 
                                onClick={() => setZhuqueState(prev => ({ ...prev, result: null, ignoredIndices: [] }))}
                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <RefreshCcw size={14} /> 继续检测 / 重新分析
                              </button>
                            </div>
                         </div>
                       )}
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                         <Wand2 size={16} /> AI 工具箱
                       </h3>
                       
                       <div className="space-y-3">
                          <button 
                            onClick={() => handleEditorAssist('continue')}
                            disabled={editorState.isLoading}
                            className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group"
                          >
                             <PenTool size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                             <span>智能续写</span>
                          </button>
                          
                          <button 
                            onClick={() => handleEditorAssist('polish')}
                            disabled={editorState.isLoading}
                            className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group"
                          >
                             <Sparkles size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                             <span>文笔润色 (更"爽")</span>
                          </button>

                          <button 
                            onClick={() => handleEditorAssist('describe')}
                            disabled={editorState.isLoading}
                            className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group"
                          >
                             <ScrollText size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                             <span>场景/打斗描写</span>
                          </button>
                       </div>
                    </div>

                    {currentIdea && (
                      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-1 overflow-y-auto min-h-[150px]">
                         <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">设定备忘录</h3>
                         <div className="text-xs space-y-4 text-slate-400">
                            <div>
                               <strong className="text-slate-300 block">金手指:</strong>
                               {currentIdea.goldfinger}
                            </div>
                            <div>
                               <strong className="text-slate-300 block">核心看点:</strong>
                               {currentIdea.hook}
                            </div>
                            {characters.length > 0 && (
                               <div>
                                  <strong className="text-slate-300 block mb-1">主要角色:</strong>
                                  <ul className="list-disc pl-4 space-y-1">
                                     {characters.map(c => <li key={c.name}>{c.name} ({c.role})</li>)}
                                  </ul>
                                </div>
                            )}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}