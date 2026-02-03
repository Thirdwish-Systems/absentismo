import React, { useState } from 'react';
import {
    X, Zap, Target, Layers,
    ArrowRight, ArrowLeft, Check,
    Plus, Trash2, Clock, ShieldCheck,
    Bell, User, Info, BarChart3, ListChecks
} from 'lucide-react';
import { Risk, Scope, Workflow } from './automationTypes';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

export default function CreateAutomation({
    risk,
    onClose,
    onSave
}: {
    risk: Risk;
    onClose: () => void;
    onSave: (wf: Partial<Workflow>) => void;
}) {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        condition: 'Alta Probabilidad (> 60%)',
        tasks: [
            { id: '1', title: 'Notificación de alerta', description: 'Informar al responsable de unidad sobre el riesgo detectado.', owner: 'District Manager', deadline: 'Inmediato', priority: 'ALTA', status: 'PENDIENTE' }
        ] as any[]
    });

    const addTask = () => {
        setConfig(c => ({
            ...c,
            tasks: [...c.tasks, { id: Math.random().toString(), title: '', description: '', owner: '', deadline: '24h', priority: 'MEDIA', status: 'PENDIENTE' }]
        }));
    };

    const removeTask = (id: string) => {
        setConfig(c => ({ ...c, tasks: c.tasks.filter(s => s.id !== id) }));
    };

    const updateTask = (id: string, field: string, val: string) => {
        setConfig(c => ({
            ...c,
            tasks: c.tasks.map(s => s.id === id ? { ...s, [field]: val } : s)
        }));
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-2 border border-white/50">
                <div className="bg-zinc-50/80 rounded-[2.5rem] flex flex-col h-full overflow-hidden">

                    {/* Header */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-xl shadow-violet-100">
                                <ListChecks size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Activar Protocolo de Actuación</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded-md">Riesgo</span>
                                    <p className="text-xs font-bold text-zinc-600 tracking-tight">{risk.name}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="h-10 w-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stepper Indicator */}
                    <div className="px-8 flex items-center gap-3 mb-8">
                        {['Activación', 'Plan de Acción', 'Métricas'].map((label, i) => {
                            const s = i + 1;
                            return (
                                <div key={s} className="flex items-center gap-3 flex-1 group">
                                    <div className={cn(
                                        "h-1.5 flex-1 rounded-full transition-all duration-700",
                                        step >= s ? "bg-violet-600" : "bg-zinc-200"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-colors",
                                        step === s ? "text-violet-600" : "text-zinc-300"
                                    )}>{label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                                <div>
                                    <h4 className="text-2xl font-bold text-zinc-900 tracking-tight">Configuración del Lanzamiento</h4>
                                    <p className="text-sm text-zinc-500 mt-2 font-medium">Define las condiciones bajo las cuales este protocolo entrará en vigor.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4 p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-violet-600 mb-2">
                                            <Target size={18} />
                                            <label className="text-[11px] font-black uppercase tracking-widest">Condición de Disparo</label>
                                        </div>
                                        <select
                                            className="w-full bg-zinc-50 h-12 px-4 rounded-xl text-sm font-bold text-zinc-900 border-none focus:ring-2 focus:ring-violet-200 transition-all"
                                            value={config.condition}
                                            onChange={(e) => setConfig(c => ({ ...c, condition: e.target.value }))}
                                        >
                                            <option>Alta Probabilidad ({'>'} 60%)</option>
                                            <option>Impacto Crítico ({'>'} 5.000€)</option>
                                            <option>Recurrencia Mayor a 3 meses</option>
                                            <option>Activación Inmediata (Manual)</option>
                                        </select>
                                        <p className="text-[10px] text-zinc-400 font-bold italic leading-relaxed">El sistema monitoriza el riesgo y activa las tareas cuando se cumple la condición.</p>
                                    </div>

                                    <div className="space-y-4 p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-zinc-600 mb-2">
                                            <ShieldCheck size={18} />
                                            <label className="text-[11px] font-black uppercase tracking-widest">Alcance Sugerido</label>
                                        </div>
                                        <div className="text-sm font-bold text-zinc-900 bg-zinc-50 h-12 flex items-center px-4 rounded-xl">
                                            {risk.scope.center || risk.scope.province || 'Nivel Corporativo'}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-bold italic">Detectado por IA basado en patrones de {risk.source}.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-2xl font-bold text-zinc-900 tracking-tight">Plan de Acción</h4>
                                        <p className="text-sm text-zinc-500 mt-2 font-medium">Asigna tareas claras, responsables y plazos.</p>
                                    </div>
                                    <button
                                        onClick={addTask}
                                        className="h-11 px-5 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-violet-600 transition-all shadow-lg active:scale-95"
                                    >
                                        <Plus size={16} /> Añadir Tarea
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {config.tasks.map((task, idx) => (
                                        <div key={task.id} className="p-8 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm relative group hover:border-violet-200 transition-colors">
                                            <button
                                                onClick={() => removeTask(task.id)}
                                                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Título de Tarea</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: Revisar rotación en sección frescos"
                                                            className="w-full h-12 px-4 bg-zinc-50 rounded-xl text-sm font-bold text-zinc-900 outline-none border-none focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                                                            value={task.title}
                                                            onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Responsable</label>
                                                        <div className="relative">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                                            <input
                                                                type="text"
                                                                placeholder="Nombre o puesto (ej. Area Manager)"
                                                                className="w-full h-12 pl-12 pr-4 bg-zinc-50 rounded-xl text-sm font-bold text-zinc-900 outline-none border-none focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                                                                value={task.owner}
                                                                onChange={(e) => updateTask(task.id, 'owner', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Instrucciones</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Breve descripción de qué hacer..."
                                                            className="w-full h-12 px-4 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-700 outline-none border-none"
                                                            value={task.description}
                                                            onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Plazo / Deadline</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                                            <select
                                                                className="w-full h-12 pl-12 pr-4 bg-zinc-50 rounded-xl text-sm font-bold text-zinc-900 outline-none border-none"
                                                                value={task.deadline}
                                                                onChange={(e) => updateTask(task.id, 'deadline', e.target.value)}
                                                            >
                                                                <option>Inmediato</option>
                                                                <option>24 horas</option>
                                                                <option>48 horas</option>
                                                                <option>1 semana</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                                <div>
                                    <h4 className="text-2xl font-bold text-zinc-900 tracking-tight">Impacto Esperado</h4>
                                    <p className="text-sm text-zinc-500 mt-2 font-medium">Visualiza el beneficio de seguir este protocolo.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl">
                                        <div className="space-y-4">
                                            <div className="inline-flex h-10 w-10 items-center justify-center bg-violet-600 rounded-xl mb-2">
                                                <Target size={20} />
                                            </div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Objetivo Final</div>
                                            <div className="text-xl font-light leading-relaxed">
                                                Reducir la incertidumbre en <span className="text-violet-400 font-bold">{risk.scope.center || 'la unidad'}</span> y evitar costes de sustitución urgente.
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Validación IA</span>
                                            <ShieldCheck className="text-emerald-400" size={20} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="p-6 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <BarChart3 size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ahorro Estimado</div>
                                                    <div className="text-lg font-bold text-zinc-900">~ 2.450 € / mes</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium">Basado en el éxito de protocolos similares en centros pares.</p>
                                        </div>

                                        <div className="p-6 bg-violet-600 rounded-[2rem] text-white shadow-lg shadow-violet-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bell size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Notificaciones Activas</span>
                                            </div>
                                            <p className="text-xs font-bold leading-snug">Se alertará a {config.tasks.length} responsables según el plan de acción definido.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-8 bg-white border-t border-zinc-100 flex items-center justify-between shrink-0">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="h-14 px-8 rounded-2xl bg-zinc-50 text-zinc-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-100 transition-all border border-zinc-200"
                            >
                                <ArrowLeft size={18} /> Anterior
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="h-14 px-8 rounded-2xl text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-zinc-900 transition-all"
                            >
                                Cancelar
                            </button>
                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    className="h-14 px-10 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-violet-600 transition-all active:scale-[0.98]"
                                >
                                    Siguiente <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => onSave({ ...config })}
                                    className="h-14 px-12 rounded-2xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-[0.98]"
                                >
                                    Activar Protocolo <Zap size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
