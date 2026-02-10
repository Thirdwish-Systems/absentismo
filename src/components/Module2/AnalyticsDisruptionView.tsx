import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    BarChart,
    Bar,
    Legend,
    Cell
} from "recharts";
import {
    AlertTriangle,
    Info,
    Map,
    TrendingUp,
    ShieldCheck,
    Banknote,
    LayoutGrid,
    ArrowRight
} from "lucide-react";
import DisruptionExplanation from "../shared/Disruption/DisruptionExplanation";

// Mock Data for Continuity Graph (Past -> Future)
const continuityData = [
    { month: "Ene", type: "past", bradford: 200, odi: 15 },
    { month: "Feb", type: "past", bradford: 220, odi: 18 },
    { month: "Mar", type: "past", bradford: 210, odi: 20 },
    { month: "Abr", type: "past", bradford: 250, odi: 28 },
    { month: "May", type: "past", bradford: 280, odi: 35 },
    { month: "Jun", type: "present", bradford: 310, odi: 45 }, // TODAY
    { month: "Jul", type: "future", bradford: 350, odi: 55 },
    { month: "Ago", type: "future", bradford: 380, odi: 62 },
    { month: "Sep", type: "future", bradford: 420, odi: 70 },
];

// Mock Data for Heatmap (Centers)
const heatmapData = [
    { id: 1, name: "Barcelona Logística", odi: 85, employees: 140, risk: "high", msg: "Situación Crítica" },
    { id: 2, name: "Madrid Oficinas", odi: 25, employees: 60, risk: "low", msg: "Operativa Normal" },
    { id: 3, name: "Cádiz Fábrica", odi: 65, employees: 80, risk: "med", msg: "Vigilancia" },
    { id: 4, name: "Valencia Hub", odi: 45, employees: 30, risk: "low", msg: "Estable" },
    { id: 5, name: "Bilbao Norte", odi: 78, employees: 25, risk: "high", msg: "Riesgo Alto" },
    { id: 6, name: "Sevilla Sur", odi: 30, employees: 42, risk: "low", msg: "Estable" },
];

const costRiskData = [
    { name: "Sin hacer nada", value: 125000, fill: "#f43f5e", label: "Pérdida Estimada" },
    { name: "Usando esta herramienta", value: 85000, fill: "#10b981", label: "Coste Reducido" },
];

const Card = ({ children, className = "", title, icon: Icon }: any) => (
    <div className={`bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-6 ${className}`}>
        {(title) && (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500"><Icon className="h-4 w-4" /></div>}
                    <div>
                        <h3 className="font-bold text-zinc-900">{title}</h3>
                    </div>
                </div>
            </div>
        )}
        {children}
    </div>
);

export default function AnalyticsDisruptionView() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-indigo-500" />
                    Analítica de Disrupción (Visión Completa)
                </h2>
                <p className="text-zinc-500 mt-1 max-w-2xl text-sm">
                    Vea cómo ha evolucionado el problema y hacia dónde va. Datos combinados de historial y predicción.
                </p>
            </div>

            <DisruptionExplanation />

            {/* CONTINUITY GRAPH */}
            <Card title="Tendencia: ¿Estamos mejorando o empeorando?" icon={TrendingUp}>

                {/* Simple Narrative */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-6 flex gap-3 items-start">
                    <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm">Lectura del Gráfico</h4>
                        <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                            La línea sólida muestra lo que ya pasó. La línea punteada es lo que pasará si no intervenimos.
                            <br />Observamos una <strong>tendencia al alza</strong> preocupante a partir de Junio.
                        </p>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={continuityData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7' }}
                                labelStyle={{ color: '#71717a', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <ReferenceLine x="Jun" stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'top', value: 'ESTAMOS AQUÍ', fill: '#6366f1', fontSize: 10, fontWeight: 700 }} />

                            <Line
                                type="monotone"
                                dataKey="bradford"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Pasado (Datos Reales)"
                            />
                            <Line
                                type="monotone"
                                dataKey="odi"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ r: 4 }}
                                name="Futuro (Predicción Riesgo)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* BOTTOM SECTION: HEATMAP & COST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* HEATMAP - Simplified labels */}
                <Card title="Mapa de Calor: ¿Dónde están los problemas?" icon={Map}>
                    <p className="text-xs text-zinc-500 mb-4">
                        Identifique rápidamente qué centros necesitan ayuda y cuáles funcionan bien.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {heatmapData.map((center) => (
                            <div
                                key={center.id}
                                className={`
                                relative p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer
                                ${center.risk === 'high'
                                        ? 'bg-rose-50 border-rose-100 ring-2 ring-rose-50'
                                        : center.risk === 'med'
                                            ? 'bg-amber-50 border-amber-100'
                                            : 'bg-emerald-50 border-emerald-100'}
                            `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-zinc-900 text-sm truncate pr-2">{center.name}</h4>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md
                                    ${center.risk === 'high' ? 'bg-rose-100 text-rose-700' : center.risk === 'med' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}
                                `}>
                                        {center.msg}
                                    </span>
                                </div>

                                {/* Simple Visual Bar */}
                                <div className="mt-2 h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${center.risk === 'high' ? 'bg-rose-500' : center.risk === 'med' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${center.odi}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* COST COMPARISON - Simplified */}
                <Card title="Impacto en Dinero" icon={Banknote}>
                    <p className="text-xs text-zinc-500 mb-6">
                        Comparativa de costes estimados si se mantiene la tendencia actual vs. si se aplican las correcciones sugeridas.
                    </p>

                    <div className="flex flex-col gap-6">
                        {/* Scenario A: Bad */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-zinc-600">Escenario A: Sin intervención</span>
                                <span className="font-bold text-zinc-900">125.000 €</span>
                            </div>
                            <div className="h-8 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-rose-500 w-[100%] flex items-center px-3 text-[10px] font-bold text-white uppercase tracking-wider">
                                    Pérdida Total
                                </div>
                            </div>
                        </div>

                        {/* Scenario B: Good */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-zinc-600">Escenario B: Actuando con IA</span>
                                <span className="font-bold text-emerald-600">85.000 €</span>
                            </div>
                            <div className="h-8 w-full bg-zinc-100 rounded-full overflow-hidden flex relative">
                                {/* The Cost Part */}
                                <div className="h-full bg-zinc-300 w-[68%] flex items-center px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider z-10">
                                    Coste Reducido
                                </div>
                                {/* The Savings Part */}
                                <div className="absolute right-0 h-full bg-emerald-500 w-[32%] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
                                    Ahorro
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-800 font-bold uppercase tracking-wide">Ahorro Potencial</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">40.000 €</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                            <ShieldCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}
