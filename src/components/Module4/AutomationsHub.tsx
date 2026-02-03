import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Plus, Zap, AlertTriangle, History,
    Brain, Target, ChevronRight, Euro, Activity, BarChart3,
    ArrowUpRight, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { MOCK_RISKS, MOCK_AUTOMATIONS } from './mockAutomations';
import { Risk, Severity, RiskSource, RiskStatus, Workflow } from './automationTypes';
import { fmtEUR } from '../../utils/formatters';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

// --- Sub-components ---

const SourceBadge = ({ source }: { source: RiskSource }) => {
    const config = {
        HISTORICO: { icon: History, label: 'Histórico', color: 'text-zinc-500 bg-zinc-50 border-zinc-100' },
        HRIS: { icon: Target, label: 'HRIS', color: 'text-blue-600 bg-blue-50 border-blue-100' },
        PATRONES_IA: { icon: Brain, label: 'IA Patrones', color: 'text-violet-600 bg-violet-50 border-violet-100' },
        CENTROS_ESPEJO: { icon: Activity, label: 'Centros Espejo', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    };
    const { icon: Icon, label, color } = config[source];
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 uppercase tracking-wider", color)}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const SeverityBadge = ({ val }: { val: Severity }) => {
    const colors = {
        ALTA: "text-rose-600 bg-rose-50 border-rose-100",
        MEDIA: "text-amber-600 bg-amber-50 border-amber-100",
        BAJA: "text-zinc-500 bg-zinc-50 border-zinc-100"
    };
    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tight", colors[val])}>
            {val}
        </span>
    );
};

