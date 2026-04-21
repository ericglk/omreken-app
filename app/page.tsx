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
    // Controleer of het alleen 0en en 1en zijn
    if (!/^[01]+$/.test(val)) { setDecimal('Ongeldig binaire'); return; }
    setDecimal(parseInt(val, 2).toString(10));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">VibeCode Converter</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Decimaal</label>
            <input 
              type="number" 
              value={decimal}
              onChange={(e) => handleDecimalChange(e.target.value)}
              className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Bijv. 10"
            />
          </div>

          <div className="flex justify-center text-xl font-bold text-slate-500">⇅</div>

          <div>
            <label className="block text-sm font-medium mb-2">Binair</label>
            <input 
              type="text" 
              value={binary}
              onChange={(e) => handleBinaryChange(e.target.value)}
              className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Bijv. 1010"
            />
          </div>
        </div>
      </div>
    </main>
  );
}