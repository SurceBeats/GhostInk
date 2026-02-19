import React, { useState, useEffect } from "react";
import { decode, analyzeCodepoints } from "./steganography.js";
import CodepointViewer from "./CodepointViewer.jsx";

const EXAMPLES = [
  { emoji: "👻󠁙󠁯󠁵󠀠󠁦󠁯󠁵󠁮󠁤󠀠󠁭󠁥󠀡󠁿", label: "👻" },
  { emoji: "🔥󠁔󠁨󠁩󠁳󠀠󠁩󠁳󠀠󠁦󠁩󠁮󠁥󠁿", label: "🔥" },
  { emoji: "🚀󠁌󠁡󠁵󠁮󠁣󠁨󠀠󠁣󠁯󠁤󠁥󠀺󠀠󠀴󠀲󠁿", label: "🚀" },
  { emoji: "🍕󠁐󠁩󠁮󠁥󠁡󠁰󠁰󠁬󠁥󠀠󠁢󠁥󠁬󠁯󠁮󠁧󠁳󠀠󠁯󠁮󠀠󠁰󠁩󠁺󠁺󠁡󠁿", label: "🍕" },
  { emoji: "🐈󠁉󠀠󠁡󠁭󠀠󠁮󠁯󠁴󠀠󠁡󠀠󠁣󠁡󠁴󠁿", label: "🐈" },
];

export default function DecodePanel() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [codepoints, setCodepoints] = useState(null);
  const [showCodepoints, setShowCodepoints] = useState(false);
  const [stash, setStash] = useState([]);
  const [showStash, setShowStash] = useState(false);

  useEffect(() => {
    fetch("/stash")
      .then((r) => r.json())
      .then(setStash)
      .catch(() => {});
  }, []);

  function loadFromStash(emoji) {
    setInput(emoji);
    setResult(null);
    setCodepoints(null);
  }

  async function deleteFromStash(id, e) {
    e.stopPropagation();
    await fetch(`/stash/${id}`, { method: "DELETE" });
    setStash((s) => s.filter((e) => e.id !== id));
  }

  function handleDecode() {
    if (!input) return;
    const decoded = decode(input);
    setResult(decoded);
    setCodepoints(analyzeCodepoints(input));
    setShowCodepoints(false);
  }

  return (
    <div className="space-y-6">
      {/* Stash */}
      {stash.length > 0 && (
        <div>
          <button onClick={() => setShowStash((s) => !s)} className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2 cursor-pointer hover:text-gray-300 transition-colors">
            <svg className={`w-4 h-4 transition-transform ${showStash ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
            </svg>
            Stash ({stash.length})
          </button>
          {showStash && (
            <div className="space-y-1.5">
              {stash.map((entry) => (
                <div key={entry.id} onClick={() => loadFromStash(entry.emoji)} className="flex items-center gap-3 px-3 py-2 bg-ghost-surface border border-ghost-border rounded-lg cursor-pointer hover:border-ghost-green/40 transition-colors group">
                  <span className="text-xl">{[...entry.emoji][0]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{entry.label}</p>
                    <p className="text-xs text-ghost-muted">{new Date(entry.created).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => deleteFromStash(entry.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-ghost-muted hover:text-red-400 transition-all cursor-pointer" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Paste suspicious emoji</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(ex.emoji);
                setResult(null);
                setCodepoints(null);
              }}
              className="text-2xl p-1.5 rounded-lg bg-ghost-surface hover:bg-ghost-border transition-all cursor-pointer"
              title="Try this one"
            >
              {ex.label}
            </button>
          ))}
          <span className="text-xs text-ghost-muted self-center ml-1">Try an example</span>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste an emoji that might contain hidden data..." rows={3} className="w-full bg-ghost-surface border border-ghost-border rounded-lg px-4 py-3 text-xl resize-none focus:border-ghost-green/50 transition-colors" />
        {input && <div className="text-xs text-ghost-muted mt-1 text-right font-mono">{[...input].length} codepoints detected</div>}
      </div>

      {/* Decode button */}
      <button onClick={handleDecode} disabled={!input} className="w-full py-3 px-6 bg-ghost-green hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed">
        Decode
      </button>

      {/* Result */}
      {result !== null && (
        <div className="animate-slide-up space-y-4">
          {result ? (
            <div className="bg-ghost-surface border border-ghost-green/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-ghost-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-ghost-green text-sm font-semibold">Hidden data found!</span>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-ghost-green break-all">{result}</div>
            </div>
          ) : (
            <div className="bg-ghost-surface border border-ghost-border rounded-lg p-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-ghost-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-ghost-muted text-sm">No hidden data found in this input.</span>
              </div>
            </div>
          )}

          {/* Codepoint analysis toggle */}
          {codepoints && codepoints.length > 0 && (
            <>
              <button onClick={() => setShowCodepoints(!showCodepoints)} className="flex items-center gap-2 text-sm text-ghost-muted hover:text-gray-300 transition-colors cursor-pointer">
                <svg className={`w-4 h-4 transition-transform ${showCodepoints ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Codepoint analysis
              </button>

              {showCodepoints && <CodepointViewer codepoints={codepoints} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
