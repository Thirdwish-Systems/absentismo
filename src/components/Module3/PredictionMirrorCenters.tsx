import React, { useState } from 'react';
import {
    Columns, ArrowRightLeft, MapPin, Users, Activity,
    ArrowRight, TrendingDown, TrendingUp, AlertTriangle,
    Zap, Info, Briefcase, Clock, Euro, CheckCircle2, ChevronDown, ListFilter,
    Search, Sparkles, Brain, Target, Building2, ChevronRight, Globe
} from 'lucide-react';
import { MOCK_MIRROR_SUGGESTION, MOCK_MIRROR_FINDINGS } from '../Module4/mockAutomations';

interface CenterStats {
    totalAbsence: number;
    noShowRate: number;
    partialRate: number;
    overtime: number;
    turnover: number;
    manualCorrections: number;
}

interface MirrorCenter {
    id: string;
    name: string;
    roleMix: string;
    headcount: number;
    revenue: string;
    similarity: number;
    stats: CenterStats;
    anomalies: string[];
}

const MOCK_CENTERS: MirrorCenter[] = [
    {
        id: 'c1',
        name: 'Madrid - Serrano',
        roleMix: '85% Venta / 15% Logística',
        headcount: 52,
        revenue: 'Tier A+',
        similarity: 100,
        stats: {
            totalAbsence: 7.8,
            noShowRate: 1.8,
            partialRate: 2.3,
            overtime: 14,
            turnover: 3.5,
            manualCorrections: 52
        },
        anomalies: ['Picos de absentismo por rotación', 'Desvío en horas extra']
    },
    {
        id: 'c2',
        name: 'Madrid - Calle Lista',
        roleMix: '82% Venta / 18% Logística',
        headcount: 48,
        revenue: 'Tier A+',
        similarity: 98,
        stats: {
            totalAbsence: 5.2,
            noShowRate: 0.6,
            partialRate: 1.1,
            overtime: 6,
            turnover: 1.2,
            manualCorrections: 18
        },
        anomalies: []
    },
    {
        id: 'c3',
        name: 'Barcelona - Diagonal',
        roleMix: '75% Venta / 25% Logística',
        headcount: 60,
        revenue: 'Tier A+',
        similarity: 100,
        stats: {
            totalAbsence: 4.8,
            noShowRate: 0.4,
            partialRate: 0.8,
            overtime: 5,
            turnover: 1.1,
            manualCorrections: 12
        },
        anomalies: []
    },
    {
        id: 'c4',
        name: 'Barcelona - Rambla',
        roleMix: '70% Venta / 30% Logística',
        headcount: 65,
        revenue: 'Tier A+',
        similarity: 95,
        stats: {
            totalAbsence: 6.9,
            noShowRate: 1.2,
            partialRate: 1.9,
            overtime: 11,
            turnover: 2.8,
            manualCorrections: 38
        },
        anomalies: ['Desconexión operativa nocturna']
    },
    {
        id: 'c5',
        name: 'Sevilla - Nervión',
        roleMix: '80% Venta / 20% Logística',
        headcount: 40,
        revenue: 'Tier A',
        similarity: 100,
        stats: {
            totalAbsence: 5.3,
            noShowRate: 0.5,
            partialRate: 1.1,
            overtime: 7,
            turnover: 1.5,
            manualCorrections: 18
        },
        anomalies: []
    },
    {
        id: 'c6',
        name: 'Cádiz - El Puerto',
        roleMix: '78% Venta / 22% Logística',
        headcount: 38,
        revenue: 'Tier A',
        similarity: 92,
        stats: {
            totalAbsence: 7.1,
            noShowRate: 1.4,
            partialRate: 2.0,
            overtime: 13,
            turnover: 3.1,
            manualCorrections: 42
        },
        anomalies: ['Clima laboral deteriorado']
    },
    {
        id: 'c7',
        name: 'Valencia - Bonaire',
        roleMix: '82% Venta / 18% Logística',
        headcount: 48,
        revenue: 'Tier A',
        similarity: 91,
        stats: {
            totalAbsence: 5.1,
            noShowRate: 0.6,
            partialRate: 0.9,
            overtime: 6,
            turnover: 1.4,
            manualCorrections: 15
        },
        anomalies: []
    },
    {
        id: 'c8',
        name: 'Alicante - Maisonnave',
        roleMix: '83% Venta / 17% Logística',
        headcount: 45,
        revenue: 'Tier A',
        similarity: 89,
        stats: {
            totalAbsence: 5.5,
            noShowRate: 0.7,
            partialRate: 1.2,
            overtime: 8,
            turnover: 1.8,
            manualCorrections: 22
        },
        anomalies: []
    }
];

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

