import React, { useState } from 'react';
import {
    X, Check, Edit2, Save, Trash2,
    Clock, User, ShieldCheck, Euro,
    ArrowRight, MessageSquare, Sparkles,
    CheckCircle2, Circle, AlertCircle,
    Copy, Target, TrendingUp, Plus
} from 'lucide-react';
import { Workflow, AutomationTask } from './automationTypes';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

export default function ProtocolDetailModal({
    workflow,
    onClose,
    onSave,
    onDuplicate
}: {
    workflow: Workflow;
    onClose: () => void;
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-2 border border-white/50 h-[90vh]">
                <div className="bg-zinc-50/80 rounded-[2.5rem] flex h-full overflow-hidden relative">

                    {/* LEFT CONTENT AREA */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-start justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl",
                                    workflow.severity === 'ALTA' ? "bg-rose-600 text-white shadow-rose-100" :
                                        workflow.severity === 'MEDIA' ? "bg-amber-500 text-white shadow-amber-100" :
                                            "bg-emerald-500 text-white shadow-emerald-100"
                                )}>
                                    <Target size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        {isEditing ? (
                                            <input
                                                className="text-2xl font-black text-zinc-900 tracking-tight bg-white border border-zinc-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-violet-200"
                                                value={editedWf.name}
                                                onChange={e => setEditedWf({ ...editedWf, name: e.target.value })}
                                            />
                                        ) : (
                                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{editedWf.name}</h3>
                                        )}
                                        <span className="text-xs font-bold text-zinc-400">#{editedWf.id.replace('auto_', '')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-600">
                                            {workflow.activeStatus}
                                        </span>
                                        <span className="text-zinc-300">•</span>
                                        <span className="text-xs font-bold text-zinc-500">{workflow.config.condition}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onDuplicate(editedWf)}
                                    className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                                    title="Duplicar Protocolo"
                                >
                                    <Copy size={18} />
                                </button>
                                {isEditing ? (
                                    <button
                                        onClick={handleSave}
                                        className="h-10 px-4 rounded-xl bg-violet-600 text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-100"
                                    >
                                        <Save size={16} /> Guardar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="h-10 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm"
                                    >
                                        <Edit2 size={16} /> Editar
                                    </button>
                                )}
                                <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 flex border-b border-zinc-200/50">
                            {['DETAILS', 'COPILOT'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative",
                                        activeTab === tab ? "text-violet-600" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    {tab === 'DETAILS' ? 'Configuración y Acción' : 'Inteligencia Copilot'}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-t-full shadow-[0_-4px_12px_rgba(124,58,237,0.3)]" />}
                                </button>
                            ))}
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

                            {activeTab === 'DETAILS' ? (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Completitud</div>
                                            <div className="text-2xl font-black text-zinc-900">{completionPct}%</div>
                                            <div className="mt-2 w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                                                <div className="bg-violet-600 h-full transition-all duration-1000" style={{ width: `${completionPct}%` }} />
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ejecuciones</div>
                                            <div className="text-2xl font-black text-zinc-900">{editedWf.runsCount}</div>
                                            <div className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                                                <TrendingUp size={12} /> +12% vs anterior
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ahorro Teórico</div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <input
                                                        type="number"
                                                        className="text-xl font-black text-zinc-900 w-full bg-zinc-50 border-none outline-none rounded-lg px-2"
                                                        value={editedWf.theoreticalSavings}
                                                        onChange={e => setEditedWf({ ...editedWf, theoreticalSavings: Number(e.target.value) })}
                                                    />
                                                    <span className="text-xs font-black text-zinc-400">€</span>
                                                </div>
                                            ) : (
                                                <div className="text-2xl font-black text-zinc-900">{editedWf.theoreticalSavings.toLocaleString()}€</div>
                                            )}
                                        </div>
                                        <div className="p-5 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ahorro Real</div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <input
                                                        type="number"
                                                        className="text-xl font-black text-emerald-600 w-full bg-zinc-50 border-none outline-none rounded-lg px-2"
                                                        value={editedWf.realSavings}
                                                        onChange={e => setEditedWf({ ...editedWf, realSavings: Number(e.target.value) })}
                                                    />
                                                    <span className="text-xs font-black text-zinc-400">€</span>
                                                </div>
                                            ) : (
                                                <div className="text-2xl font-black text-emerald-600">{editedWf.realSavings.toLocaleString()}€</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Task Action Plan */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-black text-zinc-900 tracking-tight">Plan de Acción</h4>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                {editedWf.tasks.filter(t => t.status === 'COMPLETADA').length} / {editedWf.tasks.length} Tareas listas
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {editedWf.tasks.map((task, idx) => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "group p-4 rounded-[1.5rem] border transition-all duration-300 flex items-center gap-4",
                                                        task.status === 'COMPLETADA' ? "bg-zinc-100/30 border-zinc-100 opacity-60" : "bg-white border-zinc-200 shadow-sm hover:border-violet-300"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => toggleTask(task.id)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0",
                                                            task.status === 'COMPLETADA' ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-300 group-hover:bg-violet-100 group-hover:text-violet-600"
                                                        )}
                                                    >
                                                        {task.status === 'COMPLETADA' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            {isEditing ? (
                                                                <input
                                                                    className="font-bold text-zinc-900 border-b border-dashed border-zinc-300 bg-transparent outline-none w-full mr-4"
                                                                    value={task.title}
                                                                    onChange={e => {
                                                                        const newTasks = [...editedWf.tasks];
                                                                        newTasks[idx] = { ...task, title: e.target.value };
                                                                        setEditedWf({ ...editedWf, tasks: newTasks });
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="font-bold text-zinc-900 truncate">{task.title}</span>
                                                            )}
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
                                                                    <Clock size={12} className="text-zinc-400" />
                                                                    {isEditing ? (
                                                                        <input
                                                                            className="w-16 bg-transparent outline-none border-b border-zinc-200"
                                                                            value={task.deadline}
                                                                            onChange={e => {
                                                                                const newTasks = [...editedWf.tasks];
                                                                                newTasks[idx] = { ...task, deadline: e.target.value };
                                                                                setEditedWf({ ...editedWf, tasks: newTasks });
                                                                            }}
                                                                        />
                                                                    ) : task.deadline}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
                                                                    <User size={12} className="text-zinc-400" />
                                                                    {isEditing ? (
                                                                        <input
                                                                            className="w-24 bg-transparent outline-none border-b border-zinc-200"
                                                                            value={task.owner}
                                                                            onChange={e => {
                                                                                const newTasks = [...editedWf.tasks];
                                                                                newTasks[idx] = { ...task, owner: e.target.value };
                                                                                setEditedWf({ ...editedWf, tasks: newTasks });
                                                                            }}
                                                                        />
                                                                    ) : task.owner}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isEditing ? (
                                                            <textarea
                                                                className="text-xs text-zinc-500 font-medium mt-1 bg-transparent border-none outline-none w-full resize-none"
                                                                value={task.description}
                                                                rows={1}
                                                                onChange={e => {
                                                                    const newTasks = [...editedWf.tasks];
                                                                    newTasks[idx] = { ...task, description: e.target.value };
                                                                    setEditedWf({ ...editedWf, tasks: newTasks });
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-zinc-500 font-medium mt-0.5 truncate">{task.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-8 bg-violet-600 rounded-[2.5rem] text-white shadow-xl shadow-violet-100 flex items-center justify-between group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <Sparkles size={160} />
                                        </div>
                                        <div className="relative z-10 max-w-lg">
                                            <h4 className="text-2xl font-black mb-2 flex items-center gap-2">
                                                Recomendaciones IA <Sparkles size={24} />
                                            </h4>
                                            <p className="opacity-80 font-medium leading-relaxed">
                                                He analizado este protocolo en comparación con otros 40 protocolos similares en el sector Retail.
                                            </p>
                                        </div>
                                        <button className="relative z-10 bg-white text-violet-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform">
                                            Recalcular ROI
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-white border border-zinc-200 rounded-[2rem] space-y-4">
                                            <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                                                <AlertCircle size={14} /> Puntos de Riesgo
                                            </div>
                                            <ul className="space-y-3">
                                                {[
                                                    "El plazo de 'Revisión técnica' es un 20% más alto que la media.",
                                                    "Falta un paso de validación regional para asegurar adherencia.",
                                                    "El ahorro real está desviado un 15% del teórico."
                                                ].map((text, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-zinc-600 font-medium leading-tight">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                        {text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-6 bg-white border border-emerald-100 rounded-[2rem] space-y-4">
                                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                                <CheckCircle2 size={14} /> Sugerencias de Mejora
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 group cursor-pointer hover:bg-emerald-100 transition-colors">
                                                    <div className="text-xs font-bold text-emerald-800 flex items-center justify-between">
                                                        Añadir: Check-in a los 7 días
                                                        <Plus size={14} />
                                                    </div>
                                                    <p className="text-[10px] text-emerald-700/70 mt-1 font-medium italic">Mejora el éxito un 12% en protocolos similares.</p>
                                                </div>
                                                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 group cursor-pointer hover:bg-zinc-100 transition-colors">
                                                    <div className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                                                        Cambiar Owner: Area Manager
                                                        <Edit2 size={14} />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">Reduce el tiempo de respuesta en 24h.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR (Quick Context) */}
                    <div className="w-80 bg-zinc-900 text-white p-8 flex flex-col shrink-0">
                        <div className="flex-1 space-y-10">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Origen del Riesgo</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-bold">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-violet-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-60 font-medium">Predicción IA</div>
                                            <div>Window: {workflow.riskDate ? 'Próx. 2 sem' : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                                            <Euro size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-60 font-medium">Confianza ROI</div>
                                            <div>Muy Alta (94%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Alcance de Aplicación</h4>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-60 font-medium">Provincia</span>
                                        <span className="font-bold">{workflow.config.scope.province || 'Global'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-60 font-medium">Centros</span>
                                        <span className="font-bold text-violet-400">{workflow.config.scope.center || workflow.config.scope.centers?.length || 'Todos'}</span>
                                    </div>
                                    <div className="w-full h-px bg-white/10" />
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <span>Fecha Creación</span>
                                        <span>{workflow.createdAt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <button className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] group">
                                <span className="opacity-60 group-hover:opacity-100 transition-opacity">Eliminar Protocolo</span>
                                <Trash2 size={16} className="text-rose-500" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
