import React, { useMemo, useState } from "react";
import { useCompanyData } from "./Module2Container";
import { Brain, Sparkles, TrendingDown, TrendingUp, Calendar, AlertTriangle, BarChart3 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const eur = (n: number) =>
    Math.round(Number.isFinite(n) ? n : 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// ─────────────────────────────────────────────────────────────────────────────
// Demo Data Generator
// ─────────────────────────────────────────────────────────────────────────────

function generateHistoricalData(baseRate: number, employees: number, salary: number) {
    const data: Array<{
        month: string;
        year: number;
        rate: number;
        benchmark: number;
        cost: number;
        employees: number;
        yoy: number;
    }> = [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generar 24 meses de datos (2 años)
    for (let i = 23; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 120) % 12;
        const yearOffset = Math.floor((currentMonth - i + 120) / 12) - 10;
        const year = currentYear + yearOffset;

        // Estacionalidad: más alto en invierno
        const seasonality = [0.12, 0.10, 0.08, 0.05, 0.02, 0.00, -0.02, 0.00, 0.03, 0.05, 0.08, 0.10][monthIndex];

        // Variación aleatoria pero consistente
        const noise = Math.sin(i * 0.5) * 0.01 + Math.cos(i * 0.3) * 0.008;

        // Tendencia: ligera mejora en el segundo año
        const trend = i > 12 ? 0.005 : 0;

        const rate = Math.max(0.02, Math.min(0.15, baseRate * (1 + seasonality + noise + trend)));
        const benchmark = 0.065 + Math.sin(i * 0.4) * 0.005;
        const cost = employees * salary * rate / 12 * 1.35;

        // YoY (comparar con mismo mes año anterior)
        const prevYearIndex = i + 12;
        const prevRate = prevYearIndex < 24
            ? baseRate * (1 + [0.12, 0.10, 0.08, 0.05, 0.02, 0.00, -0.02, 0.00, 0.03, 0.05, 0.08, 0.10][monthIndex] + Math.sin(prevYearIndex * 0.5) * 0.01 + 0.005)
            : rate;
        const yoy = (rate - prevRate) / prevRate;

        data.push({
            month: MONTHS[monthIndex],
            year,
            rate,
            benchmark,
            cost,
            employees: Math.round(employees * (0.95 + Math.random() * 0.1)),
            yoy,
        });
    }

    return data;
}

function identifyAlerts(data: ReturnType<typeof generateHistoricalData>) {
    const alerts: Array<{ month: string; year: number; type: "spike" | "trend"; message: string }> = [];

    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];

        // Pico súbito
        if (curr.rate > prev.rate * 1.15) {
            alerts.push({
                month: curr.month,
                year: curr.year,
                type: "spike",
                message: `Pico de +${((curr.rate - prev.rate) / prev.rate * 100).toFixed(0)}% vs mes anterior`,
            });
        }

        // Tendencia sostenida
        if (i >= 3) {
            const trend3m = (data[i].rate - data[i - 3].rate) / data[i - 3].rate;
            if (trend3m > 0.1) {
                alerts.push({
                    month: curr.month,
                    year: curr.year,
                    type: "trend",
                    message: `Tendencia alcista sostenida (3m): +${(trend3m * 100).toFixed(0)}%`,
                });
            }
        }
    }

    return alerts.slice(-5); // Últimas 5 alertas
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ children, t = "neutral" }: { children: React.ReactNode; t?: "neutral" | "good" | "bad" | "violet" | "amber" }) {
    const cls =
        t === "violet"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : t === "good"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : t === "bad"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : t === "amber"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
            {children}
        </span>
    );
}

function Card({ title, right, children }: { title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="text-sm font-semibold text-zinc-900">{title}</div>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
            <div className="h-px w-full bg-zinc-100" />
            <div className="p-5">{children}</div>
        </div>
    );
}

function MiniBar({ value, max, color = "violet" }: { value: number; max: number; color?: "violet" | "emerald" | "rose" }) {
    const w = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
    const colorCls = color === "emerald" ? "bg-emerald-500" : color === "rose" ? "bg-rose-500" : "bg-violet-500";
    return (
        <div className="h-2 w-full rounded-full bg-zinc-100">
            <div className={`h-2 rounded-full ${colorCls}`} style={{ width: `${Math.round(w * 100)}%` }} />
        </div>
    );
}

