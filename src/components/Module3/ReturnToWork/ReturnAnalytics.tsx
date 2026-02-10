import React from "react";
import { BarChart3, TrendingDown, Users, CheckCircle2 } from "lucide-react";
import { KPIS } from "./mockData";

export default function ReturnAnalytics() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="text-zinc-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Analytics de Reincorporación</h2>
                        <p className="text-xs text-zinc-500 font-medium">Aprendizaje y mejora continua del proceso de retorno</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Placeholder Chart 1 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-700">Tasa de Recaídas (Últimos 6 meses)</h3>
                        <div className="h-48 w-full bg-zinc-50 rounded-2xl border border-zinc-100 flex items-end justify-between p-4 px-8 relative">
                            {/* Data for the graph */}
                            {(() => {
                                const data = [
                                    { month: 'Ago', rate: 0.40, count: 12 },
                                    { month: 'Sep', rate: 0.35, count: 10 },
                                    { month: 'Oct', rate: 0.28, count: 8 },
                                    { month: 'Nov', rate: 0.22, count: 6 },
                                    { month: 'Dic', rate: 0.15, count: 4 },
                                    { month: 'Ene', rate: 0.12, count: 3 }
                                ];
                                const maxRate = Math.max(...data.map(d => d.rate));
                                // Add some padding to the top so the highest bar doesn't touch the very top
                                const scaleMax = maxRate * 1.2;

                                return (
                                    <>
                                        {data.map((item, i) => (
                                            <div key={i} className="relative group w-8 flex flex-col justify-end h-full">
                                                <div className="w-full relative">
                                                    {/* Bar */}
                                                    <div
                                                        className="w-full bg-violet-200 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-violet-600 relative z-10"
                                                        style={{ height: `${(item.rate / scaleMax) * 100}%` }} // Scale relative to max
                                                    >
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-zinc-900 text-white text-xs rounded-lg py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                                                            <div className="font-bold text-center">{(item.rate * 100).toFixed(0)}%</div>
                                                            <div className="text-[10px] text-zinc-300 whitespace-nowrap">{item.count} recaídas</div>
                                                            {/* Arrow */}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* X Axis Label */}
                                                <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-zinc-400 font-medium pt-2">
                                                    {item.month}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Trend Line (Approximated to match the downward trend) */}
                                        <svg className="absolute inset-0 h-full w-full pointer-events-none z-0" preserveAspectRatio="none">
                                            {/* 
                                                Manually drawing a curve that roughly follows the top of the bars.
                                                Since we know the relative heights, we can estimate Y points.
                                                Height is ~200px (h-48 is 12rem = 192px). Padded p-4 is 16px.
                                                Effective drawing area height is approx 160px.
                                                Y coordinate is from top, so 100% - height.
                                            */}
                                            <path d="M 40 60 L 100 75 L 160 95 L 220 115 L 280 135 L 340 145"
                                                fill="none"
                                                stroke="#7c3aed"
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                                className="opacity-30"
                                            />
                                        </svg>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Effectiveness by Template */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-700">Efectividad por Tipo de Plan</h3>
                        <div className="space-y-3">
                            {[
                                { label: "Retorno Progresivo", score: 92 },
                                { label: "Cambio de Turno Temporal", score: 88 },
                                { label: "Limitación de Cargas", score: 76 },
                                { label: "Refuerzo / Buddy", score: 65 },
                            ].map((Item, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-xs font-medium mb-1">
                                        <span className="text-zinc-600">{Item.label}</span>
                                        <span className="text-zinc-900 font-bold">{Item.score}% éxito</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full opacity-80 group-hover:opacity-100 transition-all"
                                            style={{ width: `${Item.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights / Drivers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 rounded-[24px] border border-amber-100 p-6">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Driver Principal Recaída</div>
                    <div className="text-lg font-bold text-zinc-900 mb-1">Turno de Noche</div>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                        El 45% de las recaídas ocurren en empleados que retornan directamente al turno de noche sin adaptación previa.
                    </p>
                </div>

                <div className="bg-violet-50 rounded-[24px] border border-violet-100 p-6">
                    <div className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-2">Mejor Práctica</div>
                    <div className="text-lg font-bold text-zinc-900 mb-1">Entrevista Día 0</div>
                    <p className="text-xs text-violet-800/80 leading-relaxed">
                        Los centros que realizan la entrevista de bienvenida documentada reducen el absentismo corto en un 30%.
                    </p>
                </div>

                <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="h-12 w-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                        <TrendingDown className="text-zinc-400" />
                    </div>
                    <div className="text-sm font-bold text-zinc-900">Coste Evitado YTD</div>
                    <div className="text-2xl font-light text-emerald-600 mt-1">18.200€</div>
                    <div className="text-[10px] text-zinc-400 mt-2">Calculado sobre histórico de recaídas</div>
                </div>
            </div>
        </div>
    );
}
