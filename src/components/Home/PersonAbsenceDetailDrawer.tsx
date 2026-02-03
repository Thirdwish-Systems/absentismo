import React from 'react';
import {
    X, User, Briefcase, MapPin, Calendar,
    Clock, Euro, ShieldAlert, CheckCircle2,
    ArrowRight, MessageSquare, AlertTriangle,
    History, Fingerprint, Zap
} from 'lucide-react';

interface PersonAbsenceDetailProps {
    person: {
        id: string;
        name: string;
        role: string;
        store: string;
        type: string;
        start: string;
        cost: number;
        critical: boolean;
        reportedBy: string;
        reportedAt: string;
    } | null;
    onClose: () => void;
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

export default function PersonAbsenceDetailDrawer({ person, onClose }: PersonAbsenceDetailProps) {
    if (!person) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-end bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Header Container */}
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-[22px] flex items-center justify-center text-xl font-light shadow-sm ring-4 ring-white",
                            person.critical ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-400"
                        )}>
                            {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="text-xl font-light text-zinc-900 tracking-tight flex items-center gap-2">
                                {person.name}
                                {person.critical && <ShieldAlert className="h-4 w-4 text-rose-500" />}
                            </h3>
                            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                <Briefcase size={12} /> {person.role} <span className="text-zinc-200">•</span> <MapPin size={12} /> {person.store}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-12 w-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* NEW: CAPTURA TEMPRANA (METADATA) */}
                    <section className="bg-zinc-50 rounded-[32px] p-6 text-zinc-900 relative overflow-hidden border border-zinc-100 shadow-sm">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none text-zinc-900">
                            <Fingerprint size={80} />
                        </div>
                        <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-4">Metadatos de Seguimiento</h4>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Reportado por</div>
                                <div className="text-xs font-semibold flex items-center gap-2">
                                    <User size={12} className="text-zinc-400" />
                                    {person.reportedBy}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Fecha y Hora</div>
                                <div className="text-xs font-semibold flex items-center gap-2">
                                    <Clock size={12} className="text-zinc-400" />
                                    {person.reportedAt}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Captura temprana confirmada</span>
                        </div>
                    </section>

                    {/* Basic Info Grid */}
                    <section className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Tipo de Incidencia</span>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
                                    person.critical ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-zinc-50 text-zinc-700 border-zinc-100"
                                )}>
                                    {person.type}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Impacto Estimado</span>
                            <div className="text-xl font-light text-zinc-900 font-mono tracking-tighter">
                                {person.cost.toLocaleString('es-ES')}€
                            </div>
                        </div>
                    </section>

                    {/* Timeline / Status */}
                    <section>
                        <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <History size={14} /> Historial de Episodios
                        </h4>
                        <div className="space-y-6 relative ml-3 border-l-2 border-zinc-50">
                            <div className="relative pl-8">
                                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-violet-600 border-4 border-white" />
                                <div className="text-xs font-semibold text-zinc-900">Inicio de ausencia</div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">{person.start} · {person.reportedAt.split(' ')[1]}</div>
                            </div>
                            <div className="relative pl-8 pb-2">
                                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-zinc-100 border-4 border-white" />
                                <div className="text-xs font-medium text-zinc-300 italic">Previsión de alta (AI)</div>
                                <div className="text-[10px] text-zinc-300 mt-0.5">Calculando duración probable...</div>
                            </div>
                        </div>
                    </section>

                    {/* Action Playbook */}
                    <section className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                                <Zap size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Siguiente paso recomendado</h4>
                                <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">Playbook: Gestión de Bajas IT</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed font-medium mb-8">
                            Se recomienda contactar con el empleado para validar el estado de salud (sin preguntar diagnósticos) y confirmar si requiere sustitución inmediata en el turno de mañana.
                        </p>
                        <div className="flex gap-2">
                            <button className="flex-1 h-12 rounded-2xl bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm shadow-violet-100 hover:bg-violet-700 transition-all">
                                Notificar a Manager <MessageSquare size={14} />
                            </button>
                            <button className="flex-1 h-12 rounded-2xl bg-white border border-zinc-200 text-zinc-900 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                                Abrir Workflow <ArrowRight size={14} />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
