import React, { useEffect, useRef, useState } from 'react';
import { useCopilotStore } from '../../stores/copilotStore';
import {
    Brain, X, Minimize2, Maximize2, Send, Sparkles,
    AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';

export default function ConfigCopilot() {
    const {
        isOpen,
        isMinimized,
        messages,
        isTyping,
        userData,
        currentSection,
        closeCopilot,
        toggleMinimize,
        addMessage,
        setTyping,
    } = useCopilotStore();

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        // Add user message
        addMessage({
            sender: 'user',
            content: inputValue.trim(),
        });

        // Clear input
        setInputValue('');

        // Simulate AI processing and response
        processUserInput(inputValue.trim());
    };

    const processUserInput = async (input: string) => {
        setTyping(true);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Simple pattern matching for demo
        const response = generateAIResponse(input, currentSection);

        setTyping(false);
        addMessage({
            sender: 'ai',
            content: response,
            metadata: { confidence: 0.95 },
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    // Minimized state - just a small bar
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-[200]">
                <button
                    onClick={toggleMinimize}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95"
                >
                    <Brain size={20} className="animate-pulse" />
                    <span className="text-sm font-bold">Asistente IA</span>
                    {messages.length > 0 && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-black">
                            {messages.length}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    // Full chat interface
    return (
        <div className="fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-zinc-200 shadow-2xl z-[200] flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            Asistente IA
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-medium">
                            {currentSection ? getSectionName(currentSection) : 'Configuración'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMinimize}
                        className="h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                        title="Minimizar"
                    >
                        <Minimize2 size={16} />
                    </button>
                    <button
                        onClick={closeCopilot}
                        className="h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                        title="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-zinc-50/30">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                            <Sparkles size={32} className="text-violet-600" />
                        </div>
                        <h4 className="text-base font-bold text-zinc-900 mb-2">
                            ¡Hola {userData.name}!
                        </h4>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Estoy aquí para ayudarte a completar la configuración. Puedes escribirme en lenguaje natural y yo me encargaré de rellenar los datos por ti.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} userName={userData.name} />
                ))}

                {isTyping && (
                    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Brain size={16} className="text-white" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                            <Loader2 size={14} className="text-violet-600 animate-spin" />
                            <span className="text-xs text-zinc-400 font-medium">escribiendo...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-white">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe aquí o describe lo que necesitas..."
                            className="w-full px-4 py-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 text-center">
                    Puedes usar lenguaje natural para cualquier configuración
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble Component
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
    message: any;
    userName: string;
}

function MessageBubble({ message, userName }: MessageBubbleProps) {
    const isAI = message.sender === 'ai';

    return (
        <div
            className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isAI ? '' : 'flex-row-reverse'
                }`}
        >
            {/* Avatar */}
            <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${isAI
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-500'
                        : 'bg-gradient-to-br from-zinc-600 to-zinc-800'
                    }`}
            >
                {isAI ? (
                    <Brain size={16} className="text-white" />
                ) : (
                    <span className="text-xs font-bold text-white">
                        {userName.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Message Content */}
            <div
                className={`max-w-[280px] px-4 py-3 rounded-2xl shadow-sm ${isAI
                        ? 'bg-white border border-zinc-100 rounded-tl-sm'
                        : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                    }`}
            >
                <p className={`text-sm leading-relaxed ${isAI ? 'text-zinc-700' : 'text-white'}`}>
                    {message.content}
                </p>

                {/* Show applied changes if any */}
                {message.metadata?.appliedChanges && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 space-y-1">
                        {message.metadata.appliedChanges.map((change: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-emerald-600">
                                <CheckCircle2 size={12} />
                                <span>{change}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getSectionName(section: string): string {
    const names: Record<string, string> = {
        'impact-engines': 'Motores de Impacto',
        'substitutions': 'Políticas de Sustitución',
        'risk-settings': 'Configuración de Riesgos',
        'mirror-centers': 'Centros Espejo',
        'available-data': 'Datos Disponibles',
    };
    return names[section] || 'Configuración';
}

function generateAIResponse(input: string, section: string | null): string {
    const lowerInput = input.toLowerCase();

    // Pattern matching for costs/rates
    if (lowerInput.match(/\d+([.,]\d+)?\s*(€|euros?|eur)/i)) {
        const match = lowerInput.match(/(\d+([.,]\d+)?)\s*(€|euros?|eur)/i);
        if (match) {
            return `Perfecto ✓ He guardado ${match[1]}€ en la configuración. ¿Hay algún otro dato que necesites actualizar?`;
        }
    }

    // Pattern matching for percentages
    if (lowerInput.match(/\d+\s*%/)) {
        const match = lowerInput.match(/(\d+)\s*%/);
        if (match) {
            return `Entendido ✓ He configurado ${match[1]}% como indicaste. ¿Necesitas algo más?`;
        }
    }

    // Complex rule detection
    if (lowerInput.includes('todas') && (lowerInput.includes('tiendas') || lowerInput.includes('centros'))) {
        return `He creado la regla personalizada que describiste:\n\n📍 Alcance detectado\n📅 Período analizado\n⚠️ Condición configurada\n🔔 Alertas activadas\n\n¿Es correcto o quieres que ajuste algo?`;
    }

    // Default helpful response
    return `Gracias por la información. Estoy procesando lo que me has dicho. ¿Puedes darme algún detalle más específico o confirmar si he entendido correctamente?`;
}
