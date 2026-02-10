import React, { useMemo, useState } from "react";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Euro,
    Calendar as CalendarIcon,
    ArrowRight,
    Building2,
    MapPin,
    Store as StoreIcon
} from "lucide-react";
import { fmtEUR } from "../../utils/formatters";

// --- TYPES ---
export interface Incident {
    id: string;
    date: Date;
    severity: 'critical' | 'medium';
    impact: number;
    title: string;
    fix: string;
    savingEUR: number;
    location: {
        province: string;
        storeId: string;
        storeName: string;
    };
}

// --- MOCK DATA ---
const PROVINCES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];
const STORES_BY_PROVINCE: Record<string, { id: string; name: string }[]> = {
    Madrid: [{ id: "mad_gv", name: "Gran Vía" }, { id: "mad_s", name: "Serrano" }, { id: "mad_f", name: "Fuencarral" }],
    Barcelona: [{ id: "bcn_d", name: "Diagonal" }, { id: "bcn_p", name: "Plaça Catalunya" }],
    Valencia: [{ id: "vlc_c", name: "Centro" }, { id: "vlc_a", name: "Avenida" }],
    Sevilla: [{ id: "sev_n", name: "Nervión" }],
    Bilbao: [{ id: "bil_m", name: "Moyúa" }],
};

const TITLES = [
    "Rotura operativa prevista",
    "Absentismo crítico detectado",
    "Riesgo de cobertura",
    "Patrón recurrente: Turno Noche",
    "Pico de bajas previsto",
    "Alerta estacional: Campaña",
    "Desviación presupuesto",
];

const FIXES = [
    "Activar cobertura express y swap de turnos.",
    "Plan de fatiga 7 días con refuerzo temporal.",
    "Reasignación de recursos desde tienda cercana.",
    "Micro-pausas planificadas y rotación.",
    "Bloquear cambios de turno no críticos.",
    "Auditoría de descansos inmediata.",
];

// DATA GENERATOR
function generateIncidents(): Incident[] {
    const incidents: Incident[] = [];
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 6);

    let idCount = 1;
    const provinces = Object.keys(STORES_BY_PROVINCE);

    // Generate ~100 incidents over 6 months
    for (let i = 0; i < 120; i++) {
        const province = provinces[Math.floor(Math.random() * provinces.length)];
        const stores = STORES_BY_PROVINCE[province];
        const store = stores[Math.floor(Math.random() * stores.length)];

        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const severity = Math.random() > 0.3 ? 'medium' : 'critical';
        const impact = severity === 'critical' ? 15000 + Math.random() * 20000 : 3000 + Math.random() * 8000;
        const savingEUR = impact * (0.4 + Math.random() * 0.3);

        incidents.push({
            id: `inc_${idCount++}`,
            date: randomDate,
            severity,
            impact,
            title: TITLES[Math.floor(Math.random() * TITLES.length)],
            fix: FIXES[Math.floor(Math.random() * FIXES.length)],
            savingEUR,
            location: {
                province,
                storeId: store.id,
                storeName: store.name
            }
        });
    }
    // DEMO CASE: 2 Critical and 2 Medium on the same day (Tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const demoStore = STORES_BY_PROVINCE["Madrid"][0];

    for (let i = 0; i < 2; i++) {
        incidents.push({
            id: `inc_demo_crit_${i}`,
            date: tomorrow,
            severity: 'critical',
            impact: 18000,
            title: `Crítico Demo ${i + 1}`,
            fix: "Acción de emergencia para demo.",
            savingEUR: 7000,
            location: { province: "Madrid", storeId: demoStore.id, storeName: demoStore.name }
        });
        incidents.push({
            id: `inc_demo_med_${i}`,
            date: tomorrow,
            severity: 'medium',
            impact: 5000,
            title: `Medio Demo ${i + 1}`,
            fix: "Acción preventiva para demo.",
            savingEUR: 2000,
            location: { province: "Madrid", storeId: demoStore.id, storeName: demoStore.name }
        });
    }

    return incidents;
}

