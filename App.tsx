import React, { useState } from 'react';
import { ConversionInput, ConversionResult } from './types';
import { convertPdmToPlm } from './services/conversionService';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { Settings, BookOpen } from 'lucide-react';

const initialInput: ConversionInput = {
  pdmNameJ: '',
  pdmNameE: '',
  pdmCode: '',
  partClassId: ''
};

function App() {
  const [input, setInput] = useState<ConversionInput>(initialInput);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleConvert = () => {
    const res = convertPdmToPlm(input);
    setResult(res);
  };

  const handleClear = () => {
    setInput(initialInput);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Settings className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              PDM <span className="text-slate-400 mx-1">→</span> PLM Converter
            </h1>
          </div>
          <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition">
            <BookOpen size={16} />
            <span className="hidden sm:inline">Rule Documentation</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Rules Summary (Visible on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-sm text-slate-600">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Conversion Logic
              </h3>
              <p className="mb-4 text-xs leading-relaxed">
                This system automatically generates PLM data based on priority rules:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs">
                <li><strong className="text-slate-700">Exception List:</strong> "Name Rules" worksheet matches.</li>
                <li><strong className="text-slate-700">Type Rules:</strong> Matches based on 4th digit & keywords (e.g., C=Wiring).</li>
                <li><strong className="text-slate-700">Basic Defs:</strong> Formatting Japanese/English text, handling underscores for alphanumeric sequences.</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm">
              <h3 className="font-bold text-blue-800 mb-2">Supported Types</h3>
              <div className="flex flex-wrap gap-2">
                {['Wiring', 'Cable Assy', 'Assembly', 'Layout', 'Name Seal'].map(t => (
                  <span key={t} className="px-2 py-1 bg-white text-blue-600 rounded text-xs border border-blue-100 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: App Logic */}
          <div className="lg:col-span-8 space-y-6">
            <InputForm 
              input={input} 
              onChange={setInput} 
              onConvert={handleConvert}
              onClear={handleClear}
            />
            
            <div className={`transition-all duration-500 ease-in-out ${result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <ResultCard result={result} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;