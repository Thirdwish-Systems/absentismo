import React, { useState, useMemo } from 'react';
import {
    Zap, Clock, TrendingUp, AlertTriangle, Users, Target,
    ArrowRight, Search, MapPin, Activity, ShieldCheck,
    Brain, Sparkles, X, BarChart3, Info,
    Radar, MoveRight, Thermometer, Calendar, FileText, CheckCircle2,
    Briefcase, Building2, UserCircle, History, Scale, ArrowRightLeft,
    BookOpen, Lightbulb, HeartPulse, Stethoscope
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Cell, ReferenceLine, PieChart, Pie
} from "recharts";


// --- TYPES & CONSTANTS ---

type Horizon = "1w" | "2w" | "1m" | "3m";

const TIME_HORIZONS: Record<Horizon, { label: string, days: number }> = {
    "1w": { label: "7 Días (Táctico)", days: 7 },
    "2w": { label: "15 Días (Operativo)", days: 15 },
    "1m": { label: "30 Días (Mensual)", days: 30 },
    "3m": { label: "90 Días (Trimestral)", days: 90 },
};

// --- SOPHISTICATED MOCK DATA ENGINE ---

// 1. RISK DRIVERS (Why is this happening?)
type RiskDriver = 'BRADFORD' | 'IT_LARGA' | 'BURNOUT' | 'ABSENTISMO_PARCIAL' | 'INJUSTIFICADO';

const PATTERN_TYPES = [
    {
        id: "burnout",
        label: "Riesgo Psicosocial / Burnout",
        driver: 'BURNOUT',
        icon: Brain,
        color: "text-rose-600 bg-rose-50 border-rose-100",
        description: "Estrés acumulado y bajas por ansiedad",
        diagnosisTemplate: (ctx: any) => `Alerta Psicosocial: Se detecta un aumento del 40% en bajas por 'Asuntos Propios' y ansiedad tras periodos de sobrecarga (${ctx.overtime}h extra). No es un problema físico, es agotamiento estructural.`
    },
    {
        id: "chronicity",
        label: "Crosificación de Bajas (IT Larga)",
        driver: 'IT_LARGA',
        icon: Stethoscope,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        description: "Bajas >90 días absorbiendo recursos",
        diagnosisTemplate: (ctx: any) => `Impacto de Cobertura: El 15% de la plantilla está en IT de Larga Duración (>60 días). Esto sobrecarga a los activos presentes, elevando su riesgo de caer también (Efecto Dominó).`
    },
    {
        id: "frequentism",
        label: "Micro-Absentismo Repetitivo",
        driver: 'BRADFORD',
        icon: Activity,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        description: "Bajas cortas frecuentes (Factor Bradford)",
        diagnosisTemplate: (ctx: any) => `Patrón Bradford Crítico (${ctx.score}): El problema no es la duración, sino la frecuencia. Las ausencias de lunes/viernes están rompiendo la planificación de turnos sistemáticamente.`
    },
    {
        id: "partial",
        label: "Absentismo Parcial / Presentismo",
        driver: 'ABSENTISMO_PARCIAL',
        icon: Clock,
        color: "text-violet-600 bg-violet-50 border-violet-100",
        description: "Retrasos y salidas anticipadas",
        diagnosisTemplate: (ctx: any) => `Fricción Operativa: Aunque las bajas médicas son bajas, la pérdida de horas efectivas por retrasos y salidas anticipadas equivale a tener 3 FTEs menos. Correlación alta con problemas de transporte.`
    },
    {
        id: "conflict",
        label: "Conflictividad / Injustificado",
        driver: 'INJUSTIFICADO',
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-100",
        description: "Absentismo no justificado o disciplinario",
        diagnosisTemplate: (ctx: any) => `Alerta de Clima: Detectado pico de ausencias sin justificar coincidiendo con cambios de turno. Posible descontento latente o pérdida de compromiso ("Quiet Quitting").`
    }
];

