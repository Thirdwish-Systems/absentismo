import React, { useState, useMemo } from 'react';
import {
    Search, Zap, Activity, BarChart3,
    ArrowRight, CheckCircle2, MoreHorizontal,
    Euro, Target, LayoutGrid, List, PlayCircle, PauseCircle,
    Plus, Layers, ArrowLeft, Calendar, Clock, MapPin, Building2, ChevronLeft
} from 'lucide-react';
import { MOCK_AUTOMATIONS } from './mockAutomations';
import { Workflow, AutomationTask, Risk } from './automationTypes';
import { fmtEUR } from '../../utils/formatters';
import { useConfig } from '../../stores/configStore';
import CreateAutomation from './CreateAutomation';
import ProtocolDetailView from './ProtocolDetailView';

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

// --- UTILS ---

const getDaysDiff = (target?: string) => {
    if (!target) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(target);
    targetDate.setHours(0, 0, 0, 0);
    const diff = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
};

// --- HELPER COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
    const isActive = status === 'ACTIVE';
    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1.5 w-fit",
            isActive
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-zinc-50 text-zinc-400 border-zinc-100"
        )}>
            <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-300")} />
            {isActive ? 'En Ejecución' : 'Inactivo'}
        </span>
    );
};

const ProtocolCard = ({ workflow, onViewDetail }: { workflow: Workflow, onViewDetail: (id: string) => void }) => {
    const completedTasks = workflow.tasks.filter(t => t.status === 'COMPLETADA').length;
    const totalTasks = workflow.tasks.length;
    const percent = Math.round((completedTasks / totalTasks) * 100);

    const accentColor =
        workflow.severity === 'ALTA' ? 'bg-rose-500' :
            workflow.severity === 'MEDIA' ? 'bg-amber-500' :
                'bg-emerald-500';

    const daysUntilRisk = getDaysDiff(workflow.riskDate);

    return (
        <div
            onClick={() => onViewDetail(workflow.id)}
            className="group bg-white border border-zinc-200 rounded-[28px] p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 flex items-center gap-6 cursor-pointer relative overflow-hidden"
        >
            {/* Severity Indicator */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", accentColor)} />

            {/* Main Info */}
            <div className="flex-1 min-w-0 flex items-center gap-8">
                <div className="flex flex-col gap-1 min-w-[220px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        #{workflow.id.replace('auto_', '')}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-violet-700 transition-colors tracking-tight truncate">
                        {workflow.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <MapPin size={12} className="text-zinc-400" /> {workflow.config.scope.center || workflow.config.scope.province || 'Global'}
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex flex-col gap-1.5 min-w-[120px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Severidad</div>
                    <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-fit",
                        workflow.severity === 'ALTA' ? "bg-rose-50 text-rose-700 border-rose-100" :
                            workflow.severity === 'MEDIA' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                        {workflow.severity}
                    </span>
                </div>

                <div className="hidden lg:flex flex-col gap-1.5 min-w-[140px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Próximo Riesgo</div>
                    <div className="flex items-center gap-1.5 text-zinc-600 font-medium text-xs">
                        <Clock size={13} className="text-zinc-400" />
                        {daysUntilRisk !== null ? (
                            daysUntilRisk === 0 ? 'Hoy' : daysUntilRisk > 0 ? `En ${daysUntilRisk} días` : `Hace ${Math.abs(daysUntilRisk)}d`
                        ) : '-'}
                    </div>
                </div>

                {/* Activaciones & Success Metrics */}
                <div className="hidden xl:flex flex-col gap-1.5 min-w-[100px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Activaciones</div>
                    <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-bold text-xs">
                        <Zap size={13} className="text-amber-500 fill-amber-500" />
                        {workflow.runsCount}
                    </div>
                </div>

                <div className="hidden xl:flex flex-col gap-1.5 min-w-[100px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">% Éxito</div>
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <Target size={13} className="text-emerald-500" />
                        {workflow.successRate}%
                    </div>
                </div>

                {/* Micro Steps Visualizer */}
                <div className="flex-1 hidden 2xl:flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progreso</span>
                        <span className="text-xs font-semibold text-violet-600">{percent}%</span>
                    </div>
                    <div className="flex gap-1.5 h-1.5">
                        {workflow.tasks.map((t, i) => (
                            <div key={i} className={cn(
                                "h-full flex-1 rounded-full transition-all",
                                t.status === 'COMPLETADA' ? "bg-emerald-500" :
                                    t.status === 'ENTRÁMITE' ? "bg-violet-500 animate-pulse" : "bg-zinc-100"
                            )} title={t.title} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 text-right min-w-[90px]">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ahorro</div>
                    <div className="text-sm font-semibold text-emerald-600">{fmtEUR(workflow.savedEur)}</div>
                </div>
            </div>

            <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
                <ArrowRight size={18} />
            </div>
        </div>
    );
};

export default function AutomationsHub({
    onViewDetail,
    onCreateAutomation,
    onAddAlternative
}: {
    onViewDetail: (automationId: string) => void;
    onCreateAutomation?: (risk: Risk) => void;
    onAddAlternative?: (risk: Risk) => void;
}) {
    const { config } = useConfig();
    const [viewMode, setViewMode] = useState<'ACTIVE_DASHBOARD' | 'FULL_LIBRARY' | 'DETAIL_VIEW'>('ACTIVE_DASHBOARD');
    const [search, setSearch] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'risk' | 'date' | 'savings'>('risk');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedWfId, setSelectedWfId] = useState<string | null>(null);
    const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_AUTOMATIONS);

    const selectedWorkflow = useMemo(() =>
        workflows.find(w => w.id === selectedWfId)
        , [selectedWfId, workflows]);

    const handleSaveProtocol = (updatedWf: Workflow) => {
        setWorkflows(prev => prev.map(w => w.id === updatedWf.id ? updatedWf : w));
    };

    const handleDuplicateProtocol = (wf: Workflow) => {
        const newWf: Workflow = {
            ...wf,
            id: `auto_${Math.random().toString(36).substr(2, 9)}`,
            name: `${wf.name} (Copia)`,
            createdAt: new Date().toISOString().split('T')[0],
            runsCount: 0,
            successRate: 0,
            savedEur: 0,
            theoreticalSavings: wf.theoreticalSavings || 0,
            realSavings: 0,
            tasks: wf.tasks.map(t => ({ ...t, status: 'PENDIENTE' }))
        };
        setWorkflows(prev => [newWf, ...prev]);
        setSelectedWfId(newWf.id);
    };

    const openDetail = (id: string) => {
        setSelectedWfId(id);
        setViewMode('DETAIL_VIEW');
    };

    // Dynamic Filter Options
    const provinces = useMemo(() => {
        return ['all', ...config.structure.map(p => p.name)];
    }, [config.structure]);

    const facilityTypes = useMemo(() => {
        const types = new Set<string>();
        config.structure.forEach(p => p.stores.forEach(s => types.add(s.type)));
        return ['all', ...Array.from(types)];
    }, [config.structure]);

    const filtered = useMemo(() => {
        let result = workflows.filter(a => {
            const matchesSearch = a.id.toLowerCase().includes(search.toLowerCase()) ||
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                JSON.stringify(a.config).toLowerCase().includes(search.toLowerCase());
            const matchesProvince = provinceFilter === 'all' || a.config.scope.province === provinceFilter;
            const matchesType = typeFilter === 'all' || true;
            return matchesSearch && matchesProvince && matchesType;
        });

        result.sort((a, b) => {
            if (sortBy === 'risk') {
                const priority = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
                return (priority[b.severity as keyof typeof priority] || 0) - (priority[a.severity as keyof typeof priority] || 0);
            }
            if (sortBy === 'date') {
                return new Date(a.riskDate || '').getTime() - new Date(b.riskDate || '').getTime();
            }
            if (sortBy === 'savings') {
                return (b.theoreticalSavings || 0) - (a.theoreticalSavings || 0);
            }
            return 0;
        });

        return result;
    }, [search, provinceFilter, typeFilter, workflows, sortBy]);

    const activeWorkflows = filtered.filter(a => a.activeStatus === 'ACTIVE');
    const allWorkflows = filtered;

    // --- VIEW 3: DETAIL VIEW (FULL PAGE) ---
    if (viewMode === 'DETAIL_VIEW' && selectedWorkflow) {
        return (
            <ProtocolDetailView
                workflow={selectedWorkflow}
                onBack={() => setViewMode('ACTIVE_DASHBOARD')}
                onSave={handleSaveProtocol}
                onDuplicate={handleDuplicateProtocol}
            />
        );
    }

    if (isCreating) {
        return (
            <CreateAutomation
                onClose={() => setIsCreating(false)}
                onSave={(wf) => {
                    setWorkflows(prev => [wf as any, ...prev]);
                    setIsCreating(false);
                }}
            />
        );
    }

    // --- VIEW 1: ACTIVE DASHBOARD (DEFAULT) ---
    if (viewMode === 'ACTIVE_DASHBOARD') {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">Protocolos Activos</h1>
                        <p className="text-zinc-500 mt-1 font-medium">Gestión inteligente de riesgos en tiempo real.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="h-12 px-6 bg-white border border-zinc-200 text-zinc-900 rounded-2xl text-[11px] font-semibold uppercase tracking-widest hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> Crear Protocolo
                        </button>
                        <button
                            onClick={() => setViewMode('FULL_LIBRARY')}
                            className="h-12 px-6 bg-white border border-zinc-200 text-zinc-900 rounded-2xl text-[11px] font-semibold uppercase tracking-widest hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Layers size={16} /> Biblioteca Completa
                        </button>
                    </div>
                </div>

                {/* FILTERS & SORT */}
                <div className="flex flex-wrap items-center gap-4 bg-zinc-100/50 p-4 rounded-3xl border border-zinc-200/50">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm flex-1 min-w-[200px]">
                        <Search size={16} className="text-zinc-400" />
                        <input
                            placeholder="Buscar protocolo..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Provincia:</label>
                        <select
                            className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                            value={provinceFilter}
                            onChange={(e) => setProvinceFilter(e.target.value)}
                        >
                            {provinces.map(p => <option key={p} value={p}>{p === 'all' ? 'Todas' : p}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 border-r border-zinc-200 pr-4 mr-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Unidad:</label>
                        <select
                            className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            {facilityTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'Todas' : t.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2 bg-zinc-200/50 px-2 py-1 rounded">Ordenar por:</label>
                        <select
                            className="h-10 px-4 rounded-xl border border-violet-200 bg-white text-xs font-black text-violet-700 outline-none focus:ring-2 focus:ring-violet-100 transition-all shadow-sm shadow-violet-100/50"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="risk">Máximo Riesgo</option>
                            <option value="date">Próximo Vencimiento</option>
                            <option value="savings">Mayor Ahorro</option>
                        </select>
                    </div>
                </div>

                {/*Active Cards Grid */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                                Actividad en Curso
                                <span className="ml-3 text-zinc-300 font-light text-xl">{activeWorkflows.length}</span>
                            </h2>
                        </div>
                    </div>

                    {activeWorkflows.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {activeWorkflows.map(workflow => (
                                <ProtocolCard
                                    key={workflow.id}
                                    workflow={workflow}
                                    onViewDetail={openDetail}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center shadow-sm">
                            <div className="h-20 w-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                                <Zap size={32} className="text-zinc-200" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW 2: FULL LIBRARY ---
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Library Header */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <button
                            onClick={() => setViewMode('ACTIVE_DASHBOARD')}
                            className="mb-6 text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-violet-600 transition-colors flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-full w-fit border border-zinc-100"
                        >
                            <ArrowLeft size={14} /> Volver a Activos
                        </button>
                        <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">Biblioteca Global</h1>
                        <p className="text-zinc-500 mt-1 font-medium">Inventario completo de protocolos e histórico de acciones.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-100/50 p-2 rounded-2xl flex gap-2 border border-zinc-200/50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="h-11 pl-11 pr-4 bg-white border border-zinc-200 rounded-xl text-sm outline-none w-64 font-bold focus:ring-2 focus:ring-violet-100 transition-all shadow-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="h-11 px-6 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-[11px] font-semibold uppercase tracking-widest hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={16} /> Nuevo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estatus</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocolo</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gravedad</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Próximo Hito</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Activaciones</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">% Éxito</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Tareas</th>
                                <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Ahorro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {allWorkflows.map(w => {
                                const diff = getDaysDiff(w.riskDate);
                                return (
                                    <tr key={w.id} className="group hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => openDetail(w.id)}>
                                        <td className="px-8 py-5">
                                            <StatusBadge status={w.activeStatus} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-black text-zinc-900 text-sm">#{w.id.replace('auto_', '')}</div>
                                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{w.config.scope.center || 'Global'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                                w.severity === 'ALTA' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    w.severity === 'MEDIA' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {w.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn("text-xs font-bold", diff !== null && diff < 0 ? "text-rose-600" : "text-zinc-600")}>
                                                {diff === null ? '-' : diff === 0 ? 'Hoy' : diff > 0 ? `En ${diff} días` : `Hace ${Math.abs(diff)} días`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-xs font-bold text-zinc-900">{w.runsCount}</div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-xs font-bold text-emerald-600">{w.successRate}%</div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {w.tasks.map((t, idx) => (
                                                    <div key={idx} className={cn(
                                                        "h-1.5 w-4 rounded-full",
                                                        t.status === 'COMPLETADA' ? "bg-emerald-500" :
                                                            t.status === 'ENTRÁMITE' ? "bg-violet-500" : "bg-zinc-200"
                                                    )} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="text-sm font-black text-emerald-600">{fmtEUR(w.savedEur)}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
