import React, { useState } from 'react';
import {
    X, ShieldCheck, FileText, Target,
    Calendar, User, Link as LinkIcon,
    ArrowRight, MessageSquare, CheckCircle2
} from 'lucide-react';
import { Risk } from './automationTypes';

export default function AlternativeSolution({
    risk,
    onClose,
    onSave
}: {
    risk: Risk;
    onClose: () => void;
    onSave: (solution: any) => void;
}) {
    const [form, setForm] = useState({
        description: '',
        expectedResult: '',
        actualResult: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        owner: 'Manager Actual',
        evidence: ''
    });

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-2">
                <div className="bg-zinc-50/50 rounded-[2.5rem] flex flex-col h-full overflow-hidden">

                    {/* Header */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-200 text-zinc-600 flex items-center justify-center shadow-sm">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Plan de Acción Manual</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Registrar intervención operativa directa</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 px-8 pb-8 overflow-y-auto space-y-6">
                        <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100/50 flex items-start gap-3">
                            <Target size={16} className="text-violet-500 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Riesgo a Mitigar</div>
                                <div className="text-sm font-semibold text-zinc-900">{risk.name}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Descripción de la Solución</label>
                                <textarea
                                    className="w-full h-24 p-4 bg-white border border-zinc-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-200 resize-none transition-all placeholder:text-zinc-300"
                                    placeholder="Describe qué acciones manuales se han tomado o se van a tomar..."
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Resultado Esperado</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-zinc-300"
                                        placeholder="Ej: Reducir impacto en 20%"
                                        value={form.expectedResult}
                                        onChange={(e) => setForm(f => ({ ...f, expectedResult: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Responsable / Owner</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                        <input
                                            type="text"
                                            className="w-full h-11 pl-9 pr-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-200"
                                            value={form.owner}
                                            onChange={(e) => setForm(f => ({ ...f, owner: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Fecha Inicio</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                        <input
                                            type="date"
                                            className="w-full h-11 pl-9 pr-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none"
                                            value={form.startDate}
                                            onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Evidencia / Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                        <input
                                            type="text"
                                            className="w-full h-11 pl-9 pr-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none placeholder:text-zinc-300"
                                            placeholder="URL de reporte o nota..."
                                            value={form.evidence}
                                            onChange={(e) => setForm(f => ({ ...f, evidence: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-1" />
                            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                                Registrar esta solución marcará el riesgo como <span className="font-bold">Mitigado Manualmente</span> en el Hub, permitiendo el seguimiento de impacto sin necesidad de un flujo automático.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-white border-t border-zinc-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="h-12 px-6 rounded-2xl text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-600 transition-all font-sans"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={() => onSave(form)}
                            className="h-12 px-8 rounded-2xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                        >
                            Guardar Registro <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
