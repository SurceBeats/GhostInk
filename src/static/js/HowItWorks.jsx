import React, { useState } from "react";

export default function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-ghost-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-ghost-surface/50 transition-colors cursor-pointer">
        <span className="text-sm font-semibold text-gray-300">How does it work?</span>
        <svg className={`w-5 h-5 text-ghost-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 animate-fade-in space-y-5 text-sm text-gray-400 leading-relaxed">
          {/* Diagram */}
          <div className="bg-ghost-surface rounded-lg p-4 font-mono text-center text-xs">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-3xl">{"\uD83D\uDC7B"}</span>
              <span className="text-ghost-muted">+</span>
              <span className="text-red-400 bg-red-900/30 px-2 py-1 rounded">invisible data</span>
              <span className="text-ghost-muted">=</span>
              <span className="text-3xl">{"\uD83D\uDC7B"}</span>
              <span className="text-ghost-green text-[10px]">(with secret)</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="text-gray-200 font-semibold">Unicode Tag Characters</h4>
            <p>
              Unicode defines a special range of characters called <span className="text-ghost-red font-mono">Tag Characters</span> (U+E0001 to U+E007F). These characters are <strong className="text-gray-200">completely invisible</strong> and take up zero visual space when rendered.
            </p>

            <h4 className="text-gray-200 font-semibold">How they're used natively</h4>
            <p>
              These tag characters are already used in standard Unicode to create subdivision flags. For example, the flags of Scotland <span className="text-xl align-middle">{"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F"}</span> and Wales <span className="text-xl align-middle">{"\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F"}</span> use tag characters after the black flag emoji to specify the region.
            </p>

            <h4 className="text-gray-200 font-semibold">The steganography trick</h4>
            <p>
              GhostInk maps each character of your secret message to its corresponding tag character (by adding <span className="font-mono text-ghost-red">0xE0000</span> to its Unicode code point). These tag characters are appended after any visible emoji, making it look identical to the original.
            </p>

            <h4 className="text-gray-200 font-semibold">Platform compatibility</h4>
            <div className="bg-ghost-surface rounded-lg p-3 space-y-1.5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-ghost-green">&#10003;</span>
                <span>Twitter/X - preserves tag characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ghost-green">&#10003;</span>
                <span>Signal - preserves tag characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ghost-green">&#10003;</span>
                <span>Email - preserves tag characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ghost-orange">~</span>
                <span>WhatsApp - may strip tag characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ghost-red">&#10007;</span>
                <span>Telegram - strips tag characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ghost-red">&#10007;</span>
                <span>Discord - strips tag characters</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
