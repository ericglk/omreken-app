"use client";
import { useState, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';
type Feedback = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

const themeStorageKey = 'theme';
const minPracticeNumber = 0;
const maxPracticeNumber = 255;

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

const parseDecimalInput = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!/^\d+$/.test(trimmedValue)) return null;

  const numberValue = Number(trimmedValue);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
};

const getBinaryFromDecimalInput = (value: string): string => {
  const numberValue = parseDecimalInput(value);

  return numberValue === null ? '' : numberValue.toString(2);
};

const getPracticeHint = (decimalNumber: number, binaryAnswer: string): string => {
  const expectedBinary = decimalNumber.toString(2);
  const answerValue = parseInt(binaryAnswer, 2);
  const normalizedAnswer = binaryAnswer.replace(/^0+(?=\d)/, '');

  if (normalizedAnswer.length !== expectedBinary.length) {
    const bitLabel = expectedBinary.length === 1 ? 'bit' : 'bits';

    return `Hint: het juiste antwoord heeft ${expectedBinary.length} ${bitLabel}.`;
  }

  const firstDifferenceIndex = normalizedAnswer
    .split('')
    .findIndex((bit, index) => bit !== expectedBinary[index]);
  const bitValue = 2 ** (expectedBinary.length - firstDifferenceIndex - 1);
  const directionHint = answerValue < decimalNumber ? 'te laag' : 'te hoog';

  return `Hint: jouw antwoord is ${answerValue} in decimaal, dus ${directionHint}. Kijk nog eens naar de bit met waarde ${bitValue}.`;
};

