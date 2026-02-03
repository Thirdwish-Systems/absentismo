import React, { useState } from 'react';
import {
    Users, Briefcase, TrendingUp, Info,
    CheckCircle2, Plus, Trash2, Sliders, Brain
} from 'lucide-react';
import { useCopilotStore } from '../../stores/copilotStore';
import { analyzeRiskMirrors } from './copilot/intelligence';

export default function RiskSettingsMirrors() {
    const { openCopilot, updateCompleteness } = useCopilotStore();

    const [criteria, setCriteria] = useState([
        { id: '1', label: 'Tolerancia de Headcount', value: '15', unit: '%', type: 'range' },
        { id: '2', label: 'Coincidencia de Mix de Roles', value: '70', unit: '% min', type: 'match' },
        { id: '3', label: 'Categoría de Facturación (Tier)', value: 'Exacto', unit: '', type: 'fixed' },
        { id: '4', label: 'Dispersión Geográfica', value: '50', unit: 'km max', type: 'range' }
    ]);

    React.useEffect(() => {
        const analysis = analyzeRiskMirrors({ criteria });
        updateCompleteness('mirror-centers', analysis);
    }, [criteria, updateCompleteness]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Configuración de Centros Espejo</h3>
                    <p className="text-[11px] text-zinc-500 mt-1">Define los parámetros que utiliza la IA para identificar unidades comparables.</p>
                </div>
                <button
                    onClick={() => openCopilot('mirror-centers')}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all active:scale-95"
                >
                    <Brain size={12} />
                    Asistente IA
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Sliders size={12} /> Criterios de Emparejamiento
                    </div>
                    <button className="text-[10px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-all">
                        <Plus size={12} /> Añadir Criterio
                    </button>
                </div>

                <div className="divide-y divide-zinc-50">
                    {criteria.map((item) => (
                        <div key={item.id} className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-100">
                                    {item.label.includes('Headcount') ? <Users size={18} /> :
                                        item.label.includes('Roles') ? <Briefcase size={18} /> :
                                            item.label.includes('Facturación') ? <TrendingUp size={18} /> : <Info size={18} />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-900">{item.label}</div>
                                    <div className="text-[10px] text-zinc-400 font-medium">Factor de peso: <span className="text-zinc-900">Alto</span></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={() => { }}
                                        className="w-20 px-3 py-1.5 bg-zinc-100 border-transparent rounded-lg text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-violet-200 transition-all text-center"
                                    />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">{item.unit}</span>
                                </div>
                                <button className="p-2 text-zinc-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-violet-50 rounded-[32px] border border-violet-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                        <CheckCircle2 size={18} />
                    </div>
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Validación de Modelo</h4>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                    Con esta configuración, la IA identifica una media de <span className="text-violet-700 font-black">3.2 centros espejo</span> por unidad de negocio con un nivel de confianza del <span className="text-violet-700 font-black">88%</span>.
                </p>
            </div>
        </div>
    );
}
