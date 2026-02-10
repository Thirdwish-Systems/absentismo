import React, { useState, useMemo, useEffect } from "react";
import {
    Zap, Clock, TrendingUp, AlertTriangle, Users, Target,
    ArrowRight, Search, Activity, ShieldCheck, Brain, Sparkles,
    X, BarChart3, Info, Calendar, FileText, CheckCircle2,
    Building2, UserCircle, Scale, ArrowRightLeft,
    BookOpen, Lightbulb, PlayCircle, MessageSquare, Hand,
    Maximize2, Minimize2, MoreHorizontal, ChevronRight, Euro,
    LineChart, PieChart, Send
} from "lucide-react";
import {
    AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar, Cell, ReferenceLine
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES & INTERFACES (The Brain)
// ─────────────────────────────────────────────────────────────────────────────

// Local types
type Horizon = "7d" | "14d" | "30d" | "90d";
type Confidence = "low" | "medium" | "high";
type RiskDriver = "FATIGA_OPERATIVA" | "VACIO_LIDERAZGO" | "PATRON_CLIMA" | "CONFLICTO_STRUCT";

// Threat interface is imported from unifiedMockData

const HORIZONS: Record<Horizon, { label: string; days: number }> = {
    "7d": { label: "7 Días (Táctico)", days: 7 },
    "14d": { label: "14 Días (Operativo)", days: 14 },
    "30d": { label: "30 Días (Mensual)", days: 30 },
    "90d": { label: "90 Días (Estratégico)", days: 90 },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA ENGINE (The "Neural System" Simulation)
// ─────────────────────────────────────────────────────────────────────────────

import { UNIFIED_MOCK_DATA, Threat } from "../../stores/unifiedMockData";

const MOCK_THREATS: Threat[] = UNIFIED_MOCK_DATA.TOP_THREATS;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: INTEGRATED COPILOT (The Voice)
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
        },
        {
            role: 'ai',
            text: "Si no haces nada, el impacto esperado es 420k€. Recomendamos 4 acciones inmediatas. Ahorro potencial: 250k€ (confianza 74%)."
        }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput("");

        // Simulate thinking & response
        setTimeout(() => {
            let responseText = "Entendido. Analizando patrones...";
            const lower = input.toLowerCase();

            if (lower.includes("plan") || lower.includes("acción")) {
                responseText = "Generando Plan de Contención (72h):\n1. Activar Bolsa en MAD-Alcorcón (Impacto: -12k€ riesgo)\n2. Reajuste de turnos en BCN-ZF.\n\n¿Quieres que lance las solicitudes de aprobación?";
            } else if (lower.includes("centro") || lower.includes("romper")) {
                responseText = "MAD-Alcorcón es el punto crítico más inminente. Rotura prevista para el viernes noche (-3 FTEs). Causa raíz: Secuencia de 5 noches consecutivas.";
            } else {
                responseText = "Puedo ayudarte a generar planes de acción, analizar causas raíz o comparar con centros espejo. ¿Qué necesitas?";
            }

            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        }, 800);
    };

    return (
        <div className={`fixed bottom-0 right-8 w-96 bg-white border-x border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl flex flex-col transition-all duration-500 z-50 ${isOpen ? 'h-[600px]' : 'h-14'}`}>
            {/* Header */}
            <div
                className="h-14 bg-zinc-900 text-white rounded-t-2xl flex items-center justify-between px-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-300" />
                        Copiloto Predictivo
                    </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    {isOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </div>
            </div>

            {/* Body */}
            {isOpen && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-zinc-900 text-white rounded-tr-none'
                                    : 'bg-white border border-zinc-200 text-zinc-700 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                                {msg.actions && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.actions.map((act: any, i: number) => (
                                            <button key={i} className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors">
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
                                className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                placeholder="Pregunta sobre riesgos, planes..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-2 p-1.5 text-zinc-400 hover:text-violet-600 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD V2
// ─────────────────────────────────────────────────────────────────────────────

export default function PredictionDashboardV2() {
    const [horizon, setHorizon] = useState<Horizon>("14d");
    const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

    return (
        <div className="min-h-screen bg-[#F4F4F5] pb-32 font-sans selection:bg-violet-200">

            {/* 1. EXECUTIVE LANDING (The 10-second view) */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm/50">
                <div className="max-w-[1800px] mx-auto px-6 py-5">

                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white">
                                    Sistema V2 Beta
                                </span>
                                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Operativo
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                Command Center
                                <span className="text-zinc-300 font-light"> | </span>
                                <span className="text-zinc-500 font-normal text-xl">Previsión de Riesgo Operativo</span>
                            </h1>
                        </div>

                        {/* Horizon Switcher */}
                        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 border border-zinc-200">
                            {(Object.keys(HORIZONS) as Horizon[]).map((h) => (
                                <button
                                    key={h}
                                    onClick={() => setHorizon(h)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${horizon === h ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                                >
                                    {HORIZONS[h].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KPI CARDS - ECONOMY FIRST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* 1. Expected Loss */}
                        <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl p-5 border border-rose-100 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-4 opacity-5"><TrendingUp size={80} /></div>
                            <div className="text-xs font-bold text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Euro size={14} /> Expected Loss
                            </div>
                            <div className="text-3xl font-black text-rose-600 tracking-tight mb-1">
                                {UNIFIED_MOCK_DATA.KPI.expectedLossCurrentWindow.toLocaleString()}€
                            </div>
                            <div className="text-xs text-rose-700 font-medium">En riesgo próximos {HORIZONS[horizon].days} días</div>

                            {/* Confidence Bar */}
                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-rose-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-600" style={{ width: `${UNIFIED_MOCK_DATA.KPI.riskConfidence}%` }} />
                                </div>
                                <span className="text-[9px] font-bold text-rose-800">Confianza {UNIFIED_MOCK_DATA.KPI.riskConfidence}%</span>
                            </div>
                        </div>

                        {/* 2. Capacidad Futura */}
                        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Users size={14} /> Capacidad Probable
                            </div>
                            <div className="text-3xl font-black text-zinc-900 tracking-tight mb-1">1042 <span className="text-lg text-zinc-400 font-normal">/ 1100 FTE</span></div>
                            <div className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-1.5 py-0.5 rounded">Gap -58 FTEs Proyectado</div>
                            <div className="mt-4 text-[10px] text-zinc-400 font-medium text-right">
                                Actualizado hace 5 min
                            </div>
                        </div>

                        {/* 3. Rotura Operativa */}
                        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertTriangle size={14} /> Riesgo Rotura
                            </div>
                            <div className="text-3xl font-black text-zinc-900 tracking-tight mb-1">12 <span className="text-lg text-zinc-400 font-normal">Centros</span></div>
                            <div className="text-xs text-zinc-500 font-medium">Probabilidad crítica {'>'} 85%</div>

                            <div className="mt-4 flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-rose-600">!</div>)}
                            </div>
                        </div>

                        {/* 4. Ahorro Potencial */}
                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-100 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-4 opacity-5"><Target size={80} /></div>
                            <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={14} /> Ahorro Potencial
                            </div>
                            <div className="text-3xl font-black text-emerald-600 tracking-tight mb-1">
                                {UNIFIED_MOCK_DATA.KPI.savingsRestYear.toLocaleString()}€
                            </div>
                            <div className="text-xs text-emerald-700 font-medium">Si ejecutas acciones pendientes</div>

                            <button className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                                Ver Plan Recomendado
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            {/* 2. TOP THREATS LIST (Actionable) */}
            <main className="max-w-[1800px] mx-auto px-6 py-8">

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={16} /> Top Threats (Prioridad por €)
                    </h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors">
                            Ver Todos ({UNIFIED_MOCK_DATA.KPI.totalActiveRisks})
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {MOCK_THREATS.map((threat) => (
                        <motion.div
                            layoutId={threat.id}
                            key={threat.id}
                            onClick={() => setSelectedThreat(threat)}
                            className="group bg-white rounded-xl border border-zinc-200 p-1 hover:border-violet-300 hover:shadow-xl transition-all cursor-pointer relative"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-4 p-4">

                                {/* A. Identity (Who) */}
                                <div className="w-full md:w-1/4 flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border ${threat.breakageProb > 0.8 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {Math.round(threat.breakageProb * 100)}%
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 leading-tight group-hover:text-violet-700">{threat.unit}</h4>
                                        <div className="text-xs text-zinc-500 font-medium flex items-center gap-2 mt-0.5">
                                            <Building2 size={10} /> {threat.shift} · {threat.role}
                                        </div>
                                    </div>
                                </div>

                                {/* B. Impact (€ - The Why) */}
                                <div className="w-full md:w-1/5 border-l border-zinc-100 pl-4">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expected Loss</div>
                                    <div className="text-xl font-mono font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">
                                        {threat.expectedLoss.toLocaleString()}€
                                    </div>
                                </div>

                                {/* C. Operational Gap (The What) */}
                                <div className="w-full md:w-1/5 border-l border-zinc-100 pl-4">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gap Operativo</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-rose-600">{threat.staffing.gap} FTEs</span>
                                        <span className="text-xs text-zinc-400">({threat.staffing.estimated}/{threat.staffing.minimum})</span>
                                    </div>
                                </div>

                                {/* D. Peak Date (When) */}
                                <div className="w-full md:w-1/5 border-l border-zinc-100 pl-4">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pico Crítico</div>
                                    <div className="text-sm font-bold text-zinc-700 flex items-center gap-2 mt-1">
                                        <Calendar size={14} className="text-rose-500" />
                                        {threat.peakDate}
                                    </div>
                                </div>

                                {/* E. Action (The How) */}
                                <div className="w-full md:w-auto ml-auto flex items-center justify-end">
                                    <div className="px-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white text-xs font-bold transition-all flex items-center gap-2">
                                        <Zap size={14} />
                                        {threat.actionPlan.type === "COVERAGE" ? "Activar Cobertura" : "Plan Intervención"}
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Mini-Context (On click) */}
                            <div className="h-1 w-full bg-zinc-100 mt-1 overflow-hidden rounded-full">
                                <div className={`h-full ${threat.breakageProb > 0.8 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${threat.breakageProb * 100}%` }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* 3. COPILOT WIDGET (Always present) */}
            <CopilotWidget />

            {/* 4. DETAIL DRAWER (The "Explainable" Layer) */}
            <AnimatePresence>
                {selectedThreat && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            key="backdrop"
                            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100]"
                            onClick={() => setSelectedThreat(null)}
                        />
                        <motion.div
                            key="drawer"
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                                            Alto Impacto {selectedThreat.expectedLoss.toLocaleString()}€
                                        </div>
                                        <div className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-zinc-200">
                                            Confianza 88%
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-2">
                                        {selectedThreat.unit}
                                    </h2>
                                    <p className="text-zinc-500 font-medium">Análisis de Rotura en {selectedThreat.shift} · {selectedThreat.role}</p>
                                </div>
                                <button onClick={() => setSelectedThreat(null)} className="h-10 w-10 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-full flex items-center justify-center transition-all"><X size={24} /></button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                                {/* Story Card */}
                                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare size={100} className="text-violet-600" /></div>
                                    <h4 className="font-bold text-violet-900 mb-2 flex items-center gap-2"><Sparkles size={16} /> Story del Riesgo</h4>
                                    <p className="text-sm text-violet-800 leading-relaxed font-medium relative z-10">
                                        "El riesgo sube drásticamente por una acumulación de 5 noches consecutivas sumado a un pico de horas extra (+22h).
                                        Este patrón ya ocurrió en <strong>BCN-Logística</strong> hace 2 meses y resultó en 14 días perdidos de operación."
                                    </p>
                                </div>

                                {/* Drivers Breakdown */}
                                <section>
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Drivers de Probabilidad</h4>
                                    <div className="space-y-3">
                                        {selectedThreat.drivers.map((driver, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                                                    <span className="text-sm font-bold text-zinc-700">{driver.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">Peso {Math.round(driver.weight * 100)}%</div>
                                                    <span className="text-xs font-bold text-rose-600">{driver.delta}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Prescriptive Action */}
                                <section>
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Acción Recomendada (Prescriptive)</h4>
                                    <div className="border border-zinc-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="text-lg font-bold text-zinc-900 mb-1">{selectedThreat.actionPlan.title}</h5>
                                                <p className="text-xs text-zinc-500">Plan óptimo para minimizar pérdida económica.</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-emerald-600">+{selectedThreat.actionPlan.savings.toLocaleString()}€</div>
                                                <div className="text-[10px] font-bold text-emerald-700/60 uppercase">Ahorro Est.</div>
                                            </div>
                                        </div>
                                        <div className="h-px w-full bg-zinc-100" />
                                        <div className="flex gap-3">
                                            <button className="flex-1 h-12 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                <Zap size={16} /> Ejecutar Acción
                                            </button>
                                            <button className="h-12 px-6 border border-zinc-200 rounded-xl text-zinc-600 font-bold hover:bg-zinc-50 text-xs uppercase tracking-widest">
                                                Simular
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1">
                                            <ShieldCheck size={10} /> Acción validada por compliance (No discriminatoria)
                                        </p>
                                    </div>
                                </section>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