export default function Home() {
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
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
    primaryButton: isDarkMode
      ? 'bg-blue-500 text-white hover:bg-blue-400'
      : 'bg-blue-600 text-white hover:bg-blue-700',
    secondaryButton: isDarkMode
      ? 'border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600'
      : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
    info: isDarkMode
      ? 'border-blue-500/40 bg-blue-500/10 text-blue-100'
      : 'border-blue-200 bg-blue-50 text-blue-800',
    success: isDarkMode
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: isDarkMode
      ? 'border-red-500/40 bg-red-500/10 text-red-100'
      : 'border-red-200 bg-red-50 text-red-800',
  };

  const feedbackClass = feedback ? themeClasses[feedback.type] : '';

  const togglePracticeMode = () => {
    const nextPracticeMode = !practiceMode;

    setPracticeMode(nextPracticeMode);
    setFeedback(
      nextPracticeMode
        ? { type: 'info', message: 'Oefenmodus staat aan. Vul een decimaal getal in of kies random.' }
        : null,
    );

    if (nextPracticeMode) {
      setBinary('');
      return;
    }

    setBinary(decimal === '' ? '' : getBinaryFromDecimalInput(decimal));
  };

  const handleDecimalChange = (val: string) => {
    setDecimal(val);
    setFeedback(null);

    if (val === '') {
      setBinary('');
      return;
    }

    if (practiceMode) {
      setBinary('');
      return;
    }

    const convertedBinary = getBinaryFromDecimalInput(val);
    setBinary(convertedBinary);

    if (convertedBinary === '') {
      setFeedback({ type: 'error', message: 'Voer een heel decimaal getal in vanaf 0.' });
    }
  };

  const handleBinaryChange = (val: string) => {
    setBinary(val);
    setFeedback(null);

    if (practiceMode) return;

    if (val === '') {
      setDecimal('');
      return;
    }

    if (!/^[01]+$/.test(val)) {
      setDecimal('');
      setFeedback({ type: 'error', message: 'Gebruik alleen 0 en 1 voor binaire invoer.' });
      return;
    }

    setDecimal(parseInt(val, 2).toString(10));
  };

  const chooseRandomPracticeNumber = () => {
    const randomNumber = Math.floor(Math.random() * (maxPracticeNumber - minPracticeNumber + 1)) + minPracticeNumber;

    setDecimal(randomNumber.toString());
    setBinary('');
    setFeedback({ type: 'info', message: 'Random getal gekozen. Vul zelf het binaire antwoord in.' });
  };

  const checkPracticeAnswer = () => {
    const decimalNumber = parseDecimalInput(decimal);
    const binaryAnswer = binary.trim();

    if (decimalNumber === null) {
      setFeedback({ type: 'error', message: 'Voer eerst een heel decimaal getal in vanaf 0.' });
      return;
    }

    if (binaryAnswer === '') {
      setFeedback({ type: 'error', message: 'Vul je binaire antwoord in.' });
      return;
    }

    if (!/^[01]+$/.test(binaryAnswer)) {
      setFeedback({ type: 'error', message: 'Een binair getal mag alleen 0 en 1 bevatten.' });
      return;
    }

    if (parseInt(binaryAnswer, 2) === decimalNumber) {
      setFeedback({
        type: 'success',
        message: `Goed. ${decimalNumber} is ${decimalNumber.toString(2)} in binair.`,
      });
      return;
    }

    setFeedback({ type: 'error', message: `Nog niet goed. ${getPracticeHint(decimalNumber, binaryAnswer)}` });
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Gekopieerd naar klembord!');
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-6 font-sans transition-colors sm:p-24 ${themeClasses.main}`}>
      <div className={`w-full max-w-md rounded-xl border p-8 shadow-2xl transition-colors ${themeClasses.card}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className={`text-2xl font-bold ${themeClasses.title}`}>VibeCode Converter</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePracticeMode}
              className={`shrink-0 rounded border px-3 py-2 text-sm font-medium transition-colors ${themeClasses.toggle}`}
              aria-pressed={practiceMode}
              aria-label={practiceMode ? 'Schakel oefenmodus uit' : 'Schakel oefenmodus aan'}
              title={practiceMode ? 'Oefenmodus aan' : 'Oefenmodus uit'}
            >
              {practiceMode ? 'Oefen: aan' : 'Oefen: uit'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`shrink-0 rounded border px-3 py-2 text-sm font-medium transition-colors ${themeClasses.toggle}`}
              aria-label={isDarkMode ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
              title={isDarkMode ? 'Lichte modus' : 'Donkere modus'}
            >
              {isDarkMode ? 'Licht' : 'Donker'}
            </button>
          </div>
        </div>

        {practiceMode ? (
          <p className={`mb-6 rounded border p-3 text-sm ${themeClasses.info}`}>
            Kies een decimaal getal. Jij typt daarna het binaire antwoord.
          </p>
        ) : null}
        
        <div className="space-y-6">
          <div>
            <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Decimaal</label>
            <div className="relative">
              <input 
                type="number" 
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                min={0}
                inputMode="numeric"
                className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                placeholder="Bijv. 10"
              />
              <button 
                onClick={() => copyToClipboard(decimal)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs transition-colors ${themeClasses.copyButton}`}
                title="Kopieer"
              >
                Kopieer
              </button>
            </div>

            {practiceMode ? (
              <button
                type="button"
                onClick={chooseRandomPracticeNumber}
                className={`mt-3 w-full rounded border px-4 py-2 text-sm font-medium transition-colors ${themeClasses.secondaryButton}`}
              >
                Random decimaal getal
              </button>
            ) : null}
          </div>

          <div className={`flex justify-center text-xl font-bold ${themeClasses.swap}`}>⇅</div>

          <div>
            <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>
              {practiceMode ? 'Jouw binaire antwoord' : 'Binair'}
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={binary}
                onChange={(e) => handleBinaryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (practiceMode && e.key === 'Enter') checkPracticeAnswer();
                }}
                inputMode="numeric"
                pattern="[01]*"
                className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                placeholder={practiceMode ? 'Typ je antwoord' : 'Bijv. 1010'}
              />
              <button 
                onClick={() => copyToClipboard(binary)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs transition-colors ${themeClasses.copyButton}`}
                title="Kopieer"
              >
                Kopieer
              </button>
            </div>

            {practiceMode ? (
              <button
                type="button"
                onClick={checkPracticeAnswer}
                className={`mt-3 w-full rounded px-4 py-2 text-sm font-semibold transition-colors ${themeClasses.primaryButton}`}
              >
                Controleer antwoord
              </button>
            ) : null}
          </div>
        </div>

        {feedback ? (
          <p className={`mt-6 rounded border p-3 text-sm ${feedbackClass}`} role="status">
            {feedback.message}
          </p>
        ) : null}
        
        <p className={`mt-8 text-center text-xs ${themeClasses.footer}`}>
          Gemaakt met passie & AI
        </p>
      </div>
    </main>
  );
}