const ALL_INCIDENTS = generateIncidents();

// --- COMPONENTS ---

const Card = ({ children, className = "" }: any) => (
    <div className={`bg-white rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 ${className}`}>
        {children}
    </div>
);

const Badge = ({ severity }: { severity: 'critical' | 'medium' }) => {
    const styles = severity === 'critical'
        ? "bg-rose-50 text-rose-700 border-rose-100 shadow-[0_2px_10px_rgba(244,63,94,0.1)]"
        : "bg-amber-50 text-amber-700 border-amber-100";
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wider ${styles}`}>
            {severity === 'critical' ? 'Crítico' : 'Medio'}
        </span>
    );
};

import { UNIFIED_MOCK_DATA } from "../../stores/unifiedMockData";

// --- COMPONENTS ---
// ... Component definitions ...

export default function AlertSystem({ onViewDetail }: { onViewDetail?: (id: string) => void }) {
    const [filter, setFilter] = useState({ province: "Todas", storeId: "Todas" });
    const [activeSeverities, setActiveSeverities] = useState(['critical', 'medium']);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const filteredIncidents = useMemo(() => {
        return ALL_INCIDENTS.filter(inc => {
            const matchProv = filter.province === "Todas" || inc.location.province === filter.province;
            const matchStore = filter.storeId === "Todas" || inc.location.storeId === filter.storeId;
            const matchSev = activeSeverities.includes(inc.severity);
            return matchProv && matchStore && matchSev;
        });
    }, [filter, activeSeverities]);

    const toggleSeverity = (sev: string) => {
        setActiveSeverities(prev =>
            prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]
        );
    };

    const stats = useMemo(() => {
        const critical = filteredIncidents.filter(i => i.severity === 'critical').length;
        const medium = filteredIncidents.filter(i => i.severity === 'medium').length;
        return { critical, medium };
    }, [filteredIncidents]);

    const sortedAlerts = useMemo(() => {
        return [...filteredIncidents]
            .sort((a, b) => {
                // First by severity
                if (a.severity === 'critical' && b.severity === 'medium') return -1;
                if (a.severity === 'medium' && b.severity === 'critical') return 1;

                // Then by date (closest to today first)
                const now = new Date();
                const diffA = Math.abs(a.date.getTime() - now.getTime());
                const diffB = Math.abs(b.date.getTime() - now.getTime());
                return diffA - diffB;
            })
            .slice(0, 10);
    }, [filteredIncidents]);

    // Calendar Helpers
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentMonth(prev => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() - 1);
        return d;
    });
    const handleNextMonth = () => setCurrentMonth(prev => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + 1);
        return d;
    });

    // Use unified total count for the summary, or ensure consistency
    // We will override the displayed count with the 'Official' number 
    const officialRiskCount = UNIFIED_MOCK_DATA.KPI.totalActiveRisks;
    const officialCriticalCount = Math.round(officialRiskCount * 0.4); // approx distribution
    const officialMediumCount = officialRiskCount - officialCriticalCount;

    return (
        <div className="space-y-6">

            {/* 2. DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: SUMMARY & FEED */}
                <div className="lg:col-span-8 space-y-6">

                    {/* SUMMARY COUNTERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => toggleSeverity('critical')}
                            className={`flex items-center gap-6 group rounded-[2rem] border p-6 transition-all text-left ${activeSeverities.includes('critical') ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-zinc-100 bg-white hover:border-rose-200'}`}
                        >
                            <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center relative">
                                <AlertTriangle className="text-rose-600 relative z-10" size={36} />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-rose-500 uppercase tracking-[0.2em] mb-1">Impacto Crítico</div>
                                <div className="text-3xl font-light text-zinc-900 leading-none mb-1 tracking-tight">{officialCriticalCount}</div>
                                <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Alertas de rotura &gt; 80%</p>
                            </div>
                            <div className="ml-auto">
                                <div className={`h-2 w-2 rounded-full bg-rose-500 ${activeSeverities.includes('critical') ? 'animate-pulse' : 'opacity-40'}`}></div>
                            </div>
                        </button>

                        <button
                            onClick={() => toggleSeverity('medium')}
                            className={`flex items-center gap-6 group rounded-[2rem] border p-6 transition-all text-left ${activeSeverities.includes('medium') ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-zinc-100 bg-white hover:border-amber-200'}`}
                        >
                            <div className="h-20 w-20 rounded-3xl bg-amber-50 flex items-center justify-center">
                                <AlertTriangle className="text-amber-600" size={36} />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-amber-600 uppercase tracking-[0.2em] mb-1">Impactos Medios</div>
                                <div className="text-3xl font-light text-zinc-900 leading-none mb-1 tracking-tight">{officialMediumCount}</div>
                                <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Desviaciones operativas</p>
                            </div>
                            <div className="ml-auto">
                                <div className={`h-2 w-2 rounded-full bg-amber-500 ${activeSeverities.includes('medium') ? 'animate-pulse' : 'opacity-40'}`}></div>
                            </div>
                        </button>
                    </div>

                    {/* ALERT FEED */}
                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                                    <Euro size={20} />
                                </div>
                                <div>
                                    <h3 className="font-light text-zinc-900 tracking-tight text-lg">Feed de Alertas Predictivas</h3>
                                    <p className="text-[10px] text-zinc-400 font-medium tracking-tight uppercase tracking-widest">Ordenado por Riesgo y Proximidad Temporal</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Próximos 6 meses
                            </div>
                        </div>

                        <div className="divide-y divide-zinc-50">
                            {sortedAlerts.map((inc) => (
                                <div key={inc.id} className="p-6 hover:bg-zinc-50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge severity={inc.severity} />
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">ID: {inc.id.toUpperCase()}</span>
                                            </div>
                                            <h4 className="font-semibold text-zinc-900 group-hover:text-violet-600 transition-colors text-lg tracking-tight">{inc.title}</h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                                                <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                                                    <MapPin size={12} className="text-violet-500" /> {inc.location.province} · {inc.location.storeName}
                                                </span>
                                                <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <CalendarIcon size={12} /> {inc.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="mt-4 p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50 group-hover:border-violet-100 transition-all">
                                                <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Acción Recomendada</div>
                                                <p className="text-sm font-medium text-zinc-700 leading-relaxed italic">"{inc.fix}"</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 min-w-[140px]">
                                            <div className="text-right">
                                                <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Impacto Previsto</div>
                                                <div className="text-xl font-light text-zinc-900 tracking-tight">{fmtEUR(inc.impact)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-semibold text-emerald-600/60 uppercase tracking-widest mb-1">Ahorro Estimado</div>
                                                <div className="text-sm font-medium text-emerald-600">{fmtEUR(inc.savingEUR)}</div>
                                            </div>
                                            <button
                                                onClick={() => onViewDetail?.(inc.id)}
                                                className="h-10 w-10 md:mt-4 rounded-2xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: FILTERS & CALENDAR */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-100">
                                <Filter size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900 text-sm tracking-tight uppercase tracking-widest text-xs">Filtros</h4>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Estructura Organizativa</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Provincia</div>
                                <div className="relative group">
                                    <select
                                        className="appearance-none w-full h-11 pl-10 pr-10 rounded-2xl border border-zinc-100 bg-zinc-50/50 text-sm font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer"
                                        value={filter.province}
                                        onChange={(e) => setFilter({ province: e.target.value, storeId: "Todas" })}
                                    >
                                        <option value="Todas">Toda la Compañía</option>
                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <MapPin className="absolute left-3.5 top-3.5 text-violet-500" size={14} />
                                    <ChevronRight className="absolute right-3.5 top-3.5 text-zinc-300 rotate-90" size={14} />
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Tienda / Centro</div>
                                <div className="relative group">
                                    <select
                                        className="appearance-none w-full h-11 pl-10 pr-10 rounded-2xl border border-zinc-100 bg-zinc-50/50 text-sm font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-violet-200 transition-all cursor-pointer disabled:opacity-40"
                                        value={filter.storeId}
                                        onChange={(e) => setFilter({ ...filter, storeId: e.target.value })}
                                        disabled={filter.province === "Todas"}
                                    >
                                        <option value="Todas">Todas las unidades</option>
                                        {filter.province !== "Todas" && STORES_BY_PROVINCE[filter.province].map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <StoreIcon className="absolute left-3.5 top-3.5 text-violet-500" size={14} />
                                    <ChevronRight className="absolute right-3.5 top-3.5 text-zinc-300 rotate-90" size={14} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="flex-1 flex flex-col p-8 bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-violet-50 flex items-center justify-center">
                                    <CalendarIcon className="text-violet-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-light text-sm tracking-tight text-zinc-900 uppercase tracking-widest text-xs">Calendario</h3>
                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={handlePrevMonth} className="h-9 w-9 rounded-xl hover:bg-zinc-50 flex items-center justify-center transition-colors border border-zinc-100 text-zinc-400"><ChevronLeft size={16} /></button>
                                <button onClick={handleNextMonth} className="h-9 w-9 rounded-xl hover:bg-zinc-50 flex items-center justify-center transition-colors border border-zinc-100 text-zinc-400"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                <div key={day} className="text-center text-[10px] font-medium text-zinc-400 py-2">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
                            {/* Empty days before first day of month */}
                            {Array.from({ length: (firstDayOfMonth(currentMonth) + 6) % 7 }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}

                            {/* Actual days */}
                            {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                                const day = i + 1;
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const dayIncidents = filteredIncidents.filter(inc => inc.date.toDateString() === date.toDateString());

                                const hasCritical = dayIncidents.some(inc => inc.severity === 'critical');
                                const hasMedium = dayIncidents.some(inc => inc.severity === 'medium');

                                let bgColor = "bg-transparent";
                                let borderColor = "border-zinc-800/10";
                                let glowColor = "";

                                if (hasCritical && hasMedium) {
                                    bgColor = "bg-orange-500/10";
                                    borderColor = "border-orange-500/30";
                                    glowColor = "shadow-[inset_0_0_10px_rgba(249,115,22,0.15)]";
                                } else if (hasCritical) {
                                    bgColor = "bg-rose-500/10";
                                    borderColor = "border-rose-500/30";
                                    glowColor = "shadow-[inset_0_0_10px_rgba(244,63,94,0.15)]";
                                } else if (hasMedium) {
                                    bgColor = "bg-amber-500/10";
                                    borderColor = "border-amber-500/30";
                                }

                                return (
                                    <div key={day} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group transition-all cursor-default ${bgColor} ${borderColor} ${glowColor}`}>
                                        <span className={`text-[11px] font-light ${dayIncidents.length > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>{day}</span>
                                        {dayIncidents.length > 0 && (
                                            <div className={`mt-0.5 h-1 w-1 rounded-full ${hasCritical && hasMedium ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]' : hasCritical ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.8)]' : 'bg-amber-500'}`}></div>
                                        )}

                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-zinc-900 text-white text-[10px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 w-[140px] pointer-events-none border border-zinc-700">
                                            <div className="font-bold mb-1 border-b border-zinc-700 pb-1">{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                                            {dayIncidents.length > 0 ? (
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-rose-400">{dayIncidents.filter(x => x.severity === 'critical').length} Críticos</p>
                                                    <p className="font-semibold text-amber-400">{dayIncidents.filter(x => x.severity === 'medium').length} Medios</p>
                                                </div>
                                            ) : <p>Sin incidencias</p>}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-zinc-900"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
                            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                                <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                                Combinado (Crítico + Medio)
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                Incidentes Críticos (Rotura)
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500">
                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                Incidentes Medios (Alerta)
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