// 2. CENTERS DATA
const CENTERS_BASE = [
    { id: "MAD-ALC", name: "Madrid · Alcorcón", size: "L", type: "Logística", employees: 342, manager: "Carlos Ruiz", mirrorId: "BCN-ZF" },
    { id: "BCN-ZF", name: "Barcelona · Z. Franca", size: "L", type: "Logística", employees: 415, manager: "Laura Valls", mirrorId: "MAD-ALC" },
    { id: "VAL-TUR", name: "Valencia · Turia", size: "M", type: "Tienda", employees: 120, manager: "Miguel Soler", mirrorId: "SEV-NEV" },
    { id: "SEV-NEV", name: "Sevilla · Nervión", size: "M", type: "Tienda", employees: 98, manager: "Ana Torres", mirrorId: "VAL-TUR" },
    { id: "BIL-IBA", name: "Bilbao · Ibaiondo", size: "S", type: "Tienda", employees: 45, manager: "Iker Mendi", mirrorId: "ZAR-DEL" },
];

const EXPLANATION_DOC = `
# Guía de Interpretación del Modelo Predictivo Integral

Este sistema evalúa la salud operativa de sus centros analizando TODAS las dimensiones del absentismo, no solo las bajas médicas frecuentes.

## 1. Visión Holística del Riesgo
El "Risk Score" (0-100) es un índice compuesto que pondera múltiples factores de riesgo. Un centro puede estar en alerta roja por diferentes motivos:

### A. Factor Bradford (Frecuencia)
*   **Qué mide:** La repetición de bajas cortas.
*   **Impacto:** Rompe la planificación diaria y genera sobrecoste administrativo.
*   **Típico en:** Perfiles desmotivados o entornos con alta carga física.

### B. Cronicidad (IT Larga Duración)
*   **Qué mide:** El peso de las bajas de larga duración (>60 días).
*   **Impacto:** Reduce la capacidad estructural del equipo. Sobrecarga a los compañeros sanos ("Burnout por contagio").
*   **Alerta:** Cuando supera el umbral de seguridad de cobertura (ej. >5% plantilla).

### C. Factor Psicosocial (Burnout / Estrés)
*   **Qué mide:** Indicadores tempranos de agotamiento mental.
*   **Señales:** Aumento de bajas por ansiedad, picos de IT media tras periodos de horas extra intensivas.
*   **Criticidad:** Alta. Son las bajas más difíciles de recuperar.

### D. Absentismo Injustificado & Parcial
*   **Qué mide:** Ausencias sin justificar, retrasos recurrentes, salidas anticipadas.
*   **Diagnóstico:** Suele indicar problemas de **Liderazgo** o **Clima Laboral**, no de salud.

---

## 2. Cómo leer los Diagnósticos
El sistema etiqueta automáticamente la causa raíz ("Driver") del riesgo para que sepa qué palanca activar:

*   Si la causa es **Psicosocial** -> Acciones de bienestar, revisión de cargas, encuestas de clima.
*   Si la causa es **Bradford** -> Entrevistas de retorno, control de gestión.
*   Si la causa es **Cronicidad** -> Planes de reincorporación adaptada, gestión con mutua.

---

## 3. Centros Espejo
Comparamos su centro con otros idénticos (mismo tamaño, sector y región) para eliminar excusas. Si su absentismo por estrés es del 8% y en su espejo es del 2%, el problema es interno, no del mercado.
`;


// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: INTEGRATED COPILOT (The Voice) - Refined for V1 Consistnecy
// ─────────────────────────────────────────────────────────────────────────────

