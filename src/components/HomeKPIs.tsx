import React from "react";
import { Info, ArrowUp, ArrowDown } from "lucide-react";
import { fmtEUR, fmtPct, fmtInt, fmtDate } from "../utils/formatters";

// --- TYPES ---
// Re-using KPIState from unifiedMockData for calculating local deltas
interface CalculatedKPIs extends KPIState {
    deltaEurYTD: number;
    deltaPctYTD: number;
    savingsYTD: number;
    deltaEurRestYear: number;
    deltaPctRestYear: number;
    savingsRestYear: number;
}

import { UNIFIED_MOCK_DATA, KPIState } from "../stores/unifiedMockData";

// --- MOCK DATA GENERATOR ---
// Using Single Source of Truth from unifiedMockData
const MOCK_DATA: KPIState = UNIFIED_MOCK_DATA.KPI;

// --- CALCULATIONS ---
function calculateKPIs(data: KPIState): CalculatedKPIs {
    // Section A: YTD
    const deltaEurYTD = data.costYTD - data.costYTD_LY;
    const deltaPctYTD = data.costYTD_LY > 0 ? (deltaEurYTD / data.costYTD_LY) * 100 : 0;
    const savingsYTD = data.costYTD_NoActions - data.costYTD;

    // Section B: Prediction
    const deltaEurRestYear = data.costRestYear_NoActions - data.costRestYear_LY;
    const deltaPctRestYear = data.costRestYear_LY > 0 ? (deltaEurRestYear / data.costRestYear_LY) * 100 : 0;
    const savingsRestYear = data.costRestYear_NoActions - data.costRestYear_WithRecommended;

    return {
        ...data,
        deltaEurYTD,
        deltaPctYTD,
        savingsYTD,
        deltaEurRestYear,
        deltaPctRestYear,
        savingsRestYear,
    };
}

// --- COMPONENTS ---

const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-flex ml-1.5 translate-y-0.5">
        <Info className="h-3.5 w-3.5 text-zinc-400 cursor-help hover:text-violet-600 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-white text-[10px] leading-tight rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
        </div>
    </div>
);

