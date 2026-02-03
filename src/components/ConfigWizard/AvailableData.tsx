import React, { useState, useMemo } from 'react';
import {
    Database, CheckCircle2, AlertCircle, XCircle,
    Info, Layers, Users, Zap, Search, ArrowRight,
    Sparkles, Filter, ChevronDown, ChevronRight,
    Link, Calendar, CreditCard, ShieldCheck,
    Cpu, Globe, Settings, ExternalLink,
    FileText, Activity, Clock, ShoppingCart,
    TrendingUp, BarChart3, Briefcase, FileJson, Brain
} from 'lucide-react';
import { useCopilotStore } from '../../stores/copilotStore';
import { analyzeAvailableData } from './copilot/intelligence';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Dictionary
// ─────────────────────────────────────────────────────────────────────────────

type DataStatus = 'captured' | 'partial' | 'missing';
type DataLevel = 'Empresa' | 'Centro' | 'Colectivo' | 'Empleado' | 'Turno' | 'Periodo' | 'Episodio' | 'Segmento' | 'Regla' | 'Tarifa' | 'Evento' | 'KPI' | 'Predicción' | 'Escenario' | 'Catálogo';
type DataSource = 'HCM' | 'Payroll' | 'Time' | 'Scheduling' | 'ERP' | 'ETT' | 'Manual' | 'IA';
type DataImpact = 'Bloqueante' | 'Alto' | 'Medio' | 'Bajo';

interface CanonicalField {
    id: string;
    label: string;
    technical_name: string;
    type: string;
    status: DataStatus;
    level: DataLevel;
    required: boolean;
    source: DataSource;
    impact: DataImpact;
    description: string;
    mapping?: {
        system: string;
        entity: string;
        field: string;
    };
    lastSync?: string;
    coverage?: number;
}

interface DataBlock {
    id: string;
    title: string;
    icon: any;
    fields: CanonicalField[];
}

