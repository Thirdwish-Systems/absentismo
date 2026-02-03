import React, { useState } from 'react';
import {
    Calendar, MapPin, Building2, AlertTriangle,
    Plus, Trash2, Edit3, Save, X, Sparkles,
    ChevronRight, ArrowRight, Zap
} from 'lucide-react';

interface SeasonalRisk {
    id: string;
    name: string;
    scope: 'Empresa' | 'Provincia' | 'Centro';
    scopeDetail: string;
    period: string;
    type: string;
    advanceWeeks: number;
    action: string;
}

const MOCK_SEASONAL: SeasonalRisk[] = [
    {
        id: 's1',
        name: 'Carnavales Cádiz',
        scope: 'Provincia',
        scopeDetail: 'Cádiz',
        period: '2ª semana Febrero',
        type: 'No-show / IT Corta',
        advanceWeeks: 4,
        action: "Plan de refuerzo 'Eventos locales' (E-102)"
    },
    {
        id: 's2',
        name: 'Pico Gripe Estacional',
        scope: 'Empresa',
        scopeDetail: 'Toda la red',
        period: 'Ene - Feb',
        type: 'IT Corta / Media',
        advanceWeeks: 2,
        action: "Campaña comunicación preventiva"
    }
];

export default function RiskSettingsSeasonal() {
    const [risks, setRisks] = useState<SeasonalRisk[]>(MOCK_SEASONAL);
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 tracking-tight">Riesgos Estacionales</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Configuración de picos cíclicos</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                >
                    <Plus size={14} /> Crear Evento
                </button>
            </div>

            <div className="space-y-4">
                {risks.map((risk) => (
                    <div key={risk.id} className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm group hover:border-amber-100 transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                                        {risk.scope === 'Provincia' ? <MapPin size={16} /> : risk.scope === 'Centro' ? <Building2 size={16} /> : <Zap size={16} />}
                                    </div>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{risk.scope}: {risk.scopeDetail}</span>
                                </div>
                                <h4 className="text-lg font-black text-zinc-900 tracking-tight">{risk.name}</h4>
                            </div>

                            <div className="md:col-span-3">
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Periodo / Tipo</div>
                                <div className="text-xs font-bold text-zinc-700">{risk.period}</div>
                                <div className="text-[10px] text-zinc-500 font-medium underline decoration-zinc-200 underline-offset-4 mt-1">{risk.type}</div>
                            </div>

                            <div className="md:col-span-3">
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Anticipación AI</div>
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 rounded-lg bg-zinc-900 text-white text-[10px] font-black">{risk.advanceWeeks}w</div>
                                    <span className="text-[10px] text-zinc-400 font-medium">Semanas antes</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                                    <Edit3 size={16} />
                                </button>
                                <button className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center gap-3">
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">
                                Playbook Auto
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium italic">Acción: {risk.action}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty stats/note */}
            <div className="p-8 bg-zinc-900 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles size={100} />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black tracking-tight mb-2">IA Estacional Activa</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium max-w-xl">
                            La plataforma detectará automáticamente la cercanía de estos eventos y disparará los warnings en el módulo de Predicción. No necesitas configurar eventos de calendario estándar (ej. Navidad, Semana Santa), el sistema ya los conoce.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
