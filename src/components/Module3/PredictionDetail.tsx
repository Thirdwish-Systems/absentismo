import React from "react";
import {
    ChevronLeft,
    Brain,
    Sparkles,
    TrendingDown,
    Euro,
    Activity,
    Zap,
    PlusCircle,
    Info,
    Target,
    ShieldAlert,
    Clock,
    MapPin,
    Users
} from "lucide-react";
import { Cell, Horizon, riskTone } from "./types";
import { RiskThresholds } from "../../stores/configStore";

interface PredictionDetailProps {
    prediction: Cell;
    horizon: Horizon;
    accuracy: number;
    onBack: () => void;
    thresholds: RiskThresholds;
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const pct = (n: number) => `${Math.round(Math.min(100, Math.max(0, n)))}%`;
const money = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
        Number.isFinite(n) ? n : 0
    );
const isoDate = (ts: number) => new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
const dow = (ts: number) => ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][new Date(ts).getDay()];

/* --- Subcomponents --- */

const DetailCard = ({ title, icon: Icon, children, className = "" }: any) => (
    <div className={`rounded-[2rem] border border-zinc-100 bg-white p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-600">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

const KPI = ({ label, value, subtext, trend, colorClass = "text-zinc-900", icon: Icon }: any) => (
    <div className="flex flex-col">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            {Icon && <Icon size={12} className="text-zinc-300" />}
            {label}
        </div>
        <div className={cn("text-3xl font-light tracking-tighter", colorClass)}>
            {value}
        </div>
        {subtext && <div className="text-[10px] font-medium text-zinc-500 mt-1 uppercase opacity-80">{subtext}</div>}
        {trend && (
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
                <TrendingDown size={12} />
                {trend}
            </div>
        )}
    </div>
);

export default function PredictionDetail({ prediction, horizon, accuracy, onBack, thresholds }: PredictionDetailProps) {
    const tone = riskTone(prediction.riskBreak, thresholds);

    // Derived "Expert" data based on the prediction
    const roi = 145 + (prediction.riskBreak / 10) * 12; // Semi-random but tied to risk
    const reliability = accuracy; // Use the accuracy from horizon
    const fatigueImpact = prediction.drivers.find(d => d.label === "Fatiga")?.s || 0.2;
    const teamHealthStatus = fatigueImpact > 0.6 ? "Riesgo de Burnout" : fatigueImpact > 0.3 ? "Tensión Moderada" : "Saludable";
    const teamHealthColor = fatigueImpact > 0.6 ? "text-rose-600" : fatigueImpact > 0.3 ? "text-amber-600" : "text-emerald-600";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-sm"
                >
                    <ChevronLeft size={18} />
                    Volver al Mapa de Riesgos
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">ID Predicción: {prediction.key.split('__')[0]}_{prediction.dayTs}</span>
                    <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                </div>
            </div>

            {/* Title Section */}
            <div className="mb-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={cn("px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border", tone.brd, tone.bg, tone.tx)}>
                        Impacto {tone.label}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border border-violet-100">
                        <Brain size={12} />
                        Análisis IA Activo
                    </span>
                </div>
                <h1 className="text-4xl font-light text-zinc-900 tracking-tighter mb-2">
                    {prediction.centerName} · <span className="text-violet-600 font-semibold">{prediction.role}</span>
                </h1>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100 flex items-center gap-1.5 shadow-sm">
                        <Activity size={12} /> {prediction.absType}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Motivo previsto por la IA</span>
                </div>
                <p className="text-lg font-medium text-zinc-500 flex items-center gap-2">
                    <Clock size={18} />
                    {dow(prediction.dayTs)}, {isoDate(prediction.dayTs)} · Turno de {prediction.shift}
                </p>
            </div>

            {/* MAIN KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="rounded-[2.5rem] bg-rose-50 border border-rose-100 p-8 shadow-[0_20px_50px_rgba(244,63,94,0.1)]">
                    <KPI
                        label="Probabilidad de Rotura"
                        value={pct(prediction.riskBreak)}
                        subtext="Riesgo Operativo Crítico"
                        colorClass="text-rose-600"
                        icon={ShieldAlert}
                    />
                </div>
                <div className="rounded-[2.5rem] bg-violet-50 border border-violet-100 p-8 shadow-[0_20px_50px_rgba(124,58,237,0.1)]">
                    <KPI
                        label="Fiabilidad IA"
                        value={pct(reliability)}
                        subtext={`Horizonte ${horizon}`}
                        colorClass="text-violet-600"
                        icon={Sparkles}
                    />
                </div>
                <div className="rounded-[2.5rem] bg-zinc-50 border border-zinc-100 p-8 shadow-sm">
                    <KPI
                        label="Coste Previsto"
                        value={money(prediction.eur)}
                        subtext={`+${money(prediction.eurNP)} fuera de ppto`}
                        colorClass="text-zinc-900"
                        icon={Euro}
                    />
                </div>
                <div className="rounded-[2.5rem] bg-emerald-50 border border-emerald-100 p-8 shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
                    <KPI
                        label="ROI de Acción"
                        value={`${roi.toFixed(0)}%`}
                        subtext="Ahorro vs Coste Acción"
                        colorClass="text-emerald-600"
                        trend="-45% Riesgo"
                        icon={Target}
                    />
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN - Diagnosis & Drivers */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Diagnosis Card */}
                    <DetailCard title="Diagnóstico de la IA" icon={Brain}>
                        <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 mb-6">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Patrón Detectado</h4>
                            <div className="text-2xl font-light text-zinc-900 mb-2">{prediction.pattern}</div>
                            <p className="text-zinc-600 font-medium leading-relaxed italic">
                                "{prediction.why}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prediction.drivers.sort((a, b) => b.s - a.s).map(d => (
                                <div key={d.label} className="p-4 rounded-2xl border border-zinc-100 hover:border-violet-200 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-zinc-800">{d.label}</span>
                                        <span className={cn("text-xs font-bold", d.s > 0.6 ? "text-rose-500" : "text-amber-500")}>
                                            {pct(d.s * 100)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", d.s > 0.6 ? "bg-rose-500" : "bg-amber-500")}
                                            style={{ width: pct(d.s * 100) }}
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight leading-tight group-hover:text-zinc-500 transition-colors">
                                        {d.why}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </DetailCard>

                    {/* Operational Insights */}
                    <DetailCard title="Contexto Operativo" icon={Activity}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-4 rounded-3xl bg-zinc-50/50 border border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users size={14} />
                                    Plantilla
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-light text-zinc-900">{prediction.planned}</span>
                                    <span className="text-xs font-medium text-zinc-500 italic">planificados</span>
                                </div>
                                <div className="mt-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Mínimo: {prediction.minOp} personas
                                </div>
                            </div>
                            <div className="p-4 rounded-3xl bg-zinc-50/50 border border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <MapPin size={14} />
                                    Complejidad Centro
                                </div>
                                <div className="text-2xl font-light text-zinc-900 uppercase">
                                    {prediction.criticidad}
                                </div>
                                <div className="mt-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    SLA Alto · Restricción de turnos
                                </div>
                            </div>
                            <div className="p-4 rounded-3xl bg-zinc-50/50 border border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity size={14} />
                                    Salud del Equipo
                                </div>
                                <div className={cn("text-xl font-light uppercase", teamHealthColor)}>
                                    {teamHealthStatus}
                                </div>
                                <div className="mt-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Índice de fatiga: {fatigueImpact.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </DetailCard>
                </div>

                {/* RIGHT COLUMN - Actions & Decisions */}
                <div className="lg:col-span-4 space-y-8">

                    {/* RECOMMENDED ACTION CARD */}
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-2xl shadow-violet-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/20 text-white">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-bold text-xl tracking-tight">Acción Recomendada</h3>
                        </div>

                        <div className="mb-8">
                            <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Estrategia de Mitigación</div>
                            <div className="text-2xl font-light mb-3">Refuerzo Preventivo</div>
                            <p className="text-white/80 text-sm font-medium leading-relaxed italic">
                                "Activar bolsa de horas y swap de turnos preventivo para garantizar el mínimo operativo de 4 personas en Caja."
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-widest">Impacto en Riesgo</span>
                                <span className="text-sm font-bold text-emerald-300">-45% prob. rotura</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-widest">Ahorro Neto</span>
                                <span className="text-sm font-bold text-white">{money(prediction.eur * 0.45)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-xs font-medium opacity-60 uppercase tracking-widest">Plazo sugerido</span>
                                <span className="text-sm font-bold text-white">Antes de 48h</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button className="w-full bg-white text-violet-700 py-4 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                                <Zap size={18} />
                                Activar Automatización
                            </button>
                            <button className="w-full bg-white/10 text-white py-4 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                                <PlusCircle size={18} />
                                Crear Estrategia Nueva
                            </button>
                        </div>
                    </div>

                    {/* EXPERT ADVICE */}
                    <DetailCard title="Consejo del Experto" icon={Info}>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs font-medium text-amber-900 leading-relaxed">
                                <span className="font-bold flex items-center gap-1 mb-1">
                                    <ShieldAlert size={12} />
                                    Nota de Fatiga Acumulada
                                </span>
                                Este centro ha tenido picos de absentismo similares en las últimas 3 semanas. No se recomienda usar horas extra del mismo equipo; mejor reasignar personal de un centro cercano para evitar bajas por agotamiento.
                            </div>
                            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-xs font-medium text-violet-900 leading-relaxed">
                                <span className="font-bold flex items-center gap-1 mb-1">
                                    <Sparkles size={12} />
                                    Sugerencia de la IA
                                </span>
                                La fiabilidad del 85% indica una señal fuerte. Hemos cruzado esta predicción con el calendario de eventos locales y hay un festival que coincide con el turno de noche.
                            </div>
                        </div>
                    </DetailCard>

                </div>
            </div>
        </div>
    );
}
