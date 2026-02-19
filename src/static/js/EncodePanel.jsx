import React, { useState } from "react";
import { encode, normalize, analyzeCodepoints } from "./steganography.js";
import CodepointViewer from "./CodepointViewer.jsx";

const POPULAR_EMOJIS = ["\uD83D\uDC7B", "\uD83D\uDD25", "\u2764\uFE0F", "\uD83D\uDE80", "\u2728", "\uD83C\uDF1F", "\uD83D\uDCAC", "\uD83D\uDC40", "\uD83E\uDD16", "\uD83C\uDF0D", "\uD83D\uDCA1", "\uD83D\uDD12", "\uD83D\uDCE9", "\uD83C\uDFAD"];

export default function EncodePanel() {
  const [emoji, setEmoji] = useState("\uD83D\uDC7B");
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState(null);
  const [codepoints, setCodepoints] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCodepoints, setShowCodepoints] = useState(false);
  const [stashLabel, setStashLabel] = useState("");
  const [showStash, setShowStash] = useState(false);
  const [stashStatus, setStashStatus] = useState(null);

  function handleEncode() {
    if (!emoji || !secret) return;
    const encoded = encode(emoji, secret);
    setResult(encoded);
    setCodepoints(analyzeCodepoints(encoded));
    setCopied(false);
    setShowCodepoints(false);
    setShowStash(false);
    setStashStatus(null);
    setStashLabel("");
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStash() {
    if (!stashLabel.trim() || !result) return;
    setStashStatus(null);
    try {
      const res = await fetch("/stash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: stashLabel.trim(), emoji: result }),
      });
      if (res.ok) {
        setStashStatus("ok");
        setStashLabel("");
        setTimeout(() => {
          setStashStatus(null);
          setShowStash(false);
        }, 2000);
      } else {
        setStashStatus("error");
      }
    } catch {
      setStashStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Emoji selector */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Emoji base</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {POPULAR_EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)} className={`text-2xl p-1.5 rounded-lg transition-all cursor-pointer ${emoji === e ? "bg-ghost-red/20 ring-1 ring-ghost-red scale-110" : "bg-ghost-surface hover:bg-ghost-border"}`}>
              {e}
            </button>
          ))}
        </div>
        <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Or type/paste any emoji..." className="w-full bg-ghost-surface border border-ghost-border rounded-lg px-4 py-3 text-xl focus:border-ghost-red/50 transition-colors" />
      </div>

      {/* Secret text */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Secret message</label>
        <textarea value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Type the secret text to hide..." rows={3} className="w-full bg-ghost-surface border border-ghost-border rounded-lg px-4 py-3 text-sm font-mono resize-none focus:border-ghost-red/50 transition-colors" />
        {secret && secret !== normalize(secret) && <div className="text-xs text-ghost-orange mt-2 font-mono bg-orange-900/20 rounded px-3 py-1.5">Normalized: {normalize(secret)}</div>}
        <div className="text-xs text-ghost-muted mt-1 text-right">{secret.length} characters</div>
      </div>

      {/* Encode button */}
      <button onClick={handleEncode} disabled={!emoji || !secret} className="w-full py-3 px-6 bg-ghost-red hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed">
        Encode
      </button>

      {/* Result */}
      {result && (
        <div className="animate-slide-up space-y-4">
          <div className="bg-ghost-surface border border-ghost-border rounded-lg p-6 text-center">
            <div className="text-7xl mb-4">{result}</div>
            <p className="text-xs text-ghost-muted mb-4 font-mono">Looks the same, but carries a secret inside</p>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-4 py-2 bg-ghost-border hover:bg-gray-700 rounded-lg text-sm transition-colors cursor-pointer">
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-ghost-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to clipboard
                </>
              )}
            </button>

            {!showStash ? (
              <button onClick={() => setShowStash(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ghost-border hover:bg-gray-700 rounded-lg text-sm transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
                Save to Stash
              </button>
            ) : stashStatus === "ok" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-ghost-green">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-3">
                <input type="text" value={stashLabel} onChange={(e) => setStashLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleStash()} placeholder="Label (e.g. WiFi password)" autoFocus className="flex-1 bg-ghost-dark border border-ghost-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" />
                <button onClick={handleStash} disabled={!stashLabel.trim()} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
                  Save
                </button>
                {stashStatus === "error" && <span className="text-xs text-red-400">Error</span>}
              </div>
            )}
          </div>

          {/* Codepoint analysis toggle */}
          <button onClick={() => setShowCodepoints(!showCodepoints)} className="flex items-center gap-2 text-sm text-ghost-muted hover:text-gray-300 transition-colors cursor-pointer">
            <svg className={`w-4 h-4 transition-transform ${showCodepoints ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Codepoint analysis
          </button>

          {showCodepoints && codepoints && <CodepointViewer codepoints={codepoints} />}
        </div>
      )}
    </div>
  );
}
