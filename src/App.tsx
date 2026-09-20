import React, { useState } from 'react';
import { Download, Code2, Activity, MessageSquare, Plus, Play, Settings, Key, Zap, CheckCircle2, Circle, Send, Gamepad2, Box, Layers, PlayCircle, Terminal, FileCode2, Sparkles, Wand2 } from 'lucide-react';

type Mode = 'model' | 'api' | 'game' | null;

type ApiKeyEntry = {
  id: string;
  name: string;
  key: string;
  isMain: boolean;
};

type Model = {
  id: string;
  name: string;
  source: 'local' | 'huggingface';
};

const mikQModels: Model[] = [
  { id: '1', name: 'Llama-2-7b-chat', source: 'huggingface' },
  { id: '2', name: 'Mistral-7B-v0.1', source: 'huggingface' },
  { id: '3', name: 'Local-Custom-Model', source: 'local' },
];

function App() {
  const [appMode, setAppMode] = useState<Mode>(null);
  const [templateName, setTemplateName] = useState('');
  const [isTemplateCreated, setIsTemplateCreated] = useState(false);

  // Model Mode State
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [codeEditorContent, setCodeEditorContent] = useState('// Your fine-tuning configuration here\n');
  const [mainChatInput, setMainChatInput] = useState('');
  const [mainChatMessages, setMainChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [trainerChatInput, setTrainerChatInput] = useState('');
  const [trainerChatMessages, setTrainerChatMessages] = useState<{role: 'user' | 'trainer', text: string}[]>([
    { role: 'trainer', text: 'Witaj! Jestem twoim asystentem do fine-tuningu. Powiedz mi co chcesz osiągnąć, a ja zajmę się konfiguracją i rozpocznę proces.' }
  ]);
  const [trainerModel, setTrainerModel] = useState('GPT-4 (API)');

  // API Mode & Game Mode State (Shared API keys)
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newApiName, setNewApiName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  // API Mode specific
  const [taskInput, setTaskInput] = useState('');
  const [taskLogs, setTaskLogs] = useState<{agent: string, message: string, type: 'info' | 'task' | 'subtask' | 'done'}[]>([]);
  const [apiLeftTab, setApiLeftTab] = useState<'config' | 'code'>('config');
  const [apiGeneratedCode, setApiGeneratedCode] = useState('// Oczekuję na zlecenie zadania dla API...\n');

  // Game Mode specific
  const [gameChatInput, setGameChatInput] = useState('');
  const [gameChatLogs, setGameChatLogs] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Zainicjowano zintegrowany silnik Godot. Skonfiguruj API, aby AI mogło przejąć pełną kontrolę nad scenami i skryptami. Co tworzymy?' }
  ]);
  const [godotConsole, setGodotConsole] = useState<string[]>(['Godot Engine v4.2.1.stable.official', 'OpenGL API 3.3.0', 'Project "Untitled" loaded.']);
  const [godotScene, setGodotScene] = useState<'empty' | 'player' | 'level'>('empty');
  const [isAiWorking, setIsAiWorking] = useState(false);

  const handleCreateTemplate = () => {
    if (appMode === 'model' && templateName && selectedModel) {
      setIsTemplateCreated(true);
    } else if ((appMode === 'api' || appMode === 'game') && templateName) {
      setIsTemplateCreated(true);
    }
  };

  const handleAddApiKey = () => {
    if (newApiName && newApiKey) {
      setApiKeys([...apiKeys, {
        id: Date.now().toString(),
        name: newApiName,
        key: newApiKey,
        isMain: apiKeys.length === 0 // First one is main by default
      }]);
      setNewApiName('');
      setNewApiKey('');
    }
  };

  const setMainApi = (id: string) => {
    setApiKeys(apiKeys.map(api => ({
      ...api,
      isMain: api.id === id
    })));
  };

  const handleDownloadModel = () => {
    if (downloadProgress > 0) return; // Prevent multiple clicks

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsModelDownloaded(true), 300);
      }
    }, 200);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([apiGeneratedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_code.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chat handlers (Model mode)
  const handleTrainerChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerChatInput.trim()) return;

    setTrainerChatMessages([...trainerChatMessages, { role: 'user', text: trainerChatInput }]);

    setTimeout(() => {
      let response = '';
      if (trainerChatInput.toLowerCase().includes('start') || trainerChatInput.toLowerCase().includes('fine tuning') || trainerChatInput.toLowerCase().includes('trenuj')) {
        response = `Zrozumiałem. Zaktualizowałem konfigurację, by wy-finetunować ${selectedModel?.name} według Twoich wytycznych. Rozpoczynam proces treningu...`;
        setIsTraining(true);
        setCodeEditorContent(prev => prev + '\n// Dodane przez Asystenta Treningu:\nconst learningRate = 2e-5;\nconst epochs = 3;\nawait model.train(dataset, { learningRate, epochs });');
      } else {
        response = `Pomogę z tym. Podaj więcej szczegółów na temat datasetu lub konkretnych zachowań, których model ma się nauczyć.`;
      }
      setTrainerChatMessages(prev => [...prev, { role: 'trainer', text: response }]);
    }, 1000);

    setTrainerChatInput('');
  };

  const handleMainChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainChatInput.trim()) return;

    setMainChatMessages([...mainChatMessages, { role: 'user', text: mainChatInput }]);

    setTimeout(() => {
      setMainChatMessages(prev => [...prev, { role: 'model', text: `[${selectedModel?.name} (Fine-tuned)] Odpowiedź: "${mainChatInput}"` }]);
    }, 800);

    setMainChatInput('');
  };

  // Task Handler (API mode)
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const mainApi = apiKeys.find(a => a.isMain);
    const workerApis = apiKeys.filter(a => !a.isMain);
    const taskText = taskInput;
    setTaskInput('');

    setTaskLogs(prev => [...prev, { agent: 'User', message: taskText, type: 'task' }]);

    setTimeout(() => {
      setTaskLogs(prev => [...prev, { agent: mainApi?.name || 'Główne API', message: `Analizuję zadanie i rozbijam na podzadania...`, type: 'info' }]);

      const finalizeTask = () => {
         setTaskLogs(prev => [...prev, { agent: 'System', message: `Wszystkie podzadania zostały zakończone i scalone. Wygenerowano kod!`, type: 'done' }]);
         setApiGeneratedCode(`// Wygenerowany kod przez ${mainApi?.name}\n\nfunction performTask() {\n  console.log("Task finished!");\n  // Generated implementation for: ${taskText}\n}\n\nexport default performTask;`);
         setApiLeftTab('code');
      };

      if (workerApis.length > 0) {
        setTimeout(() => {
          workerApis.forEach((api, idx) => {
            setTimeout(() => {
              setTaskLogs(prev => [...prev, { agent: mainApi?.name || 'Główne API', message: `Deleguję podzadanie ${idx + 1} do ${api.name}`, type: 'subtask' }]);
            }, idx * 1000);
          });

          setTimeout(finalizeTask, workerApis.length * 1000 + 1500);
        }, 1500);
      } else {
        setTimeout(() => {
           setTaskLogs(prev => [...prev, { agent: mainApi?.name || 'Główne API', message: `Wykonuję zadanie samodzielnie (brak przypisanych innych API)...`, type: 'info' }]);
           setTimeout(finalizeTask, 2000);
        }, 1000);
      }
    }, 800);
  };

  // Game Handler (Game mode)
  const handleGameChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameChatInput.trim() || !apiKeys.some(a => a.isMain)) return;

    const mainApi = apiKeys.find(a => a.isMain);
    setGameChatLogs(prev => [...prev, { role: 'user', text: gameChatInput }]);
    const input = gameChatInput.toLowerCase();
    setGameChatInput('');
    setIsAiWorking(true);

    setTimeout(() => {
       setGameChatLogs(prev => [...prev, { role: 'ai', text: `[${mainApi?.name}] Przetwarzam Twoją prośbę. Modyfikuję projekt w Godot...` }]);

       setTimeout(() => {
         if (input.includes('gracz') || input.includes('player') || input.includes('postac')) {
           setGodotScene('player');
           setGodotConsole(prev => [...prev, 'AI: Generating Player.tscn', 'AI: Writing script res://Player.gd', 'Scene changed to Player.tscn']);
           setGameChatLogs(prev => [...prev, { role: 'ai', text: `[${mainApi?.name}] Utworzono scenę gracza z kontrolerem ruchu (KinematicBody2D). Dodałem też skrypt Player.gd.` }]);
         } else if (input.includes('level') || input.includes('poziom') || input.includes('mapa')) {
           setGodotScene('level');
           setGodotConsole(prev => [...prev, 'AI: Generating Level1.tscn', 'AI: Placing TileMap nodes', 'Scene changed to Level1.tscn']);
           setGameChatLogs(prev => [...prev, { role: 'ai', text: `[${mainApi?.name}] Wygenerowano podstawowy poziom z TileMap. Gracz może się teraz po nim poruszać.` }]);
         } else {
           setGodotConsole(prev => [...prev, 'AI: Compiling scripts...', 'Build successful.']);
           setGameChatLogs(prev => [...prev, { role: 'ai', text: `[${mainApi?.name}] Zaktualizowano skrypty w projekcie według instrukcji.` }]);
         }
         setIsAiWorking(false);
       }, 2000);
    }, 1000);
  };


  // --- RENDERING ---

  if (!appMode) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center font-sans p-4 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="max-w-5xl w-full relative z-10 animate-fade-in-up">
           <div className="text-center mb-16">
             <div className="flex items-center justify-center gap-3 mb-6">
               <div className="relative">
                 <Activity className="w-14 h-14 text-blue-500" />
                 <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-bounce" />
               </div>
               <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tighter">mikQ Studio</h1>
             </div>
             <p className="text-gray-400 text-xl font-light">Wybierz architekturę dla swojego nowego projektu</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <button
                onClick={() => setAppMode('model')}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] text-left flex flex-col"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                  <Activity className="w-32 h-32 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  Model AI
                </h3>
                <p className="text-gray-400 flex-1 leading-relaxed">Trenuj i fine-tuninguj modele AI z użyciem potężnego, 4-okienkowego interfejsu. Idealne do tworzenia własnych LLM.</p>
              </button>

              <button
                onClick={() => setAppMode('api')}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-emerald-500/50 p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] text-left flex flex-col"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                  <Zap className="w-32 h-32 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  Szablon API
                </h3>
                <p className="text-gray-400 flex-1 leading-relaxed">Podłącz wiele kluczy API i zlecaj złożone zadania Głównemu modelowi, który wygeneruje kod z pomocą sub-agentów.</p>
              </button>

              <button
                onClick={() => setAppMode('game')}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-pink-500/50 p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.2)] text-left flex flex-col"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
                  <Gamepad2 className="w-32 h-32 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  Szablon dla Gier
                </h3>
                <p className="text-gray-400 flex-1 leading-relaxed">Wbudowany Godot Engine z pełną integracją AI. Zleć modelowi budowę scen i pisanie skryptów w czasie rzeczywistym.</p>
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (!isTemplateCreated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 to-gray-950">
        <div className="bg-gray-900/70 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-gray-800 animate-fade-in-up">
          <button onClick={() => setAppMode(null)} className="text-sm text-gray-400 hover:text-white mb-8 flex items-center gap-1 transition-colors">
             &larr; Wróć
          </button>

          <div className="flex flex-col items-center mb-8 text-center">
            <div className={`p-4 rounded-2xl mb-4 ${
              appMode === 'model' ? 'bg-blue-500/10 text-blue-500' :
              appMode === 'api' ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-pink-500/10 text-pink-500'
            }`}>
              {appMode === 'model' && <Activity className="w-10 h-10" />}
              {appMode === 'api' && <Zap className="w-10 h-10" />}
              {appMode === 'game' && <Gamepad2 className="w-10 h-10" />}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Konfiguracja Szablonu</h1>
            <p className="text-gray-400 mt-2">Podaj podstawowe informacje o projekcie.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nazwa projektu</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={`w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 text-white transition-all shadow-inner ${
                  appMode === 'game' ? 'focus:border-pink-500 focus:ring-pink-500/20' :
                  appMode === 'api' ? 'focus:border-emerald-500 focus:ring-emerald-500/20' :
                  'focus:border-blue-500 focus:ring-blue-500/20'
                }`}
                placeholder={appMode === 'game' ? "np. CyberQuest" : "np. Project Alpha"}
              />
            </div>

            {appMode === 'model' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-300 mb-2">Model bazowy</label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-950/50 border border-gray-700 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white appearance-none transition-all shadow-inner cursor-pointer"
                    onChange={(e) => setSelectedModel(mikQModels.find(m => m.id === e.target.value) || null)}
                    defaultValue=""
                  >
                    <option value="" disabled>Wybierz źródło (Hugging Face / Dysk)...</option>
                    {mikQModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.source === 'local' ? 'Dysk Lokalny' : 'Hugging Face'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateTemplate}
              disabled={!templateName || (appMode === 'model' && !selectedModel)}
              className={`w-full font-medium py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl mt-8
                ${(!templateName || (appMode === 'model' && !selectedModel))
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : appMode === 'api'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:-translate-y-1 hover:shadow-emerald-900/50'
                    : appMode === 'game'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white hover:-translate-y-1 hover:shadow-pink-900/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white hover:-translate-y-1 hover:shadow-blue-900/50'
                }`}
            >
              Rozpocznij Projekt <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- REUSABLE API CONFIG SIDEBAR FOR API & GAME MODE ---
  const ApiConfigSidebar = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl h-full flex flex-col animate-fade-in">
      <h3 className={`font-semibold text-lg flex items-center gap-2 mb-6 text-white`}>
        <Key className={`w-5 h-5 ${appMode === 'game' ? 'text-pink-400' : 'text-emerald-400'}`} /> Konfiguracja API
      </h3>

      <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {apiKeys.map((api, idx) => (
          <div key={api.id} className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 animate-slide-in-right ${
            api.isMain
              ? (appMode === 'game' ? 'bg-pink-950/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]')
              : 'bg-gray-950 border-gray-800 hover:border-gray-600 hover:bg-gray-900'
          }`} onClick={() => setMainApi(api.id)} style={{animationDelay: `${idx * 0.1}s`}}>
            <div>
              <div className="font-medium text-sm text-gray-200">{api.name}</div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                {api.key.substring(0,4)}...{api.key.substring(api.key.length-4)}
              </div>
            </div>
            {api.isMain ? (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                appMode === 'game' ? 'text-pink-400 bg-pink-400/10' : 'text-emerald-400 bg-emerald-400/10'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> MAIN
              </div>
            ) : (
              <Circle className="w-4 h-4 text-gray-600" />
            )}
          </div>
        ))}
        {apiKeys.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-950/50 rounded-xl border border-gray-800 border-dashed flex flex-col items-center gap-2">
            <Key className="w-8 h-8 opacity-20" />
            Brak skonfigurowanych kluczy API.
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-5 mt-auto">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Dodaj nowe API</h4>
        <div className="space-y-3">
          <input
            type="text" placeholder="Nazwa (np. OpenAI)"
            value={newApiName} onChange={e => setNewApiName(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
          />
          <input
            type="password" placeholder="Klucz API"
            value={newApiKey} onChange={e => setNewApiKey(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500 transition-colors"
          />
          <button onClick={handleAddApiKey} disabled={!newApiName || !newApiKey} className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2">
            <Plus className="w-4 h-4" /> Dodaj API
          </button>
        </div>
      </div>
    </div>
  );


  // GAME WORKSPACE
  if (appMode === 'game') {
    const mainApi = apiKeys.find(a => a.isMain);

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans h-screen">
        <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Gamepad2 className="w-6 h-6 text-pink-500 animate-pulse" />
               <span className="font-bold text-xl text-white tracking-tight">mikQ <span className="font-light text-gray-400">Game</span></span>
            </div>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <span className="font-medium text-pink-50">{templateName}</span>
          </div>
          {mainApi && (
            <div className="flex items-center gap-2 text-sm bg-pink-950/50 text-pink-400 px-4 py-1.5 rounded-full border border-pink-900/50 shadow-inner">
              <Zap className="w-4 h-4" /> AI: <strong>{mainApi.name}</strong>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 flex gap-4 min-h-0 overflow-hidden">
          {/* Left Column: API & Chat */}
          <div className="w-[380px] flex flex-col gap-4 shrink-0 h-full overflow-hidden">
            <div className="h-2/5 min-h-[300px]">
              <ApiConfigSidebar />
            </div>

            {/* AI Chat Command Interface */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="bg-gray-800/80 p-4 border-b border-gray-800 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Terminal Godot AI</h3>
              </div>
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-950/50 custom-scrollbar">
                 {!mainApi ? (
                   <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3">
                     <Wand2 className="w-12 h-12 opacity-20" />
                     <p className="text-sm">Skonfiguruj i wybierz Główne API,<br/>aby aktywować asystenta.</p>
                   </div>
                 ) : (
                   gameChatLogs.map((log, idx) => (
                     <div key={idx} className={`p-3.5 rounded-2xl text-sm leading-relaxed animate-scale-in ${
                       log.role === 'user'
                         ? 'bg-pink-900/30 border border-pink-900/50 ml-4 rounded-tr-sm text-pink-50'
                         : 'bg-gray-800 border border-gray-700 mr-4 text-gray-300 rounded-tl-sm'
                     }`}>
                       {log.text}
                     </div>
                   ))
                 )}
                 {isAiWorking && (
                   <div className="flex gap-2 items-center p-3 text-pink-400/70 mr-4 bg-gray-800/50 rounded-2xl rounded-tl-sm w-fit border border-gray-800">
                     <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                 )}
              </div>
              <form onSubmit={handleGameChatSubmit} className="p-4 border-t border-gray-800 bg-gray-900 relative">
                <input
                  type="text"
                  value={gameChatInput}
                  onChange={(e) => setGameChatInput(e.target.value)}
                  placeholder={mainApi ? "Napisz 'Dodaj gracza'..." : "Skonfiguruj API..."}
                  disabled={!mainApi || isAiWorking}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-pink-500 text-white disabled:opacity-50 transition-colors"
                />
                <button type="submit" disabled={!mainApi || isAiWorking || !gameChatInput.trim()} className="absolute right-6 top-1/2 -translate-y-1/2 text-pink-500 disabled:text-gray-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Embedded Godot Mock */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-fade-in" style={{animationDelay: '0.2s'}}>
             <div className="bg-[#242930] p-2 border-b border-[#1b1f24] flex items-center justify-between shadow-sm z-10">
                <div className="flex gap-2 px-2">
                  <button className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1d22] text-[#e0e0e0] text-xs font-semibold rounded"><Layers className="w-3.5 h-3.5 text-blue-400"/> Scene</button>
                  <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#1a1d22] text-gray-400 hover:text-[#e0e0e0] text-xs font-semibold rounded transition-colors"><Box className="w-3.5 h-3.5 text-yellow-400"/> 2D</button>
                  <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#1a1d22] text-gray-400 hover:text-[#e0e0e0] text-xs font-semibold rounded transition-colors"><Gamepad2 className="w-3.5 h-3.5 text-pink-400"/> 3D</button>
                  <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#1a1d22] text-gray-400 hover:text-[#e0e0e0] text-xs font-semibold rounded transition-colors"><Code2 className="w-3.5 h-3.5 text-gray-400"/> Script</button>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <button className="text-gray-400 hover:text-green-400 transition-colors hover:scale-110 transform"><PlayCircle className="w-6 h-6" /></button>
                </div>
             </div>

             {/* Viewport */}
             <div className="flex-1 bg-[#1a1d22] relative overflow-hidden flex items-center justify-center">
                {godotScene === 'empty' && (
                  <div className="text-[#3b4149] text-2xl font-bold flex flex-col items-center animate-pulse-slow">
                    <Box className="w-32 h-32 mb-6 opacity-30" />
                    Empty Scene
                  </div>
                )}
                {godotScene === 'player' && (
                  <div className="relative w-full h-full animate-fade-in">
                    {/* Mock Grid */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJiMzAzOCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
                    {/* Mock Player Node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce-short">
                       <div className="w-16 h-16 bg-blue-500 rounded-md border-2 border-blue-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] relative">
                         <div className="absolute -top-7 text-[10px] text-blue-300 font-mono bg-[#242930] px-2 py-0.5 rounded border border-[#1b1f24] shadow-sm">KinematicBody2D</div>
                         <Gamepad2 className="w-8 h-8 text-white opacity-90" />
                       </div>
                    </div>
                  </div>
                )}
                {godotScene === 'level' && (
                  <div className="relative w-full h-full bg-[#2c353d] animate-fade-in">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJiMzAzOCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                    {/* Mock Tilemap Platform */}
                    <div className="absolute bottom-1/4 left-10 right-10 h-16 bg-emerald-800 border-t-4 border-emerald-500 flex items-center px-4 overflow-hidden rounded-sm shadow-xl">
                       <div className="text-[10px] text-emerald-300 font-mono bg-black/30 px-2 py-1 rounded">TileMap (Ground)</div>
                    </div>
                    <div className="absolute bottom-[calc(25%+4rem)] left-32">
                       <div className="w-12 h-12 bg-blue-500 rounded-md border-2 border-blue-300 shadow-lg"></div>
                    </div>
                  </div>
                )}
             </div>

             {/* Output Console */}
             <div className="h-48 bg-[#242930] border-t border-[#1b1f24] p-2 flex flex-col z-10">
                <div className="text-[11px] text-[#b8b8b8] font-bold mb-1.5 flex items-center gap-2 uppercase tracking-wider px-1">Output</div>
                <div className="flex-1 bg-[#1a1d22] font-mono text-[11px] p-3 overflow-y-auto rounded-md border border-[#1b1f24] text-[#a0a0a0] leading-relaxed custom-scrollbar">
                  {godotConsole.map((msg, idx) => (
                    <div key={idx} className={msg.startsWith('AI:') ? 'text-pink-400 font-semibold' : ''}>
                      {msg}
                    </div>
                  ))}
                  <div ref={(el) => {el?.scrollIntoView()}} />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // API WORKSPACE
  if (appMode === 'api') {
    const mainApi = apiKeys.find(a => a.isMain);

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
        <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Zap className="w-6 h-6 text-emerald-500" />
               <span className="font-bold text-xl text-white">mikQ <span className="font-light text-gray-400">API</span></span>
            </div>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <span className="font-medium text-emerald-50">{templateName}</span>
          </div>
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-6 h-[calc(100vh-4rem)]">

          {/* Left Column: Switchable Config / Code View */}
          <div className="w-[400px] flex flex-col overflow-hidden bg-gray-900 border border-gray-800 rounded-3xl shadow-xl shrink-0 animate-fade-in">

             {/* Left Column Tabs */}
             <div className="flex border-b border-gray-800 bg-gray-900/80 p-2.5 gap-2">
               <button
                 onClick={() => setApiLeftTab('config')}
                 className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${apiLeftTab === 'config' ? 'bg-emerald-500/10 text-emerald-400 shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
               >
                 <Settings className="w-4 h-4" /> Konfiguracja
               </button>
               <button
                 onClick={() => setApiLeftTab('code')}
                 className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${apiLeftTab === 'code' ? 'bg-blue-500/10 text-blue-400 shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
               >
                 <FileCode2 className="w-4 h-4" /> Kod Wynikowy
               </button>
             </div>

             {/* Left Column Content */}
             <div className="flex-1 overflow-hidden relative">
               {apiLeftTab === 'config' ? (
                 <div className="absolute inset-0 overflow-y-auto p-6 bg-gray-900 custom-scrollbar animate-fade-in">
                   <h3 className={`font-semibold text-lg flex items-center gap-2 mb-6 text-white`}>
                     <Key className="w-5 h-5 text-emerald-400" /> Klucze API
                   </h3>

                   <div className="space-y-3 mb-8">
                     {apiKeys.map(api => (
                       <div key={api.id} className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                         api.isMain
                           ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                           : 'bg-gray-950 border-gray-800 hover:border-gray-600'
                       }`} onClick={() => setMainApi(api.id)}>
                         <div>
                           <div className="font-medium text-sm text-gray-200">{api.name}</div>
                           <div className="text-xs text-gray-500 font-mono mt-1">
                             {api.key.substring(0,4)}...{api.key.substring(api.key.length-4)}
                           </div>
                         </div>
                         {api.isMain ? (
                           <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded text-emerald-400 bg-emerald-400/10">
                             MAIN
                           </div>
                         ) : (
                           <Circle className="w-4 h-4 text-gray-600" />
                         )}
                       </div>
                     ))}
                     {apiKeys.length === 0 && (
                       <div className="text-sm text-gray-500 text-center py-6 bg-gray-950/50 rounded-xl border border-gray-800 border-dashed">
                         Brak dodanych kluczy.
                       </div>
                     )}
                   </div>

                   <div className="border-t border-gray-800 pt-6">
                     <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Dodaj nowe API</h4>
                     <div className="space-y-4">
                       <input
                         type="text" placeholder="Nazwa (np. OpenAI)"
                         value={newApiName} onChange={e => setNewApiName(e.target.value)}
                         className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                       />
                       <input
                         type="password" placeholder="Klucz API"
                         value={newApiKey} onChange={e => setNewApiKey(e.target.value)}
                         className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                       />
                       <button onClick={handleAddApiKey} disabled={!newApiName || !newApiKey} className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                         <Plus className="w-4 h-4" /> Dodaj
                       </button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col animate-fade-in">
                   <div className="flex-1 p-0 relative bg-gray-950">
                     <textarea
                       className="w-full h-full bg-transparent text-blue-100 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed custom-scrollbar"
                       value={apiGeneratedCode}
                       readOnly
                     />
                   </div>
                   <div className="p-4 border-t border-gray-800 bg-gray-900">
                     <button
                       onClick={handleDownloadCode}
                       className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                     >
                       <Download className="w-5 h-5" /> Pobierz Kod (.ts)
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Task Center */}
          <div className="flex-1 flex flex-col h-full">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="bg-gray-800/80 p-5 border-b border-gray-800 flex justify-between items-center">
                 <div>
                   <h2 className="font-semibold text-white">Centrum Zadań (Chat)</h2>
                   <p className="text-xs text-gray-400 mt-1">Zleć zadanie, Główne API zintegruje odpowiedzi i wygeneruje kod.</p>
                 </div>
                 {mainApi && (
                   <div className="flex items-center gap-2 text-sm bg-emerald-950/50 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-900/50 shadow-inner">
                     <Zap className="w-4 h-4" /> Główne API: <strong>{mainApi.name}</strong>
                   </div>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-950 custom-scrollbar">
                {taskLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                     <MessageSquare className="w-16 h-16 opacity-20" />
                     <p className="text-center">Skonfiguruj API, a następnie<br/>opisz komponent, który chcesz wygenerować.</p>
                  </div>
                ) : (
                  taskLogs.map((log, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border animate-scale-in ${
                      log.type === 'task' ? 'bg-blue-950/30 border-blue-900/50 ml-12 rounded-tr-sm' :
                      log.type === 'info' ? 'bg-gray-900 border-gray-800 mr-12' :
                      log.type === 'subtask' ? 'bg-emerald-950/20 border-emerald-900/30 mr-12 border-l-2 border-l-emerald-500' :
                      'bg-purple-950/40 border-purple-900/50 mx-6 text-center shadow-lg shadow-purple-900/20'
                    }`}>
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        {log.type === 'task' && 'Ty'}
                        {log.type === 'subtask' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {log.type !== 'task' && log.agent}
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed">{log.message}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleTaskSubmit} className="p-5 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder={mainApi ? "Napisz np. Napisz komponent przycisku w React..." : "Dodaj i wybierz Główne API..."}
                    disabled={!mainApi}
                    className="w-full bg-gray-950 border border-gray-700 rounded-2xl pl-5 pr-14 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!taskInput.trim() || !mainApi}
                    className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white p-2 rounded-xl transition-colors aspect-square flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // MODEL WORKSPACE (Original)
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <Activity className="w-6 h-6 text-blue-500" />
             <span className="font-bold text-xl tracking-tight">mikQ <span className="font-light text-gray-400">Model</span></span>
          </div>
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <span className="font-medium">{templateName}</span>
          <span className="text-xs px-3 py-1.5 bg-gray-800/80 rounded-full text-gray-300 border border-gray-700 backdrop-blur-sm shadow-inner">
            {selectedModel?.name}
          </span>
        </div>

        <div>
          {!isModelDownloaded ? (
            <button
              onClick={handleDownloadModel}
              disabled={downloadProgress > 0}
              className="relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-900/50 disabled:opacity-90 disabled:cursor-wait group"
            >
              {downloadProgress > 0 && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-blue-400/30 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              )}
              <Download className={`w-4 h-4 relative z-10 ${downloadProgress > 0 ? 'animate-bounce' : ''}`} />
              <span className="relative z-10">
                {downloadProgress > 0 ? `Pobieranie... ${downloadProgress}%` : `Pobierz model (${selectedModel?.source === 'local' ? 'Dysk' : 'Hugging Face'})`}
              </span>
            </button>
          ) : (
            <span className="text-emerald-400 flex items-center gap-2 text-sm font-medium px-6 py-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl shadow-inner animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Model Gotowy
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-6 p-6 h-[calc(100vh-4rem)]">

        {/* 1. Edytor kodu */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-xl group animate-fade-in" style={{animationDelay: '0.1s'}}>
          <div className="bg-gray-800/80 px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">1. Edytor Kodu</h3>
          </div>
          <div className="flex-1 p-0 relative">
             <textarea
               className="w-full h-full bg-gray-950 text-blue-100 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed custom-scrollbar"
               value={codeEditorContent}
               onChange={(e) => setCodeEditorContent(e.target.value)}
               disabled={!isModelDownloaded}
               placeholder={isModelDownloaded ? "Wpisz kod..." : ""}
             />
             {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center">
                 <div className="bg-gray-900 px-6 py-3 rounded-full border border-gray-800 text-sm font-medium text-gray-400 shadow-xl flex items-center gap-2">
                   <Download className="w-4 h-4" /> Wymaga pobrania modelu
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* 2. Aktualny stan */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-xl group animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="bg-gray-800/80 px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">2. Aktualny Stan</h3>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-gray-900 to-gray-950">
            {isTraining ? (
               <div className="space-y-6 w-full max-w-sm animate-fade-in">
                 <div className="relative w-24 h-24 mx-auto">
                   <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-blue-500 border-r-transparent border-t-blue-400 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                   <Activity className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                 </div>
                 <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Fine-tuning w toku</h4>
                 <p className="text-sm text-gray-400 leading-relaxed">
                   Asystent konfiguruje wagi i trenuje <strong className="text-gray-300">{selectedModel?.name}</strong>.
                 </p>
                 <div className="w-full bg-gray-950 rounded-full h-3 border border-gray-800 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full w-[45%] relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 font-mono bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
                   <span>Epoch 1/3</span>
                   <span className="text-blue-400">Loss: 0.245</span>
                 </div>
               </div>
            ) : isModelDownloaded ? (
              <div className="space-y-6 animate-scale-in">
                 <div className="w-24 h-24 bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto border border-emerald-900/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-20"></div>
                    <Play className="w-10 h-10 text-emerald-400 ml-1" />
                 </div>
                 <div>
                   <h4 className="text-xl font-bold text-gray-200 mb-2">Gotowy do treningu</h4>
                   <p className="text-sm text-gray-500 max-w-[250px] mx-auto">Napisz do asystenta (okno 4), aby zdefiniować dataset i rozpocząć proces.</p>
                 </div>
              </div>
            ) : (
              <div className="space-y-4 text-gray-600">
                <Download className="w-16 h-16 mx-auto opacity-20 mb-4" />
                <p className="text-sm font-medium">Oczekuje na pobranie modelu z paska narzędzi...</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Chat z modelem (testowanie) */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-xl group relative animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="bg-gray-800/80 px-5 py-4 border-b border-gray-800 flex items-center gap-2 z-10">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">3. Testuj Model</h3>
          </div>
          <div className="flex-1 flex flex-col relative bg-gray-950">
            {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-20 flex items-center justify-center">
                 <div className="bg-gray-900 px-6 py-3 rounded-full border border-gray-800 text-sm font-medium text-gray-400 shadow-xl">
                   Pobierz model, aby testować
                 </div>
               </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {mainChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm animate-scale-in ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleMainChatSubmit} className="p-4 border-t border-gray-800 bg-gray-900 z-10">
              <input
                type="text"
                value={mainChatInput}
                onChange={(e) => setMainChatInput(e.target.value)}
                placeholder={`Napisz do ${selectedModel?.name || 'modelu'}...`}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white shadow-inner transition-all"
                disabled={!isModelDownloaded}
              />
            </form>
          </div>
        </div>

        {/* 4. Chat z modelem trenerem */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-xl group relative border-t-[4px] border-t-orange-500 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="bg-gray-800/80 px-5 py-4 border-b border-gray-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-semibold tracking-wide text-gray-200">4. Asystent Treningu</h3>
            </div>
            <select
              value={trainerModel}
              onChange={(e) => setTrainerModel(e.target.value)}
              className="bg-gray-950 border border-gray-700 text-xs rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none focus:border-orange-500 shadow-inner appearance-none cursor-pointer"
            >
              <option>GPT-4 (API)</option>
              <option>Claude 3 (API)</option>
              <option>Local Code Model</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col relative bg-gray-950">
             {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-20 flex items-center justify-center">
                 <div className="bg-gray-900 px-6 py-3 rounded-full border border-gray-800 text-sm font-medium text-gray-400 shadow-xl">
                   Pobierz model przed konfiguracją
                 </div>
               </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {trainerChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm animate-scale-in ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-tr-sm'
                      : 'bg-gray-900 text-orange-50 border border-orange-900/30 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTrainerChatSubmit} className="p-4 border-t border-gray-800 bg-gray-900 z-10 relative">
              <input
                type="text"
                value={trainerChatInput}
                onChange={(e) => setTrainerChatInput(e.target.value)}
                placeholder="Np. 'Zacznij trenować model'..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white shadow-inner transition-all"
                disabled={!isModelDownloaded}
              />
               <button type="submit" disabled={!isModelDownloaded || !trainerChatInput.trim()} className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500 disabled:text-gray-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;