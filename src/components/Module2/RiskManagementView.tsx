import React, { useState } from 'react';
import { Filter, Calendar, MapPin, ChevronRight, AlertCircle, Clock, TrendingUp, Activity, User, Building2, Store } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RiskDetailView from './RiskDetailView';
import RiskKPIDetailView from './RiskKPIDetailView';
import PredictionCopilot from './PredictionCopilot';

// Mock Data for Chart
const tensionData = [
    { date: '1 Feb', tension: 25, prediccion: 30 },
    { date: '5 Feb', tension: 35, prediccion: 32 },
    { date: '10 Feb', tension: 28, prediccion: 45 },
    { date: '15 Feb', tension: 45, prediccion: 65 }, // Peak
    { date: '20 Feb', tension: 35, prediccion: 50 },
    { date: '25 Feb', tension: 30, prediccion: 40 },
    { date: '28 Feb', tension: 25, prediccion: 35 },
];

// Expanded Mock Data for Risks (12 items)
export interface Risk {
    id: string;
    location: string;
    department: string;
    riskScore: number;
    criticalDate: string;
    dominantFactor: string;
    probability: number;
    pattern: string;
    level: 'critical' | 'high' | 'low';
}

const mockRisks: Risk[] = [
    { id: 'r1', location: 'Madrid - Alcorcón', department: 'Línea de Caja', riskScore: 92, criticalDate: '15 Feb', dominantFactor: 'Fatiga Acumulada', probability: 88, pattern: 'Fatiga Acumulada', level: 'critical' },
    { id: 'r2', location: 'Barcelona - Diagonal', department: 'Logística', riskScore: 78, criticalDate: '22 Feb', dominantFactor: 'Bajas Encadenadas', probability: 72, pattern: 'Efecto Contagio', level: 'high' },
    { id: 'r3', location: 'Sevilla - Centro', department: 'Atención al Cliente', riskScore: 45, criticalDate: '10 Mar', dominantFactor: 'Estacionalidad', probability: 40, pattern: 'Micro-absentismo', level: 'low' },
    { id: 'r4', location: 'Valencia - Puerto', department: 'Operaciones', riskScore: 85, criticalDate: '18 Feb', dominantFactor: 'Conflictividad', probability: 82, pattern: 'Conflictividad', level: 'critical' },
    { id: 'r5', location: 'Bilbao - Gran Vía', department: 'Ventas', riskScore: 65, criticalDate: '01 Mar', dominantFactor: 'Sobrecarga', probability: 60, pattern: 'Burnout Temprano', level: 'high' },
    { id: 'r6', location: 'Madrid - Sol', department: 'Almacén', riskScore: 89, criticalDate: '14 Feb', dominantFactor: 'Epidemia Local', probability: 85, pattern: 'Epidemia Local', level: 'critical' },
    { id: 'r7', location: 'Málaga - Costa', department: 'Línea de Caja', riskScore: 30, criticalDate: '20 Mar', dominantFactor: 'Clima Laboral', probability: 25, pattern: 'Desmotivación', level: 'low' },
    { id: 'r8', location: 'Zaragoza - Delicias', department: 'Logística', riskScore: 72, criticalDate: '28 Feb', dominantFactor: 'Turnos Dobles', probability: 68, pattern: 'Fatiga Física', level: 'high' },
    { id: 'r9', location: 'Alicante - Centro', department: 'Atención al Cliente', riskScore: 95, criticalDate: '12 Feb', dominantFactor: 'Pico Demanda', probability: 92, pattern: 'Estrés Agudo', level: 'critical' },
    { id: 'r10', location: 'Murcia - Norte', department: 'Operaciones', riskScore: 55, criticalDate: '05 Mar', dominantFactor: 'Transporte', probability: 50, pattern: 'Retrasos Crónicos', level: 'low' },
    { id: 'r11', location: 'Vigo - Puerto', department: 'Mantenimiento', riskScore: 81, criticalDate: '19 Feb', dominantFactor: 'Accidentalidad', probability: 78, pattern: 'Riesgo Físico', level: 'critical' },
    { id: 'r12', location: 'Palma - Aeropuerto', department: 'Ventas', riskScore: 68, criticalDate: '25 Feb', dominantFactor: 'Aislamiento', probability: 62, pattern: 'Desconexión', level: 'high' },
];

interface RiskManagementViewProps {
    onNavigateToPattern?: (patternName: string) => void;
}