const CopilotWidget = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user', text: string, actions?: any[] }>>([
        {
            role: 'ai',
            text: "Buenos días. En los próximos 14 días, el riesgo total sube un 18% en el cluster Norte. El driver principal es fatiga operativa en turno noche (3 centros).",
            actions: [
                { label: "Ver Análisis Norte", type: "primary" },
                { label: "Plan de Contención (72h)", type: "secondary" }
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const [isMinimized, setIsMinimized] = useState(false);

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: text }]);
        setInput("");

        // Simulate thinking & response based on specific keywords from the demo script
        setTimeout(() => {
            let responseText = "Entendido. Analizando...";
            let nextActions: any[] | undefined;

            if (text.includes("Plan de Contención") || text.includes("72h")) {
                responseText = "Si no haces nada, el impacto esperado es 420k€. Recomendamos 4 acciones inmediatas. Ahorro potencial: 250k€ (confianza 74%).";
                nextActions = [
                    { label: "Ejecutar Acciones (Automatizado)", type: "primary" },
                    { label: "Revisar Detalle", type: "secondary" }
                ];
            } else if (text.includes("Análisis Norte")) {
                responseText = "El Cluster Norte muestra un pico de estrés en MAD-Alcorcón y BIL-Ibaiondo. La causa raíz es la acumulación de 5 noches consecutivas sin descanso suficiente.";
            } else {
                responseText = "Puedo ayudarte a generar planes de acción, analizar causas raíz o comparar con centros espejo. ¿Qué necesitas?";
            }

            setMessages(prev => [...prev, { role: 'ai', text: responseText, actions: nextActions }]);
        }, 800);
    };

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[90] h-14 w-14 bg-zinc-900 rounded-full text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
            <Sparkles size={24} />
        </button>
    );

    return (
        <div className={`fixed bottom-0 right-8 w-96 bg-white border-x border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl flex flex-col transition-all duration-500 z-[90] ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
            {/* Header */}
            <div
                className="h-14 bg-zinc-900 text-white rounded-t-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-300" />
                        Copiloto Predictivo
                    </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:text-white"><X size={16} /></button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-zinc-900 text-white rounded-tr-none'
                                    : 'bg-white border border-zinc-200 text-zinc-700 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                                {msg.actions && (
                                    <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in duration-500 delay-100">
                                        {msg.actions.map((act: any, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(act.label)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all border ${act.type === 'primary'
                                                    ? 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-sm'
                                                    : 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100'
                                                    }`}
                                            >
                                                {act.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-zinc-200 bg-white">
                        <div className="relative">
                            <input
                                className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-zinc-700 placeholder:text-zinc-400"
                                placeholder="Pregunta sobre riesgos u operativas..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={() => handleSend()}
                                className="absolute right-2 top-2 p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-violet-600 transition-colors shadow-sm"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- MAIN DASHBOARD ---

export default function PredictionDashboard() {
    const [selectedRisk, setSelectedRisk] = useState<any>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [horizon, setHorizon] = useState<Horizon>("1m");
    const [showCopilot, setShowCopilot] = useState(true);

    // Dynamic Timeline Data Generator
    const timelineData = useMemo(() => {
        const points = TIME_HORIZONS[horizon].days;
        return Array.from({ length: points }, (_, i) => {
            const day = i + 1;
            const baseRisk = 15;
            const wave = Math.sin(i / 4) * 25; // Cyclic risk
            const trend = (i / points) * 20;   // Increasing trend
            const totalRisk = Math.min(100, Math.max(0, baseRisk + wave + trend + Math.random() * 10));

            return {
                day: `+${day}d`,
                risk: Math.round(totalRisk),
                event: totalRisk > 75 ? "⚠️ Alerta" : ""
            };
        });
    }, [horizon]);

    // Dynamic Risk Cards Generator with MIXED PATTERNS
    const risks = useMemo(() => {
        const multiplier = horizon === '1w' ? 0.9 : horizon === '2w' ? 1.0 : 1.1;

        return CENTERS_BASE.map((c, i) => {
            // Assign distinct risk profiles to show variety
            const pattern = PATTERN_TYPES[i % PATTERN_TYPES.length];
            const baseScore = i === 0 ? 92 : i === 1 ? 78 : i === 2 ? 65 : 42;
            const riskBreak = Math.round(Math.min(99, baseScore * multiplier));

            const daysOffset = Math.floor(Math.random() * TIME_HORIZONS[horizon].days) + 1;
            const criticalDate = new Date();
            criticalDate.setDate(criticalDate.getDate() + daysOffset);

            // Generate a distribution of risk causes for the chart
            const breakdown = [
                { name: 'Bradford', value: i === 2 ? 60 : 20, fill: '#60a5fa' },
                { name: 'IT Larga', value: i === 1 ? 50 : 15, fill: '#f59e0b' },
                { name: 'Psicosocial', value: i === 0 ? 70 : 10, fill: '#e11d48' }, // High Burnout for first item
                { name: 'Otros', value: 15, fill: '#94a3b8' },
            ];

            return {
                ...c,
                riskBreak,
                impactEur: Math.round(riskBreak * 185),
                patternType: pattern,
                diagnosis: pattern.diagnosisTemplate({
                    overtime: 145 + (i * 15),
                    score: 450 + (i * 100)
                }),
                nextCriticalDay: criticalDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
                mirrorData: {
                    id: c.mirrorId,
                    name: CENTERS_BASE.find(x => x.id === c.mirrorId)?.name || "N/A",
                    delta: i === 0 ? "+22%" : i === 1 ? "+12%" : "-5%"
                },
                breakdown
            };
        }).sort((a, b) => b.riskBreak - a.riskBreak);
    }, [horizon]);

    return (
        <div className="min-h-screen bg-zinc-50 pb-20 animate-in fade-in duration-700">

            {/* INJECT COPILOT */}
            <CopilotWidget />

            {/* HERO HEADER */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="max-w-[1700px] mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                                <Zap className="text-violet-600 fill-violet-100" />
                                Monitor de Predicción Integral
                            </h1>
                            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                <Brain size={14} />
                                Análisis multivariable (Bradford, IT Larga, Burnout, Clima)
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="group h-10 px-4 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs flex items-center gap-2 transition-all border border-indigo-100"
                            >
                                <Info size={16} />
                                <span className="hidden sm:inline">Guía de Interpretación</span>
                            </button>

                            <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200">
                                {(Object.keys(TIME_HORIZONS) as Horizon[]).map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setHorizon(h)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${horizon === h ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                                    >
                                        {TIME_HORIZONS[h].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TIMELINE VISUALIZER */}
                    <div className="h-[220px] w-full bg-white rounded-2xl border border-zinc-100 overflow-hidden relative group shadow-sm">
                        <div className="absolute top-5 left-6 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                <Activity size={14} /> Riesgo Sistémico ({TIME_HORIZONS[horizon].label})
                            </div>
                            <div className="text-2xl font-bold text-zinc-900 mt-1">
                                Tensión Operativa Proyectada
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 60, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRiskLight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} dy={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}
                                />
                                <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Zona Crítica', fill: '#f43f5e', fontSize: 10 }} />
                                <Area type="monotone" dataKey="risk" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorRiskLight)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-[1700px] mx-auto px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                        <Target size={18} className="text-zinc-400" />
                        Diagnóstico de Riesgo por Centro
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {risks.map((risk) => (
                        <div
                            key={risk.id}
                            onClick={() => setSelectedRisk(risk)}
                            className="bg-white rounded-[32px] border border-zinc-200 p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Top Color Line indicating dominant risk factor type */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${risk.patternType.driver === 'BURNOUT' ? 'bg-rose-500' : risk.patternType.driver === 'IT_LARGA' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-xl text-zinc-900 group-hover:text-violet-700 transition-colors mb-1">{risk.name}</h4>
                                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Building2 size={12} /> {risk.employees} Empleados
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-black ${risk.riskBreak > 80 ? 'text-rose-600' : risk.riskBreak > 60 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                        {risk.riskBreak}
                                    </div>
                                    <div className="text-[9px] font-bold text-zinc-400 uppercase">Risk Score</div>
                                </div>
                            </div>

                            <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3">
                                <Calendar size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Previsión Fecha Crítica</div>
                                    <div className="text-sm font-bold text-zinc-900">{risk.nextCriticalDay}</div>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                {/* CAUSE DRIVER CARD */}
                                <div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Factor Dominante</div>
                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${risk.patternType.color}`}>
                                        <risk.patternType.icon size={18} />
                                        <div>
                                            <div className="text-sm font-bold leading-tight">{risk.patternType.label}</div>
                                            <div className="text-[10px] opacity-80 font-medium mt-0.5">{risk.patternType.description}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MINI BREAKDOWN CHART */}
                                <div className="pt-2">
                                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                                        <span>Composición del Riesgo</span>
                                    </div>
                                    <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
                                        {risk.breakdown.map((b: any, i: number) => (
                                            <div key={i} style={{ width: `${b.value}%`, backgroundColor: b.fill }} title={b.name} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1 text-[9px] text-zinc-400">
                                        <span className="text-rose-500 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" />Psicosocial</span>
                                        <span className="text-amber-500 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />Larga Dur.</span>
                                        <span className="text-blue-500 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />Bradford</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-violet-600 group-hover:underline decoration-violet-300 underline-offset-4 transition-all">
                                <span>Ver Diagnóstico Completo</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- DETAILED DATA DRAWER --- */}
            {selectedRisk && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedRisk(null)} />
                    <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">

                        {/* Drawer Header */}
                        <div className="p-10 border-b border-zinc-100 bg-zinc-50 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${selectedRisk.patternType.color}`}>
                                        <selectedRisk.patternType.icon size={12} />
                                        {selectedRisk.patternType.label}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">{selectedRisk.name}</h2>
                                <p className="text-zinc-500 font-medium flex items-center gap-6">
                                    <span className="flex items-center gap-2"><UserCircle size={18} /> Manager: {selectedRisk.manager}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedRisk(null)} className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-12">

                            {/* 1. THE DIAGNOSIS */}
                            <section>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Brain size={16} /> Diagnóstico IA & Causa Raíz
                                </h4>

                                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm relative overflow-hidden group hover:border-violet-200 transition-colors">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Sparkles size={120} />
                                    </div>

                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className={`p-4 rounded-2xl ${selectedRisk.patternType.color} shrink-0`}>
                                            <selectedRisk.patternType.icon size={32} />
                                        </div>
                                        <div className="space-y-4">
                                            <h5 className="text-xl font-bold text-zinc-900">
                                                Causa Principal: {selectedRisk.patternType.label}
                                            </h5>
                                            <p className="text-base text-zinc-600 leading-relaxed font-medium">
                                                {selectedRisk.diagnosis}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. RISK BREAKDOWN CHART (The "Why" in visual form) */}
                            <section>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Activity size={16} /> Perfil Clínico del Absentismo
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={selectedRisk.breakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {selectedRisk.breakdown.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-zinc-900 mb-4">Peso de los Factores</h5>
                                        <div className="space-y-3">
                                            {selectedRisk.breakdown.map((item: any) => (
                                                <div key={item.name} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                                        <span className="text-zinc-600 font-medium">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-zinc-900">{item.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. MIRROR CENTER ANALYSIS */}
                            <section>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Scale size={16} /> Comparativa con Centro Espejo
                                </h4>
                                <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-bold text-zinc-900">{selectedRisk.mirrorData.name}</div>
                                        <div className="text-xs text-zinc-500">Espejo Estructural Verificado (Headcount idéntico)</div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-lg font-bold ${selectedRisk.mirrorData.delta.includes('+') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {selectedRisk.mirrorData.delta} vs Espejo
                                    </div>
                                </div>
                            </section>

                            {/* 4. IMPACT METRICS */}
                            <section>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <BarChart3 size={16} /> Impacto Económico
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl border border-zinc-100 bg-white">
                                        <div className="text-xs text-zinc-500 mb-1">Coste Proyectado</div>
                                        <div className="text-3xl font-bold text-zinc-900">{selectedRisk.impactEur.toLocaleString()}€</div>
                                    </div>
                                    <div className="p-6 rounded-3xl border border-zinc-100 bg-white">
                                        <div className="text-xs text-zinc-500 mb-1">Días Perdidos Est.</div>
                                        <div className="text-3xl font-bold text-zinc-900">42 <span className="text-sm font-normal text-zinc-400">jornadas</span></div>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Drawer Actions */}
                        <div className="p-10 border-t border-zinc-100 bg-white z-10 flex gap-4">
                            <button className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-violet-600 transition-all shadow-xl flex items-center justify-center gap-3">
                                <Zap size={18} />
                                Activar Protocolo {selectedRisk.patternType.driver}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- INFO MODAL (DOCUMENTATION) --- */}
            {showInfoModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowInfoModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 pb-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                    <BookOpen size={20} className="text-violet-600" />
                                    Guía de Interpretación Integral
                                </h2>
                            </div>
                            <button onClick={() => setShowInfoModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} className="text-zinc-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-8">

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-zinc-900">¿Qué es el Monitor de Predicción Integral?</h3>
                                <p className="text-zinc-600 leading-relaxed text-sm">
                                    Este sistema evalúa la salud operativa de sus centros analizando TODAS las dimensiones del absentismo, no solo las bajas médicas frecuentes. Utiliza algoritmos de Machine Learning para detectar patrones y prevenir roturas de servicio.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-zinc-900">Visión Holística del Riesgo</h3>
                                <p className="text-zinc-600 leading-relaxed text-sm">
                                    El "Risk Score" (0-100) es un índice compuesto que pondera múltiples factores. Un centro puede estar en alerta por diferentes motivos:
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="font-bold text-blue-900 mb-1 flex items-center gap-2"><Activity size={14} /> Factor Bradford</div>
                                        <p className="text-xs text-blue-800 leading-relaxed">Mide la frecuencia de bajas cortas. Rompe la planificación diaria.</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="font-bold text-amber-900 mb-1 flex items-center gap-2"><Stethoscope size={14} /> Cronicidad (IT Larga)</div>
                                        <p className="text-xs text-amber-800 leading-relaxed">Peso de bajas {'>'}90 días. Reduce la capacidad estructural.</p>
                                    </div>
                                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                        <div className="font-bold text-rose-900 mb-1 flex items-center gap-2"><Brain size={14} /> Factor Psicosocial</div>
                                        <p className="text-xs text-rose-800 leading-relaxed">Indicadores de Burnout y estrés. Aumento de bajas por ansiedad.</p>
                                    </div>
                                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                                        <div className="font-bold text-violet-900 mb-1 flex items-center gap-2"><Clock size={14} /> Absentismo Parcial</div>
                                        <p className="text-xs text-violet-800 leading-relaxed">Retrasos y salidas anticipadas. Problemas de clima o compromiso.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-zinc-900">Interpretación de Diagnósticos</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-600">
                                    <li><strong className="text-zinc-900">Causa Psicosocial:</strong> Requiere acciones de bienestar y revisión de cargas.</li>
                                    <li><strong className="text-zinc-900">Causa Bradford:</strong> Requiere entrevistas de retorno y control de gestión.</li>
                                    <li><strong className="text-zinc-900">Causa Cronicidad:</strong> Requiere planes de reincorporación adaptada.</li>
                                </ul>
                            </div>

                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                                <h4 className="flex items-center gap-2 font-bold text-indigo-900 text-lg mb-3">
                                    <Lightbulb size={20} />
                                    Nota Importante sobre Ética
                                </h4>
                                <p className="text-indigo-800 text-sm leading-relaxed">
                                    Este algoritmo ha sido auditado para evitar sesgos discriminatorios. No analiza datos de salud privados (diagnósticos médicos) ni penaliza derechos fundamentales (bajas por maternidad, paternidad o enfermedades graves). Su único propósito es la sostenibilidad operativa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