export default function PredictionMirrorCenters({ onLaunchAutomation }: { onLaunchAutomation?: (finding: any) => void }) {
    const [searchScope, setSearchScope] = useState<'GLOBAL' | 'CENTER'>('GLOBAL');
    const [centerA, setCenterA] = useState<MirrorCenter | null>(null);
    const [selectedMirrorIds, setSelectedMirrorIds] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasResults, setHasResults] = useState(false);
    const [showCenterSelector, setShowCenterSelector] = useState(false);

    // Initial focus centers logic for the selector
    const FOCUSABLE_CENTERS = MOCK_CENTERS.filter((_, i) => [0, 2, 4].includes(i)); // Serrano, Diagonal, Sevilla

    const activeCenter = centerA || MOCK_CENTERS[0];
    const selectedMirrors = MOCK_CENTERS.filter(c => selectedMirrorIds.includes(c.id));

    const getDiff = (valA: number, valB: number, isBadHigher: boolean = true) => {
        const diff = valA - valB;
        const pct = valB !== 0 ? ((diff / valB) * 100).toFixed(0) : "0";
        const isBetter = isBadHigher ? diff < 0 : diff > 0;
        return { diff, pct, isBetter };
    };

    const metrics = [
        { label: 'Absentismo Total', key: 'totalAbsence', suffix: '%', isBadHigher: true },
        { label: 'Tasa No-show', key: 'noShowRate', suffix: '%', isBadHigher: true },
        { label: 'Absentismo Parcial', key: 'partialRate', suffix: '%', isBadHigher: true },
        { label: 'Horas Extra / Emp', key: 'overtime', suffix: 'h', isBadHigher: true },
        { label: 'Rotación Voluntaria', key: 'turnover', suffix: '%', isBadHigher: true },
        { label: 'Correcciones Manuales', key: 'manualCorrections', suffix: '', isBadHigher: true },
    ];

    const handleSearch = () => {
        setIsSearching(true);
        setHasResults(false);
        setSelectedMirrorIds([]);
        setTimeout(() => {
            setIsSearching(false);
            setHasResults(true);
            if (searchScope === 'CENTER' && centerA) {
                // Return specific pairing for focus search
                if (centerA.id === 'c1') setSelectedMirrorIds(['c2', 'c7', 'c8']); // Serrano -> Lista, Valencia, Alicante
                else if (centerA.id === 'c3') setSelectedMirrorIds(['c4', 'c2']); // Diagonal -> Rambla, Lista
                else if (centerA.id === 'c5') setSelectedMirrorIds(['c6', 'c8']); // Sevilla -> Cádiz, Alicante
            } else {
                // In global mode, return 8 mirrors (or as many as we have)
                setSelectedMirrorIds(MOCK_CENTERS.map(c => c.id));
            }
        }, 1500);
    };

    const selectFocusCenter = (center: MirrorCenter) => {
        setCenterA(center);
        setSearchScope('CENTER');
        setHasResults(false);
        setSelectedMirrorIds([]);
        setShowCenterSelector(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Scope Selection & Header */}
            <div className="bg-white rounded-[40px] border border-zinc-100 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Globe size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-6 w-6 rounded-lg bg-violet-100/50 flex items-center justify-center text-violet-600">
                            <Sparkles size={12} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">Motor de Descubrimiento Espejo</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-light text-zinc-900 tracking-tight leading-none">Calibración de Red</h2>
                            <p className="text-zinc-500 text-sm font-medium max-w-xl">
                                Identificamos anomalías operativas comparando unidades con similar ADN estructural.
                                Puedes analizar toda la compañía o enfocar el estudio en un centro concreto.
                            </p>

                            <div className="flex p-1.5 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                                <button
                                    onClick={() => { setSearchScope('GLOBAL'); setCenterA(null); setHasResults(false); }}
                                    className={cn(
                                        "h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                        searchScope === 'GLOBAL' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <Globe size={14} />
                                    Toda la Compañía
                                </button>
                                <button
                                    onClick={() => setSearchScope('CENTER')}
                                    className={cn(
                                        "h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                        searchScope === 'CENTER' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <MapPin size={14} />
                                    Por Unidad
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {searchScope === 'CENTER' && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowCenterSelector(!showCenterSelector)}
                                        className="h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl hover:border-violet-200 transition-all text-left flex items-center gap-4"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                                            <Building2 size={16} />
                                        </div>
                                        <div className="min-w-[140px]">
                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Unidad en Foco</div>
                                            <div className="text-sm font-semibold text-zinc-900 flex items-center justify-between">
                                                {centerA?.name || 'Seleccionar...'}
                                                <ChevronDown size={14} className={cn("ml-2 transition-transform duration-300", showCenterSelector && "rotate-180")} />
                                            </div>
                                        </div>
                                    </button>

                                    {showCenterSelector && (
                                        <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[28px] border border-zinc-100 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                                            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                                {FOCUSABLE_CENTERS.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => selectFocusCenter(c)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-3.5 rounded-xl transition-all",
                                                            c.id === centerA?.id ? "bg-violet-50 text-violet-700 font-bold" : "hover:bg-zinc-50 text-zinc-600 text-sm font-medium"
                                                        )}
                                                    >
                                                        {c.name}
                                                        {c.id === centerA?.id && <CheckCircle2 size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSearch}
                                disabled={isSearching || (searchScope === 'CENTER' && !centerA)}
                                className="h-14 px-8 rounded-2xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-40"
                            >
                                {isSearching ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {searchScope === 'GLOBAL' ? 'Escaneando Red...' : 'Analizando Unidad...'}
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        {searchScope === 'GLOBAL' ? 'Buscar Desviaciones Globales' : 'Encontrar Espejos'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {hasResults && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
                    {/* Key Findings Layer */}
                    <div className="bg-emerald-50/20 rounded-[40px] border border-emerald-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-emerald-600">
                            <Sparkles size={160} />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-14 w-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <Brain size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-light text-zinc-900 tracking-tight">Anomalías Detectadas</h3>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    {searchScope === 'GLOBAL' ? 'Ranking de Desviaciones de Red' : `Estudio Comparativo: ${centerA?.name}`}
                                </p>
                            </div>
                        </div>

                        {searchScope === 'CENTER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {selectedMirrors.map(c => (
                                    <div key={c.id} className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm transition-all hover:bg-emerald-50/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                                <Building2 size={16} />
                                            </div>
                                            <div className="text-xl font-light text-emerald-600 tracking-tighter">{c.similarity}%</div>
                                        </div>
                                        <div className="text-xs font-bold text-zinc-900">{c.name}</div>
                                        <div className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">Afinidad Espejo</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            {(searchScope === 'GLOBAL' ? MOCK_MIRROR_FINDINGS : MOCK_MIRROR_FINDINGS.slice(0, 2)).map(find => (
                                <div key={find.id} className="p-7 bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-emerald-300 transition-all group">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100/50">Anomaly</span>
                                            <h5 className="text-md font-bold text-zinc-900 tracking-tight">{find.findingType}</h5>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                            Se detecta una desviación de <span className="text-rose-600 font-bold">{find.deltaMetrics}</span> respecto a su clúster de referencia.
                                            Factores probables: <span className="text-zinc-800 font-semibold">{find.suspectedOperationalDrivers.join(', ')}</span>.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onLaunchAutomation?.(find)}
                                        className="h-12 px-6 rounded-2xl bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                    >
                                        <Zap size={14} /> Crear Automatismo
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Comparison Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Comparison Units Tabs */}
                        <div className="lg:col-span-12">
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-2 whitespace-nowrap">Red Analizada (Top Espejos):</span>
                                {selectedMirrors.map(center => (
                                    <div
                                        key={center.id}
                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-violet-100 text-violet-700 shadow-sm whitespace-nowrap text-xs font-bold"
                                    >
                                        <div className="h-5 w-5 rounded-lg bg-violet-50 flex items-center justify-center text-[9px]">
                                            {center.similarity}%
                                        </div>
                                        {center.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Benchmark Card */}
                        <div className="lg:col-span-4">
                            <div className="p-8 bg-white rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                    <MapPin size={80} />
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-light text-zinc-900 tracking-tighter">{activeCenter.name}</h4>
                                        <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded uppercase tracking-widest">
                                            {searchScope === 'GLOBAL' ? 'Benchmark Red' : 'Unidad en Foco'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-0 flex-1">
                                    {metrics.map((m, i) => {
                                        const val = (activeCenter.stats as any)[m.key];
                                        return (
                                            <div key={i} className="flex justify-between items-center py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 rounded-xl px-2 transition-all">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">{m.label}</span>
                                                <span className="text-lg font-light text-zinc-900 font-mono">{val}{m.suffix}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Comparisons */}
                        <div className="lg:col-span-8 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                            {selectedMirrors.filter(m => m.id !== activeCenter.id).map((center) => (
                                <div key={center.id} className="min-w-[360px] bg-zinc-50 rounded-[40px] border border-zinc-100 p-8 flex flex-col hover:border-violet-200 transition-all">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-[20px] bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">{center.name}</h4>
                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">{center.similarity}% Similarity</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Mix: {center.roleMix}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 lg:max-h-[380px] lg:overflow-y-auto pr-1">
                                        {metrics.map((m, i) => {
                                            const valA = (activeCenter.stats as any)[m.key];
                                            const valB = (center.stats as any)[m.key];
                                            const { pct, isBetter } = getDiff(valA, valB, m.isBadHigher);

                                            return (
                                                <div key={i} className="bg-white rounded-2xl p-5 flex justify-between items-center border border-zinc-200/50 group hover:shadow-sm transition-all">
                                                    <div>
                                                        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{m.label}</div>
                                                        <div className="text-xl font-light text-zinc-900 font-mono">
                                                            {valB}{m.suffix}
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black border",
                                                        isBetter ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                    )}>
                                                        {isBetter ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                                        {pct}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
