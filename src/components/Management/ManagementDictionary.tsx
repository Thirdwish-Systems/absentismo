import React, { useState } from 'react';
import {
    ShieldCheck, Calendar, Zap, Info, ChevronRight,
    Settings2, Plus, FileSpreadsheet, AlertCircle, Sparkles,
    ToggleLeft, ToggleRight, ArrowRight, Database
} from 'lucide-react';
import { ABSENCE_DICTIONARY, AbsenceType } from '../Module3/AbsenceDictionary';

export default function ManagementDictionary() {
    const [category, setCategory] = useState<'GESTIONABLE' | 'NO_GESTIONABLE'>('GESTIONABLE');
    const [selectedType, setSelectedType] = useState<AbsenceType | null>(null);

    const filteredTypes = ABSENCE_DICTIONARY.filter(t => t.category === category);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 h-full overflow-hidden">
            {/* List Side */}
            <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                {/* Segmented Control */}
                <div className="inline-flex p-1 bg-zinc-100 rounded-2xl w-full max-w-md">
                    <button
                        onClick={() => setCategory('GESTIONABLE')}
                        className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${category === 'GESTIONABLE' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Gestionable
                    </button>
                    <button
                        onClick={() => setCategory('NO_GESTIONABLE')}
                        className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${category === 'NO_GESTIONABLE' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        No gestionable
                    </button>
                </div>

                <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm flex-1 flex flex-col">
                    <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Diccionario Canónico de Absentismo</div>
                        <div className="text-[10px] text-zinc-400 font-medium tracking-tight">Modelo unificado para el análisis operacional</div>
                    </div>

                    <div className="overflow-y-auto divide-y divide-zinc-50">
                        {filteredTypes.map(type => (
                            <div
                                key={type.id}
                                onClick={() => setSelectedType(type)}
                                className={`p-5 flex items-center justify-between hover:bg-zinc-50/50 cursor-pointer transition-all ${selectedType?.id === type.id ? 'bg-violet-50/30 ring-1 ring-inset ring-violet-100' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${type.category === 'GESTIONABLE' ? 'bg-violet-50 text-violet-600' : 'bg-zinc-50 text-zinc-400'}`}>
                                        {type.predecible ? <Sparkles className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-zinc-900">{type.label}</span>
                                            {type.predecible && (
                                                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[8px] font-bold uppercase tracking-widest border border-violet-200">IA</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 line-clamp-1">{type.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2" title="Incluir en KPI Gestionable">
                                        <div className="text-[8px] font-bold text-zinc-300 uppercase">En KPI</div>
                                        {type.entraEnKPI ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-zinc-200" />}
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedType?.id === type.id ? 'translate-x-1 text-violet-400' : 'text-zinc-200'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HRIS Mapping Block */}
                <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-900">Mapeo de códigos del HRIS</h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5">Asocia tus códigos nativos (Workday, Cegid, SAP) al modelo canónico.</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all shadow-sm">
                            <Plus className="h-3.5 w-3.5" />
                            Añadir mapeo
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-zinc-100">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="px-4 py-3">Source HRIS</th>
                                    <th className="px-4 py-3">Código Origen</th>
                                    <th className="px-4 py-3">Nombre Original</th>
                                    <th className="px-4 py-3">Tipo Canónico</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                <tr>
                                    <td className="px-4 py-4 text-zinc-900 font-medium">Workday</td>
                                    <td className="px-4 py-4 font-mono text-zinc-400">AB_EC_04</td>
                                    <td className="px-4 py-4 text-zinc-600 italic">Enfermedad Común {"<"} 3 días</td>
                                    <td className="px-4 py-4"><span className="px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 font-bold text-[10px]">IT_CC_CORTA</span></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-zinc-900 font-medium">Workday</td>
                                    <td className="px-4 py-4 font-mono text-zinc-400">AB_AT_01</td>
                                    <td className="px-4 py-4 text-zinc-600 italic">Accidente In Itinere</td>
                                    <td className="px-4 py-4"><span className="px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 font-bold text-[10px]">IT_AT</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-4">
                <div className="sticky top-6 bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                    {!selectedType ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
                                <Info className="h-6 w-6" />
                            </div>
                            <h5 className="text-sm font-bold text-zinc-400">Detalle del Tipo</h5>
                            <p className="text-[11px] text-zinc-300 mt-1">Selecciona un tipo para ver su definición operativa y acciones recomendadas.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">{selectedType.label}</h3>
                                <p className="text-xs text-zinc-500 mt-1 italic">"{selectedType.description}"</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    Lógica Operacional
                                </h5>
                                <div className="p-3 bg-white rounded-xl border border-zinc-200 font-mono text-[10px] text-zinc-600 break-all leading-relaxed">
                                    {selectedType.rule}
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                                    <Database className="h-3 w-3" />
                                    Captura: <span className="text-zinc-900 font-bold">{selectedType.source}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-2">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    Acción recomendada
                                </h5>
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                        {selectedType.recommendedAction}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-zinc-100 text-[10px] leading-relaxed text-zinc-400 bg-zinc-50/20">
                                <strong>Calidad del dato:</strong> Impacto <span className="text-zinc-900">{selectedType.qualityImpact}</span>.
                                Se sincroniza cada 24h con el sistema de nóminas.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
