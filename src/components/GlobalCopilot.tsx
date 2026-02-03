import React, { useState, useEffect } from "react";
import { Brain, Sparkles, ArrowUp, Eraser, X, MessageCircle } from "lucide-react";

// --- UI COMPONENTS (Copied from Module 4 for consistency) ---

const Pill = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={`flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
        {children}
    </div>
);

// --- MAIN COMPONENT ---

export default function GlobalCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [msgs, setMsgs] = useState([
        { role: "assistant", text: "Hola, soy tu Copiloto Global. Puedo ayudarte a navegar por los datos o responder dudas sobre absentismo." }
    ]);

    // Handle mock send
    const handleSend = () => {
        if (!prompt.trim()) return;
        setMsgs((prev) => [...prev, { role: "user", text: prompt }]);
        setTimeout(() => {
            setMsgs((prev) => [...prev, { role: "assistant", text: "Entendido. Ahora mismo estoy en modo demo, pero pronto podré cruzar datos de todos los módulos." }]);
        }, 600);
        setPrompt("");
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON (FAB) */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className={`
            group flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all hover:scale-110 active:scale-95
            ${isOpen ? "bg-zinc-100 text-zinc-400 scale-0 opacity-0" : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"}
          `}
                    title="Abrir Copiloto IA"
                >
                    <div className="relative">
                        <Brain className="h-7 w-7" />
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                    </div>
                </button>
            </div>

            {/* DRAWER OVERLAY & PANEL */}
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-zinc-900/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Panel */}
            <div
                className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out border-l border-zinc-200
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
            >
                <div className="flex h-full flex-col">

                    {/* HEADER */}
                    <div className="flex items-center justify-between gap-3 p-4 shrink-0 bg-white border-b border-zinc-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-zinc-900">Copiloto IA</div>
                                <div className="text-xs text-zinc-500">Asistente Global</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Pill className="border-violet-100 bg-violet-50 text-violet-700">
                                <Sparkles className="h-3.5 w-3.5 mr-1" />
                                <span>Activo</span>
                            </Pill>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* CHAT BODY */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
                        {msgs.map((m, idx) => (
                            <div
                                key={idx}
                                className={`
                        flex w-full 
                        ${m.role === 'user' ? 'justify-end' : 'justify-start'}
                    `}
                            >
                                <div className={`
                        max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm
                        ${m.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-none'
                                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none'
                                    }
                    `}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER INPUT */}
                    <div className="border-t border-zinc-200 bg-white p-4 shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={1}
                                placeholder="Pregúntame lo que sea..."
                                className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-zinc-400 min-h-[48px]"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                title="Enviar"
                            >
                                <ArrowUp className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between px-1">
                            <div className="text-[10px] font-medium text-zinc-400">Enter envía</div>
                            <button
                                onClick={() => setMsgs([])}
                                className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 transition"
                            >
                                <Eraser className="h-3 w-3" />
                                Limpiar historial
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
