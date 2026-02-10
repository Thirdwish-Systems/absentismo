import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';
import { ChevronDown, Info } from 'lucide-react';

// --- TYPES ---

type ViewMode = 'monthly' | 'ytd' | 'rolling';

interface ChartData {
    month: string;
    absenteeismRate: number; // % Tasa Absentismo
    incidenceRate: number;   // % Tasa Incidencia
    daysLost: number;        // Working days lost (absolute)
}

// --- MOCK DATA ---
// Generamos 3 sets de datos para simular los filtros

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const DATA_MONTHLY: ChartData[] = MONTHS.map((m, i) => ({
    month: m,
    absenteeismRate: 5 + Math.random() * 2 - (i * 0.1), // Tendencia ligera a la baja
    incidenceRate: 3 + Math.random() * 1.5,
    daysLost: Math.round(400 + Math.random() * 200),
}));

const DATA_YTD: ChartData[] = MONTHS.map((m, i) => {
    // Acumulado simulado (promedio ponderado para tasas, suma para dias)
    return {
        month: m,
        absenteeismRate: 5.5 - (i * 0.05),
        incidenceRate: 3.2,
        daysLost: (i + 1) * 450
    };
});

const DATA_ROLLING: ChartData[] = MONTHS.map((m, i) => ({
    month: m, // Sería "Feb 25", "Mar 25"... simplificado aquí
    absenteeismRate: 5.8 - (i * 0.15), // Baja más clara
    incidenceRate: 3.5 - (i * 0.05),
    daysLost: 5000 - (i * 50)
}));


// --- COMPONENT ---

export default function AbsenteeismEvolutionChart() {
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');

    const data = viewMode === 'monthly' ? DATA_MONTHLY
        : viewMode === 'ytd' ? DATA_YTD
            : DATA_ROLLING;

    // Helpers de estilo
    const activeClass = "bg-violet-600 text-white shadow-sm border-transparent";
    const inactiveClass = "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50";

    return (
        <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        Evolución del Absentismo
                        <Info className="h-4 w-4 text-zinc-400 cursor-help" />
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Tendencia de <span className="font-semibold text-violet-600">tasa de absentismo</span> y <span className="font-semibold text-emerald-500">tasa de incidencia</span> a lo largo del tiempo.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-zinc-100/50 p-1 rounded-2xl">
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${viewMode === 'monthly' ? activeClass : inactiveClass}`}
                    >
                        Mes a mes
                    </button>
                    <button
                        onClick={() => setViewMode('ytd')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${viewMode === 'ytd' ? activeClass : inactiveClass}`}
                    >
                        Acumulado (YTD)
                    </button>
                    <button
                        onClick={() => setViewMode('rolling')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${viewMode === 'rolling' ? activeClass : inactiveClass}`}
                    >
                        Rolling 12M
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAbs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }}
                        />

                        {/* Area de Absentismo (Principal) */}
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="absenteeismRate"
                            name="Tasa Absentismo"
                            stroke="#7c3aed"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAbs)"
                        />

                        {/* Linea de Incidencia (Secundaria) */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="incidenceRate"
                            name="Tasa Incidencia"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ stroke: '#10b981', strokeWidth: 2, fill: 'white', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-600" />
                    <span>Tasa Absentismo (Working days lost / Total)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Tasa Incidencia (Casos / Plantilla)</span>
                </div>
            </div>
        </div>
    );
}
