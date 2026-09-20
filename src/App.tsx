import React, { useState } from 'react';
import { Download, Code2, Activity, MessageSquare, Plus, Save, Play, Settings } from 'lucide-react';

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
  const [templateName, setTemplateName] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isTemplateCreated, setIsTemplateCreated] = useState(false);
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const [codeEditorContent, setCodeEditorContent] = useState('// Your fine-tuning configuration here\n');
  const [mainChatInput, setMainChatInput] = useState('');
  const [mainChatMessages, setMainChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);

  const [trainerChatInput, setTrainerChatInput] = useState('');
  const [trainerChatMessages, setTrainerChatMessages] = useState<{role: 'user' | 'trainer', text: string}[]>([
    { role: 'trainer', text: 'Hello! I am your trainer assistant model. Tell me what you want to achieve with fine-tuning, and I will help configure and start the process.' }
  ]);
  const [trainerModel, setTrainerModel] = useState('GPT-4 (API)');

  const handleCreateTemplate = () => {
    if (templateName && selectedModel) {
      setIsTemplateCreated(true);
    }
  };

  const handleDownloadModel = () => {
    setIsModelDownloaded(true);
  };

  const handleTrainerChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerChatInput.trim()) return;

    setTrainerChatMessages([...trainerChatMessages, { role: 'user', text: trainerChatInput }]);

    // Simulate trainer response and action
    setTimeout(() => {
      let response = '';
      if (trainerChatInput.toLowerCase().includes('start') || trainerChatInput.toLowerCase().includes('fine tuning')) {
        response = `Understood. I have updated the configuration to fine-tune ${selectedModel?.name} based on your requirements. Starting the fine-tuning process now...`;
        setIsTraining(true);
        setCodeEditorContent(prev => prev + '\n// Added by Trainer Assistant:\nconst learningRate = 2e-5;\nconst epochs = 3;\nawait model.train(dataset, { learningRate, epochs });');
      } else {
        response = `I can help with that. Could you provide more details about the dataset or specific behaviors you want the model to learn?`;
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
      setMainChatMessages(prev => [...prev, { role: 'model', text: `[${selectedModel?.name} (Fine-tuned)] Responding to: "${mainChatInput}"` }]);
    }, 800);

    setMainChatInput('');
  };

  if (!isTemplateCreated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center font-sans">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">mikQ Studio</h1>
          </div>

          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Utwórz nowy szablon
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nazwa szablonu</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="np. MyCustomModel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Domyślny model AI</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
                onChange={(e) => setSelectedModel(mikQModels.find(m => m.id === e.target.value) || null)}
                defaultValue=""
              >
                <option value="" disabled>Wybierz model...</option>
                {mikQModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.source === 'local' ? 'Dysk' : 'Hugging Face'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateTemplate}
              disabled={!templateName || !selectedModel}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Utwórz szablon
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <Activity className="w-6 h-6 text-blue-500" />
             <span className="font-bold text-xl">mikQ</span>
          </div>
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <span className="font-medium">{templateName}</span>
          <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400 border border-gray-700">
            {selectedModel?.name}
          </span>
        </div>

        <div>
          {!isModelDownloaded ? (
            <button
              onClick={handleDownloadModel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Pobierz model
            </button>
          ) : (
            <span className="text-green-400 flex items-center gap-2 text-sm font-medium px-4 py-2 bg-green-900/20 border border-green-800/30 rounded-md">
              <Download className="w-4 h-4" /> Model pobrany
            </span>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 h-[calc(100vh-64px)]">

        {/* 1. Edytor kodu */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium">1. Edytor Kodu</h3>
          </div>
          <div className="flex-1 p-0 relative">
             <textarea
               className="w-full h-full bg-gray-900 text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
               value={codeEditorContent}
               onChange={(e) => setCodeEditorContent(e.target.value)}
               disabled={!isModelDownloaded}
               placeholder={isModelDownloaded ? "Wpisz kod..." : "Pobierz model, aby edytować kod..."}
             />
             {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center">
                 <span className="text-gray-400">Wymaga pobrania modelu</span>
               </div>
             )}
          </div>
        </div>

        {/* 2. Aktualny stan */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-medium">2. Aktualny Stan</h3>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            {isTraining ? (
               <div className="space-y-4">
                 <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                 <h4 className="text-xl font-bold text-blue-400">Fine-tuning w toku...</h4>
                 <p className="text-gray-400 max-w-sm">
                   Model asystenta konfiguruje wagi i trenuje model {selectedModel?.name} na podstawie Twoich wytycznych.
                 </p>
                 <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[45%]"></div>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Epoch 1/3 - Loss: 0.245</p>
               </div>
            ) : isModelDownloaded ? (
              <div className="space-y-4">
                 <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto border border-gray-700">
                    <Play className="w-8 h-8 text-gray-400 ml-1" />
                 </div>
                 <h4 className="text-xl font-medium text-gray-300">Gotowy do treningu</h4>
                 <p className="text-gray-500">Skorzystaj z czatu z asystentem (okno 4), aby rozpocząć proces fine-tuningu.</p>
              </div>
            ) : (
              <div className="space-y-4 text-gray-500">
                <Download className="w-12 h-12 mx-auto opacity-50" />
                <p>Oczekuje na pobranie modelu...</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Chat z modelem (testowanie) */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium">3. Testuj Model ({selectedModel?.name})</h3>
          </div>
          <div className="flex-1 flex flex-col relative">
            {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
                 <span className="text-gray-400">Pobierz model, aby testować</span>
               </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mainChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleMainChatSubmit} className="p-3 border-t border-gray-800 bg-gray-900">
              <input
                type="text"
                value={mainChatInput}
                onChange={(e) => setMainChatInput(e.target.value)}
                placeholder="Napisz do swojego modelu..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                disabled={!isModelDownloaded}
              />
            </form>
          </div>
        </div>

        {/* 4. Chat z modelem trenerem */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-medium">4. Asystent Treningu</h3>
            </div>
            <select
              value={trainerModel}
              onChange={(e) => setTrainerModel(e.target.value)}
              className="bg-gray-950 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300 focus:outline-none"
            >
              <option>GPT-4 (API)</option>
              <option>Claude 3 (API)</option>
              <option>Local Code Model</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col relative">
             {!isModelDownloaded && (
               <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
                 <span className="text-gray-400">Pobierz model przed konfiguracją</span>
               </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {trainerChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === 'user' ? 'bg-orange-600/80 text-white' : 'bg-gray-800 text-orange-100 border border-orange-900/30'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTrainerChatSubmit} className="p-3 border-t border-gray-800 bg-gray-900">
              <input
                type="text"
                value={trainerChatInput}
                onChange={(e) => setTrainerChatInput(e.target.value)}
                placeholder="Powiedz asystentowi jak fine-tuningować model..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-orange-500 text-white"
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