export default function RiskManagementView({ onNavigateToPattern }: RiskManagementViewProps) {
    const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
    const [showKPIs, setShowKPIs] = useState(false);

    // Filters State
    const [dateRange, setDateRange] = useState('next-30');
    const [department, setDepartment] = useState('all');
    const [store, setStore] = useState('all');

    if (showKPIs && selectedRisk) {
        return <RiskKPIDetailView risk={selectedRisk} onBack={() => setShowKPIs(false)} />;
    }

    if (selectedRisk) {
        return <RiskDetailView risk={selectedRisk} onBack={() => setSelectedRisk(null)} onShowKPIs={() => setShowKPIs(true)} />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

            {/* LEFT COLUMN: Main Content */}
            <div className="space-y-6 min-w-0">
                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-3 p-1 rounded-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 shadow-sm">
                        <Filter className="w-4 h-4 text-zinc-400" />
                        <span>Filtros:</span>
                    </div>

                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                        <option value="next-30">Próximos 30 días</option>
                        <option value="quarter">Este Trimestre</option>
                        <option value="year">Este Año</option>
                    </select>

                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                        <option value="all">Todos los Departamentos</option>
                        <option value="caja">Línea de Caja</option>
                        <option value="logistica">Logística</option>
                        <option value="ventas">Ventas</option>
                    </select>

                    <select
                        value={store}
                        onChange={(e) => setStore(e.target.value)}
                        className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                        <option value="all">Todas las tiendas</option>
                        <option value="madrid">Madrid</option>
                        <option value="bcn">Barcelona</option>
                        <option value="sevilla">Sevilla</option>
                    </select>
                </div>

                {/* Operational Tension Chart */}
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-violet-600" />
                                Tensión Operativa Proyectada
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Previsión de riesgo de rotura de servicio basado en absentismo proyectado</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                                <span className="text-zinc-600">Predicción Riesgo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                                <span className="text-zinc-600">Tensión Base</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tensionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="prediccion"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPred)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tension"
                                    stroke="#e4e4e7"
                                    strokeWidth={2}
                                    fill="transparent"
                                    strokeDasharray="4 4"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Risk Cards Scroll */}
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 px-2">Riesgos Identificados ({mockRisks.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-6 px-2">
                        {mockRisks.map((risk) => (
                            <div
                                key={risk.id}
                                onClick={() => setSelectedRisk(risk)}
                                className={`
                            p-5 rounded-[24px] border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
                            ${risk.level === 'critical' ? 'bg-rose-50 border-rose-100' :
                                        risk.level === 'high' ? 'bg-orange-50 border-orange-100' :
                                            'bg-zinc-50 border-zinc-200'}
                        `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`
                                px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                ${risk.level === 'critical' ? 'bg-rose-100 text-rose-700' :
                                            risk.level === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-zinc-200 text-zinc-600'}
                            `}>
                                        {risk.level === 'critical' ? 'Crítico' : risk.level === 'high' ? 'Alto' : 'Bajo'}
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-500">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs font-medium">{risk.criticalDate}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-zinc-900 font-bold text-lg leading-tight mb-1 truncate">{risk.location}</h4>
                                    <p className="text-zinc-500 text-xs font-medium flex items-center gap-1">
                                        <Store className="w-3 h-3" /> {risk.department}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 text-xs font-medium">Risk Score</span>
                                        <span className={`font-bold ${risk.level === 'critical' ? 'text-rose-600' : 'text-zinc-900'
                                            }`}>{risk.riskScore}/100</span>
                                    </div>

                                    <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${risk.level === 'critical' ? 'bg-rose-500' :
                                                risk.level === 'high' ? 'bg-orange-500' :
                                                    'bg-zinc-400'
                                                }`}
                                            style={{ width: `${risk.riskScore}%` }}
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-black/5 flex flex-col gap-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Probabilidad</span>
                                            <span className="font-semibold text-zinc-700">{risk.probability}%</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Factor</span>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onNavigateToPattern) onNavigateToPattern(risk.pattern);
                                                }}
                                                className="font-semibold text-violet-600 truncate max-w-[120px] text-right hover:underline hover:cursor-pointer"
                                            >
                                                {risk.pattern}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Copilot */}
            <div className="hidden lg:block">
                <PredictionCopilot mode="general" />
            </div>

        </div>
    );
}
