import React from 'react';
import { ArrowLeft, BarChart2, Calendar, Clock, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Risk } from './RiskManagementView';

// Mock Data for KPI Charts
const historicalBradford = [
    { month: 'Sep', value: 120 },
    { month: 'Oct', value: 145 },
    { month: 'Nov', value: 280 }, // Escalation
    { month: 'Dec', value: 85 },  // Drop
    { month: 'Jan', value: 320 }, // Spike
    { month: 'Feb', value: 450 }, // Current Peak
];

const durationDist = [
    { range: '1-3 días', count: 45, color: '#e4e4e7' },
    { range: '4-15 días', count: 22, color: '#fb923c' },
    { range: '+15 días', count: 8, color: '#f43f5e' },
];

interface RiskKPIDetailViewProps {
    risk: Risk;
    onBack: () => void;
}

export default function RiskKPIDetailView({ risk, onBack }: RiskKPIDetailViewProps) {
    return (
        <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al detalle del riesgo
                </button>
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-full">
                    <Activity className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold text-zinc-700">Modo Análisis Profundo</span>
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-zinc-200 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">Desglose de KPIs: {risk.location}</h1>
                    <p className="text-zinc-500 text-sm">Análisis factorial del patrón <strong className="text-violet-600">{risk.pattern}</strong> detectado.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* KPI Cards */}
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Índice Bradford (Medio)</div>
                            <div className="flex items-end justify-between">
                                <div className="text-3xl font-bold text-zinc-900">450</div>
                                <div className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg">
                                    <TrendingUp className="w-3 h-3" /> +42% vs mes ant.
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Frecuencia Media</div>
                            <div className="flex items-end justify-between">
                                <div className="text-3xl font-bold text-zinc-900">3.2</div>
                                <span className="text-xs text-zinc-500">bajas / empleado / año</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Duración Media</div>
                            <div className="flex items-end justify-between">
                                <div className="text-3xl font-bold text-zinc-900">4.5</div>
                                <span className="text-xs text-zinc-500">días / baja</span>
                            </div>
                        </div>
                    </div>

                    {/* Bradford Evolution Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-zinc-400" /> Evolución Índice Bradford (6 meses)
                        </h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historicalBradford}>
                                    <defs>
                                        <linearGradient id="colorBrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorBrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Duration Distribution */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Distribución por Duración</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={durationDist} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f4f4f5" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="range" type="category" width={80} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                        {durationDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Key Factors Analysis */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Factores de Riesgo Específicos</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                                <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-orange-800 uppercase">Patrón Lunes/Viernes</div>
                                    <p className="text-xs text-orange-700 mt-1">El 65% de las bajas cortas comienzan en lunes o viernes, sugiriendo absentismo actitudinal.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                                <AlertTriangle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-violet-800 uppercase">Micro-bajas recurrentes</div>
                                    <p className="text-xs text-violet-700 mt-1">Detectados 12 empleados con +4 bajas de 2 días en el último trimestre.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
