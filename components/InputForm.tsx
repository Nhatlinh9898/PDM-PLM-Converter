import React from 'react';
import { ConversionInput } from '../types';
import { ArrowRight, Eraser } from 'lucide-react';

interface InputFormProps {
  input: ConversionInput;
  onChange: (input: ConversionInput) => void;
  onConvert: () => void;
  onClear: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ input, onChange, onConvert, onClear }) => {
  const handleChange = (field: keyof ConversionInput, value: string) => {
    onChange({ ...input, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Input PDM Data</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            PDM Drawing Name (Japanese) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={input.pdmNameJ}
            onChange={(e) => handleChange('pdmNameJ', e.target.value)}
            placeholder="e.g. HUB&マルチドロップコントローラASSY.図"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            PDM Drawing Name (English)
          </label>
          <input
            type="text"
            value={input.pdmNameE}
            onChange={(e) => handleChange('pdmNameE', e.target.value)}
            placeholder="e.g. HUB & MULTIDROP CONTROLLER ASSY."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              PDM Drawing Code (4th Digit) <span className="text-red-500">*</span>
            </label>
            <select
              value={input.pdmCode}
              onChange={(e) => handleChange('pdmCode', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select...</option>
              <option value="C">C (配線図/Wiring)</option>
              <option value="J">J (ケーブル/Cable)</option>
              <option value="A">A (組立/Assy)</option>
              <option value="L">L (配置/Layout)</option>
              <option value="S">S (シール/Seal)</option>
              <option value="Z">Other/Part</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Part Class ID (Optional)
            </label>
            <input
              type="text"
              value={input.partClassId || ''}
              onChange={(e) => handleChange('partClassId', e.target.value)}
              placeholder="e.g. 1516"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onClear}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition"
        >
          <Eraser size={18} />
          Clear
        </button>
        <button
          onClick={onConvert}
          disabled={!input.pdmNameJ || !input.pdmCode}
          className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition"
        >
          Generate PLM Data
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};