import React from 'react';
import { ArrowLeft, MapPin, Calendar, AlertTriangle, ShieldCheck, Euro, Zap, Brain, MessageSquare, ChevronRight, BarChart2 } from 'lucide-react';
import { Risk } from './RiskManagementView';
import PredictionCopilot from './PredictionCopilot';

interface RiskDetailViewProps {
    risk: Risk;
    onBack: () => void;
    onShowKPIs: () => void;
}

export default function RiskDetailView({ risk, onBack, onShowKPIs }: RiskDetailViewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 animate-in slide-in-from-right-4 duration-500">

            {/* LEFT COLUMN: Detail Content */}
            <div className="space-y-6 min-w-0">

                {/* Header Navigation */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Riesgos
                </button>

                {/* Main Header Card */}
                <div className="bg-white rounded-[32px] p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-8 opacity-[0.05] ${risk.level === 'critical' ? 'text-rose-600' : 'text-orange-600'
                        }`}>
                        <AlertTriangle className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${risk.level === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {risk.level === 'critical' ? 'Riesgo Crítico' : 'Riesgo Alto'}
                                    </span>
                                    <span className="text-zinc-400 text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Previsto: {risk.criticalDate}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-zinc-900 mb-2">{risk.location}</h1>
                                <div className="flex items-center gap-4 text-sm text-zinc-500">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {risk.department}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                    <span>Probabilidad de rotura: <strong className="text-zinc-900">{risk.probability}%</strong></span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-center min-w-[100px]">
                                    <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Risk Score</div>
                                    <div className={`text-3xl font-bold ${risk.level === 'critical' ? 'text-rose-600' : 'text-orange-600'
                                        }`}>{risk.riskScore}</div>
                                </div>
                                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-center min-w-[100px]">
                                    <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Fiabilidad IA</div>
                                    <div className="text-3xl font-bold text-violet-600">85%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Impact */}
                <div className="bg-white rounded-[32px] p-6 border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Euro className="w-5 h-5 text-emerald-600" /> Impacto Económico Proyectado
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-500 font-medium">Coste Inacción</span>
                                <span className="text-xl font-bold text-zinc-400 line-through decoration-rose-400 decoration-2">12.500€</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-500 font-medium">Coste con Solución</span>
                                <span className="text-2xl font-bold text-zinc-900">4.200€</span>
                            </div>
                            <div className="h-px bg-zinc-100 w-full my-4"></div>
                            <div className="flex justify-between items-end bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                <span className="text-sm text-emerald-700 font-bold uppercase">ROI Estimado</span>
                                <span className="text-xl font-bold text-emerald-600">+197%</span>
                            </div>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 text-sm leading-relaxed text-zinc-600">
                            <strong className="block text-zinc-900 mb-2">Análisis de Coste</strong>
                            El coste de inacción incluye horas extra proyectadas al +150% y pérdida de productividad estimada por fatiga del equipo restante. La solución propone redistribución sin nuevas contrataciones.
                        </div>
                    </div>
                </div>

                {/* AI Diagnosis */}
                <div className="bg-white rounded-[32px] p-6 border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-violet-600" /> Diagnóstico Exhaustivo
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Patrón Detectado</div>
                            <div className="bg-violet-50 text-violet-700 px-4 py-3 rounded-xl font-medium border border-violet-100 inline-block">
                                {risk.pattern}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Factores Contribuyentes</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Sobrecarga Turnos', 'Baja Supervisión', 'Pico Estacional'].map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                            <button
                                onClick={onShowKPIs}
                                className="flex items-center gap-2 text-violet-600 text-sm font-bold hover:underline hover:text-violet-700 transition-colors"
                            >
                                <BarChart2 className="w-4 h-4" />
                                Ver desglose de KPIs (Bradford, Frecuencia, Duración)
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: Sidebar Copilot (Context Aware) */}
            <div className="hidden lg:block">
                <PredictionCopilot mode="detail" riskContext={risk} />
            </div>

        </div>
    );
}
