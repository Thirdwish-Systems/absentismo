import React, { useState, useEffect } from 'react';
import { Fingerprint, Users, AlertTriangle, ArrowRight, MapPin, ChevronRight, Activity, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionCopilot from './PredictionCopilot';

// --- MOCK DATA ---
interface Pattern {
    id: string;
    name: string;
    description: string;
    impactLevel: 'high' | 'medium' | 'low';
    employeesAffected: number;
    centersCount: number;
    riskDistribution: { critical: number; high: number; safe: number };
}

interface CenterRisk {
    id: string;
    name: string;
    province: string;
    riskScore: number; // 0-100
    level: 'critical' | 'high' | 'safe';
    employees: number;
}

interface Employee {
    id: string;
    name: string;
    position: string;
    isCriticalPosition: boolean;
    seniority: string;
    lastAbsence: string;
    riskFactor: string;
}

const mockPatterns: Pattern[] = [
    { id: 'fatiga', name: 'Fatiga Acumulada', description: 'Bajas recurrentes tras periodos de horas extra >20%', impactLevel: 'high', employeesAffected: 145, centersCount: 12, riskDistribution: { critical: 4, high: 6, safe: 2 } },
    { id: 'bradford', name: 'Bradford Agrupado', description: 'Micro-absentismo coordinado en mismos turnos', impactLevel: 'high', employeesAffected: 89, centersCount: 8, riskDistribution: { critical: 3, high: 4, safe: 1 } },
    { id: 'clima', name: 'Clima Laboral Negativo', description: 'Correlación entre encuestas pulso bajas y repuntes de IT', impactLevel: 'medium', employeesAffected: 210, centersCount: 18, riskDistribution: { critical: 2, high: 8, safe: 8 } },
    { id: 'lunes', name: 'Patrón Lunes/Viernes', description: 'Absentismo actitudinal anclado a fines de semana', impactLevel: 'medium', employeesAffected: 320, centersCount: 25, riskDistribution: { critical: 5, high: 10, safe: 10 } },
    { id: 'epidemia', name: 'Epidemia Local', description: 'Contagio viral rápido en espacios cerrados sin ventilación', impactLevel: 'high', employeesAffected: 65, centersCount: 4, riskDistribution: { critical: 4, high: 0, safe: 0 } },
    { id: 'burnout', name: 'Burnout Temprano', description: 'Bajas en empleados con antigüedad < 6 meses', impactLevel: 'medium', employeesAffected: 45, centersCount: 6, riskDistribution: { critical: 1, high: 3, safe: 2 } },
];

const mockCenters: Record<string, CenterRisk[]> = {
    'fatiga': [
        { id: 'c1', name: 'Madrid - Alcorcón', province: 'Madrid', riskScore: 92, level: 'critical', employees: 45 },
        { id: 'c2', name: 'Valencia - Puerto', province: 'Valencia', riskScore: 88, level: 'critical', employees: 32 },
        { id: 'c3', name: 'Sevilla - Nervión', province: 'Sevilla', riskScore: 75, level: 'high', employees: 28 },
        { id: 'c4', name: 'Bilbao - Centro', province: 'Vizcaya', riskScore: 70, level: 'high', employees: 22 },
        { id: 'c5', name: 'Málaga - Costa', province: 'Málaga', riskScore: 45, level: 'safe', employees: 18 },
    ],
    // Fallback for others
    'default': [
        { id: 'c10', name: 'Barcelona - Diagonal', province: 'Barcelona', riskScore: 85, level: 'critical', employees: 60 },
        { id: 'c11', name: 'Madrid - Sol', province: 'Madrid', riskScore: 65, level: 'high', employees: 40 },
        { id: 'c12', name: 'Zaragoza - Delicias', province: 'Zaragoza', riskScore: 30, level: 'safe', employees: 25 },
    ]
};

const mockEmployees: Employee[] = [
    { id: 'emp1', name: 'García, Alberto', position: 'Operario Especialista', isCriticalPosition: true, seniority: '4 años', lastAbsence: 'Hace 12 días', riskFactor: 'Fatiga Acumulada' },
    { id: 'emp2', name: 'Martínez, Elena', position: 'Suministrador Linea', isCriticalPosition: false, seniority: '3 años', lastAbsence: 'Hace 5 días', riskFactor: 'Turnos Rotativos' },
    { id: 'emp3', name: 'Rodríguez, Juan', position: 'Jefe de Equipo', isCriticalPosition: true, seniority: '5 años', lastAbsence: 'Ninguna', riskFactor: 'Estrés' },
    { id: 'emp4', name: 'López, Sara', position: 'Operador Logístico', isCriticalPosition: false, seniority: '3.5 años', lastAbsence: 'Hace 20 días', riskFactor: 'Bradford Alto' },
    { id: 'emp5', name: 'Sánchez, Pedro', position: 'Mantenedor Senior', isCriticalPosition: true, seniority: '4.2 años', lastAbsence: 'Hace 3 días', riskFactor: 'Fatiga Acumulada' },
    { id: 'emp6', name: 'Díaz, Carmen', position: 'Administrativo', isCriticalPosition: false, seniority: '3.8 años', lastAbsence: 'Ninguna', riskFactor: 'Clima Laboral' },
];

const EmployeeModal = ({ isOpen, onClose, patternName }: { isOpen: boolean, onClose: () => void, patternName: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">Empleados Afectados</h3>
                            <p className="text-xs text-zinc-500 font-medium">{patternName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-4 h-4 text-zinc-400 rotate-90" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Nombre</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Puesto</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Antigüedad</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Última Baja</th>
                                <th className="pb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Factor de Riesgo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {mockEmployees.map(emp => (
                                <tr key={emp.id} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 text-sm font-semibold text-zinc-900">{emp.name}</td>
                                    <td className={`py-4 text-sm font-medium ${emp.isCriticalPosition ? 'text-rose-600' : 'text-zinc-600'}`}>
                                        {emp.position} {emp.isCriticalPosition && <span className="ml-1 text-[10px] bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-tighter font-bold">Crítico</span>}
                                    </td>
                                    <td className="py-4 text-sm text-zinc-500">{emp.seniority}</td>
                                    <td className="py-4 text-sm text-zinc-500">{emp.lastAbsence}</td>
                                    <td className="py-4">
                                        <span className="text-[11px] px-2 py-1 rounded-full bg-violet-50 text-violet-700 font-bold border border-violet-100">
                                            {emp.riskFactor}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTS ---

// LEVEL 0: PATTERN DASHBOARD
const PatternDashboard = ({ onSelect }: { onSelect: (p: Pattern) => void }) => {
    const getPercentages = (dist: { critical: number; high: number; safe: number }) => {
        const total = dist.critical + dist.high + dist.safe;
        return {
            critical: Math.round((dist.critical / total) * 100),
            high: Math.round((dist.high / total) * 100),
            safe: Math.round((dist.safe / total) * 100)
        };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPatterns.map(p => {
                const pct = getPercentages(p.riskDistribution);
                return (
                    <div
                        key={p.id}
                        onClick={() => onSelect(p)}
                        className="group bg-white rounded-[24px] p-6 border border-zinc-200 hover:border-violet-200 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Fingerprint className="w-24 h-24 text-violet-600" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.impactLevel === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                    }`}>
                                    Impacto {p.impactLevel === 'high' ? 'Alto' : 'Medio'}
                                </span>
                            </div>

                            <h3 className="text-zinc-900 font-bold text-lg mb-2 group-hover:text-violet-700 transition-colors">{p.name}</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed mb-6 min-h-[40px]">{p.description}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400 font-medium">Centros Afectados</span>
                                    <span className="text-zinc-900 font-bold text-sm">{p.centersCount}</span>
                                </div>

                                {/* Distribution Bar */}
                                <div className="h-2 w-full rounded-full flex overflow-hidden">
                                    <div style={{ flex: p.riskDistribution.critical }} className="bg-rose-500"></div>
                                    <div style={{ flex: p.riskDistribution.high }} className="bg-orange-400"></div>
                                    <div style={{ flex: p.riskDistribution.safe }} className="bg-emerald-400"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-zinc-400 font-semibold uppercase tracking-tight">
                                    <span className="text-rose-600">Crítico {pct.critical}%</span>
                                    <span className="text-orange-600">Alto {pct.high}%</span>
                                    <span className="text-emerald-600">Bajo {pct.safe}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// LEVEL 1: CENTER DISTRIBUTION VIEW
const CenterDistribution = ({ pattern, onBack, onSelectCenter }: { pattern: Pattern, onBack: () => void, onSelectCenter: (c: CenterRisk) => void }) => {
    const centers = mockCenters[pattern.id] || mockCenters['default']; // Fallback mock

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a Patrones
            </button>

            <div className="bg-white rounded-[32px] p-8 border border-zinc-200">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
                        <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">{pattern.name}</h2>
                        <p className="text-zinc-500 text-sm">Distribución de riesgo por centro</p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {centers.map(center => (
                        <div
                            key={center.id}
                            onClick={() => onSelectCenter(center)}
                            className={`
                                p-5 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative overflow-hidden
                                ${center.level === 'critical' ? 'bg-rose-50 border-rose-200 hover:border-rose-300' :
                                    center.level === 'high' ? 'bg-orange-50 border-orange-200 hover:border-orange-300' :
                                        'bg-emerald-50 border-emerald-200 hover:border-emerald-300'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${center.level === 'critical' ? 'bg-white text-rose-700 border-rose-100' :
                                    center.level === 'high' ? 'bg-white text-orange-700 border-orange-100' :
                                        'bg-white text-emerald-700 border-emerald-100'
                                    }`}>
                                    Riesgo {center.level === 'critical' ? 'Crítico' : center.level === 'high' ? 'Alto' : 'Bajo'}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                                </div>
                            </div>

                            <h4 className="text-zinc-900 font-bold text-lg leading-tight mb-1">{center.name}</h4>
                            <p className="text-zinc-500 text-xs font-medium mb-4 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {center.province}
                            </p>

                            <div className="flex items-end gap-2">
                                <span className={`text-3xl font-bold ${center.level === 'critical' ? 'text-rose-600' :
                                    center.level === 'high' ? 'text-orange-600' :
                                        'text-emerald-600'
                                    }`}>{center.riskScore}</span>
                                <span className="text-xs text-zinc-400 font-medium mb-2">/ 100 Intensidad</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// LEVEL 2: PATTERN DETAIL VIEW (Specific Center)
const PatternDetail = ({ pattern, center, onBack }: { pattern: Pattern, center: CenterRisk, onBack: () => void }) => {
    const [showEmployees, setShowEmployees] = useState(false);

    // Mock chart data
    const data = [
        { name: 'S1', val: 20 }, { name: 'S2', val: 35 }, { name: 'S3', val: 50 },
        { name: 'S4', val: 85 }, { name: 'S5', val: 65 }, { name: 'S6', val: 90 }
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a Centros
            </button>

            <div className="bg-white rounded-[32px] p-8 border border-zinc-200 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl ${center.level === 'critical' ? 'bg-rose-500' : 'bg-orange-500'
                    }`}></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-zinc-400">{center.name}</span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-lg font-bold text-violet-600">{pattern.name}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Análisis Profundo del Patrón</h1>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div
                                onClick={() => setShowEmployees(true)}
                                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all group"
                            >
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 group-hover:text-violet-500">Empleados Afectados</div>
                                <div className="text-2xl font-bold text-zinc-900 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        {center.employees} <span className="text-xs font-normal text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">+15% vs media</span>
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-violet-500 transition-colors" />
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Coste Estimado Mes</div>
                                <div className="text-2xl font-bold text-zinc-900">4.500€</div>
                            </div>
                        </div>

                        <div className="h-[200px] w-full bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Intensidad del patrón (Últimas 6 semanas)</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900">Factores Coincidentes</h3>
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-900 text-sm">
                            <strong>Turnos Rotativos:</strong> El 80% de los afectados cambió de turno la semana previa a la baja.
                        </div>
                        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-violet-900 text-sm">
                            <strong>Antigüedad:</strong> Afecta principalmente al tramo de 3-5 años de antigüedad.
                        </div>
                    </div>
                </div>
            </div>

            <EmployeeModal
                isOpen={showEmployees}
                onClose={() => setShowEmployees(false)}
                patternName={pattern.name}
            />
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

interface PatternManagementViewProps {
    initialPatternId?: string | null;
    onClearSelection?: () => void;
}

export default function PatternManagementView({ initialPatternId, onClearSelection }: PatternManagementViewProps) {
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
    const [selectedCenter, setSelectedCenter] = useState<CenterRisk | null>(null);

    // Initial load handler
    useEffect(() => {
        if (initialPatternId) {
            const pattern = mockPatterns.find(p => p.name === initialPatternId || p.id === initialPatternId);
            if (pattern) setSelectedPattern(pattern);
        }
    }, [initialPatternId]);

    // Back handlers
    const handleBackToDashboard = () => {
        setSelectedPattern(null);
        setSelectedCenter(null);
        if (onClearSelection) onClearSelection();
    };

    const handleBackToCenters = () => {
        setSelectedCenter(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

            {/* LEFT COLUMN: Main Content */}
            <div className="min-w-0">
                {!selectedPattern ? (
                    <PatternDashboard onSelect={setSelectedPattern} />
                ) : !selectedCenter ? (
                    <CenterDistribution
                        pattern={selectedPattern}
                        onBack={handleBackToDashboard}
                        onSelectCenter={setSelectedCenter}
                    />
                ) : (
                    <PatternDetail
                        pattern={selectedPattern}
                        center={selectedCenter}
                        onBack={handleBackToCenters}
                    />
                )}
            </div>

            {/* RIGHT COLUMN: Sidebar Copilot */}
            <div className="hidden lg:block">
                <PredictionCopilot mode={selectedCenter ? 'detail' : 'general'} />
            </div>

        </div>
    );
}