export default function AutomationsHub({
    onCreateAutomation,
    onViewDetail,
    onAddAlternative
}: {
    onCreateAutomation: (risk: Risk) => void;
    onViewDetail: (automationId: string) => void;
    onAddAlternative: (risk: Risk) => void;
}) {
    const [search, setSearch] = useState('');
    const [filterSource, setFilterSource] = useState<string>('Todas');

    const filtered = useMemo(() => {
        return MOCK_RISKS.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.scope.center?.toLowerCase().includes(search.toLowerCase());
            const matchesSource = filterSource === 'Todas' || r.source === filterSource;
            return matchesSearch && matchesSource;
        });
    }, [search, filterSource]);

    const pendingRisks = useMemo(() => filtered.filter(r => r.status === 'AUTOMATION_NOT_CREATED'), [filtered]);
    const activeRisks = useMemo(() => filtered.filter(r => r.status === 'AUTOMATION_CREATED' || r.status === 'ALTERNATIVE_STUDY'), [filtered]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* --- HEADER & FILTERS --- */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Hub de Protocolos</h1>
                        <p className="text-zinc-500 text-base mt-2 font-medium max-w-2xl">
                            Transforma riesgos predictivos en protocolos de actuación operativa. Define tareas, responsables y monitoriza el impacto real.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 border border-zinc-200 rounded-[2rem] shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar riesgo o centro..."
                                className="h-11 pl-11 pr-4 bg-zinc-50 border-none rounded-2xl text-sm outline-none w-64 font-medium focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-11 px-4 bg-zinc-50 border-none rounded-2xl text-sm outline-none font-bold text-zinc-600 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                            value={filterSource}
                            onChange={(e) => setFilterSource(e.target.value)}
                        >
                            <option value="Todas">Todas las fuentes</option>
                            <option value="HISTORICO">Histórico</option>
                            <option value="HRIS">HRIS</option>
                            <option value="PATRONES_IA">IA Patrones</option>
                            <option value="CENTROS_ESPEJO">Centros Espejo</option>
                        </select>
                    </div>
                </div>

                {/* --- ANALYTICS SUMMARY (TOP) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Protocolos Activos', val: MOCK_AUTOMATIONS.length, icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50/50' },
                        { label: '% Éxito Agregado', val: '72%', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                        { label: 'Ahorro Total Est.', val: fmtEUR(65500), icon: Euro, color: 'text-emerald-700', bg: 'bg-emerald-50/50' },
                        { label: 'Riesgos Pendientes', val: pendingRisks.length, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50/50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-zinc-100 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-zinc-200 transition-colors">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{stat.label}</div>
                                <div className="text-xl font-bold text-zinc-900 tracking-tight">{stat.val}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SECTION 1: PENDING RISKS (CARDS) --- */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                        Riesgos Detectados <span className="text-rose-500 font-medium opacity-60">({pendingRisks.length})</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRisks.map((risk) => (
                        <div key={risk.id} className="group relative bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden">
                            {/* Card Background Accent */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-violet-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <SourceBadge source={risk.source} />
                                    <SeverityBadge val={risk.severity} />
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-1 group-hover:text-violet-700 transition-colors">
                                        {risk.name}
                                    </h3>
                                    <p className="text-sm font-medium text-zinc-500">
                                        {risk.scope.center || risk.scope.province || 'General'} · <span className="text-zinc-400">{risk.scope.role || 'Varios roles'}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-zinc-50 p-3 rounded-2xl">
                                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Impacto Est.</div>
                                        <div className="text-sm font-bold text-zinc-900">{fmtEUR(risk.impactEur || 0)}</div>
                                    </div>
                                    <div className="bg-zinc-50 p-3 rounded-2xl">
                                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Confianza IA</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 flex-1 bg-zinc-200 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all", risk.probability && risk.probability >= 80 ? 'bg-emerald-500' : 'bg-amber-500')}
                                                    style={{ width: `${risk.probability}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-900">{risk.probability}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-3">
                                    <button
                                        onClick={() => onCreateAutomation(risk)}
                                        className="flex-1 h-12 bg-zinc-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-violet-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Zap size={14} />
                                        Activar Protocolo
                                    </button>
                                    <button
                                        onClick={() => onAddAlternative(risk)}
                                        className="h-12 w-12 bg-white border border-zinc-200 text-zinc-500 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-all active:scale-95"
                                        title="Mitigación Manual"
                                    >
                                        <AlertTriangle size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {pendingRisks.length === 0 && (
                        <div className="col-span-full py-16 bg-white border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900">Sin riesgos pendientes</h3>
                            <p className="text-zinc-500 text-sm mt-2 max-w-xs">
                                ¡Excelente! Todos los riesgos detectados tienen un plan de acción o un flujo activo.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECTION 2: ACTIVE AUTOMATIONS (COMPACT LIST) --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Flujos y Monitorización Activa</h2>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Procedimiento / Estado</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ejecución</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Rendimiento (KPI)</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {activeRisks.map((risk) => {
                                    const automation = risk.automationId ? MOCK_AUTOMATIONS.find(a => a.id === risk.automationId) : null;

                                    return (
                                        <tr key={risk.id} className="group hover:bg-zinc-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                        risk.status === 'AUTOMATION_CREATED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {risk.status === 'AUTOMATION_CREATED' ? <Zap size={18} /> : <AlertTriangle size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-900 mb-0.5">{risk.name}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{risk.scope.center || 'Corporativo'}</span>
                                                            <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest",
                                                                risk.status === 'AUTOMATION_CREATED' ? "text-emerald-600" : "text-amber-600"
                                                            )}>
                                                                {risk.status === 'AUTOMATION_CREATED' ? 'Vigilancia Activa' : 'Mitigación Manual'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-zinc-600">
                                                        <History size={12} className="text-zinc-400" />
                                                        <span className="text-xs font-medium">{risk.window || 'Continua'}</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Incentivado por {risk.source}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {automation ? (
                                                    <div className="flex items-center justify-center gap-8">
                                                        <div className="text-center">
                                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 mt-2">Ahorro</div>
                                                            <div className="text-sm font-bold text-emerald-600">{fmtEUR(automation.savedEur)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 mt-2">Éxito</div>
                                                            <div className="text-sm font-bold text-emerald-600">{automation.successRate}%</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                                                        <BarChart3 size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sin métricas registradas</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => onViewDetail(risk.automationId || '')}
                                                    className="h-10 px-4 bg-zinc-50 border border-zinc-100 text-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 hover:border-zinc-200 transition-all inline-flex items-center gap-2"
                                                >
                                                    Gestionar
                                                    <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
