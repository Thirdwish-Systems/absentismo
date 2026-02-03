import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, Save, X,
    Clock, Users, Zap, CheckCircle2, Brain, Sparkles
} from 'lucide-react';
import { useCopilotStore } from '../../stores/copilotStore';
import { analyzeSubstitutionPolicies, parseNaturalLanguage } from './copilot/intelligence';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SubstitutionPriority = 'overtime' | 'ett' | 'internal' | 'none';

interface SubstitutionRule {
    id: string;
    collective: string;
    coveragePct: number;
    priority: SubstitutionPriority[];
    minStaffing: number;
    active: boolean;
}

interface CostRate {
    id: string;
    type: string;
    rate: number;
    unit: 'hora' | 'dia';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SubstitutionPolicies() {
    const { openCopilot, updateCompleteness, messages, addMessage } = useCopilotStore();

    const [rules, setRules] = useState<SubstitutionRule[]>([
        { id: '1', collective: 'Operativos Planta (L1)', coveragePct: 100, priority: ['overtime', 'ett'], minStaffing: 85, active: true },
        { id: '2', collective: 'Logística & Almacén', coveragePct: 80, priority: ['ett', 'overtime'], minStaffing: 70, active: true },
        { id: '3', collective: 'Staff / Oficinas', coveragePct: 15, priority: ['internal'], minStaffing: 0, active: false }
    ]);

    const [rates, setRates] = useState<CostRate[]>([
        { id: 'r1', type: 'Coste Hora Extra (Avg)', rate: 32.50, unit: 'hora' },
        { id: 'r2', type: 'Fee ETT (Margen)', rate: 18.20, unit: 'hora' }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);

    // Update completeness when data changes
    useEffect(() => {
        const completeness = analyzeSubstitutionPolicies({ rules, rates });
        updateCompleteness('substitutions', completeness);
    }, [rules, rates, updateCompleteness]);

    // Listen for AI messages and auto-fill
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === 'user') {
            const parsed = parseNaturalLanguage(lastMessage.content, 'substitutions');

            if (parsed.type === 'cost' && parsed.value > 0) {
                // Auto-fill first empty rate or update first rate
                const emptyRate = rates.find(r => r.rate === 0);
                if (emptyRate) {
                    handleRateChange(emptyRate.id, parsed.value.toString());
                    addMessage({
                        sender: 'ai',
                        content: `✓ He actualizado el coste a ${parsed.value}€/hora`,
                        metadata: { appliedChanges: [`Coste: ${parsed.value}€`] }
                    });
                }
            }

            if (parsed.type === 'percentage' && parsed.value > 0) {
                // Auto-fill first empty coverage or update first rule
                const emptyRule = rules.find(r => r.coveragePct === 0);
                if (emptyRule) {
                    handleRuleChange(emptyRule.id, 'coveragePct', parsed.value);
                    addMessage({
                        sender: 'ai',
                        content: `✓ He configurado ${parsed.value}% de cobertura`,
                        metadata: { appliedChanges: [`Cobertura: ${parsed.value}%`] }
                    });
                }
            }
        }
    }, [messages]);

    const handleToggleActive = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const handleDeleteRule = (id: string) => {
        if (confirm('¿Eliminar esta política de cobertura?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    const handleRateChange = (id: string, value: string) => {
        setRates(rates.map(r => r.id === id ? { ...r, rate: parseFloat(value) || 0 } : r));
    };

    const handleRuleChange = (id: string, field: keyof SubstitutionRule, value: any) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-500">

            {/* SECCIÓN 1: REGLAS DE COBERTURA */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-zinc-900">Políticas por Colectivo</h2>
                        <p className="text-sm text-zinc-500">Configura el porcentaje de cobertura y personal mínimo por cada grupo.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openCopilot('substitutions')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <Brain size={16} className="animate-pulse" /> Asistente IA
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all">
                            <Plus size={16} /> Añadir Grupo
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Colectivo / Grupo</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Cobertura</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">SLA Mín.</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-zinc-900">{rule.collective}</div>
                                        <div className="flex gap-2 mt-1">
                                            {rule.priority.map(p => (
                                                <span key={p} className="text-[9px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded font-bold uppercase">{p}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="number"
                                            value={rule.coveragePct}
                                            onChange={(e) => handleRuleChange(rule.id, 'coveragePct', parseInt(e.target.value))}
                                            className="w-16 text-center border-b border-transparent focus:border-zinc-300 focus:outline-none text-sm font-bold bg-transparent"
                                        />
                                        <span className="text-xs text-zinc-400 font-bold">%</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="number"
                                            value={rule.minStaffing}
                                            onChange={(e) => handleRuleChange(rule.id, 'minStaffing', parseInt(e.target.value))}
                                            className="w-16 text-center border-b border-transparent focus:border-zinc-300 focus:outline-none text-sm font-bold bg-transparent"
                                        />
                                        <span className="text-xs text-zinc-400 font-bold">%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(rule.id)}
                                            className={`h-6 w-11 rounded-full relative transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${rule.active ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-zinc-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECCIÓN 2: COSTES FINANCIEROS */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">Costes de Sustitución</h2>
                    <p className="text-sm text-zinc-500">Precios medios por hora para el cálculo del impacto económico.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rates.map(rate => (
                        <div key={rate.id} className="p-6 bg-white border border-zinc-200 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400">
                                    <Clock size={20} />
                                </div>
                                <span className="text-sm font-bold text-zinc-700">{rate.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rate.rate}
                                    onChange={(e) => handleRateChange(rate.id, e.target.value)}
                                    className="w-24 h-10 px-3 bg-zinc-50 border border-transparent focus:bg-white focus:border-zinc-200 rounded-lg text-right font-bold text-zinc-900 outline-none transition-all"
                                />
                                <span className="text-xs font-bold text-zinc-400">€/{rate.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BOTÓN GUARDAR (Simple y directo) */}
            <div className="flex justify-end pt-8">
                <button className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 active:scale-95 transition-all">
                    <Save size={18} /> Guardar cambios configuración
                </button>
            </div>

        </div>
    );
}
