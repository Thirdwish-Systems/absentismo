import React, { useState } from 'react';
import {
    Sparkles, Calendar, Clock, Euro, TrendingUp, Info,
    ArrowRight, MapPin, Activity, Zap, ShieldCheck,
    AlertTriangle, ChevronRight, BarChart3, Users, PlayCircle, Eye
} from 'lucide-react';

interface PatternWarning {
    id: string;
    title: string;
    description: string;
    type: 'Seasonal' | 'Operational' | 'Team' | 'Mirror' | 'Personal';
    window: string;
    impactEUR: number;
    impactDays: number;
    confidence: 'Baja' | 'Media' | 'Alta';
    evidence: {
        matches: number;
        years: number[];
        correlations: string[];
    };
    preventiveAction: string;
}

const MOCK_PATTERNS: PatternWarning[] = [
    {
        id: 'p1',
        title: "Conciliación Festivos Locales",
        description: "Mujeres (35-45 años) en roles de Picking/Caja muestran un repunte de ausencias durante festividades locales debido a falta de soporte en cuidados infantiles.",
        type: 'Seasonal',
        window: "Carnavales (2-4 semanas)",
        impactEUR: 15600,
        impactDays: 52,
        confidence: 'Alta',
        evidence: {
            matches: 5,
            years: [2022, 2023, 2024, 2025],
            correlations: ["Demográfico: Femenino 35-45", "Rol: Operativo", "Calendario escolar"]
        },
        preventiveAction: "Habilitar bolsa de horas flexibles y facilitar cambios por 'días de libre disposición' gestionados."
    },
    {
        id: 'p2',
        title: "Fatiga por Turno de Noche",
        description: "Hombres jóvenes (<25 años) en turno de noche muestran una espiral de absentismo corto tras >4 noches consecutivas.",
        type: 'Operational',
        window: "Ciclo de 4 días",
        impactEUR: 9200,
        impactDays: 28,
        confidence: 'Media',
        evidence: {
            matches: 14,
            years: [2024, 2025],
            correlations: ["Demográfico: <25 años", "Turno: Noche", "Quick returns"]
        },
        preventiveAction: "Limitar bloques de noche a 3 jornadas consecutivas para este perfil y aumentar descanso post-turno."
    },
    {
        id: 'p3',
        title: "Erosión por Sobrecarga (Burnout)",
        description: "Supervisores con equipos con >10% de vacantes muestran un aumento de IT media tras 6 semanas de sobrecarga.",
        type: 'Team',
        window: "2 - 4 semanas",
        impactEUR: 22000,
        impactDays: 65,
        confidence: 'Alta',
        evidence: {
            matches: 8,
            years: [2025],
            correlations: ["Rol: Supervisor", "Ratio vacantes/hc", "Horas extra estructurales"]
        },
        preventiveAction: "Refuerzo intermedio de gestión y activación de 'Pool de Volantes' para cubrir huecos críticos."
    },
    {
        id: 'p4',
        title: "Desajuste de Especialización",
        description: "Técnicos especialistas muestran absentismo eludible en jornadas con alta rotura de stock de materiales críticos.",
        type: 'Operational',
        window: "Días de entrega",
        impactEUR: 6800,
        impactDays: 12,
        confidence: 'Media',
        evidence: {
            matches: 9,
            years: [2025],
            correlations: ["Rol: Técnico", "Stock-out KPI", "Fricción operativa"]
        },
        preventiveAction: "Ajustar planificación de especialistas a disponibilidad confirmada de suministros."
    },
    {
        id: 'p5',
        title: "Vulnerabilidad por Distancia",
        description: "Empleados con >40km de desplazamiento muestran No-shows recurrentes en días de inclemencias climáticas o huelgas transporte.",
        type: 'Personal',
        window: "Días de lluvia/nieve",
        impactEUR: 4500,
        impactDays: 18,
        confidence: 'Alta',
        evidence: {
            matches: 22,
            years: [2023, 2024, 2025],
            correlations: ["Radio >40km", "Previsión meteo", "Acceso vía A-1/AP-7"]
        },
        preventiveAction: "Protocolo de teletrabajo de emergencia o transporte corporativo compartido."
    },
    {
        id: 'p6',
        title: "Efecto 'Liderazgo Frágil'",
        description: "Anomalía en el centro de Madrid-Alcorcón: Absentismo 30% superior a su 'Centro Espejo' tras cambio de manager local.",
        type: 'Mirror',
        window: "Sostenido (3 meses)",
        impactEUR: 31000,
        impactDays: 110,
        confidence: 'Alta',
        evidence: {
            matches: 1,
            years: [2025],
            correlations: ["Diferencial Mirror Center", "Cambio Manager", "Encuesta clima baja"]
        },
        preventiveAction: "Auditoría de liderazgo y despliegue de soporte senior para estabilización de equipo."
    },
    {
        id: 'p7',
        title: "Repunte Post-Campaña",
        description: "Personal de refuerzo (ETT) muestra abandono/baja en la última semana de contrato tras picos de actividad extrema.",
        type: 'Seasonal',
        window: "Fin de rebajas",
        impactEUR: 12000,
        impactDays: 40,
        confidence: 'Media',
        evidence: {
            matches: 6,
            years: [2023, 2024, 2025],
            correlations: ["Tipo contrato: Temporal", "Pico ventas", "Tasa de fidelización"]
        },
        preventiveAction: "Bonificaciones por finalización de campaña y revisión de carga en última semana."
    },
    {
        id: 'p8',
        title: "Fragilidad por Antigüedad",
        description: "Nuevas incorporaciones (<3 meses) en Logística muestran IT corta en el periodo de formación intensiva.",
        type: 'Personal',
        window: "Semana 3 - 6",
        impactEUR: 5400,
        impactDays: 20,
        confidence: 'Alta',
        evidence: {
            matches: 15,
            years: [2025],
            correlations: ["Antigüedad <90d", "Curva aprendizaje", "Tutorización baja"]
        },
        preventiveAction: "Reforzar sistema de 'Buddy' y reducir cuotas de picking progresivamente."
    }
];

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

