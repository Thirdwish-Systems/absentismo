import React, { useState, useEffect } from 'react';
import {
    Users, AlertTriangle, ShieldCheck, Zap,
    Info, ArrowRight, Settings2, BarChart3, Clock,
    Smartphone, Search, Percent, Brain
} from 'lucide-react';
import { useCopilotStore } from '../../stores/copilotStore';
import { parseNaturalLanguage } from './copilot/intelligence';

interface RiskRule {
    id: string;
    label: string;
    description: string;
    count: number;
    periodDays: number;
    severity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
    enabled: boolean;
}

const MOCK_RULES: RiskRule[] = [
    {
        id: 'r1',
        label: "Recurrencia de IT Corta",
        description: "Alerta cuando una persona encadena varios episodios de corta duración.",
        count: 3,
        periodDays: 90,
        severity: 'Alta',
        enabled: true
    },
    {
        id: 'r2',
        label: "Patrón No-Show",
        description: "Detección temprana de ausencias no justificadas recurrentes.",
        count: 2,
        periodDays: 30,
        severity: 'Crítica',
        enabled: true
    },
    {
        id: 'r3',
        label: "Absentismo Parcial (Tardes)",
        description: "Seguimiento de puntualidad extrema y salidas anticipadas.",
        count: 5,
        periodDays: 60,
        severity: 'Media',
        enabled: false
    }
];

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

export default function RiskSettingsPersonal() {
    const { openCopilot, messages, addMessage } = useCopilotStore();
    const [rules, setRules] = useState<RiskRule[]>(MOCK_RULES);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Listen for complex rule creation from AI
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === 'user') {
            const parsed = parseNaturalLanguage(lastMessage.content, 'risk-settings');

            if (parsed.type === 'complex_rule' && parsed.value) {
                // Create new risk rule from natural language
                const newRule: RiskRule = {
                    id: `r_${Date.now()}`,
                    label: `Alerta personalizada: ${parsed.value.scope?.location || 'General'}`,
                    description: `Umbral: ${parsed.value.condition?.threshold || 'N/A'}% - Período: ${parsed.value.period || 'Continuo'}`,
                    count: parsed.value.condition?.threshold || 60,
                    periodDays: 7,
                    severity: parsed.value.condition?.threshold > 70 ? 'Crítica' : 'Alta',
                    enabled: true
                };

                setRules([newRule, ...rules]);

                addMessage({
                    sender: 'ai',
                    content: `✓ Regla creada correctamente para ${parsed.value.scope?.location || 'todos los centros'}`,
                    metadata: { appliedChanges: ['Nueva regla de riesgo personalizada'] }
                });
            }
        }
    }, [messages]);

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const updateValue = (id: string, field: 'count' | 'periodDays', val: string) => {
        const num = parseInt(val) || 0;
        setRules(rules.map(r => r.id === id ? { ...r, [field]: num } : r));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Riesgos Personales</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Umbrales de comportamiento y recurrencia</p>
                </div>
            </div>

            <div className="space-y-4">
                {rules.map((rule) => (
                    <div
                        key={rule.id}
                        className={cn(
                            "bg-white rounded-[40px] border p-8 transition-all duration-500 group",
                            rule.enabled ? "border-zinc-200 shadow-sm" : "border-zinc-100 opacity-60 bg-zinc-50/50"
                        )}
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-black text-zinc-900 tracking-tight leading-none">{rule.label}</h4>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                        rule.severity === 'Crítica' ? "bg-rose-100 text-rose-700" :
                                            rule.severity === 'Alta' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                    )}>
                                        {rule.severity}
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-lg">
                                    {rule.description}
                                </p>
                            </div>

                            <button
                                onClick={() => toggleRule(rule.id)}
                                className={cn(
                                    "h-7 w-12 rounded-full p-1 transition-all duration-300 relative",
                                    rule.enabled ? "bg-zinc-900" : "bg-zinc-200"
                                )}
                            >
                                <div className={cn(
                                    "h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300",
                                    rule.enabled ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-4 bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-colors">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Umbral</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={rule.count}
                                        onChange={(e) => updateValue(rule.id, 'count', e.target.value)}
                                        className="w-12 bg-transparent text-sm font-black text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-200 rounded px-1"
                                    />
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight whitespace-nowrap">bajas/incidencias</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-colors">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Periodo</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={rule.periodDays}
                                        onChange={(e) => updateValue(rule.id, 'periodDays', e.target.value)}
                                        className="w-12 bg-transparent text-sm font-black text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-200 rounded px-1"
                                    />
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight whitespace-nowrap">días naturales</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                                className={cn(
                                    "ml-auto text-xs font-bold flex items-center gap-2 transition-all p-2 rounded-xl",
                                    expandedId === rule.id ? "text-zinc-900 bg-zinc-100" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                                )}
                            >
                                <Settings2 size={14} />
                                {expandedId === rule.id ? "Ocultar parámetros" : "Configurar parámetros avanzados"}
                            </button>
                        </div>

                        {/* ADVANCED PARAMETERS DROPDOWN */}
                        {expandedId === rule.id && (
                            <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lógica de segmentación</h5>
                                    <div className="space-y-3">
                                        {[
                                            "Excluir fines de semana y festivos",
                                            "Solo considerar jornadas completas (>6h)",
                                            "Ignorar incidencias justificadas con anexo B"
                                        ].map((label, idx) => (
                                            <label key={idx} className="flex items-center gap-3 cursor-pointer group/label">
                                                <div className="h-5 w-5 rounded border border-zinc-200 flex items-center justify-center group-hover/label:border-zinc-400 transition-colors bg-white">
                                                    {idx === 0 && <div className="h-2.5 w-2.5 rounded-sm bg-zinc-900" />}
                                                </div>
                                                <span className="text-xs font-medium text-zinc-600 group-hover/label:text-zinc-900 transition-colors">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ponderación IA</h5>
                                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-zinc-500">Influencia antigüedad</span>
                                            <span className="text-xs font-black text-zinc-900">Media</span>
                                        </div>
                                        <input type="range" className="w-full h-1 bg-zinc-200 rounded-full appearance-none accent-zinc-900" />
                                        <p className="text-[9px] text-zinc-400 leading-relaxed italic">
                                            Ajusta cómo el historial previo afecta a la sensibilidad de este umbral personal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-zinc-900 tracking-tight mb-1 uppercase">Privacidad y Ética AI</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
                        Estas reglas no analizan motivos médicos o de salud. El sistema detecta <span className="text-zinc-900 font-bold italic">distribuciones temporales de eventos</span> para permitir una gestión operativa proactiva y equitativa.
                    </p>
                </div>
            </div>
        </div>
    );
}
