import React, { useState, useEffect } from "react";

export default function AccountMenu({ initialUsername }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [form, setForm] = useState({ username: "", password: "", confirm: "", current: "" });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  function openModal() {
    setMsg(null);
    setForm({ username: "", password: "", confirm: "", current: "" });
    setOpen(true);
  }

  function closeModal() {
    setVisible(false);
    setTimeout(() => setOpen(false), 200);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setMsg(null);
    if (!form.current) return setMsg({ ok: false, text: "Current password is required." });
    if (!form.username && !form.password) return setMsg({ ok: false, text: "Nothing to change." });

    const body = { current_password: form.current };
    if (form.username) body.username = form.username;
    if (form.password) {
      body.new_password = form.password;
      body.confirm_password = form.confirm;
    }

    try {
      const res = await fetch("/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: "Account updated. Redirecting to login..." });
        setTimeout(() => {
          window.location.href = "/logout";
        }, 1200);
      } else {
        setMsg({ ok: false, text: data.msg });
      }
    } catch {
      setMsg({ ok: false, text: "Connection error." });
    }
  }

  return (
    <>
      <button onClick={openModal} title="Account" className="fixed top-3 right-4 z-50 p-1.5 rounded-lg opacity-50 hover:opacity-90 transition-all cursor-pointer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200" style={{ opacity: visible ? 1 : 0 }} onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative w-full max-w-sm mx-4 bg-ghost-surface border border-ghost-border rounded-2xl p-6 shadow-2xl transition-all duration-200" style={{ transform: visible ? "scale(1)" : "scale(0.95)", opacity: visible ? 1 : 0 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-3 right-3 text-ghost-muted hover:text-gray-300 transition cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg font-semibold text-white mb-1">Account</h2>
            <p className="text-xs text-ghost-muted mb-5">
              Signed in as <span className="text-gray-200 font-semibold">{username}</span>
            </p>

            {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-4 border ${msg.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>{msg.text}</div>}

            <Field label="New username" value={form.username} onChange={(v) => update("username", v)} placeholder={username} />
            <Field label="New password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Leave blank to keep" />
            <Field label="Confirm new password" type="password" value={form.confirm} onChange={(v) => update("confirm", v)} />
            <Field label="Current password" type="password" value={form.current} onChange={(v) => update("current", v)} required />

            <button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2.5 rounded-lg transition cursor-pointer mt-1">
              Save Changes
            </button>

            <hr className="border-ghost-border my-4" />

            <a href="/logout" className="block text-center text-sm text-red-400 hover:text-red-300 transition-colors">
              Logout
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-ghost-muted mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-ghost-dark border border-ghost-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" />
    </div>
  );
}
