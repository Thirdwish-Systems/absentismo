import React, { useState, useMemo } from 'react';
import {
    Calculator, Info, Euro, TrendingDown,
    Search, Zap, Bot, Upload, CheckCircle2,
    Download, Database, ShieldCheck, ArrowRight,
    TrendingUp
} from 'lucide-react';
import { useConfig, computeTotalAbsence, computeAnnualCost, computeGapVsSector } from '../../stores/configStore';
import {
    BlockFramework, BlockHeadcount, BlockAbsenceData,
    BlockPayrollDetails, BlockCoverageCost, BlockOpportunityCost,
    BlockPRLMutua, BlockAdditionalCosts, BlockTechnicalData,
    BlockMasterData, BlockCalendars, BlockPrediction
} from './PayrollCostBlocks';

// ─────────────────────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatEUR(n: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: Costs Configuration (Payroll Inputs)
// ─────────────────────────────────────────────────────────────────────────────

export default function Step5Costs() {
    const { config } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');

    const annualCost = computeAnnualCost(config);
    const gap = computeGapVsSector(config);
    const totalAbsence = computeTotalAbsence(config.absence);
    const potentialSaving = (gap > 0 && totalAbsence > 0) ? (gap / totalAbsence) * annualCost : 0;

    // Calculate overall average progress
    const overallProgress = 100; // Estado desbloqueado para demostración

    const isReadyToCalculate = overallProgress >= 70; // Threshold for minimum data

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* 1. Header & Global Status */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-lg shadow-zinc-100">
                        <Calculator className="h-6 w-6 text-white font-light" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-0.5">
                            <h3 className="text-xl font-light text-zinc-900 tracking-tight">Configuración de Costes</h3>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-widest ${isReadyToCalculate ? 'bg-emerald-50 text-emerald-500 border border-emerald-100/50' : 'bg-amber-50 text-amber-500 border border-amber-100/50'
                                }`}>
                                {isReadyToCalculate ? 'Verificado' : 'Pendiente'}
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-light tracking-wide">Parámetros de Payroll y ratios de sustitución para el motor de cálculo.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1.5 px-4 py-2 rounded-2xl bg-white border border-zinc-100/60 shadow-sm">
                        <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">Integración de Datos</span>
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-0.5 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                    className="h-full bg-zinc-900 transition-all duration-1000"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-light text-zinc-500">{overallProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Global Actions & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1.5 bg-zinc-50/40 rounded-[28px] border border-zinc-100/50">
                <div className="relative flex-1 max-w-md group ml-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar parámetros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 rounded-[20px] bg-white border border-zinc-100/60 pl-10 pr-4 text-[11px] font-light text-zinc-600 outline-none focus:border-zinc-200 transition-all placeholder:text-zinc-300 focus:shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 mr-1">
                    <button className="h-10 px-5 rounded-[20px] bg-white border border-zinc-100/60 flex items-center gap-2 text-[9px] font-medium text-zinc-500 uppercase tracking-wider hover:bg-zinc-50 hover:text-zinc-800 transition-all active:scale-95">
                        <Zap className="h-3 w-3 text-emerald-400/80" /> Conectar APIs
                    </button>
                    <button className="h-10 px-5 rounded-[20px] bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-[9px] font-medium text-white uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-95 shadow-sm">
                        <Bot className="h-3 w-3 text-violet-300/80" /> Copiloto IA
                    </button>
                    <div className="w-px h-6 bg-zinc-200/50 mx-1 hidden sm:block" />
                    <button className="h-10 w-10 rounded-[20px] bg-white border border-zinc-100/60 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all active:scale-95">
                        <Download className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>


            {/* 3. Main Accordion Blocks */}
            <div className="space-y-4">
                <BlockMasterData />
                <BlockCalendars />
                <BlockPrediction />
                <div className="h-px bg-zinc-100 my-8 mx-4" />
                <BlockFramework />
                <BlockHeadcount />
                <BlockAbsenceData />
                <BlockPayrollDetails />
                <BlockCoverageCost />
                <BlockOpportunityCost />
                <BlockPRLMutua />
                <BlockAdditionalCosts />
                <BlockTechnicalData />
            </div>

            {/* 4. Impact Preview (Stickied or Footer) */}
            <div className="mt-12 rounded-[40px] bg-zinc-900 p-10 shadow-3xl shadow-zinc-200 relative overflow-hidden border border-zinc-800">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 text-zinc-500 mb-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                            <span className="text-[9px] font-medium uppercase tracking-[0.2em]">Motor de Precisión Financiera</span>
                        </div>
                        <h4 className="text-2xl font-light text-white tracking-tight mb-4 leading-tight">
                            Exactitud del <span className="text-violet-300 font-medium">{overallProgress}%</span> en la proyección de impacto.
                        </h4>
                        <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                            Basado en los inputs configurados, el motor estima un coste anual aproximado de <span className="text-zinc-200">{formatEUR(annualCost)}</span>.
                            Integra los bloques técnicos para eliminar el margen de error residual.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                            <div className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" /> Estado Auditoría
                            </div>
                            <div className="text-lg font-light text-white mb-0.5 tracking-tight">Cálculo Certificado</div>
                            <div className="text-[9px] text-zinc-600 font-light italic">Normativa 2026/02</div>
                        </div>

                        <div className={`p-5 rounded-[24px] border backdrop-blur-md ${gap > 0 ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-white/[0.02] border-white/[0.05]'
                            }`}>
                            <div className={`text-[8px] font-medium uppercase tracking-widest mb-3 flex items-center gap-2 ${gap > 0 ? 'text-emerald-400/60' : 'text-zinc-500'
                                }`}>
                                <TrendingDown className="h-3 w-3" /> Ahorro Proyectado
                            </div>
                            <div className={`text-lg font-light mb-0.5 tracking-tight ${gap > 0 ? 'text-white' : 'text-zinc-500'}`}>
                                {gap > 0 ? formatEUR(potentialSaving) : 'Optimizado'}
                            </div>
                            <div className={`text-[9px] font-light italic ${gap > 0 ? 'text-emerald-500/40' : 'text-zinc-600'}`}>
                                {gap > 0 ? `vs Objetivo ${config.benchmark.sectorRate}%` : 'Nivel de eficiencia top'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
