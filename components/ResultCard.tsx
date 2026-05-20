import React from 'react';
import { ConversionResult } from '../types';
import { Copy, CheckCircle } from 'lucide-react';

interface ResultCardProps {
  result: ConversionResult | null;
}

const ResultRow = ({ label, value }: { label: string, value: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 w-48 shrink-0 font-medium">{label}</span>
      <div className="flex-1 flex items-center gap-2 mt-1 sm:mt-0">
        <code className="bg-slate-100 px-3 py-1.5 rounded text-slate-800 text-sm font-mono break-all w-full">
          {value || <span className="text-slate-400 italic">Empty</span>}
        </code>
        {value && (
          <button 
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Generated PLM Data</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
          Ready
        </span>
      </div>

      <div className="flex flex-col">
        <ResultRow label="PLM品番 (4桁目)" value={result.plmPartCode} />
        <ResultRow label="PLM図番 (頭4桁)" value={result.plmDrawingPrefix} />
        <ResultRow label="PLM品名 (English)" value={result.plmNameE} />
        <ResultRow label="PLM品名 (日本語)" value={result.plmNameJ} />
        <ResultRow label="PLM図面名称 (English)" value={result.plmDrawingNameE} />
      </div>

      {result.remarks.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800 mb-2">System Remarks</h3>
          <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1">
            {result.remarks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};