const CANONICAL_DICTIONARY: DataBlock[] = [
    {
        id: 'company',
        title: 'Empresa & Gobernanza',
        icon: Globe,
        fields: [
            { id: 'c1', label: 'ID Empresa', technical_name: 'company_id', type: 'string', status: 'captured', level: 'Empresa', required: true, source: 'ERP', impact: 'Bloqueante', description: 'ID interno canónico único.', mapping: { system: 'SAP S/4HANA', entity: 'T001', field: 'BUKRS' }, lastSync: 'Hoy, 08:30', coverage: 100 },
            { id: 'c2', label: 'Razón Social', technical_name: 'legal_name', type: 'string', status: 'captured', level: 'Empresa', required: true, source: 'ERP', impact: 'Bloqueante', description: 'Nombre legal de la entidad.', lastSync: 'Hoy, 08:30', coverage: 100 },
            { id: 'c3', label: 'CIF/NIF', technical_name: 'tax_id', type: 'string', status: 'captured', level: 'Empresa', required: true, source: 'ERP', impact: 'Alto', description: 'Identificador fiscal absoluto.', lastSync: 'Hoy, 08:30', coverage: 100 },
            { id: 'c4', label: 'Moneda Contable', technical_name: 'currency', type: 'enum', status: 'missing', level: 'Empresa', required: true, source: 'ERP', impact: 'Bloqueante', description: 'Divisa base para consolidación de costes.' },
            { id: 'c5', label: 'CNAE Principal', technical_name: 'cnae_primary', type: 'string', status: 'captured', level: 'Empresa', required: true, source: 'Payroll', impact: 'Alto', description: 'Código de actividad para cálculo de AT/EP.' },
            { id: 'c6', label: 'Cierre de Nómina', technical_name: 'payroll_cutoff_rule', type: 'json', status: 'missing', level: 'Empresa', required: true, source: 'Manual', impact: 'Alto', description: 'Define la fecha de corte para imputación de absentismos al mes siguiente.' }
        ]
    },
    {
        id: 'work_center',
        title: 'Centros de Trabajo (Nivel 1)',
        icon: MapPinIcon,
        fields: [
            { id: 'wc1', label: 'ID Centro', technical_name: 'center_id', type: 'string', status: 'captured', level: 'Centro', required: true, source: 'HCM', impact: 'Bloqueante', description: 'ID canónico del centro o tienda.' },
            { id: 'wc2', label: 'Provincia / CCAA', technical_name: 'province', type: 'string', status: 'captured', level: 'Centro', required: true, source: 'HCM', impact: 'Medio', description: 'Ubicación para festivos y mutuas.' },
            { id: 'wc3', label: 'Código CCC', technical_name: 'ccc', type: 'string', status: 'captured', level: 'Centro', required: true, source: 'Payroll', impact: 'Bloqueante', description: 'Código Cuenta Cotización para costes SS.' },
            { id: 'wc4', label: 'Mutua', technical_name: 'mutua_name', type: 'string', status: 'missing', level: 'Centro', required: true, source: 'Payroll', impact: 'Alto', description: 'Entidad colaboradora para gestión de IT.' }
        ]
    },
    {
        id: 'employee',
        title: 'Maestro de Empleados (Nivel 1)',
        icon: Users,
        fields: [
            { id: 'e1', label: 'ID Empleado', technical_name: 'employee_id', type: 'string', status: 'captured', level: 'Empleado', required: true, source: 'HCM', impact: 'Bloqueante', description: 'ID único anonimizado.' },
            { id: 'e2', label: 'Categoría Profesional', technical_name: 'job_category', type: 'string', status: 'captured', level: 'Empleado', required: true, source: 'HCM', impact: 'Alto', description: 'Afecta a tablas de convenio y mínimos.' },
            { id: 'e3', label: 'Grupo Cotización', technical_name: 'ss_group', type: 'string', status: 'captured', level: 'Empleado', required: true, source: 'Payroll', impact: 'Alto', description: 'Bases máximas y mínimas de cotización.' },
            { id: 'e4', label: 'Fecha de Alta', technical_name: 'hire_date', type: 'date', status: 'captured', level: 'Empleado', required: true, source: 'HCM', impact: 'Bloqueante', description: 'Inicio de relación laboral.' },
            { id: 'e5', label: 'Antigüedad Real', technical_name: 'seniority_date', type: 'date', status: 'partial', level: 'Empleado', required: false, source: 'HCM', impact: 'Medio', description: 'Fecha para trienios/complementos.', coverage: 82 }
        ]
    },
    {
        id: 'absence_episode',
        title: 'Gestión de Ausencias (Nivel 1)',
        icon: FileText,
        fields: [
            { id: 'ae1', label: 'Fecha Inicio', technical_name: 'start_dt', type: 'datetime', status: 'captured', level: 'Episodio', required: true, source: 'Time', impact: 'Bloqueante', description: 'Momento exacto del comienzo.' },
            { id: 'ae2', label: 'Contingencia', technical_name: 'contingency', type: 'enum', status: 'captured', level: 'Episodio', required: true, source: 'Payroll', impact: 'Bloqueante', description: 'Clave: CC (común) o CP (profesional).' },
            { id: 'ae3', label: 'Es Recaída', technical_name: 'is_relapse', type: 'bool', status: 'partial', level: 'Episodio', required: false, source: 'Payroll', impact: 'Medio', description: 'Indica si es continuación de baja anterior.' },
            { id: 'ae4', label: 'ID Episodio Origen', technical_name: 'relapse_of_id', type: 'string', status: 'missing', level: 'Episodio', required: false, source: 'Payroll', impact: 'Medio', description: 'Vincula recaídas para agotar tramos.' }
        ]
    },
    {
        id: 'coverage_policy',
        title: 'Sustituciones & Cobertura (Nivel 2)',
        icon: Briefcase,
        fields: [
            { id: 'cp1', label: 'Política de Sustitución', technical_name: 'coverage_required', type: 'bool', status: 'missing', level: 'Regla', required: true, source: 'Manual', impact: 'Bloqueante', description: '¿Se debe cubrir este puesto en caso de baja?' },
            { id: 'cp2', label: 'Prioridad de Cobertura', technical_name: 'coverage_priority', type: 'json', status: 'missing', level: 'Regla', required: false, source: 'Manual', impact: 'Medio', description: 'Orden: Horas Extra -> ETT -> Bolsa Interna.' },
            { id: 'cp3', label: 'Tarifa Hora Extra', technical_name: 'overtime_rate', type: 'decimal', status: 'partial', level: 'Tarifa', required: true, source: 'Manual', impact: 'Alto', description: 'Coste por hora adicional de personal propio.' },
            { id: 'cp4', label: 'Tarifa ETT (Fee incl.)', technical_name: 'ett_rate', type: 'decimal', status: 'missing', level: 'Tarifa', required: true, source: 'Manual', impact: 'Alto', description: 'Coste por hora de personal externo.' }
        ]
    },
    {
        id: 'coverage_events',
        title: 'Eventos de Cobertura Real (Nivel 2)',
        icon: Clock,
        fields: [
            { id: 'ce1', label: 'Horas Cubiertas', technical_name: 'hours_covered', type: 'decimal', status: 'missing', level: 'Evento', required: false, source: 'Scheduling', impact: 'Medio', description: 'Horas reales que fueron sustituidas.' },
            { id: 'ce2', label: 'Coste Sustituto', technical_name: 'coverage_cost', type: 'decimal', status: 'missing', level: 'Evento', required: false, source: 'Payroll', impact: 'Bajo', description: 'Impacto económico real del sustituto.' }
        ]
    },
    {
        id: 'business_kpi',
        title: 'Impacto en Negocio (Nivel 3)',
        icon: TrendingUp,
        fields: [
            { id: 'bk1', label: 'Ventas / Producción', technical_name: 'kpi_value', type: 'decimal', status: 'missing', level: 'KPI', required: true, source: 'ERP', impact: 'Bloqueante', description: 'Output por centro para calcular productividad.' },
            { id: 'bk2', label: 'Margen de Contribución', technical_name: 'contribution_margin', type: 'decimal', status: 'missing', level: 'KPI', required: true, source: 'Manual', impact: 'Alto', description: '% de beneficio sobre ventas (Margen Operativo).' },
            { id: 'bk3', label: 'Costo por Hora de Output', technical_name: 'kpi_value_per_hour', type: 'decimal', status: 'missing', level: 'KPI', required: false, source: 'Manual', impact: 'Medio', description: 'Valor económico de una hora de trabajo efectiva.' }
        ]
    },
    {
        id: 'predictive',
        title: 'Predicción & Riesgo',
        icon: Cpu,
        fields: [
            { id: 'p1', label: 'Probabilidad Riesgo', technical_name: 'probability', type: 'decimal', status: 'captured', level: 'Predicción', required: true, source: 'IA', impact: 'Bloqueante', description: 'Score 0-1 de probabilidad de ausencia.' },
            { id: 'p2', label: 'Drivers de Riesgo', technical_name: 'explainability_tags', type: 'json', status: 'captured', level: 'Predicción', required: false, source: 'IA', impact: 'Medio', description: 'Factores que explican el riesgo.' }
        ]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function MapPinIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

const HealthCard = ({ label, score, icon: Icon, color }: { label: string, score: number, icon: any, color: string }) => (
    <div className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className={`h-9 w-9 rounded-2xl ${color} flex items-center justify-center text-white`}>
                <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-light text-zinc-900 tracking-tighter">{score}%</div>
        </div>
        <div>
            <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</div>
            <div className="mt-3 w-full h-0.5 bg-zinc-50 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${color.replace('bg-', 'bg-opacity-100 bg-')}`} style={{ width: `${score}%`, backgroundColor: 'currentColor' }} />
            </div>
        </div>
    </div>
);

const Badge = ({ status }: { status: DataStatus }) => {
    switch (status) {
        case 'captured': return <div className="h-5 w-5 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-500"><CheckCircle2 size={11} strokeWidth={1.5} /></div>;
        case 'partial': return <div className="h-5 w-5 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500"><AlertCircle size={11} strokeWidth={1.5} /></div>;
        case 'missing': return <div className="h-5 w-5 rounded-full bg-rose-500/5 flex items-center justify-center text-rose-500"><XCircle size={11} strokeWidth={1.5} /></div>;
    }
};

const ImpactBadge = ({ impact }: { impact: DataImpact }) => {
    const colors = {
        'Bloqueante': 'bg-zinc-900 text-white border-zinc-900',
        'Alto': 'bg-rose-50/50 text-rose-500 border-rose-100/50',
        'Medio': 'bg-amber-50/50 text-amber-500 border-amber-100/50',
        'Bajo': 'bg-zinc-50/50 text-zinc-300 border-zinc-100/50'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-tight border ${colors[impact]}`}>
            {impact}
        </span>
    );
};

export default function AvailableData() {
    const { openCopilot, updateCompleteness } = useCopilotStore();
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<DataStatus | 'all'>('all');
    const [dictionary, setDictionary] = useState(CANONICAL_DICTIONARY);

    React.useEffect(() => {
        const analysis = analyzeAvailableData({ dictionary });
        updateCompleteness('available-data', analysis);
    }, [dictionary, updateCompleteness]);

    const filteredBlocks = useMemo(() => {
        return dictionary.map(block => ({
            ...block,
            fields: block.fields.filter(f => {
                const matchesSearch = f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.technical_name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
                return matchesSearch && matchesStatus;
            })
        })).filter(block => block.fields.length > 0);
    }, [dictionary, searchQuery, filterStatus]);

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                        <Database size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium text-zinc-900 tracking-tight">Diccionario de Integración</h2>
                        <p className="text-[11px] text-zinc-400 font-normal tracking-tight">Catalogo canónico para auditoría de exactitud financiera.</p>
                    </div>
                </div>
                <button
                    onClick={() => openCopilot('available-data')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all active:scale-95"
                >
                    <Brain size={14} strokeWidth={2} />
                    Asistente IA
                </button>
            </div>

            {/* Health Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                <HealthCard label="Coste Directo" score={85} icon={CreditCard} color="bg-zinc-900" />
                <HealthCard label="Coste Total" score={62} icon={ShieldCheck} color="bg-violet-500" />
                <HealthCard label="Impacto P&L" score={40} icon={Activity} color="bg-emerald-500" />
                <HealthCard label="Previsión IA" score={78} icon={Cpu} color="bg-blue-500" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-zinc-50/50 rounded-3xl border border-zinc-100/50 mx-2">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar campo o technical_name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 bg-white rounded-2xl border border-zinc-100/60 pl-10 pr-4 text-xs font-normal outline-none focus:border-zinc-200 transition-all placeholder:text-zinc-300"
                    />
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-white rounded-2xl border border-zinc-100/60">
                    {(['all', 'captured', 'partial', 'missing'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`h-8 px-4 rounded-xl text-[9px] font-semibold uppercase tracking-wider transition-all ${filterStatus === s
                                ? 'bg-zinc-900 text-white shadow-sm'
                                : 'bg-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            {s === 'all' ? 'Ver Todos' : s === 'captured' ? 'OK' : s === 'partial' ? 'Parcial' : 'Faltante'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-4 px-2">
                {filteredBlocks.map((block) => (
                    <div key={block.id} className="group/block">
                        <button
                            onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
                            className={`w-full flex items-center justify-between p-5 rounded-[28px] border transition-all text-left ${selectedBlock === block.id
                                ? 'bg-white border-zinc-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
                                : 'bg-zinc-50/30 border-zinc-100/60 hover:bg-white hover:border-zinc-200'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedBlock === block.id
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white border border-zinc-100 text-zinc-300'
                                    }`}>
                                    <block.icon size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-medium text-zinc-900 tracking-tight">{block.title}</h3>
                                    <div className="flex items-center gap-2.5 mt-0.5">
                                        <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-tight">{block.fields.length} campos analizados</span>
                                        <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                        <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-tight">
                                            {Math.round((block.fields.filter(f => f.status === 'captured').length / block.fields.length) * 100)}% Completitud
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={`transition-transform duration-500 ${selectedBlock === block.id ? 'rotate-180 text-zinc-900' : 'text-zinc-200'}`}>
                                <ChevronDown size={18} strokeWidth={1.5} />
                            </div>
                        </button>

                        {(selectedBlock === block.id || searchQuery !== '') && (
                            <div className="mt-3 px-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="bg-white rounded-[28px] border border-zinc-100/60 shadow-sm divide-y divide-zinc-50 overflow-hidden">
                                    {block.fields.map((field) => (
                                        <div key={field.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50/50 transition-all group/field">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1"><Badge status={field.status} /></div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-xs font-medium text-zinc-800 tracking-tight">{field.label}</span>
                                                        <ImpactBadge impact={field.impact} />
                                                        {field.required && <div className="h-1 w-1 rounded-full bg-zinc-300" title="Obligatorio" />}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-[9px] font-mono text-zinc-300 bg-zinc-50 px-1 py-0.5 rounded leading-none">{field.technical_name}</code>
                                                        <span className="text-[9px] text-zinc-300 font-normal uppercase tracking-tighter">{field.level} · {field.type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-10">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-semibold text-zinc-300 uppercase tracking-widest">Fuente</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${field.source === 'Manual' ? 'text-amber-500/80' :
                                                            field.source === 'IA' ? 'text-blue-500/80' : 'text-zinc-400'
                                                            }`}>
                                                            {field.source}
                                                        </span>
                                                    </div>
                                                    {field.lastSync && (
                                                        <span className="text-[8px] text-zinc-200 font-normal">Sync: {field.lastSync}</span>
                                                    )}
                                                </div>

                                                <button className="h-8 w-8 rounded-full border border-zinc-100 bg-white flex items-center justify-center text-zinc-200 hover:text-zinc-600 hover:border-zinc-200 transition-all opacity-0 group-hover/field:opacity-100">
                                                    <Settings size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Audit Quality Insight */}
            <div className="mx-2 p-10 rounded-[40px] bg-zinc-900 relative overflow-hidden border border-zinc-800 shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2.5 mb-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-[0.3em]">Estado de Certificación</span>
                        </div>
                        <h4 className="text-2xl font-light text-white tracking-tight leading-tight mb-5">
                            Motor operando al <span className="text-emerald-400/80 font-normal">94%</span> de fiabilidad financiera.
                        </h4>
                        <p className="text-zinc-500 text-xs font-normal leading-relaxed">
                            Analizadas 14 fuentes canónicas. Faltan <span className="text-zinc-300">6 campos bloqueantes</span> para alcanzar la certificación "Audit-Ready" de costes estructurales.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2.5 w-full md:w-auto">
                        <button className="h-11 px-8 rounded-2xl bg-white text-zinc-900 text-[10px] font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5">
                            <ExternalLink size={13} /> Solicitar Integración
                        </button>
                        <button className="h-11 px-8 rounded-2xl bg-zinc-800/80 backdrop-blur-sm text-zinc-400 text-[10px] font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center justify-center gap-2.5">
                            <FileText size={13} /> Descargar Auditoría
                        </button>
                    </div>
                </div>
            </div>

            {/* Checklist Level Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-zinc-100/60 mx-2">
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={11} /></div>
                        <h5 className="text-[10px] font-semibold text-zinc-900 uppercase tracking-wider">Nivel 1: Coste Directo</h5>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-normal leading-relaxed">Certifica el impacto en nómina bruta y cuotas de seguridad social básicas.</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><Clock size={11} /></div>
                        <h5 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Nivel 2: Coste Total</h5>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-normal leading-relaxed">Incluye costes de cobertura (ETT, HE). Falta política de sustitución definida.</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200"><XCircle size={11} /></div>
                        <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Nivel 3: Impacto P&L</h5>
                    </div>
                    <p className="text-[10px] text-zinc-300/60 font-normal leading-relaxed italic">Requiere integración de KPIs de negocio (Ventas o Producción).</p>
                </div>
            </div>
        </div>
    );
}
