import React, { useMemo, useState } from "react";
import {
    Users,
    TrendingDown,
    ShieldCheck,
    AlertTriangle,
    ArrowRight,
    Filter,
    Calendar,
    MapPin,
    ChevronDown,
    Clock,
    UserCheck,
    AlertOctagon
} from "lucide-react";
import { MOCK_CASES, KPIS, ReturnCase } from "./mockData";

export default function ReturnControlRoom({ onOpenCase }: { onOpenCase: (c: any) => void }) {
    const [returnsRange, setReturnsRange] = useState<number>(7);

    // Filter returns by selected range
    const returnsInPeriod = useMemo(() => {
        const today = new Date();
        const limitDate = new Date();
        limitDate.setDate(today.getDate() + returnsRange);

        // Sort by Date Ascending (Nearest first)
        return MOCK_CASES.filter(c => {
            const rDate = new Date(c.returnDate);
            return rDate >= new Date(today.setHours(0, 0, 0, 0)) && rDate <= limitDate;
        }).sort((a, b) => new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime());
    }, [returnsRange]);

    const fmtEUR = (n: number) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

    return (
        <div className="space-y-8 p-1">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-[24px] border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                Retornos
                                <div className="relative group">
                                    <button className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100">
                                        {returnsRange}d <ChevronDown size={10} />
                                    </button>
                                    {/* Dropdown menu */}
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl border border-zinc-100 shadow-lg p-1 z-20 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                                        {[7, 14, 30, 60].map(days => (
                                            <button
                                                key={days}
                                                onClick={() => setReturnsRange(days)}
                                                className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg ${returnsRange === days ? "bg-violet-50 text-violet-700" : "text-zinc-600 hover:bg-zinc-50"}`}
                                            >
                                                Próximos {days} días
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-light text-zinc-900">
                                {returnsInPeriod.length}
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                        +2 vs periodo anterior
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cobertura Planes</div>
                            <div className="text-3xl font-light text-zinc-900">{fmtPct(KPIS.planCoverage)}</div>
                        </div>
                        <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-violet-600 h-full rounded-full" style={{ width: `${KPIS.planCoverage * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tasa Recaídas (30d)</div>
                            <div className="text-3xl font-light text-zinc-900">{fmtPct(KPIS.relapseRate)}</div>
                        </div>
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-zinc-500">
                        Objetivo: &lt;10%
                    </div>
                </div>

                <div className="bg-zinc-900 p-5 rounded-[24px] border border-zinc-800 shadow-sm text-white relative">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Coste en Riesgo</div>
                            <div className="text-3xl font-light text-white">{fmtEUR(KPIS.costAtRisk)}</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-medium text-emerald-400 z-10 relative">
                        {fmtEUR(KPIS.costAvoided)} evitado este mes
                    </div>
                    {/* Abstract decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>
            </div>

            {/* In-page List of Returns */}
            <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900">Próximos Retornos ({returnsRange} días)</h3>
                        <p className="text-xs text-zinc-500 mt-1">Ordenado por fecha de reincorporación (más próxima primero).</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                            <AlertOctagon size={12} /> Puesto Crítico
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {returnsInPeriod.length === 0 ? (
                        <div className="p-10 text-center text-zinc-400 text-sm flex flex-col items-center gap-3">
                            <Calendar size={32} className="opacity-20" />
                            No hay reincorporaciones previstas para los próximos {returnsRange} días.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Fecha Retorno</th>
                                    <th className="px-6 py-4 font-bold">Empleado</th>
                                    <th className="px-6 py-4 font-bold">Ubicación</th>
                                    <th className="px-6 py-4 font-bold">Riesgo / Aptitud</th>
                                    <th className="px-6 py-4 font-bold">Impacto</th>
                                    <th className="px-6 py-4 text-right font-bold">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {returnsInPeriod.map(c => (
                                    <tr key={c.id} className={`hover:bg-zinc-50/80 transition-colors group ${c.isCritical ? 'bg-rose-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center font-bold border ${c.isCritical ? 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                                                    <span className="text-sm">{new Date(c.returnDate).getDate()}</span>
                                                    <span className="text-[9px] uppercase">{new Date(c.returnDate).toLocaleString('es-ES', { month: 'short' })}</span>
                                                </div>
                                                {c.status === 'day0' && (
                                                    <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] uppercase font-bold rounded shadow-sm animate-pulse">
                                                        HOY
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {c.isCritical && (
                                                    <AlertOctagon size={14} className="text-rose-500 shrink-0" />
                                                )}
                                                <div>
                                                    <div className={`font-semibold ${c.isCritical ? 'text-rose-900' : 'text-zinc-900'}`}>{c.employeeName}</div>
                                                    <div className="text-xs text-zinc-500">{c.role} · {c.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-zinc-700">
                                                <MapPin size={14} className="text-zinc-400" />
                                                {c.unit}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${c.riskScore > 70 ? 'bg-rose-500' : c.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${c.riskScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400">Riesgo</span>
                                                </div>
                                                {c.aptitude === "Apto con limitaciones" ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                        Limitaciones
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        Apto
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-700 text-xs">
                                            {fmtEUR(c.costAtRisk)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onOpenCase(c)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-sm text-xs font-bold text-zinc-700 hover:text-violet-600 hover:border-violet-200 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                Ver Ficha <ArrowRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
