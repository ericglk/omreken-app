"use client";

import { useState, useSyncExternalStore } from "react";

type Theme = "dark" | "light";
type PracticeTarget = "binary" | "hexadecimal";
type Feedback = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const themeStorageKey = "theme";
const minPracticeNumber = 0;
const maxPracticeNumber = 255;

const targetLabels: Record<PracticeTarget, string> = {
  binary: "binair",
  hexadecimal: "hexadecimaal",
};

const getBrowserTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getServerTheme = (): Theme => "dark";

const subscribeToTheme = (callback: () => void) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = () => callback();

  window.addEventListener("storage", handleThemeChange);
  window.addEventListener("themechange", handleThemeChange);
  mediaQuery.addEventListener("change", handleThemeChange);

  return () => {
    window.removeEventListener("storage", handleThemeChange);
    window.removeEventListener("themechange", handleThemeChange);
    mediaQuery.removeEventListener("change", handleThemeChange);
  };
};

const parseDecimalInput = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!/^\d+$/.test(trimmedValue)) return null;

  const numberValue = Number(trimmedValue);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
};

const parseBaseInput = (value: string, pattern: RegExp, radix: number): number | null => {
  const trimmedValue = value.trim();

  if (!pattern.test(trimmedValue)) return null;

  const numberValue = parseInt(trimmedValue, radix);

  return Number.isSafeInteger(numberValue) ? numberValue : null;
};

const parseBinaryInput = (value: string): number | null => parseBaseInput(value, /^[01]+$/, 2);

const parseHexadecimalInput = (value: string): number | null =>
  parseBaseInput(value, /^[0-9a-fA-F]+$/, 16);

const toBinary = (value: number): string => value.toString(2);

const toHexadecimal = (value: number): string => value.toString(16).toUpperCase();

const normalizeBinaryAnswer = (answer: string): string => answer.trim().replace(/^0+(?=\d)/, "");

const normalizeHexadecimalAnswer = (answer: string): string =>
  answer.trim().toUpperCase().replace(/^0+(?=[0-9A-F])/, "");

const getPracticeAnswer = (decimalNumber: number, target: PracticeTarget): string =>
  target === "binary" ? toBinary(decimalNumber) : toHexadecimal(decimalNumber);

const getPracticeHint = (
  decimalNumber: number,
  answer: string,
  target: PracticeTarget,
): string => {
  const expectedAnswer = getPracticeAnswer(decimalNumber, target);
  const normalizedAnswer =
    target === "binary" ? normalizeBinaryAnswer(answer) : normalizeHexadecimalAnswer(answer);
  const answerValue = parseInt(normalizedAnswer, target === "binary" ? 2 : 16);

  if (normalizedAnswer.length !== expectedAnswer.length) {
    const unitLabel =
      target === "binary"
        ? expectedAnswer.length === 1
          ? "bit"
          : "bits"
        : expectedAnswer.length === 1
          ? "hex-cijfer"
          : "hex-cijfers";

    return `Hint: het juiste antwoord heeft ${expectedAnswer.length} ${unitLabel}.`;
  }

  const firstDifferenceIndex = normalizedAnswer
    .split("")
    .findIndex((digit, index) => digit !== expectedAnswer[index]);
  const placeValue =
    target === "binary"
      ? 2 ** (expectedAnswer.length - firstDifferenceIndex - 1)
      : 16 ** (expectedAnswer.length - firstDifferenceIndex - 1);
  const directionHint = answerValue < decimalNumber ? "te laag" : "te hoog";

  return `Hint: jouw antwoord is ${answerValue} in decimaal, dus ${directionHint}. Kijk nog eens naar het ${targetLabels[target]} cijfer met waarde ${placeValue}.`;
};