function SimpleLineChart({ data, height = 200 }: { data: Array<{ label: string; value: number; benchmark?: number }>; height?: number }) {
    const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.benchmark || 0)), 0.01) * 1.1;
    const minVal = Math.min(...data.map((d) => Math.min(d.value, d.benchmark || d.value)), 0) * 0.9;
    const range = maxVal - minVal || 0.01;

    const getY = (val: number) => height - 50 - ((val - minVal) / range) * (height - 70);
    const step = (data.length > 1) ? 100 / (data.length - 1) : 100;

    const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * step}% ${getY(d.value)}`).join(" ");
    const benchPath = data.some((d) => d.benchmark !== undefined)
        ? data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * step}% ${getY(d.benchmark || 0)}`).join(" ")
        : null;

    // Calcular promedios para la leyenda
    const avgCompany = data.reduce((s, d) => s + d.value, 0) / data.length;
    const avgBenchmark = data.reduce((s, d) => s + (d.benchmark || 0), 0) / data.length;

    return (
        <div className="relative" style={{ height }}>
            {/* Leyenda con valores promedio */}
            <div className="absolute top-0 right-0 flex gap-4 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200">
                    <div className="h-3 w-3 rounded-full bg-violet-500" />
                    <span className="text-violet-700 font-medium">Tu empresa: {(avgCompany * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-amber-700 font-medium">Sector: {(avgBenchmark * 100).toFixed(1)}%</span>
                </div>
            </div>

            <svg className="w-full h-full pt-10" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="companyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Área rellena benchmark */}
                {benchPath && (
                    <path
                        d={`${benchPath} L 100% ${height - 50} L 0% ${height - 50} Z`}
                        fill="url(#benchGradient)"
                    />
                )}

                {/* Línea benchmark - MÁS VISIBLE */}
                {benchPath && (
                    <path
                        d={benchPath}
                        fill="none"
                        stroke="rgb(245, 158, 11)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Puntos benchmark */}
                {data.map((d, i) => (
                    d.benchmark !== undefined && (
                        <circle
                            key={`bench-${i}`}
                            cx={`${i * step}%`}
                            cy={getY(d.benchmark)}
                            r="4"
                            fill="rgb(245, 158, 11)"
                            stroke="white"
                            strokeWidth="2"
                        />
                    )
                ))}

                {/* Área rellena empresa */}
                <path
                    d={`${linePath} L 100% ${height - 50} L 0% ${height - 50} Z`}
                    fill="url(#companyGradient)"
                />

                {/* Línea principal empresa */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Puntos empresa */}
                {data.map((d, i) => (
                    <circle
                        key={`company-${i}`}
                        cx={`${i * step}%`}
                        cy={getY(d.value)}
                        r="5"
                        fill="rgb(139, 92, 246)"
                        stroke="white"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Labels eje X */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-zinc-500 font-medium">
                {data.filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1).map((d, idx) => (
                    <span key={idx}>{d.label}</span>
                ))}
            </div>
        </div>
    );
}

function CopilotPanel({ insights }: { insights: string[] }) {
    return (
        <div className="flex h-full flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-900">Copiloto IA</div>
                        <div className="text-xs text-zinc-500">Análisis histórico</div>
                    </div>
                </div>
                <Badge t="violet">Beta</Badge>
            </div>
            <div className="h-px w-full bg-zinc-100" />
            <div className="flex-1 space-y-3 overflow-auto p-4">
                <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                        <Sparkles className="h-4 w-4 text-violet-700" /> Insights detectados
                    </div>
                    <div className="mt-3 space-y-2">
                        {insights.map((insight, i) => (
                            <div key={i} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="font-semibold">Utilidad para RRHH</div>
                    <div className="mt-2 text-zinc-700">
                        Identifica patrones estacionales y correlaciones con eventos (vacaciones, campañas, picos de producción) para anticipar necesidades de cobertura.
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Historico() {
    const { company, absence } = useCompanyData();
    const [view, setView] = useState<"Mes" | "Trimestre" | "Año" | "Personalizado">("Mes");

    // Calcular tasa base de la empresa
    const baseRate = useMemo(() => {
        const total = (absence.AT || 0) + (absence.IT_CORTA || 0) + (absence.IT_MEDIA || 0) + (absence.IT_LARGA || 0);
        return Math.max(0.02, Math.min(0.15, total / 100));
    }, [absence]);

    // Generar datos históricos
    const historicalData = useMemo(
        () => generateHistoricalData(baseRate, company.employees, company.salary),
        [baseRate, company.employees, company.salary]
    );

    const displayData = useMemo(
        () => (view === "Mes" ? historicalData.slice(-12) : view === "Trimestre" ? historicalData.slice(-24) : historicalData),
        [historicalData, view]
    );

    const alerts = useMemo(() => identifyAlerts(historicalData), [historicalData]);

    // Estadísticas
    const stats = useMemo(() => {
        const last12 = historicalData.slice(-12);
        const prev12 = historicalData.slice(-24, -12);

        const avgRate12m = last12.reduce((s, d) => s + d.rate, 0) / 12;
        const avgRatePrev12m = prev12.length > 0 ? prev12.reduce((s, d) => s + d.rate, 0) / prev12.length : avgRate12m;
        const yoyChange = (avgRate12m - avgRatePrev12m) / avgRatePrev12m;

        const totalCost12m = last12.reduce((s, d) => s + d.cost, 0);
        const totalCostPrev12m = prev12.reduce((s, d) => s + d.cost, 0);
        const costYoyChange = prev12.length > 0 ? (totalCost12m - totalCostPrev12m) / totalCostPrev12m : 0;

        // Mes pico y mes valle
        const maxMonth = last12.reduce((max, d) => (d.rate > max.rate ? d : max), last12[0]);
        const minMonth = last12.reduce((min, d) => (d.rate < min.rate ? d : min), last12[0]);

        // Estacionalidad
        const summerAvg = last12.filter((d) => ["Jun", "Jul", "Ago"].includes(d.month)).reduce((s, d) => s + d.rate, 0) / 3;
        const winterAvg = last12.filter((d) => ["Dic", "Ene", "Feb"].includes(d.month)).reduce((s, d) => s + d.rate, 0) / 3;

        return {
            avgRate12m,
            yoyChange,
            totalCost12m,
            costYoyChange,
            maxMonth,
            minMonth,
            summerAvg,
            winterAvg,
            seasonalDiff: winterAvg - summerAvg,
        };
    }, [historicalData]);

    // Insights para el copiloto
    const copilotInsights = useMemo(() => {
        const insights: string[] = [];

        if (stats.yoyChange > 0.05) {
            insights.push(`📈 La tasa media ha subido un ${(stats.yoyChange * 100).toFixed(0)}% respecto al año anterior.`);
        } else if (stats.yoyChange < -0.05) {
            insights.push(`📉 La tasa media ha bajado un ${(Math.abs(stats.yoyChange) * 100).toFixed(0)}% respecto al año anterior.`);
        } else {
            insights.push(`➡️ La tasa se mantiene estable respecto al año anterior.`);
        }

        if (stats.seasonalDiff > 0.01) {
            insights.push(`❄️ Patrón estacional detectado: invierno +${(stats.seasonalDiff * 100).toFixed(1)}pp vs verano.`);
        }

        insights.push(`💰 Coste acumulado 12m: ${eur(stats.totalCost12m)}.`);

        if (stats.maxMonth) {
            insights.push(`⚠️ Mes pico: ${stats.maxMonth.month} ${stats.maxMonth.year} (${pct(stats.maxMonth.rate)}).`);
        }

        return insights;
    }, [stats]);

    const chartData = useMemo(
        () =>
            displayData.map((d) => ({
                label: `${d.month} ${String(d.year).slice(-2)}`,
                value: d.rate,
                benchmark: d.benchmark,
            })),
        [displayData]
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1400px] px-4 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-zinc-900">Histórico</h2>
                                <p className="mt-1 text-xs text-zinc-500 font-medium">Evolución temporal y análisis de patrones de absentismo</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-zinc-400" />
                                <select
                                    value={view}
                                    onChange={(e) => setView(e.target.value as any)}
                                    className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="Mes">Este Mes</option>
                                    <option value="Trimestre">Este Trimestre</option>
                                    <option value="Año">Este Año</option>
                                    <option value="Personalizado">Personalizado</option>
                                </select>
                            </div>
                        </div>

                        {/* Banner Beta */}
                        <div className="rounded-[28px] border border-violet-200 bg-violet-50 p-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-violet-700" />
                                <div>
                                    <div className="text-sm font-semibold text-violet-900">Sección en desarrollo</div>
                                    <div className="text-xs text-violet-700">
                                        Esta vista usa datos simulados basados en tu configuración. En producción se conectará con datos reales.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPIs principales */}
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <BarChart3 className="h-4 w-4 text-violet-700" /> Media 12m
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{pct(stats.avgRate12m)}</div>
                                <div className="mt-1 flex items-center gap-1 text-xs">
                                    {stats.yoyChange >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-rose-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                                    )}
                                    <span className={stats.yoyChange >= 0 ? "text-rose-600" : "text-emerald-600"}>
                                        {stats.yoyChange >= 0 ? "+" : ""}{(stats.yoyChange * 100).toFixed(1)}% YoY
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <Calendar className="h-4 w-4 text-violet-700" /> Coste 12m
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{eur(stats.totalCost12m)}</div>
                                <div className="mt-1 flex items-center gap-1 text-xs">
                                    {stats.costYoyChange >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-rose-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                                    )}
                                    <span className={stats.costYoyChange >= 0 ? "text-rose-600" : "text-emerald-600"}>
                                        {stats.costYoyChange >= 0 ? "+" : ""}{(stats.costYoyChange * 100).toFixed(1)}% YoY
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <TrendingUp className="h-4 w-4 text-rose-600" /> Mes pico
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{stats.maxMonth?.month}</div>
                                <div className="mt-1 text-xs text-zinc-500">
                                    Tasa: {pct(stats.maxMonth?.rate || 0)}
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <TrendingDown className="h-4 w-4 text-emerald-600" /> Mes valle
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{stats.minMonth?.month}</div>
                                <div className="mt-1 text-xs text-zinc-500">
                                    Tasa: {pct(stats.minMonth?.rate || 0)}
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de evolución */}
                        <Card
                            title="Evolución mensual"
                            right={
                                <div className="flex gap-2">
                                    <Badge t="violet">{view}</Badge>
                                </div>
                            }
                        >
                            <SimpleLineChart data={chartData} height={280} />
                        </Card>

                        {/* Estacionalidad */}
                        <Card title="Análisis de estacionalidad" right={<Badge>Últimos 12m</Badge>}>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-medium text-zinc-600">Invierno (Dic-Feb)</div>
                                    <div className="mt-2 text-2xl font-semibold text-zinc-900">{pct(stats.winterAvg)}</div>
                                    <div className="mt-3">
                                        <MiniBar value={stats.winterAvg} max={0.15} color="rose" />
                                    </div>
                                </div>
                                <div className="rounded-[26px] border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-medium text-zinc-600">Verano (Jun-Ago)</div>
                                    <div className="mt-2 text-2xl font-semibold text-zinc-900">{pct(stats.summerAvg)}</div>
                                    <div className="mt-3">
                                        <MiniBar value={stats.summerAvg} max={0.15} color="emerald" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                                <div className="font-semibold">Diferencia estacional</div>
                                <div className="mt-1 text-zinc-700">
                                    {stats.seasonalDiff > 0.005 ? (
                                        <>El invierno presenta una tasa <b>+{(stats.seasonalDiff * 100).toFixed(1)} pp</b> superior al verano. Considera reforzar cobertura en Q1 y Q4.</>
                                    ) : stats.seasonalDiff < -0.005 ? (
                                        <>El verano presenta una tasa superior al invierno. Patrón inusual que puede indicar problemas específicos (turnos, carga).</>
                                    ) : (
                                        <>No se detecta un patrón estacional significativo. La tasa es relativamente estable a lo largo del año.</>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Alertas históricas */}
                        <Card title="Alertas históricas" right={<Badge t="amber">{alerts.length} eventos</Badge>}>
                            {alerts.length > 0 ? (
                                <div className="space-y-3">
                                    {alerts.map((alert, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-[26px] border p-4 shadow-sm ${alert.type === "spike"
                                                ? "border-rose-200 bg-rose-50"
                                                : "border-amber-200 bg-amber-50"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle
                                                    className={`h-5 w-5 ${alert.type === "spike" ? "text-rose-600" : "text-amber-600"}`}
                                                />
                                                <div>
                                                    <div className="text-sm font-semibold text-zinc-900">
                                                        {alert.month} {alert.year}
                                                    </div>
                                                    <div className="mt-1 text-sm text-zinc-700">{alert.message}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
                                    No se detectaron eventos significativos.
                                </div>
                            )}
                        </Card>

                        {/* Tabla de datos */}
                        <Card title="Detalle mensual" right={<Badge>{displayData.length} meses</Badge>}>
                            <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                                <table className="min-w-[600px] w-full text-left text-sm">
                                    <thead className="bg-zinc-50 text-xs text-zinc-600">
                                        <tr>
                                            <th className="p-3">Mes</th>
                                            <th className="p-3">Tasa</th>
                                            <th className="p-3">Benchmark</th>
                                            <th className="p-3">Brecha</th>
                                            <th className="p-3">Coste</th>
                                            <th className="p-3">YoY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.slice().reverse().slice(0, 12).map((d, i) => {
                                            const gap = d.rate - d.benchmark;
                                            return (
                                                <tr key={i} className="border-t border-zinc-200 bg-white">
                                                    <td className="p-3 font-medium text-zinc-900">{d.month} {d.year}</td>
                                                    <td className="p-3 text-zinc-700">{pct(d.rate)}</td>
                                                    <td className="p-3 text-zinc-500">{pct(d.benchmark)}</td>
                                                    <td className="p-3">
                                                        <Badge t={gap > 0.005 ? "bad" : gap < -0.005 ? "good" : "neutral"}>
                                                            {gap >= 0 ? "+" : ""}{(gap * 100).toFixed(1)}pp
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-zinc-700">{eur(d.cost)}</td>
                                                    <td className="p-3">
                                                        <span className={d.yoy >= 0 ? "text-rose-600" : "text-emerald-600"}>
                                                            {d.yoy >= 0 ? "+" : ""}{(d.yoy * 100).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="hidden lg:block">
                        <div className="sticky top-6 h-[calc(100vh-48px)]">
                            <CopilotPanel insights={copilotInsights} />
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <CopilotPanel insights={copilotInsights} />
                    </div>
                </div>
            </div>
        </div>
    );
}