const KPICard = ({
    label,
    value,
    subtext,
    tooltip,
    highlight,
    trend, // 'up' | 'down' | null
    trendColor, // 'good' | 'bad' | 'neutral'
}: {
    label: string;
    value: React.ReactNode;
    subtext?: React.ReactNode;
    tooltip: string;
    highlight?: boolean;
    trend?: "up" | "down" | null;
    trendColor?: "good" | "bad" | "neutral";
}) => {
    return (
        <div className={`
      relative p-4 rounded-[28px] border bg-white shadow-sm flex flex-col justify-between h-full
      ${highlight ? "border-violet-200 bg-violet-50/30" : "border-zinc-200"}
    `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center text-xs font-medium text-zinc-600">
                    {label}
                    <Tooltip text={tooltip} />
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trendColor === "good" ? "bg-emerald-50 text-emerald-700" :
                        trendColor === "bad" ? "bg-amber-50 text-amber-700" :
                            "bg-zinc-100 text-zinc-600"
                        }`}>
                        {trend === "up" ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                        {/* Optional text could go here if needed, but styling usually minimal */}
                    </div>
                )}
            </div>

            {/* Main Value */}
            <div className="text-2xl font-light text-zinc-900 tracking-tight">
                {value}
            </div>

            {/* Subtext */}
            {subtext && (
                <div className="mt-1 text-[11px] text-zinc-500 font-medium leading-snug">
                    {subtext}
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function HomeKPIs() {
    const kpis = calculateKPIs(MOCK_DATA);

    // Delta color helpers
    // If Cost > LY => Bad (Red/Amber)
    // If Cost < LY => Good (Green)
    // For savings, usually positive is good, but here we show deltas of COSTS.
    // Prompt: Si el coste sube vs LY => peor (ambar/rojo). Si baja => mejor (verde).

    const getTrendColor = (deltaVal: number, type: 'cost' | 'savings') => {
        if (type === 'cost') return deltaVal > 0 ? 'bad' : 'good';
        // For savings positive is good
        return deltaVal > 0 ? 'good' : 'bad';
    };

    const DeltaDisplay = ({ pct, eur }: { pct: number; eur: number }) => {
        const isUp = eur > 0;
        const colorClass = isUp ? "text-amber-600" : "text-emerald-600"; // Cost logic: Up is bad
        const Icon = isUp ? ArrowUp : ArrowDown;

        return (
            <span className={`flex items-center gap-1.5 ${colorClass}`}>
                <Icon className="h-3 w-3" />
                <span>{Math.abs(pct).toFixed(1)}%</span>
                <span className="opacity-60 text-[10px]">({fmtEUR(Math.abs(eur))})</span>
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-4 mb-6">

            {/* SECCIÓN A: HASTA HOY */}
            <div className="rounded-[32px] border border-zinc-200/60 bg-zinc-50/50 p-2">
                {/* Section Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest text-[10px]">Hasta hoy</h2>
                        <p className="text-xs text-zinc-500">Acumulado desde 01/01 hasta hoy</p>
                    </div>
                    {/* Micro-frase */}
                    <div className="hidden md:block text-[10px] text-zinc-400 bg-white/50 px-3 py-1.5 rounded-full border border-zinc-100 uppercase tracking-widest font-bold">
                        Vas <span className={kpis.deltaPctYTD > 0 ? "text-amber-600" : "text-emerald-600"}>
                            {kpis.deltaPctYTD > 0 ? "▲" : "▼"}{Math.abs(kpis.deltaPctYTD).toFixed(1)}%
                        </span> vs LY y has capturado <span className="text-violet-700">{fmtEUR(kpis.savingsYTD)}</span> con {kpis.actionsCompletedYTD} acciones cerradas.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* A1: Corte */}
                    <KPICard
                        label="Corte"
                        value={fmtDate(kpis.asOfDate)}
                        tooltip="Fecha de referencia del cálculo (según filtros)."
                    />
                    {/* NEW: Coste Hoy */}
                    <KPICard
                        label="Coste Hoy"
                        value={fmtEUR(kpis.costToday)}
                        tooltip="Coste estimado del absentismo activo durante el día de hoy."
                        highlight
                    />
                    {/* A2: Coste YTD */}
                    <KPICard
                        label="Coste YTD"
                        value={fmtEUR(kpis.costYTD)}
                        tooltip="Coste Empresa del absentismo desde 01/01 hasta hoy. Incluye sustituciones/coberturas. No incluye Mutua/SS."
                    />
                    {/* A3: Sobrecoste / Vs LY */}
                    <KPICard
                        label={kpis.deltaEurYTD > 0 ? "Sobrecoste YTD (vs LY)" : "Ahorro vs LY"}
                        value={<DeltaDisplay pct={kpis.deltaPctYTD} eur={kpis.deltaEurYTD} />}
                        tooltip="Diferencia de coste real acumulado vs mismo periodo año anterior."
                        trend={kpis.deltaEurYTD > 0 ? "up" : "down"}
                        trendColor={kpis.deltaEurYTD > 0 ? "bad" : "good"}
                    />
                    {/* A4: YTD Sin Plan (Counterfactual) */}
                    <KPICard
                        label="YTD Sin Plan (Estimado)"
                        value={fmtEUR(kpis.costYTD_NoActions)}
                        tooltip="Coste que hubiéramos tenido sin las intervenciones realizadas (Modelo inercial)."
                    />
                    {/* A6: Ahorro YTD */}
                    <KPICard
                        label={kpis.savingsYTD >= 0 ? "Ahorro YTD" : "Sobrecoste YTD"}
                        value={
                            <span className={kpis.savingsYTD >= 0 ? "text-emerald-600" : "text-amber-600"}>
                                {fmtEUR(Math.abs(kpis.savingsYTD))}
                            </span>
                        }
                        tooltip="Ahorro atribuible a acciones cerradas: (sin plan) – (real)."
                        highlight
                    />
                </div>
            </div>

            {/* SECCIÓN B: PREDICCIÓN */}
            <div className="rounded-[32px] border border-zinc-200/60 bg-zinc-50/50 p-2">
                {/* Section Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest text-[10px]">Predicción</h2>
                        <p className="text-xs text-zinc-500">Estimación desde mañana hasta 31/12</p>
                    </div>
                    {/* Micro-frase */}
                    <div className="hidden md:block text-xs text-zinc-500 bg-white/50 px-3 py-1.5 rounded-full border border-zinc-100">
                        Si no haces nada: <span className="font-medium">{fmtEUR(kpis.costRestYear_NoActions)}</span>.
                        Con plan: <span className="font-medium text-violet-700">{fmtEUR(kpis.costRestYear_WithRecommended)}</span> (ahorro {fmtEUR(kpis.savingsRestYear)}).
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* B1: Resto año sin plan */}
                    <KPICard
                        label="Resto año sin plan"
                        value={fmtEUR(kpis.costRestYear_NoActions)}
                        tooltip="Proyección de Coste Empresa (incl. sustituciones) desde mañana hasta fin de año si no hacemos nada."
                    />
                    {/* B2: Vs LY (resto) */}
                    <KPICard
                        label="Vs LY (resto)"
                        value={<DeltaDisplay pct={kpis.deltaPctRestYear} eur={kpis.deltaEurRestYear} />}
                        tooltip="Comparación vs el mismo tramo del año anterior para controlar estacionalidad."
                        trend={kpis.deltaEurRestYear > 0 ? "up" : "down"}
                        trendColor={kpis.deltaEurRestYear > 0 ? "bad" : "good"}
                    />
                    {/* B3: Resto año con plan */}
                    <KPICard
                        label="Resto año con plan"
                        value={fmtEUR(kpis.costRestYear_WithRecommended)}
                        tooltip="Proyección aplicando recomendaciones seleccionadas (impacto esperado modelado)."
                        highlight
                    />
                    {/* B4: Ahorro previsto */}
                    <KPICard
                        label={kpis.savingsRestYear >= 0 ? "Ahorro previsto" : "Riesgo sobrecoste"}
                        value={
                            <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'pred' })); }} className="hover:underline decoration-emerald-500/30">
                                <span className={kpis.savingsRestYear >= 0 ? "text-emerald-600" : "text-amber-600"}>
                                    {fmtEUR(Math.abs(kpis.savingsRestYear))}
                                </span>
                            </a>
                        }
                        tooltip="Ahorro potencial del plan: (sin plan) – (con plan)."
                        highlight
                    />
                </div>
            </div>

        </div>
    );
}