export default function Home() {
  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [hexadecimal, setHexadecimal] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceTarget, setPracticeTarget] = useState<PracticeTarget>("binary");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const theme = useSyncExternalStore(subscribeToTheme, getBrowserTheme, getServerTheme);
  const isDarkMode = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event("themechange"));
  };

  const themeClasses = {
    main: isDarkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900",
    card: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
    title: isDarkMode ? "text-blue-400" : "text-blue-700",
    label: isDarkMode ? "text-slate-400" : "text-slate-600",
    input: isDarkMode
      ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400",
    copyButton: isDarkMode
      ? "hover:bg-slate-600 text-slate-300"
      : "hover:bg-slate-200 text-slate-600",
    swap: isDarkMode ? "text-slate-600" : "text-slate-400",
    footer: isDarkMode ? "text-slate-500" : "text-slate-400",
    toggle: isDarkMode
      ? "bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300",
    selectedToggle: isDarkMode
      ? "bg-blue-500 text-white border-blue-400"
      : "bg-blue-600 text-white border-blue-600",
    primaryButton: isDarkMode
      ? "bg-blue-500 text-white hover:bg-blue-400"
      : "bg-blue-600 text-white hover:bg-blue-700",
    secondaryButton: isDarkMode
      ? "border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600"
      : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
    info: isDarkMode
      ? "border-blue-500/40 bg-blue-500/10 text-blue-100"
      : "border-blue-200 bg-blue-50 text-blue-800",
    success: isDarkMode
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: isDarkMode
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : "border-red-200 bg-red-50 text-red-800",
  };

  const feedbackClass = feedback ? themeClasses[feedback.type] : "";
  const answer = practiceTarget === "binary" ? binary : hexadecimal;

  const clearConvertedValues = () => {
    setBinary("");
    setHexadecimal("");
  };

  const fillConvertedValues = (numberValue: number) => {
    setDecimal(numberValue.toString(10));
    setBinary(toBinary(numberValue));
    setHexadecimal(toHexadecimal(numberValue));
  };

  const clearPracticeAnswer = (target: PracticeTarget = practiceTarget) => {
    if (target === "binary") {
      setBinary("");
      return;
    }

    setHexadecimal("");
  };

  const togglePracticeMode = () => {
    const nextPracticeMode = !practiceMode;

    setPracticeMode(nextPracticeMode);
    setFeedback(
      nextPracticeMode
        ? {
            type: "info",
            message: `Oefenmodus staat aan. Vul een decimaal getal in en typ het ${targetLabels[practiceTarget]} antwoord.`,
          }
        : null,
    );

    if (nextPracticeMode) {
      clearPracticeAnswer();
      return;
    }

    const decimalNumber = parseDecimalInput(decimal);

    if (decimalNumber === null) {
      clearConvertedValues();
      return;
    }

    fillConvertedValues(decimalNumber);
  };

  const handlePracticeTargetChange = (target: PracticeTarget) => {
    setPracticeTarget(target);
    clearPracticeAnswer(target);
    setFeedback({
      type: "info",
      message: `Je oefent nu naar ${targetLabels[target]}.`,
    });
  };

  const handleDecimalChange = (value: string) => {
    setDecimal(value);
    setFeedback(null);

    if (value === "") {
      clearConvertedValues();
      return;
    }

    const decimalNumber = parseDecimalInput(value);

    if (decimalNumber === null) {
      clearConvertedValues();
      setFeedback({ type: "error", message: "Voer een heel decimaal getal in vanaf 0." });
      return;
    }

    if (practiceMode) {
      clearPracticeAnswer();
      return;
    }

    setBinary(toBinary(decimalNumber));
    setHexadecimal(toHexadecimal(decimalNumber));
  };

  const handleBinaryChange = (value: string) => {
    setBinary(value);
    setFeedback(null);

    if (practiceMode) return;

    if (value === "") {
      setDecimal("");
      setHexadecimal("");
      return;
    }

    const binaryNumber = parseBinaryInput(value);

    if (binaryNumber === null) {
      setDecimal("");
      setHexadecimal("");
      setFeedback({ type: "error", message: "Gebruik alleen 0 en 1 voor binaire invoer." });
      return;
    }

    setDecimal(binaryNumber.toString(10));
    setHexadecimal(toHexadecimal(binaryNumber));
  };

  const handleHexadecimalChange = (value: string) => {
    const normalizedValue = value.toUpperCase();

    setHexadecimal(normalizedValue);
    setFeedback(null);

    if (practiceMode) return;

    if (normalizedValue === "") {
      setDecimal("");
      setBinary("");
      return;
    }

    const hexadecimalNumber = parseHexadecimalInput(normalizedValue);

    if (hexadecimalNumber === null) {
      setDecimal("");
      setBinary("");
      setFeedback({
        type: "error",
        message: "Gebruik alleen 0-9 en A-F voor hexadecimale invoer.",
      });
      return;
    }

    setDecimal(hexadecimalNumber.toString(10));
    setBinary(toBinary(hexadecimalNumber));
  };

  const chooseRandomPracticeNumber = () => {
    const randomNumber =
      Math.floor(Math.random() * (maxPracticeNumber - minPracticeNumber + 1)) + minPracticeNumber;

    setDecimal(randomNumber.toString());
    clearPracticeAnswer();
    setFeedback({
      type: "info",
      message: `Random getal gekozen. Vul zelf het ${targetLabels[practiceTarget]} antwoord in.`,
    });
  };

  const checkPracticeAnswer = () => {
    const decimalNumber = parseDecimalInput(decimal);
    const trimmedAnswer = answer.trim();
    const parsedAnswer =
      practiceTarget === "binary"
        ? parseBinaryInput(trimmedAnswer)
        : parseHexadecimalInput(trimmedAnswer);

    if (decimalNumber === null) {
      setFeedback({ type: "error", message: "Voer eerst een heel decimaal getal in vanaf 0." });
      return;
    }

    if (trimmedAnswer === "") {
      setFeedback({
        type: "error",
        message: `Vul je ${targetLabels[practiceTarget]} antwoord in.`,
      });
      return;
    }

    if (parsedAnswer === null) {
      setFeedback({
        type: "error",
        message:
          practiceTarget === "binary"
            ? "Een binair getal mag alleen 0 en 1 bevatten."
            : "Een hexadecimaal getal mag alleen 0-9 en A-F bevatten.",
      });
      return;
    }

    if (parsedAnswer === decimalNumber) {
      setFeedback({
        type: "success",
        message: `Goed. ${decimalNumber} is ${getPracticeAnswer(decimalNumber, practiceTarget)} in ${targetLabels[practiceTarget]}.`,
      });
      return;
    }

    setFeedback({
      type: "error",
      message: `Nog niet goed. ${getPracticeHint(decimalNumber, trimmedAnswer, practiceTarget)}`,
    });
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Gekopieerd naar klembord!");
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-6 font-sans transition-colors sm:p-24 ${themeClasses.main}`}
    >
      <div className={`w-full max-w-lg rounded-xl border p-6 shadow-2xl transition-colors sm:p-8 ${themeClasses.card}`}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className={`text-2xl font-bold ${themeClasses.title}`}>VibeCode Converter</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePracticeMode}
              className={`shrink-0 rounded border px-3 py-2 text-sm font-medium transition-colors ${themeClasses.toggle}`}
              aria-pressed={practiceMode}
              aria-label={practiceMode ? "Schakel oefenmodus uit" : "Schakel oefenmodus aan"}
              title={practiceMode ? "Oefenmodus aan" : "Oefenmodus uit"}
            >
              {practiceMode ? "Oefen: aan" : "Oefen: uit"}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`shrink-0 rounded border px-3 py-2 text-sm font-medium transition-colors ${themeClasses.toggle}`}
              aria-label={isDarkMode ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
              title={isDarkMode ? "Lichte modus" : "Donkere modus"}
            >
              {isDarkMode ? "Licht" : "Donker"}
            </button>
          </div>
        </div>

        {practiceMode ? (
          <div className={`mb-6 rounded border p-3 text-sm ${themeClasses.info}`}>
            <p>Kies een decimaal getal. Jij typt daarna het antwoord in de gekozen notatie.</p>
            <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Oefendoel">
              {(["binary", "hexadecimal"] as const).map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => handlePracticeTargetChange(target)}
                  className={`rounded border px-3 py-2 text-sm font-medium transition-colors ${
                    practiceTarget === target ? themeClasses.selectedToggle : themeClasses.toggle
                  }`}
                  aria-pressed={practiceTarget === target}
                >
                  {target === "binary" ? "Naar binair" : "Naar hex"}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-6">
          <div>
            <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Decimaal</label>
            <div className="relative">
              <input
                type="number"
                value={decimal}
                onChange={(event) => handleDecimalChange(event.target.value)}
                min={0}
                inputMode="numeric"
                className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                placeholder="Bijv. 10"
              />
              <button
                type="button"
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

          <div className={`flex justify-center text-xl font-bold ${themeClasses.swap}`} aria-hidden="true">
            &harr;
          </div>

          {practiceMode ? (
            <div>
              <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>
                {practiceTarget === "binary" ? "Jouw binaire antwoord" : "Jouw hexadecimale antwoord"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(event) =>
                    practiceTarget === "binary"
                      ? handleBinaryChange(event.target.value)
                      : handleHexadecimalChange(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") checkPracticeAnswer();
                  }}
                  inputMode="text"
                  pattern={practiceTarget === "binary" ? "[01]*" : "[0-9A-Fa-f]*"}
                  className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                  placeholder={practiceTarget === "binary" ? "Bijv. 1010" : "Bijv. A"}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(answer)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs transition-colors ${themeClasses.copyButton}`}
                  title="Kopieer"
                >
                  Kopieer
                </button>
              </div>

              <button
                type="button"
                onClick={checkPracticeAnswer}
                className={`mt-3 w-full rounded px-4 py-2 text-sm font-semibold transition-colors ${themeClasses.primaryButton}`}
              >
                Controleer antwoord
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Binair</label>
                <div className="relative">
                  <input
                    type="text"
                    value={binary}
                    onChange={(event) => handleBinaryChange(event.target.value)}
                    inputMode="numeric"
                    pattern="[01]*"
                    className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                    placeholder="Bijv. 1010"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(binary)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs transition-colors ${themeClasses.copyButton}`}
                    title="Kopieer"
                  >
                    Kopieer
                  </button>
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${themeClasses.label}`}>Hexadecimaal</label>
                <div className="relative">
                  <input
                    type="text"
                    value={hexadecimal}
                    onChange={(event) => handleHexadecimalChange(event.target.value)}
                    inputMode="text"
                    pattern="[0-9A-Fa-f]*"
                    className={`w-full rounded border p-3 pr-24 outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                    placeholder="Bijv. A"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(hexadecimal)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs transition-colors ${themeClasses.copyButton}`}
                    title="Kopieer"
                  >
                    Kopieer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {feedback ? (
          <p className={`mt-6 rounded border p-3 text-sm ${feedbackClass}`} role="status">
            {feedback.message}
          </p>
        ) : null}

        <p className={`mt-8 text-center text-xs ${themeClasses.footer}`}>Gemaakt met passie & AI</p>
      </div>
    </main>
  );
}
