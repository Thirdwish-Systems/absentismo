import React, { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceDot
} from "recharts";
import {
    Info,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Zap,
    Activity,
    Euro,
    Users,
    MapPin,
    Clock,
    ArrowRight
} from "lucide-react";
import DisruptionExplanation from "../shared/Disruption/DisruptionExplanation";

// Mock Data for "Tormenta Operativa" Timeline
const timelineData = [
    { day: "Hoy", risk: 20, odi: 15, event: "Situación Normal" },
    { day: "+7d", risk: 25, odi: 18, event: "" },
    { day: "+14d", risk: 35, odi: 22, event: "⚠️ Inicio Riesgo" },
    { day: "+21d", risk: 45, odi: 35, event: "" },
    { day: "+30d", risk: 68, odi: 55, event: "🔥 ALERTA MÁXIMA" }, // Critical Point
    { day: "+45d", risk: 55, odi: 48, event: "" },
    { day: "+60d", risk: 40, odi: 30, event: "Vuelta a la calma" },
    { day: "+90d", risk: 30, odi: 25, event: "" },
];

const vulnerabilityData = [
    { name: "Madrid · Centro", risk: "high", odi: 85, impacted: 12 },
    { name: "Barcelona · Logística", risk: "med", odi: 62, impacted: 8 },
    { name: "Sevilla · Ventas", risk: "low", odi: 40, impacted: 3 },
];

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

const Badge = ({ risk }: { risk: string }) => {
    const styles = risk === "high" || risk === "Crítico"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : risk === "med" || risk === "Alto"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200";

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles} uppercase tracking-wide`}>
            {risk === "high" ? "Crítico" : risk === "med" ? "Alto" : "Bajo"}
        </span>
    );
};

export default function PredictionDisruptionBlock() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Header Section */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        <Zap className="h-6 w-6 text-amber-500 fill-amber-100" />
                        Riesgo de Disrupción Operativa
                    </h2>
                    <p className="text-zinc-500 mt-1 max-w-2xl text-sm">
                        Esta pantalla le ayuda a <span className="font-bold text-zinc-700">anticiparse</span>.
                        Le mostramos dónde y cuándo es probable que su operación sufra por falta de personal clave.
                    </p>
                </div>
            </div>

            <DisruptionExplanation />

            {/* Main KPI Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CARD 1: BRADFORD PREDICTIVO */}
                <Card className="relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <span className="font-bold text-lg">B</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 leading-tight">Bradford Predictivo</h3>
                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Tendencia Histórica</p>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-bold text-zinc-900">485</span>
                        <span className="text-xs font-medium text-rose-600 flex items-center bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Empeorando (+12%)
                        </span>
                    </div>

                    <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                        <p className="text-xs text-zinc-600 leading-relaxed">
                            <span className="font-bold text-zinc-900">Interpretación:</span><br />
                            Las bajas son cada vez <span className="font-semibold text-rose-600">más cortas y frecuentes</span>.
                            Esto indica un posible desgaste ("burnout") o falta de compromiso en ciertos equipos.
                        </p>
                    </div>
                </Card>

                {/* CARD 2: ODI PREDICTIVO (HERO) */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-violet-50 via-white to-white border-violet-100">
                    <div className="flex flex-col md:flex-row gap-8 h-full">

                        {/* Left Side: Metrics */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 leading-tight">ODI Predictivo</h3>
                                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Impacto Real en Negocio</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Impacto Financiero</p>
                                    <div className="text-3xl font-black text-violet-900 tracking-tight flex items-baseline gap-1">
                                        42.5k <span className="text-lg font-normal text-zinc-400">€</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Estimado para los próximos 90 días</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Nivel de Riesgo</p>
                                    <div className="text-3xl font-black text-rose-500 tracking-tight flex items-baseline gap-1">
                                        ALTO
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Requiere intervención inmediata</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Focos Rojos (Centros Afectados)</p>
                                <ul className="space-y-2">
                                    {vulnerabilityData.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-sm bg-white/80 p-2 rounded-lg border border-purple-100/50">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-violet-400" />
                                                <span className="font-medium text-zinc-700">{item.name}</span>
                                            </div>
                                            <Badge risk={item.risk} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right Side: Narrative */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                                <h4 className="font-bold text-zinc-900 text-sm mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-violet-500" />
                                    Análisis de la IA
                                </h4>
                                <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                                    "Si no hacemos nada, preveemos una <span className="font-bold text-rose-600">rotura de stock de personal</span> crítica en <span className="font-bold text-zinc-900">Madrid</span> dentro de 30 días."
                                </p>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    La combinación de bajas en roles críticos (Team Leads) y la fatiga acumulada del equipo está creando un "cuello de botella".
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* TIMELINE: Tormenta Operativa */}
            <Card className="min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 text-lg">Predicción: "La Tormenta Operativa"</h3>
                            <p className="text-xs text-zinc-500">¿Cuándo será el peor momento? (Próximos 90 días)</p>
                        </div>
                    </div>
                </div>

                {/* Narrative Banner above Chart */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-rose-800">Alerta de Calendario: Finales de Mes</p>
                        <p className="text-xs text-rose-700 mt-1">
                            El modelo predice un pico de ausencias en 30 días que superará su capacidad de sustitución habitual.
                            Prepare refuerzos para la semana del 20-25.
                        </p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorOdi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid #e4e4e7',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#3f3f46' }}
                            />

                            <Area
                                type="monotone"
                                dataKey="odi"
                                stroke="#f43f5e"
                                fillOpacity={1}
                                fill="url(#colorOdi)"
                                strokeWidth={3}
                                name="Nivel de Riesgo"
                            />

                            {timelineData.map((entry, index) => (
                                entry.event && (
                                    <ReferenceLine
                                        key={index}
                                        x={entry.day}
                                        stroke="#71717a"
                                        strokeDasharray="3 3"
                                        label={{
                                            position: 'top',
                                            value: entry.event,
                                            fill: '#71717a',
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}
                                    />
                                )
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Footer / Context */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
                    <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-emerald-800">Nota sobre Ética y Privacidad</h4>
                    <p className="text-xs text-emerald-700/80 mt-1 max-w-4xl leading-relaxed">
                        Este sistema monitoriza patrones numéricos anónimos para proteger la operación.
                        No toma decisiones sobre personas individuales ni incluye bajas por enfermedad grave o maternidad.
                        El objetivo es ayudar a los equipos sobrecargados, no sancionar.
                    </p>
                </div>
            </div>

        </div>
    );
}
