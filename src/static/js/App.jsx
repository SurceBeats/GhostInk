import React, { useState } from "react";
import EncodePanel from "./EncodePanel.jsx";
import DecodePanel from "./DecodePanel.jsx";
import HowItWorks from "./HowItWorks.jsx";
import AccountMenu from "./AccountMenu.jsx";

const TABS = [
  { id: "encode", label: "Encode" },
  { id: "decode", label: "Decode" },
];

export default function App({ username }) {
  const [activeTab, setActiveTab] = useState("encode");

  return (
    <div className="min-h-screen flex flex-col">
      <AccountMenu initialUsername={username} />

      {/* Header */}
      <header className="border-b border-ghost-border">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="mr-2">{"\uD83D\uDC7B\uD83D\uDD8B\uFE0F"}</span>
            <span className="shimmer-text">GhostInk</span>
          </h1>
          <p className="text-ghost-muted text-sm mt-1 italic">Hide data in plain sight</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex bg-ghost-surface rounded-lg p-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === tab.id ? (tab.id === "encode" ? "bg-ghost-red text-white" : "bg-ghost-green text-black") : "text-ghost-muted hover:text-gray-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        {activeTab === "encode" ? <EncodePanel /> : <DecodePanel />}

        {/* How it works */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <footer className="border-t border-ghost-border py-4 text-center">
        <p className="text-xs text-ghost-muted">GhostInk v0.1.236 &mdash; Emoji Steganography Tool</p>
      </footer>
    </div>
  );
}
