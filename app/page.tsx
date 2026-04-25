"use client";
import { useState } from 'react';

export default function Home() {
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState('');

  const handleDecimalChange = (val: string) => {
    setDecimal(val);
    if (val === '') { setBinary(''); return; }
    const num = parseInt(val, 10);
    setBinary(!isNaN(num) ? num.toString(2) : 'Ongeldig');
  };

  const handleBinaryChange = (val: string) => {
    setBinary(val);
    if (val === '') { setDecimal(''); return; }
    if (!/^[01]+$/.test(val)) { setDecimal('Ongeldig binaire'); return; }
    setDecimal(parseInt(val, 2).toString(10));
  };

  // De nieuwe kopieer-functie
  const copyToClipboard = (text: string) => {
    if (!text || text === 'Ongeldig') return;
    navigator.clipboard.writeText(text);
    alert('Gekopieerd naar klembord!');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white font-sans">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">VibeCode Converter</h1>
        
        <div className="space-y-6">
          {/* Decimaal Veld */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Decimaal</label>
            <div className="relative">
              <input 
                type="number" 
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                className="w-full p-3 pr-12 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Bijv. 10"
              />
              <button 
                onClick={() => copyToClipboard(decimal)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-600 rounded text-xs text-slate-300"
                title="Kopieer"
              >
                📋
              </button>
            </div>
          </div>

          <div className="flex justify-center text-xl font-bold text-slate-600">⇅</div>

          {/* Binair Veld */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Binair</label>
            <div className="relative">
              <input 
                type="text" 
                value={binary}
                onChange={(e) => handleBinaryChange(e.target.value)}
                className="w-full p-3 pr-12 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Bijv. 1010"
              />
              <button 
                onClick={() => copyToClipboard(binary)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-600 rounded text-xs text-slate-300"
                title="Kopieer"
              >
                📋
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-500">
          Gemaakt met passie & AI
        </p>
      </div>
    </main>
  );
}