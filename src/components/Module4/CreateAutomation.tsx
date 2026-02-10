import React, { useState, useEffect, useRef } from 'react';
import {
    X, Zap, Target, Layers,
    ArrowRight, ArrowLeft, Check, ChevronLeft,
    Plus, Trash2, Clock, ShieldCheck, Sparkles,
    Bell, User, Info, BarChart3, ListChecks,
    Settings, AlertTriangle, FileText, Euro,
    BrainCircuit, ClipboardList, Phone, Mail,
    ChevronDown, Layout, Activity, Eye, Search,
    MessageCircle, Lightbulb, HelpCircle
} from 'lucide-react';
import { Risk, Scope, Workflow, AutomationTask, Severity } from './automationTypes';
import { useConfig } from '../../stores/configStore';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

// Dummy empty risk for standalone mode
const EMPTY_RISK: Partial<Risk> = {
    name: '',
    source: 'HRIS',
    scope: { company: 'Global' },
    severity: 'MEDIA'
};

const COACH_IA = {
    origin: "Elegir el origen ayuda a la IA a saber qué datos monitorear para activar este plan automáticamente.",
    trigger: "El disparador es la 'condición maestra'. Si se cumple, el protocolo se pone en marcha sin que tengas que hacer nada.",
    tasks: "Estas son las acciones que tu equipo recibirá. Sé claro y asigna responsables para que el plan sea un éxito.",
    roi: "Basado en protocolos similares, estimamos cuánto podrías ahorrar si este plan se ejecuta correctamente."
};

