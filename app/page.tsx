"use client";
import { useState, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

const themeStorageKey = 'theme';

const getBrowserTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getServerTheme = (): Theme => 'dark';

const subscribeToTheme = (callback: () => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = () => callback();

  window.addEventListener('storage', handleThemeChange);
  window.addEventListener('themechange', handleThemeChange);
  mediaQuery.addEventListener('change', handleThemeChange);

  return () => {
    window.removeEventListener('storage', handleThemeChange);
    window.removeEventListener('themechange', handleThemeChange);
    mediaQuery.removeEventListener('change', handleThemeChange);
  };
};

export default function Home() {
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState('');
  const theme = useSyncExternalStore(subscribeToTheme, getBrowserTheme, getServerTheme);
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event('themechange'));
  };

  const themeClasses = {
    main: isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900',
    card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    title: isDarkMode ? 'text-blue-400' : 'text-blue-700',
    label: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    input: isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400',
    copyButton: isDarkMode
      ? 'hover:bg-slate-600 text-slate-300'
      : 'hover:bg-slate-200 text-slate-600',
    swap: isDarkMode ? 'text-slate-600' : 'text-slate-400',
    footer: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    toggle: isDarkMode
      ? 'bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300',
  };

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
    <main className={`flex min-h-screen flex-col items-center justify-center p-6 font-sans transition-colors sm:p-24 ${themeClasses.main}`}>
      <div className={`w-full max-w-md rounded-xl border p-8 shadow-2xl transition-colors ${themeClasses.card}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className={`text-2xl font-bold ${themeClasses.title}`}>VibeCode Converter</h1>
          <button
            type="button"
            onClick={toggleTheme}
            className={`shrink-0 rounded border px-3 py-2 text-sm font-medium transition-colors ${themeClasses.toggle}`}
            aria-label={isDarkMode ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
            title={isDarkMode ? 'Lichte modus' : 'Donkere modus'}
          >
            {isDarkMode ? '☀️ Licht' : '🌙 Donker'}
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Decimaal Veld */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Decimaal</label>
            <div className="relative">
              <input 
                type="number" 
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                className={`w-full rounded border p-3 pr-12 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                placeholder="Bijv. 10"
              />
              <button 
                onClick={() => copyToClipboard(decimal)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-xs transition-colors ${themeClasses.copyButton}`}
                title="Kopieer"
              >
                📋
              </button>
            </div>
          </div>

          <div className={`flex justify-center text-xl font-bold ${themeClasses.swap}`}>⇅</div>

          {/* Binair Veld */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Binair</label>
            <div className="relative">
              <input 
                type="text" 
                value={binary}
                onChange={(e) => handleBinaryChange(e.target.value)}
                className={`w-full rounded border p-3 pr-12 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                placeholder="Bijv. 1010"
              />
              <button 
                onClick={() => copyToClipboard(binary)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-xs transition-colors ${themeClasses.copyButton}`}
                title="Kopieer"
              >
                📋
              </button>
            </div>
          </div>
        </div>
        
        <p className={`mt-8 text-center text-xs ${themeClasses.footer}`}>
          Gemaakt met passie & AI
        </p>
      </div>
    </main>
  );
}
