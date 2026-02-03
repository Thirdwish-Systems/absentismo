import React, { useMemo, useState } from 'react';
import { useCompanyData } from './Module2Container';
import { TrendingDown, TrendingUp, ShieldCheck, Zap, ArrowRight, BarChart3, Calendar, Brain, Download, FileText, CheckCircle2 } from 'lucide-react';

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "violet" | "amber" | "red" | "green" }) {
    const cls =
        tone === "violet" ? "bg-violet-50 text-violet-700 border-violet-200" :
            tone === "amber" ? "bg-amber-50 text-amber-800 border-amber-200" :
                tone === "red" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    tone === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-zinc-50 text-zinc-700 border-zinc-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
            {children}
        </span>
    );
}

const money = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number.isFinite(n) ? n : 0);

export default function EconomicPredictions() {
    const { company } = useCompanyData();

    const [selectedMonths, setSelectedMonths] = useState(12);

    // Mock constants for transparency
    const THEORETICAL_BASELINE = 0.085; // 8.5% absentismo sin acciones
    const REAL_CURRENT = 0.062;        // 6.2% absentismo actual

    // Mock predictions based on company size and selected horizon
    const stats = useMemo(() => {
        const monthlySalaryTotal = company.employees * (company.salary / 12);
        const baseMonthlyCostNoAction = monthlySalaryTotal * THEORETICAL_BASELINE * 1.35; // +35% costes asociados
        const baseMonthlyCostReal = monthlySalaryTotal * REAL_CURRENT * 1.35;

        const horizonCostNoAction = baseMonthlyCostNoAction * selectedMonths;
        const horizonCostReal = baseMonthlyCostReal * selectedMonths;

        // Savings dynamic: more months = more efficiency potential
        const savingsRate = 0.15 + (Math.min(selectedMonths, 12) / 12) * 0.10;
        const savingsPotential = horizonCostNoAction * savingsRate;

        return {
            horizonCostNoAction,
            horizonCostReal,
            savingsPotential,
            savingsRate,
            theoreticalRate: THEORETICAL_BASELINE,
            realRate: REAL_CURRENT,
            scenarios: [
                { months: 3, costNoAction: baseMonthlyCostNoAction * 3, costWithPlan: (baseMonthlyCostNoAction * 3) * 0.82, savings: (baseMonthlyCostNoAction * 3) * 0.18 },
                { months: 6, costNoAction: baseMonthlyCostNoAction * 6, costWithPlan: (baseMonthlyCostNoAction * 6) * 0.78, savings: (baseMonthlyCostNoAction * 6) * 0.22 },
                { months: 12, costNoAction: baseMonthlyCostNoAction * 12, costWithPlan: (baseMonthlyCostNoAction * 12) * 0.75, savings: (baseMonthlyCostNoAction * 12) * 0.25 },
            ]
        };
    }, [company.employees, company.salary, selectedMonths]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm text-violet-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">Predicciones Económicas</h2>
                            <p className="text-xs text-zinc-500 font-medium">Proyección de impacto y ahorro basado en IA operativa</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                        <Calendar className="ml-2 h-4 w-4 text-zinc-400" />
                        <div className="flex gap-1">
                            {[3, 6, 12, 24].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMonths(m)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedMonths === m
                                        ? 'bg-white text-violet-600 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    {m} meses
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main ROI Card */}
                <div className="rounded-[32px] border border-zinc-100 bg-white p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <BarChart3 size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="text-[11px] font-bold text-violet-500 uppercase tracking-[0.2em] mb-2">Potencial de Ahorro ({selectedMonths} meses)</div>
                        <div className="text-5xl font-bold text-zinc-900 tracking-tighter mb-4">
                            {money(stats.savingsPotential)}
                        </div>
                        <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
                            Ahorro estimado acumulado en {selectedMonths} meses ({(stats.savingsRate * 100).toFixed(0)}% de reducción media) implementando el plan recomendado.
                        </p>
                    </div>
                </div>

                {/* Comparative Detail: Theoretical vs Real */}
                <div className="rounded-[32px] border border-zinc-100 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 mb-1">Análisis Comparativo (Cierre Año)</h3>
                            <p className="text-[11px] text-zinc-500">Transparencia en el cálculo de impacto sobre P&L</p>
                        </div>
                        <Badge tone="violet">Auditado por IA</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Theoretical Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-1 bg-zinc-200 rounded-full" />
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Escenario Teórico (Sin Acción)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Absentismo</div>
                                    <div className="text-2xl font-bold text-zinc-400">{(stats.theoreticalRate * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Coste Proyectado</div>
                                    <div className="text-2xl font-bold text-zinc-400">{money(stats.horizonCostNoAction)}</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                * Basado en la tendencia histórica del sector y el coeficiente de estacionalidad sin intervenciones preventivas.
                            </p>
                        </div>

                        {/* Real/Optimized Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Escenario Optimizado (Acción)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Absentismo Target</div>
                                    <div className="text-2xl font-bold text-emerald-600">{(stats.realRate * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Coste Realizado</div>
                                    <div className="text-2xl font-bold text-zinc-900">{money(stats.horizonCostReal)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span className="text-[11px] font-bold text-emerald-700">Ahorro diferencial capturado: {money(stats.horizonCostNoAction - stats.horizonCostReal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scenarios Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.scenarios.map((s, i) => (
                        <div key={i} className="rounded-[32px] border border-zinc-100 bg-zinc-50/50 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{s.months} meses</span>
                                    <div className="h-8 w-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Sin Intervención</div>
                                        <div className="text-xl font-bold text-zinc-400 line-through decoration-zinc-300 decoration-2">{money(s.costNoAction)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Con Plan de Choque</div>
                                        <div className="text-2xl font-bold text-zinc-900">{money(s.costWithPlan)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ahorro Neto</span>
                                <span className="text-lg font-bold text-emerald-600">+{money(s.savings)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Card */}
                <div className="rounded-[32px] border border-violet-100 bg-violet-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Activa el Plan de Choque</h3>
                        <p className="text-violet-100 text-sm max-w-md opacity-90">
                            Nuestra IA ha identificado 14 acciones prioritarias en 5 centros que reducirían el coste inmediato en un 15% este trimestre.
                        </p>
                    </div>
                    <button className="whitespace-nowrap px-8 py-4 bg-white text-violet-600 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
                        Ver Plan Recomendado <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Simulated Copilot Side Panel */}
            <div className="hidden lg:block sticky top-6 h-[calc(100vh-140px)]">
                <div className="flex h-full flex-col rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-3 p-5 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-zinc-900">Copiloto IA</div>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mesa de Análisis</div>
                            </div>
                        </div>
                        <Badge tone="violet">Activo</Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* HR Request */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">RR</div>
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Director RRHH</span>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 text-sm text-zinc-700 leading-relaxed shadow-sm">
                                Quiero enviar un informe al consejo. Quiero que me descargues un informe con los datos de reducción de absentismo y su ahorro asociado en los últimos seis meses. Además quiero que me incluyas todas las acciones realizadas, lo que nos ha costado cada una y el retorno que ha tenido.
                                <br /><br />
                                <b>Quiero que me lo generes en formato PPT para que pueda editarlo.</b>
                            </div>
                        </div>

                        {/* IA Response */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 animate-pulse">IA</div>
                                <span className="text-[11px] font-bold text-violet-500 uppercase tracking-widest">Copiloto IA</span>
                            </div>
                            <div className="bg-violet-600 p-4 rounded-3xl text-sm text-white leading-relaxed shadow-xl shadow-violet-100 inline-block">
                                ¡Por supuesto! He consolidado los datos del último semestre:
                                <ul className="mt-2 space-y-1 opacity-90">
                                    <li>• Reducción neta: 2.3 puntos</li>
                                    <li>• Ahorro capturado: {money(stats.savingsPotential * 0.5)}</li>
                                    <li>• Acciones auditadas: 8 ejecutadas</li>
                                </ul>
                                <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-white/70 uppercase">PowerPoint Editable</div>
                                            <div className="text-xs font-bold text-white">Informe_Consejo_Q3_Q4.pptx</div>
                                        </div>
                                    </div>
                                    <button className="h-8 w-8 bg-white text-violet-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pídeme un análisis detallado..."
                                className="w-full h-12 pl-4 pr-12 bg-white border border-zinc-200 rounded-2xl text-sm shadow-inner outline-none focus:border-violet-300 transition-colors"
                            />
                            <div className="absolute right-2 top-2 h-8 w-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Zap className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-[10px] text-zinc-400 text-center font-medium">Ejecución inmediata de reportes complejos vía NLP</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