export default function PredictionPatternsTab() {
    const [selectedPattern, setSelectedPattern] = useState<PatternWarning | null>(null);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with impact overview */}
            <div className="p-12 bg-white rounded-[48px] border border-zinc-100 text-zinc-900 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Sparkles size={160} />
                </div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
                                <Activity size={12} className="text-violet-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inteligencia de Patrones</span>
                        </div>
                        <h2 className="text-4xl font-light tracking-tight mb-4">Descubrimiento Automático</h2>
                        <p className="text-zinc-500 text-lg leading-relaxed font-medium max-w-md">
                            La IA ha detectado <span className="text-zinc-900 font-bold">{MOCK_PATTERNS.length} patrones críticos</span> que se repiten en tu operativa. Acciónalos para evitar el impacto previsto.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                            <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Impacto Previsto</div>
                            <div className="text-3xl font-light text-rose-600 font-mono">25.500€</div>
                            <div className="text-[9px] text-zinc-400 mt-1">Próximas 6 semanas</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 text-zinc-500">
                            <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Días en Riesgo</div>
                            <div className="text-3xl font-light text-zinc-900 font-mono">91 <span className="text-xs">días</span></div>
                            <div className="text-[9px] text-zinc-500 mt-1">Acumulado patrones</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pattern Warnings Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Warnings de Patrones Activos
                    </h3>
                    <div className="text-[10px] text-zinc-400 font-bold">Ordenado por impacto P&L</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PATTERNS.map((p) => (
                        <div
                            key={p.id}
                            className="group bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-500 relative flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    p.type === 'Seasonal' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-blue-700 border-blue-100"
                                )}>
                                    {p.type}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-bold",
                                    p.confidence === 'Alta' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-50 text-zinc-500 border-zinc-100"
                                )}>
                                    <ShieldCheck size={10} /> Confianza {p.confidence}
                                </div>
                            </div>

                            <h4 className="text-lg font-medium text-zinc-900 mb-2 leading-tight group-hover:text-violet-600 transition-colors uppercase tracking-tight">
                                {p.title}
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6 flex-1">
                                {p.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={12} /> Ventana
                                    </span>
                                    <span className="text-zinc-900">{p.window}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Euro size={12} /> Impacto P&L
                                    </span>
                                    <span className="text-rose-600">-{p.impactEUR.toLocaleString()}€</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-400/20 w-3/4 rounded-full" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPattern(p)}
                                    className="flex-1 h-11 rounded-2xl bg-zinc-50 text-zinc-900 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all border border-zinc-100"
                                >
                                    <Eye size={14} /> Ver Evidencia
                                </button>
                                <button className="h-11 w-11 rounded-2xl bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center hover:bg-zinc-50 transition-all shadow-sm">
                                    <Zap size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evidence Drawer/Modal Backdrop */}
            {selectedPattern && (
                <div className="fixed inset-0 z-[120] flex items-center justify-end bg-zinc-900/20 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-zinc-900 tracking-tight">Evidencia del Patrón</h3>
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Análisis Multianual AI Engine</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPattern(null)}
                                className="h-12 w-12 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Visual Match */}
                            <section>
                                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em] mb-4">Repetición Histórica</h4>
                                <div className="flex gap-2">
                                    {[2021, 2022, 2023, 2024, 2025].map(year => (
                                        <div key={year} className={cn(
                                            "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                                            selectedPattern.evidence.years.includes(year)
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                                                : "bg-zinc-50 border-zinc-100 text-zinc-300 border-dashed"
                                        )}>
                                            <span className="text-[10px]">{year}</span>
                                            {selectedPattern.evidence.years.includes(year) ? <ShieldCheck size={16} /> : <div className="h-4 w-4" />}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500 mt-4 font-medium leading-relaxed italic">
                                    "Este patrón se ha manifestado en {selectedPattern.evidence.matches} de los últimos 4 años con una varianza inferior al 8%."
                                </p>
                            </section>

                            {/* Correlation Matrix */}
                            <section>
                                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em] mb-4">Variables Correlacionadas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPattern.evidence.correlations.map((c, i) => (
                                        <div key={i} className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-700 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                            {c}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Preventive Playbook */}
                            <section className="p-8 bg-violet-50 rounded-[32px] border border-violet-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                                        <PlayCircle size={18} />
                                    </div>
                                    <h4 className="text-sm font-semibold text-violet-900 uppercase tracking-tight">Acción Preventiva Recomendada</h4>
                                </div>
                                <p className="text-sm text-violet-800/80 leading-relaxed font-medium mb-6">
                                    {selectedPattern.preventiveAction}
                                </p>
                                <button className="w-full h-12 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 flex items-center justify-center gap-2">
                                    Activar Playbook <ArrowRight size={14} />
                                </button>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Impact Tracking System */}
            <div className="bg-zinc-50 rounded-[48px] border border-zinc-100 p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-900 tracking-tight">Seguimiento de Impacto</h3>
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-1">Eficacia de las medidas preventivas</p>
                    </div>
                    <button className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 hover:text-zinc-900 transition-all">
                        Ver histórico completo <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Acciones Activas</div>
                        <div className="text-2xl font-light text-zinc-900">4</div>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                            <TrendingUp size={12} /> Alta eficacia
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Coste Evitado</div>
                        <div className="text-2xl font-light text-emerald-600">12.420€</div>
                        <div className="mt-2 text-[10px] font-bold text-zinc-400 italic">Mes de enero</div>
                    </div>
                    {/* ... more stats ... */}
                </div>
            </div>
        </div>
    );
}
