import React, { useState } from 'react';
import {
    ChevronLeft, Check, Edit2, Save, Trash2,
    Clock, User, ShieldCheck, Euro,
    ArrowRight, MessageSquare, Sparkles,
    CheckCircle2, Circle, AlertCircle,
    Copy, Target, TrendingUp, Plus, MapPin
} from 'lucide-react';
import { Workflow, AutomationTask } from './automationTypes';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

export default function ProtocolDetailView({
    workflow,
    onBack,
    onSave,
    onDuplicate
}: {
    workflow: Workflow;
    onBack: () => void;
    onSave: (wf: Workflow) => void;
    onDuplicate: (wf: Workflow) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedWf, setEditedWf] = useState<Workflow>({ ...workflow });
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'COPILOT'>('DETAILS');

    const toggleTask = (taskId: string) => {
        setEditedWf(prev => ({
            ...prev,
            tasks: prev.tasks.map(t =>
                t.id === taskId
                    ? { ...t, status: t.status === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA' }
                    : t
            )
        }));
    };

    const handleSave = () => {
        onSave(editedWf);
        setIsEditing(false);
    };

    const completionPct = Math.round(
        (editedWf.tasks.filter(t => t.status === 'COMPLETADA').length / editedWf.tasks.length) * 100
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold uppercase text-[10px] tracking-widest bg-white px-4 py-2 rounded-xl border border-zinc-100 shadow-sm"
                >
                    <ChevronLeft size={16} /> Volver a Gestión
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDuplicate(editedWf)}
                        className="h-10 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-600 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm"
                    >
                        <Copy size={16} /> Duplicar
                    </button>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="h-10 px-6 rounded-xl bg-violet-600 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-violet-100"
                        >
                            <Save size={16} /> Guardar Cambios
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="h-10 px-6 rounded-xl bg-white border border-zinc-200 text-zinc-900 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm"
                        >
                            <Edit2 size={16} /> Editar Protocolo
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex gap-8 min-h-0">

                {/* Left: Main Dashboard */}
                <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar pb-10">

                    {/* Hero Section */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm relative overflow-hidden">
                        <div className={cn(
                            "absolute top-0 left-0 bottom-0 w-2",
                            workflow.severity === 'ALTA' ? "bg-rose-500" :
                                workflow.severity === 'MEDIA' ? "bg-amber-500" : "bg-emerald-500"
                        )} />

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                                        {workflow.activeStatus}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                                        workflow.severity === 'ALTA' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            workflow.severity === 'MEDIA' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    )}>
                                        Prioridad {workflow.severity}
                                    </span>
                                </div>
                                {isEditing ? (
                                    <input
                                        className="text-4xl font-semibold text-zinc-900 tracking-tighter bg-zinc-50 border-none outline-none rounded-2xl px-4 py-2 w-full focus:ring-2 focus:ring-violet-200"
                                        value={editedWf.name}
                                        onChange={e => setEditedWf({ ...editedWf, name: e.target.value })}
                                    />
                                ) : (
                                    <h1 className="text-4xl font-semibold text-zinc-900 tracking-tighter">{editedWf.name}</h1>
                                )}
                                <p className="text-zinc-500 mt-2 font-medium flex items-center gap-2">
                                    <Target size={16} className="text-violet-500" />
                                    {workflow.config.condition} • Protocolo #{editedWf.id.replace('auto_', '')}
                                </p>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Impacto Real</div>
                                    <div className="text-3xl font-semibold text-emerald-600 font-mono tracking-tight">{editedWf.realSavings.toLocaleString()}€</div>
                                </div>
                                <div className="h-12 w-px bg-zinc-100" />
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tareas</div>
                                    <div className="text-3xl font-semibold text-zinc-900 font-mono tracking-tight">{completionPct}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-zinc-200/50 pt-2">
                        {['DETAILS', 'COPILOT'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                                    activeTab === tab ? "text-violet-600" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                {tab === 'DETAILS' ? 'Centro de Acción' : 'Inteligencia Copilot'}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-t-full shadow-[0_-4px_12px_rgba(124,58,237,0.3)]" />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'DETAILS' ? (
                            <div className="space-y-8">
                                {/* Action Plan */}
                                <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm">
                                    <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                                        <h4 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                                            <CheckCircle2 size={20} className="text-violet-500" />
                                            Pasos del Protocolo
                                        </h4>
                                        <button className="h-8 px-4 rounded-lg bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:border-violet-300 transition-all flex items-center gap-2">
                                            <Plus size={14} /> Añadir Paso
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {editedWf.tasks.map((task, idx) => (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    "group p-5 rounded-[1.5rem] border transition-all duration-300 flex items-center gap-6",
                                                    task.status === 'COMPLETADA' ? "bg-zinc-50/50 border-transparent opacity-60" : "bg-white border-zinc-100 shadow-sm hover:border-violet-200"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2",
                                                        task.status === 'COMPLETADA' ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-zinc-100 text-zinc-200 group-hover:border-violet-200 group-hover:text-violet-500"
                                                    )}
                                                >
                                                    {task.status === 'COMPLETADA' ? <Check size={24} /> : <div className="h-3 w-3 rounded-full bg-current" />}
                                                </button>

                                                <div className="flex-1">
                                                    {isEditing ? (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <input
                                                                className="font-semibold text-zinc-900 bg-zinc-50 border-none outline-none rounded-lg px-3 py-1 text-sm"
                                                                value={task.title}
                                                                onChange={e => {
                                                                    const nt = [...editedWf.tasks];
                                                                    nt[idx] = { ...task, title: e.target.value };
                                                                    setEditedWf({ ...editedWf, tasks: nt });
                                                                }}
                                                            />
                                                            <div className="flex gap-2">
                                                                <input
                                                                    className="flex-1 bg-zinc-50 text-xs font-semibold rounded-lg px-3 outline-none"
                                                                    value={task.owner}
                                                                    onChange={e => {
                                                                        const nt = [...editedWf.tasks];
                                                                        nt[idx] = { ...task, owner: e.target.value };
                                                                        setEditedWf({ ...editedWf, tasks: nt });
                                                                    }}
                                                                />
                                                                <input
                                                                    className="w-24 bg-zinc-50 text-xs font-semibold rounded-lg px-3 outline-none uppercase"
                                                                    value={task.deadline}
                                                                    onChange={e => {
                                                                        const nt = [...editedWf.tasks];
                                                                        nt[idx] = { ...task, deadline: e.target.value };
                                                                        setEditedWf({ ...editedWf, tasks: nt });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h5 className="font-semibold text-zinc-900">{task.title}</h5>
                                                                <p className="text-xs text-zinc-400 font-medium mt-1">{task.description}</p>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-right">
                                                                    <div className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Responsable</div>
                                                                    <div className="text-xs font-semibold text-zinc-500">{task.owner}</div>
                                                                </div>
                                                                <div className="text-right min-w-[80px]">
                                                                    <div className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Plazo</div>
                                                                    <div className="text-xs font-semibold text-zinc-900">{task.deadline}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] text-white shadow-2xl flex items-center justify-between group overflow-hidden relative">
                                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                                        <Sparkles size={300} />
                                    </div>
                                    <div className="relative z-10 max-w-xl">
                                        <h4 className="text-3xl font-semibold mb-4 flex items-center gap-3">
                                            IA Estratégica <Sparkles size={32} />
                                        </h4>
                                        <p className="opacity-80 text-lg font-medium leading-relaxed">
                                            Basado en patrones de éxito en {workflow.config.scope.province}, sugiero ajustar los plazos de las tareas de cierre para maximizar el ROI.
                                        </p>
                                    </div>
                                    <button className="relative z-10 bg-white text-violet-600 px-8 py-4 rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                                        Aplicar Mejoras
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-8 bg-white border border-rose-100 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-[0.2em]">
                                            <AlertCircle size={20} /> Riesgos Detectados
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                "Saturación de tareas en el Día 3.",
                                                "Posible cuello de botella en validación central.",
                                                "Desviación del ahorro real vs proyectado (12%)."
                                            ].map((t, i) => (
                                                <div key={i} className="flex gap-4 p-4 bg-rose-50/30 rounded-2xl border border-rose-50 font-medium text-zinc-700 text-sm">
                                                    <span className="h-2 w-2 rounded-full bg-rose-400 mt-1.5" />
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-white border border-emerald-100 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-[0.2em]">
                                            <TrendingUp size={20} /> Oportunidades ROI
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                                <h6 className="font-semibold text-emerald-900 text-sm mb-1">Automatizar Notificación</h6>
                                                <p className="text-xs text-emerald-700 font-medium">Reduce latencia operativa en 4.5h por evento.</p>
                                            </div>
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                                <h6 className="font-semibold text-zinc-800 text-sm mb-1">Ahorro proyectado adicional</h6>
                                                <p className="text-xs text-zinc-500 font-medium">Estimado en +1,250€ mensuales por centro.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Quick Context Sidebar */}
                <div className="w-96 space-y-6 shrink-0">
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 space-y-10 shadow-sm transition-all duration-300">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-8 px-2">Alcance Global</h4>
                            <div className="space-y-3">
                                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ámbito</div>
                                            <div className="text-sm font-semibold text-zinc-900">{workflow.config.scope.province || 'Global'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Nº Sitios</div>
                                        <div className="text-sm font-semibold text-violet-600">{workflow.config.scope.center ? '1' : workflow.config.scope.centers?.length || 'Todos'}</div>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Euro size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ahorro Teórico</div>
                                        <div className="text-sm font-semibold text-zinc-900 font-mono tracking-tight">{editedWf.theoreticalSavings.toLocaleString()}€</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-8 px-2">Metadatos</h4>
                            <div className="space-y-5 px-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400 font-bold">FECHA CREACIÓN</span>
                                    <span className="font-semibold text-zinc-700">{workflow.createdAt}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400 font-bold">ÚLTIMA EJECUCIÓN</span>
                                    <span className="font-semibold text-zinc-700">Hoy, 10:45h</span>
                                </div>
                                <div className="pt-6 border-t border-zinc-50 flex justify-between items-center">
                                    <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">ID ÚNICO</span>
                                    <span className="font-semibold text-zinc-400 text-[10px]">{workflow.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full h-16 bg-white border border-rose-100 rounded-[2rem] flex items-center justify-between px-8 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all group shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Eliminar Protocolo</span>
                        <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
