import React, { useState } from 'react';
import { Download, Code2, Activity, MessageSquare, Plus, Save, Play, Settings, Key, Zap, CheckCircle2, Circle, Send, Gamepad2, Box, Layers, PlayCircle, Terminal } from 'lucide-react';

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
    setIsModelDownloaded(true);
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

      if (workerApis.length > 0) {
        setTimeout(() => {
          workerApis.forEach((api, idx) => {
            setTimeout(() => {
              setTaskLogs(prev => [...prev, { agent: mainApi?.name || 'Główne API', message: `Deleguję podzadanie ${idx + 1} do ${api.name}`, type: 'subtask' }]);
            }, idx * 1000);
          });

          setTimeout(() => {
             setTaskLogs(prev => [...prev, { agent: 'System', message: `Wszystkie podzadania zostały zakończone i scalone przez Główne API.`, type: 'done' }]);
          }, workerApis.length * 1000 + 1500);
        }, 1500);
      } else {
        setTimeout(() => {
           setTaskLogs(prev => [...prev, { agent: mainApi?.name || 'Główne API', message: `Wykonuję zadanie samodzielnie (brak przypisanych innych API)...`, type: 'info' }]);
           setTimeout(() => {
              setTaskLogs(prev => [...prev, { agent: 'System', message: `Zadanie wykonane.`, type: 'done' }]);
           }, 2000);
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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center font-sans p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950">
        <div className="max-w-5xl w-full">
           <div className="text-center mb-12">
             <div className="flex items-center justify-center gap-3 mb-4">
               <Activity className="w-12 h-12 text-blue-500" />
               <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">mikQ Studio</h1>
             </div>
             <p className="text-gray-400 text-lg">Wybierz tryb pracy dla swojego nowego projektu</p>
           </div>

           <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setAppMode('model')}
                className="group relative bg-gray-900 border border-gray-800 hover:border-blue-500/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 text-left overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-24 h-24 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-400" /> Model AI
                </h3>
                <p className="text-gray-400 flex-1">Trenuj i fine-tuninguj modele AI z użyciem potężnego, 4-okienkowego interfejsu. Pobieraj z dysku lub Hugging Face.</p>
              </button>

              <button
                onClick={() => setAppMode('api')}
                className="group relative bg-gray-900 border border-gray-800 hover:border-emerald-500/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 text-left overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-24 h-24 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-emerald-400" /> Szablon API
                </h3>
                <p className="text-gray-400 flex-1">Podłącz wiele kluczy API, wyznacz Główne API zarządzające zadaniami i automatyzuj złożone zlecenia poprzez delegację.</p>
              </button>

              <button
                onClick={() => setAppMode('game')}
                className="group relative bg-gray-900 border border-gray-800 hover:border-pink-500/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 text-left overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Gamepad2 className="w-24 h-24 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-pink-400" /> Szablon dla Gier
                </h3>
                <p className="text-gray-400 flex-1">Wbudowany Godot Engine z pełną integracją AI. Podłącz API i zleć modelowi tworzenie skryptów oraz scen 2D/3D w czasie rzeczywistym.</p>
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (!isTemplateCreated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 to-gray-950">
        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800">
          <button onClick={() => setAppMode(null)} className="text-sm text-gray-400 hover:text-white mb-6 flex items-center gap-1 transition-colors">
             &larr; Wróć
          </button>
          <div className="flex items-center gap-3 mb-8">
            {appMode === 'model' && <Activity className="w-8 h-8 text-blue-500" />}
            {appMode === 'api' && <Zap className="w-8 h-8 text-emerald-500" />}
            {appMode === 'game' && <Gamepad2 className="w-8 h-8 text-pink-500" />}
            <h1 className="text-2xl font-bold text-white">Utwórz nowy szablon {appMode === 'api' ? 'tekstowy API' : appMode === 'game' ? 'Gry' : ''}</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nazwa szablonu / projektu</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 text-white transition-all shadow-inner focus:border-blue-500 focus:ring-blue-500"
                placeholder={appMode === 'game' ? "np. MyAwesomeGame" : "np. MyCustomProject"}
              />
            </div>

            {appMode === 'model' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Domyślny model AI</label>
                <select
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white appearance-none transition-all shadow-inner"
                  onChange={(e) => setSelectedModel(mikQModels.find(m => m.id === e.target.value) || null)}
                  defaultValue=""
                >
                  <option value="" disabled>Wybierz z dysku lub Hugging Face...</option>
                  {mikQModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.source === 'local' ? 'Dysk' : 'Hugging Face'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCreateTemplate}
              disabled={!templateName || (appMode === 'model' && !selectedModel)}
              className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg
                ${(!templateName || (appMode === 'model' && !selectedModel))
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : appMode === 'api'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    : appMode === 'game'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                }`}
            >
              <Save className="w-5 h-5" /> Utwórz i przejdź dalej
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- REUSABLE API CONFIG SIDEBAR FOR API & GAME MODE ---
  const ApiConfigSidebar = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl h-full flex flex-col">
      <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 text-white`}>
        <Key className={`w-5 h-5 ${appMode === 'game' ? 'text-pink-400' : 'text-emerald-400'}`} /> Konfiguracja API
      </h3>

      <div className="space-y-3 mb-6 flex-1 overflow-y-auto pr-2">
        {apiKeys.map(api => (
          <div key={api.id} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            api.isMain
              ? (appMode === 'game' ? 'bg-pink-950/30 border-pink-500/50' : 'bg-emerald-950/30 border-emerald-500/50')
              : 'bg-gray-950 border-gray-800 hover:border-gray-600'
          }`} onClick={() => setMainApi(api.id)}>
            <div>
              <div className="font-medium text-sm text-gray-200">{api.name}</div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                {api.key.substring(0,4)}...{api.key.substring(api.key.length-4)}
              </div>
            </div>
            {api.isMain ? (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                appMode === 'game' ? 'text-pink-400 bg-pink-400/10' : 'text-emerald-400 bg-emerald-400/10'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> GŁÓWNE
              </div>
            ) : (
              <Circle className="w-4 h-4 text-gray-600" />
            )}
          </div>
        ))}
        {apiKeys.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4 bg-gray-950 rounded-xl border border-gray-800 border-dashed">
            Brak dodanych kluczy API.
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-4 mt-auto">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dodaj nowe API</h4>
        <div className="space-y-3">
          <input
            type="text" placeholder="Nazwa (np. OpenAI)"
            value={newApiName} onChange={e => setNewApiName(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <input
            type="password" placeholder="Klucz API"
            value={newApiKey} onChange={e => setNewApiKey(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <button onClick={handleAddApiKey} disabled={!newApiName || !newApiKey} className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
            <Plus className="w-4 h-4" /> Dodaj
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
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Gamepad2 className="w-6 h-6 text-pink-500" />
               <span className="font-bold text-xl text-white">mikQ <span className="font-light text-gray-400">Game</span></span>
            </div>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <span className="font-medium text-pink-50">{templateName}</span>
          </div>
          {mainApi && (
            <div className="flex items-center gap-2 text-sm bg-pink-950/50 text-pink-400 px-3 py-1.5 rounded-lg border border-pink-900/50">
              <Zap className="w-4 h-4" /> Integracja AI: <strong>{mainApi.name}</strong>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 flex gap-4 min-h-0 overflow-hidden">
          {/* Left Column: API & Chat */}
          <div className="w-[350px] flex flex-col gap-4 shrink-0 h-full overflow-hidden">
            <div className="h-2/5 min-h-[300px]">
              <ApiConfigSidebar />
            </div>

            {/* AI Chat Command Interface */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
              <div className="bg-gray-800/80 p-3 border-b border-gray-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Terminal AI Godot</h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-950/50">
                 {!mainApi ? (
                   <div className="text-center text-sm text-gray-500 mt-10">Dodaj i ustaw Główne API w konfiguracji powyżej, aby aktywować AI.</div>
                 ) : (
                   gameChatLogs.map((log, idx) => (
                     <div key={idx} className={`p-3 rounded-xl text-sm ${
                       log.role === 'user'
                         ? 'bg-pink-900/30 border border-pink-900/50 ml-4'
                         : 'bg-gray-800 border border-gray-700 mr-4 text-gray-300'
                     }`}>
                       {log.text}
                     </div>
                   ))
                 )}
                 {isAiWorking && (
                   <div className="flex gap-1 items-center p-2 text-pink-400/70">
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                 )}
              </div>
              <form onSubmit={handleGameChatSubmit} className="p-3 border-t border-gray-800 bg-gray-900">
                <input
                  type="text"
                  value={gameChatInput}
                  onChange={(e) => setGameChatInput(e.target.value)}
                  placeholder={mainApi ? "Napisz np. 'Dodaj postać gracza'..." : "Skonfiguruj API..."}
                  disabled={!mainApi || isAiWorking}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 text-white disabled:opacity-50"
                />
              </form>
            </div>
          </div>

          {/* Right Column: Embedded Godot Mock */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
             <div className="bg-[#242930] p-2 border-b border-[#1b1f24] flex items-center justify-between shadow-sm">
                <div className="flex gap-4 px-2">
                  <div className="flex items-center gap-1 text-[#e0e0e0] text-xs font-semibold"><Layers className="w-4 h-4 text-blue-400"/> Scene</div>
                  <div className="flex items-center gap-1 text-[#e0e0e0] text-xs font-semibold"><Box className="w-4 h-4 text-yellow-400"/> 2D</div>
                  <div className="flex items-center gap-1 text-[#e0e0e0] text-xs font-semibold"><Gamepad2 className="w-4 h-4 text-pink-400"/> 3D</div>
                  <div className="flex items-center gap-1 text-[#e0e0e0] text-xs font-semibold"><Code2 className="w-4 h-4 text-gray-400"/> Script</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-green-400 transition-colors"><PlayCircle className="w-5 h-5" /></button>
                </div>
             </div>

             {/* Viewport */}
             <div className="flex-1 bg-[#1a1d22] relative overflow-hidden flex items-center justify-center">
                {godotScene === 'empty' && (
                  <div className="text-[#3b4149] text-2xl font-bold flex flex-col items-center">
                    <Box className="w-24 h-24 mb-4 opacity-50" />
                    Empty Scene
                  </div>
                )}
                {godotScene === 'player' && (
                  <div className="relative w-full h-full">
                    {/* Mock Grid */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJiMzAzOCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
                    {/* Mock Player Node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                       <div className="w-16 h-16 bg-blue-500 rounded-sm border-2 border-blue-300 flex items-center justify-center shadow-lg relative">
                         <div className="absolute -top-6 text-[10px] text-blue-300 font-mono bg-[#242930] px-1 rounded border border-[#1b1f24]">KinematicBody2D</div>
                         <Gamepad2 className="w-8 h-8 text-white opacity-80" />
                       </div>
                    </div>
                  </div>
                )}
                {godotScene === 'level' && (
                  <div className="relative w-full h-full bg-[#3a4750]">
                    {/* Mock Grid */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJiMzAzOCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
                    {/* Mock Tilemap Platform */}
                    <div className="absolute bottom-1/4 left-10 right-10 h-12 bg-green-800 border-t-4 border-green-600 flex items-center px-4 overflow-hidden">
                       <div className="text-[10px] text-green-300 font-mono">TileMap (Ground)</div>
                    </div>
                    <div className="absolute bottom-[calc(25%+3rem)] left-32">
                       <div className="w-12 h-12 bg-blue-500 rounded-sm border-2 border-blue-300 shadow-lg"></div>
                    </div>
                  </div>
                )}
             </div>

             {/* Output Console */}
             <div className="h-48 bg-[#242930] border-t border-[#1b1f24] p-2 flex flex-col">
                <div className="text-xs text-[#b8b8b8] font-semibold mb-1 flex items-center gap-2">Output</div>
                <div className="flex-1 bg-[#1a1d22] font-mono text-xs p-2 overflow-y-auto rounded border border-[#1b1f24] text-[#a0a0a0]">
                  {godotConsole.map((msg, idx) => (
                    <div key={idx} className={msg.startsWith('AI:') ? 'text-pink-400' : ''}>
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
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Zap className="w-6 h-6 text-emerald-500" />
               <span className="font-bold text-xl text-white">mikQ <span className="font-light text-gray-400">API</span></span>
            </div>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <span className="font-medium text-emerald-50">{templateName}</span>
          </div>
        </header>

        <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-1 space-y-6">
             <ApiConfigSidebar />
          </div>

          <div className="md:col-span-2 flex flex-col h-[calc(100vh-8rem)]">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
              <div className="bg-gray-800/50 p-4 border-b border-gray-800 flex justify-between items-center">
                 <div>
                   <h2 className="font-semibold text-white">Centrum Zadań</h2>
                   <p className="text-xs text-gray-400 mt-1">Zleć zadanie, Główne API podzieli je na podzadania.</p>
                 </div>
                 {mainApi && (
                   <div className="flex items-center gap-2 text-sm bg-emerald-950/50 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-900/50">
                     <Zap className="w-4 h-4" /> Aktywne Główne API: <strong>{mainApi.name}</strong>
                   </div>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950">
                {taskLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                     <Zap className="w-16 h-16 opacity-20" />
                     <p>Oczekuję na pierwsze zadanie...</p>
                  </div>
                ) : (
                  taskLogs.map((log, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${
                      log.type === 'task' ? 'bg-blue-950/30 border-blue-900/50 ml-12' :
                      log.type === 'info' ? 'bg-gray-900 border-gray-800 mr-12' :
                      log.type === 'subtask' ? 'bg-emerald-950/20 border-emerald-900/30 mr-12 border-l-2 border-l-emerald-500' :
                      'bg-purple-950/30 border-purple-900/50 mx-6 text-center'
                    }`}>
                      <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-2">
                        {log.type === 'task' && 'Ty'}
                        {log.type === 'subtask' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {log.type !== 'task' && log.agent}
                      </div>
                      <div className="text-gray-200">{log.message}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleTaskSubmit} className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder={mainApi ? "Napisz zadanie (np. Wygeneruj strukturę projektu i napisz dokumentację...)" : "Dodaj i wybierz Główne API, aby rozpocząć..."}
                    disabled={!mainApi}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!taskInput.trim() || !mainApi}
                    className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white p-2 rounded-lg transition-colors aspect-square flex items-center justify-center"
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
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center h-16 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <Activity className="w-6 h-6 text-blue-500" />
             <span className="font-bold text-xl">mikQ <span className="font-light text-gray-400">Model</span></span>
          </div>
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <span className="font-medium">{templateName}</span>
          <span className="text-xs px-2.5 py-1 bg-gray-800/80 rounded-full text-gray-300 border border-gray-700 backdrop-blur-sm shadow-inner">
            {selectedModel?.name}
          </span>
        </div>

        <div>
          {!isModelDownloaded ? (
            <button
              onClick={handleDownloadModel}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-900/50"
            >
              <Download className="w-4 h-4" /> Pobierz model z {selectedModel?.source === 'local' ? 'dysku' : 'Hugging Face'}
            </button>
          ) : (
            <span className="text-emerald-400 flex items-center gap-2 text-sm font-medium px-5 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg shadow-inner">
              <CheckCircle2 className="w-4 h-4" /> Model pobrany
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 p-4 h-[calc(100vh-64px)]">

        {/* 1. Edytor kodu */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-lg group">
          <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-800 flex items-center gap-2 group-hover:bg-gray-800 transition-colors">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">1. Edytor Kodu</h3>
          </div>
          <div className="flex-1 p-0 relative">
             <textarea
               className="w-full h-full bg-gray-950 text-blue-100 p-5 font-mono text-sm resize-none focus:outline-none leading-relaxed"
               value={codeEditorContent}
               onChange={(e) => setCodeEditorContent(e.target.value)}
               disabled={!isModelDownloaded}
               placeholder={isModelDownloaded ? "Wpisz kod..." : ""}
             />
             {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center">
                 <div className="bg-gray-900 px-6 py-3 rounded-full border border-gray-800 text-sm font-medium text-gray-400 shadow-xl">
                   Wymaga pobrania modelu
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* 2. Aktualny stan */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-lg group">
          <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-800 flex items-center gap-2 group-hover:bg-gray-800 transition-colors">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">2. Aktualny Stan</h3>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-gray-900 to-gray-950">
            {isTraining ? (
               <div className="space-y-6 w-full max-w-sm">
                 <div className="w-20 h-20 border-4 border-blue-500 border-r-transparent border-t-blue-400 rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                 <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Fine-tuning w toku</h4>
                 <p className="text-sm text-gray-400 leading-relaxed">
                   Model asystenta konfiguruje wagi i trenuje model <strong className="text-gray-300">{selectedModel?.name}</strong> na podstawie Twoich wytycznych.
                 </p>
                 <div className="w-full bg-gray-950 rounded-full h-3 border border-gray-800 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full w-[45%] relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 font-mono">
                   <span>Epoch 1/3</span>
                   <span>Loss: 0.245</span>
                 </div>
               </div>
            ) : isModelDownloaded ? (
              <div className="space-y-5">
                 <div className="w-20 h-20 bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto border border-emerald-900/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <Play className="w-8 h-8 text-emerald-400 ml-1" />
                 </div>
                 <h4 className="text-xl font-semibold text-gray-200">Gotowy do treningu</h4>
                 <p className="text-sm text-gray-500 max-w-xs mx-auto">Skorzystaj z czatu z asystentem (okno 4), aby zdefiniować zadanie i rozpocząć proces fine-tuningu.</p>
              </div>
            ) : (
              <div className="space-y-4 text-gray-600">
                <Download className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-sm font-medium">Oczekuje na pobranie modelu...</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Chat z modelem (testowanie) */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-lg group relative">
          <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-800 flex items-center gap-2 group-hover:bg-gray-800 transition-colors z-10">
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

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {mainChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
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
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white shadow-inner transition-all"
                disabled={!isModelDownloaded}
              />
            </form>
          </div>
        </div>

        {/* 4. Chat z modelem trenerem */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-lg group relative border-t-[3px] border-t-orange-500">
          <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-800 flex items-center justify-between group-hover:bg-gray-800 transition-colors z-10">
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

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {trainerChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-tr-sm'
                      : 'bg-gray-900 text-orange-50 border border-orange-900/30 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTrainerChatSubmit} className="p-4 border-t border-gray-800 bg-gray-900 z-10">
              <input
                type="text"
                value={trainerChatInput}
                onChange={(e) => setTrainerChatInput(e.target.value)}
                placeholder="Napisz asystentowi jak fine-tuningować model..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white shadow-inner transition-all"
                disabled={!isModelDownloaded}
              />
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;