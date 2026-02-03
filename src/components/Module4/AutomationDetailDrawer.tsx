import React from 'react';
import {
    X, Zap, BarChart3, Euro, History,
    ArrowRight, CheckCircle2, ShieldAlert,
    Clock, AlertTriangle, Layers, Calendar,
    Activity, Target, ListChecks, User, Timer
} from 'lucide-react';
import { Workflow, AutomationRun, Risk, Outcome } from './automationTypes';
import { fmtEUR } from '../../utils/formatters';
import { MOCK_RUNS, MOCK_RISKS } from './mockAutomations';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

const OutcomeBadge = ({ outcome }: { outcome: Outcome }) => {
    const config = {
        AVOIDED: { label: 'Evitado', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        REDUCED: { label: 'Reducido', color: 'text-amber-600 bg-amber-50 border-amber-100' },
        NO_EFFECT: { label: 'Sin efecto', color: 'text-zinc-400 bg-zinc-50 border-zinc-100' },
    };
    const { label, color } = config[outcome];
    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tight", color)}>
            {label}
        </span>
    );
};

export default function AutomationDetailDrawer({
    automation,
    onClose
}: {
    automation: Workflow | null;
    onClose: () => void;
}) {
    if (!automation) return null;

    const risk = MOCK_RISKS.find(r => r.id === automation.riskId);
    const automationRuns = MOCK_RUNS.filter(run => run.automationId === automation.id);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-end bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-white/20">
                {/* Header */}
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-[24px] bg-violet-600 text-white flex items-center justify-center shadow-xl shadow-violet-100 ring-4 ring-white">
                            <ListChecks size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                                {risk?.name || 'Protocolo Activo'}
                            </h3>
                            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                <Layers size={12} /> ID: {automation.id} <span className="text-zinc-200">•</span> <Calendar size={12} /> Creado: {automation.createdAt}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-12 w-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-zinc-50 rounded-[32px] p-6 border border-zinc-200/50 shadow-sm">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-emerald-600">
                                <BarChart3 size={12} /> Éxito
                            </div>
                            <div className="text-3xl font-bold text-zinc-900 tracking-tighter">
                                {automation.successRate}%
                            </div>
                            <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Eficacia Real</div>
                        </div>
                        <div className="bg-zinc-50 rounded-[32px] p-6 border border-zinc-200/50 shadow-sm">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-violet-600">
                                <Activity size={12} /> Lanzamientos
                            </div>
                            <div className="text-3xl font-bold text-zinc-900 tracking-tighter">
                                {automation.runsCount}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Ejecuciones</div>
                        </div>
                        <div className="bg-zinc-50 rounded-[32px] p-6 border border-zinc-200/50 shadow-sm">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 text-emerald-700">
                                <Euro size={12} /> Ahorro Est.
                            </div>
                            <div className="text-3xl font-bold text-emerald-600 tracking-tighter">
                                {fmtEUR(automation.savedEur)}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Impacto Histórico</div>
                        </div>
                    </div>

                    {/* Logic Section */}
                    <section className="bg-zinc-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                            <Target size={100} />
                        </div>
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            Lógica de Activación
                        </h4>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-violet-400 shrink-0">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Condición de Disparo</div>
                                    <div className="text-sm text-zinc-400 mt-1">
                                        Estado actual: <span className="font-bold text-violet-400">{automation.config.condition}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Alcance de Vigilancia</div>
                                    <div className="text-sm text-zinc-400 mt-1">
                                        Monitorizando <span className="font-bold text-zinc-200">{automation.config.scope.center || automation.config.scope.province || 'General'}</span>.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Workflow Tasks */}
                    <section>
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <ListChecks size={18} className="text-violet-600" /> Plan de Acción Definido
                        </h4>
                        <div className="space-y-6">
                            {automation.tasks.map((task, idx) => (
                                <div key={task.id} className="flex gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-xs font-black transition-all shadow-sm",
                                            task.status === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 text-zinc-400'
                                        )}>
                                            {task.status === 'COMPLETADA' ? <CheckCircle2 size={18} /> : idx + 1}
                                        </div>
                                        {idx !== automation.tasks.length - 1 && (
                                            <div className="w-px h-full bg-zinc-100 my-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-base font-bold text-zinc-900 group-hover:text-violet-700 transition-colors">{task.title}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    task.priority === 'ALTA' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100')}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-4">{task.description}</p>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-zinc-300" />
                                                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">{task.owner}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Timer size={14} className="text-zinc-300" />
                                                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">{task.deadline}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Run History */}
                    <section className="pt-4">
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 font-sans">
                            <History size={18} /> Historial Operativo
                        </h4>
                        <div className="space-y-4">
                            {automationRuns.map(run => (
                                <div key={run.id} className="p-6 rounded-[2.5rem] border border-zinc-200 bg-white hover:border-violet-200 transition-all group shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 transition-colors">{run.date}</div>
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Cierre de incidencia</div>
                                            </div>
                                        </div>
                                        <OutcomeBadge outcome={run.outcome} />
                                    </div>
                                    <div className="flex items-end justify-between border-t border-zinc-50 pt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {run.actionsExecuted.map((act, i) => (
                                                <span key={i} className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-bold text-zinc-500 border border-zinc-100">
                                                    {act}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Impacto Mitigado</div>
                                            <div className="text-base font-bold text-emerald-600 font-mono tracking-tighter">{fmtEUR(run.savedEurEstimated)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4 shrink-0">
                    <button className="flex-1 h-14 rounded-[2rem] bg-white border border-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
                        <Timer size={18} /> Historial Completo
                    </button>
                    <button className="flex-1 h-14 rounded-[2rem] bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-95">
                        Editar Protocolo <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