export default function CreateAutomation({
    risk,
    onClose,
    onSave
}: {
    risk?: Risk; // Optional for standalone creation
    onClose: () => void;
    onSave: (wf: Partial<Workflow>) => void;
}) {
    const activeRisk = risk || EMPTY_RISK;
    const [creationMode, setCreationMode] = useState<'RISK' | 'PATTERN'>(risk ? 'RISK' : 'RISK');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { config: globalConfig } = useConfig();

    const [config, setConfig] = useState({
        name: activeRisk.name || '',
        condition: 'Alta Probabilidad (> 60%)',
        targetScope: activeRisk.scope?.center || activeRisk.scope?.province || 'Global',
        selectedCenters: [] as string[],
        theoreticalSavings: 15000,
        tasks: [
            {
                id: '1',
                title: 'Entrevista de retorno',
                description: 'Realizar una breve charla para entender motivos y ofrecer apoyo.',
                owner: 'Responsable de Unidad',
                phone: '',
                email: '',
                deadline: '24h',
                priority: 'MEDIA',
                status: 'PENDIENTE'
            }
        ] as AutomationTask[]
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisRevealed, setAnalysisRevealed] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);

    const analysisMessages = [
        "Analizando coherencia del plan...",
        "Simulando reducción de absentismo...",
        "Calculando retorno de inversión anual...",
        "Finalizando diagnóstico..."
    ];

    const handleAskAI = () => {
        setIsAnalyzing(true);
        setAnalysisRevealed(false);
        setAnalysisStep(0);

        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < analysisMessages.length) {
                setAnalysisStep(step);
            } else {
                clearInterval(interval);
                setIsAnalyzing(false);
                setAnalysisRevealed(true);
            }
        }, 800);
    };

    const addTask = () => {
        setConfig(c => ({
            ...c,
            tasks: [...c.tasks, {
                id: Math.random().toString(),
                title: '',
                description: '',
                owner: '',
                phone: '',
                email: '',
                deadline: '48h',
                priority: 'MEDIA',
                status: 'PENDIENTE'
            }]
        }));
    };

    const removeTask = (id: string) => {
        setConfig(c => ({ ...c, tasks: c.tasks.filter(s => s.id !== id) }));
    };

    const updateTask = (id: string, field: keyof AutomationTask, val: string) => {
        setConfig(c => ({
            ...c,
            tasks: c.tasks.map(s => s.id === id ? { ...s, [field]: val } : s)
        }));
    };

    const handleSave = () => {
        onSave({
            id: `auto_${Math.random().toString(36).substr(2, 9)}`,
            name: config.name || 'Protocolo sin nombre',
            riskId: activeRisk.id || 'custom',
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: 'Gestor',
            severity: (activeRisk.severity as Severity) || 'MEDIA',
            activeStatus: 'ACTIVE',
            config: {
                condition: config.condition,
                scope: {
                    company: 'Global',
                    province: config.targetScope === 'Provincial' ? 'Madrid' : undefined,
                    center: config.targetScope === 'Centro Específico' ? 'Centro 1' : undefined,
                    centers: config.targetScope === 'Multi-Centro' ? config.selectedCenters : undefined
                }
            },
            tasks: config.tasks,
            runsCount: 0,
            successRate: 0,
            theoreticalSavings: config.theoreticalSavings,
            realSavings: 0,
            savedEur: 0
        } as any);
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-zinc-900 overflow-hidden">
            {/* Minimal Header */}
            <header className="h-20 px-8 flex items-center justify-between border-b border-zinc-100 shrink-0 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} className="text-zinc-400" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">Nuevo Protocolo de Acción</h2>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guía de diseño paso a paso</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-900 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-violet-600 text-white rounded-full text-xs font-bold uppercase tracking-[0.1em] shadow-lg shadow-violet-100 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        Activar Protocolo <Check size={14} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-zinc-50/30 scroll-smooth">
                {/* Centered Storytelling Container */}
                <div className="max-w-2xl mx-auto py-24 px-6 space-y-32">

                    {/* STEP 1: THE ORIGIN */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">1. ¿Qué quieres vigilar?</h1>
                            <div className="flex items-start gap-4 p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-100/50">
                                <div className="p-2 bg-violet-50 rounded-lg text-violet-600 shrink-0">
                                    <Sparkles size={16} />
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed italic">
                                    "{COACH_IA.origin}"
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'RISK', title: 'Un riesgo específico', desc: 'Actúa cuando la IA detecte una probabilidad alta de ausencia en un centro.', icon: <Activity className="text-rose-500" /> },
                                { id: 'PATTERN', title: 'Un patrón recurrente', desc: 'Diseña una defensa fija para comportamientos que se repiten en el tiempo.', icon: <BrainCircuit className="text-violet-500" /> }
                            ].map(o => (
                                <button
                                    key={o.id}
                                    onClick={() => setCreationMode(o.id as any)}
                                    className={cn(
                                        "flex items-center gap-6 p-6 text-left rounded-3xl border-2 transition-all group",
                                        creationMode === o.id
                                            ? "bg-white border-violet-600 ring-4 ring-violet-50"
                                            : "bg-white border-zinc-100 hover:border-zinc-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                        creationMode === o.id ? "bg-violet-600 text-white shadow-lg shadow-violet-100" : "bg-zinc-50 text-zinc-400"
                                    )}>
                                        {o.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900">{o.title}</h3>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{o.desc}</p>
                                    </div>
                                    {creationMode === o.id && (
                                        <div className="ml-auto p-1 bg-violet-600 rounded-full text-white">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* STEP 2: NAME & SCOPE */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">2. Identifica el Plan</h1>
                            <p className="text-sm text-zinc-400">¿Cómo quieres llamar a este protocolo y dónde se aplicará?</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Nombre del Protocolo</label>
                                <input
                                    className="w-full h-14 bg-white border border-zinc-200 rounded-2xl px-6 text-lg font-medium outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all placeholder:text-zinc-200"
                                    placeholder="Ej: Plan de Choque Verano Madrid"
                                    value={config.name}
                                    onChange={e => setConfig({ ...config, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">¿Dónde actuar?</label>
                                <div className="flex gap-2">
                                    {['Global', 'Por Provincia', 'Unidades seleccionadas'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setConfig({ ...config, targetScope: s })}
                                            className={cn(
                                                "flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                                config.targetScope === s
                                                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100"
                                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: THE TRIGGER */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">3. ¿Cuándo debemos activarlo?</h1>
                            <div className="flex items-start gap-4 p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-100/50">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                                    <Lightbulb size={16} />
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed italic">
                                    "{COACH_IA.trigger}"
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-zinc-100 rounded-[2rem] space-y-8 shadow-sm">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-300 uppercase tracking-widest ml-1">Condición de disparo</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 bg-zinc-50 border-none rounded-xl px-6 text-sm font-bold text-zinc-900 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-violet-100 transition-all"
                                            value={config.condition}
                                            onChange={e => setConfig({ ...config, condition: e.target.value })}
                                        >
                                            <option>Cuando la probabilidad supere el 60%</option>
                                            <option>Si el impacto estimado es mayor a 5.000€</option>
                                            <option>Ante la detección de un patrón de 'Lunes Crítico'</option>
                                            <option>Solo con activación manual del gestor</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-5 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300">
                                            <Layout size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-900 block uppercase tracking-widest">Validación Previa</span>
                                            <span className="text-[9px] text-zinc-400 font-medium">Revisar el plan antes de disparar tareas</span>
                                        </div>
                                    </div>
                                    <button className="h-6 w-11 bg-zinc-200 rounded-full p-1 transition-colors hover:bg-violet-600 group/tog relative">
                                        <div className="h-4 w-4 bg-white rounded-full transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 4: ACTION PLAN */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">4. El Plan de Acción</h1>
                                <p className="text-sm text-zinc-400">Describe los pasos para que tu equipo sepa qué hacer.</p>
                            </div>
                            <button
                                onClick={addTask}
                                className="h-12 px-6 bg-violet-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all"
                            >
                                <Plus size={14} /> Añadir Paso
                            </button>
                        </div>

                        <div className="space-y-6 relative">
                            {/* Visual connector line */}
                            <div className="absolute left-6 top-8 bottom-8 w-px bg-zinc-100 hidden sm:block" />

                            {config.tasks.map((task, idx) => (
                                <div key={task.id} className="relative pl-0 sm:pl-16 group/task animate-in fade-in slide-in-from-bottom-4">
                                    {/* Dot */}
                                    <div className="absolute left-[1.125rem] top-8 h-8 w-8 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center z-10 hidden sm:flex group-hover/task:border-violet-600 transition-colors">
                                        <span className="text-xs font-bold text-zinc-400 group-hover/task:text-violet-600">{idx + 1}</span>
                                    </div>

                                    <div className="p-8 bg-white border border-zinc-100 rounded-3xl space-y-6 shadow-sm shadow-zinc-100/50 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <input
                                                    className="w-full text-lg font-semibold text-zinc-900 placeholder:text-zinc-200 bg-transparent border-none outline-none p-0 focus:ring-0"
                                                    value={task.title}
                                                    onChange={e => updateTask(task.id, 'title', e.target.value)}
                                                    placeholder="¿Qué hay que hacer? (Ej: Contactar empleado)"
                                                />
                                                <div className="h-0.5 w-8 bg-violet-600/20 rounded-full" />
                                            </div>
                                            <button
                                                onClick={() => removeTask(task.id)}
                                                className="p-2 text-zinc-200 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                <MessageCircle size={10} /> Instrucciones para el equipo
                                            </label>
                                            <textarea
                                                className="w-full h-20 bg-zinc-50/50 border-none rounded-xl p-4 text-xs font-medium text-zinc-600 outline-none focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all resize-none leading-relaxed"
                                                value={task.description}
                                                onChange={e => updateTask(task.id, 'description', e.target.value)}
                                                placeholder="Ej: Si el riesgo es crítico, llamar hoy mismo y confirmar disponibilidad..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Responsable</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={12} />
                                                    <input
                                                        className="w-full h-11 pl-10 bg-white border border-zinc-100 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-300 transition-all"
                                                        value={task.owner}
                                                        onChange={e => updateTask(task.id, 'owner', e.target.value)}
                                                        placeholder="Nombre o Cargo"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Plazo Máximo</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={12} />
                                                    <input
                                                        className="w-full h-11 pl-10 bg-white border border-zinc-100 rounded-xl text-xs font-semibold text-zinc-900 outline-none focus:border-violet-300 transition-all"
                                                        value={task.deadline}
                                                        onChange={e => updateTask(task.id, 'deadline', e.target.value)}
                                                        placeholder="Ej: 24 horas"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex flex-wrap gap-3">
                                            <div className="relative flex-1 min-w-[140px]">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={12} />
                                                <input
                                                    className="w-full h-10 pl-10 bg-zinc-50/50 border border-zinc-100 rounded-lg text-[10px] font-medium text-zinc-600 outline-none focus:border-violet-200"
                                                    value={task.phone}
                                                    onChange={e => updateTask(task.id, 'phone', e.target.value)}
                                                    placeholder="Teléfono"
                                                />
                                            </div>
                                            <div className="relative flex-1 min-w-[140px]">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={12} />
                                                <input
                                                    className="w-full h-10 pl-10 bg-zinc-50/50 border border-zinc-100 rounded-lg text-[10px] font-medium text-zinc-600 outline-none focus:border-violet-200"
                                                    value={task.email}
                                                    onChange={e => updateTask(task.id, 'email', e.target.value)}
                                                    placeholder="E-mail"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={addTask}
                                className="flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors bg-violet-50 px-6 py-3 rounded-full"
                            >
                                <Plus size={16} /> Añadir otro paso al plan
                            </button>
                        </div>
                    </div>

                    {/* STEP 5: INTERACTIVE IMPACT ANALYSIS */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">5. ¿Qué impacto tendrá este plan?</h1>
                            <div className="flex items-start gap-4 p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-100/50">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                                    <HelpCircle size={16} />
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed italic">
                                    "{COACH_IA.roi}"
                                </p>
                            </div>
                        </div>

                        <div className="min-h-[200px] flex flex-col items-center justify-center p-12 bg-white border border-zinc-100 rounded-[3rem] shadow-sm relative overflow-hidden transition-all duration-700">
                            {!analysisRevealed && !isAnalyzing && (
                                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                    <div className="h-20 w-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto text-violet-600">
                                        <BrainCircuit size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">Análisis de Eficacia IA</h3>
                                        <p className="text-zinc-400 text-sm max-w-sm mx-auto">La IA evaluará tus tareas y el contexto para predecir el ahorro y éxito del plan.</p>
                                    </div>
                                    <button
                                        onClick={handleAskAI}
                                        className="px-10 py-4 bg-violet-600 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all hover:scale-105"
                                    >
                                        Consultar a la IA <Sparkles size={14} className="inline ml-2" />
                                    </button>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="text-center space-y-8 animate-in fade-in duration-500">
                                    <div className="relative">
                                        <div className="h-24 w-24 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto" />
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-600 animate-pulse" size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-zinc-900">IA Procesando...</h3>
                                        <p className="text-sm font-bold text-violet-600 uppercase tracking-widest animate-pulse">
                                            {analysisMessages[analysisStep]}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {analysisRevealed && (
                                <div className="w-full grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                    <div className="p-10 bg-white border border-emerald-100 rounded-[2.5rem] text-zinc-900 space-y-6 relative overflow-hidden group shadow-sm">
                                        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-emerald-50/50 to-transparent" />
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Euro size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ahorro Estimado Anual</div>
                                            <div className="text-4xl font-semibold tracking-tighter mt-1">15.000€</div>
                                        </div>
                                        <div className="h-1 w-full bg-emerald-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                                        </div>
                                    </div>

                                    <div className="p-10 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex flex-col justify-between">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fiabilidad del Plan</div>
                                            <div className="text-3xl font-semibold text-zinc-900">96.8%</div>
                                        </div>
                                        <div className="py-2.5 px-5 bg-emerald-100/50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest w-fit border border-emerald-200">
                                            IA: Plan Altamente Efectivo
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-20 text-center space-y-8">
                        <div className="h-px bg-zinc-100 w-full" />
                        <div className="max-w-xs mx-auto space-y-6">
                            <h3 className="text-xl font-semibold">¿Está todo listo?</h3>
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-violet-600 text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-violet-100 hover:bg-violet-700 transition-all hover:scale-105"
                            >
                                Activar Protocolo Ahora
                            </button>
                            <p className="text-[10px] text-zinc-400 font-medium">Puedes desactivar o editar este plan en cualquier momento desde la biblioteca.</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
