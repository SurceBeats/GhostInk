import React from "react";

const typeStyles = {
  visible: {
    bg: "bg-emerald-900/40",
    border: "border-emerald-700/50",
    text: "text-emerald-400",
    label: "Visible",
  },
  tag: {
    bg: "bg-red-900/40",
    border: "border-red-700/50",
    text: "text-red-400",
    label: "Hidden",
  },
  cancel: {
    bg: "bg-gray-800/40",
    border: "border-gray-600/50",
    text: "text-gray-400",
    label: "Cancel Tag",
  },
};

export default function CodepointViewer({ codepoints }) {
  if (!codepoints || codepoints.length === 0) return null;

  const visibleCount = codepoints.filter((c) => c.type === "visible").length;
  const hiddenCount = codepoints.filter((c) => c.type === "tag").length;
  const cancelCount = codepoints.filter((c) => c.type === "cancel").length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-3 text-xs font-mono">
        <span className="text-emerald-400">{visibleCount} visible</span>
        <span className="text-red-400">{hiddenCount} hidden</span>
        {cancelCount > 0 && <span className="text-gray-400">{cancelCount} cancel</span>}
        <span className="text-ghost-muted">{codepoints.length} total</span>
      </div>

      <div className="grid gap-1.5">
        {codepoints.map((cp, i) => {
          const style = typeStyles[cp.type];
          return (
            <div key={i} className={`flex items-center gap-3 px-3 py-1.5 rounded ${style.bg} border ${style.border} font-mono text-sm`}>
              <span className="text-ghost-muted text-xs w-6 text-right shrink-0">{i}</span>
              <span className="text-lg w-8 text-center shrink-0">{cp.type === "visible" ? cp.char : cp.type === "tag" ? cp.char : "\u26D4"}</span>
              <span className={`${style.text} text-xs`}>U+{cp.codepoint.toString(16).toUpperCase().padStart(5, "0")}</span>
              <span className={`${style.text} text-xs opacity-60 ml-auto`}>{style.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
