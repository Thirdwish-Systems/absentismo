import React from 'react';
import { Activity, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useConfig, computeTotalAbsence, SECTORS } from '../../stores/configStore';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function RateInput({ label, value, onChange, color, tooltip }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    color: 'rose' | 'amber' | 'yellow' | 'orange';
    tooltip: string;
}) {
    const colorClasses = {
        rose: 'bg-rose-50 border-rose-200 focus:border-rose-300 focus:ring-rose-100',
        amber: 'bg-amber-50 border-amber-200 focus:border-amber-300 focus:ring-amber-100',
        yellow: 'bg-yellow-50 border-yellow-200 focus:border-yellow-300 focus:ring-yellow-100',
        orange: 'bg-orange-50 border-orange-200 focus:border-orange-300 focus:ring-orange-100',
    };

    const dotColors = {
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
        yellow: 'bg-yellow-500',
        orange: 'bg-orange-500',
    };

    return (
        <div className={`rounded-2xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColors[color]}`} />
                    <span className="text-sm font-semibold text-zinc-800">{label}</span>
                    <span className="group relative">
                        <Info className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl border border-zinc-200 bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltip}
                        </span>
                    </span>
                </div>
                <span className="text-lg font-bold text-zinc-900">{value.toFixed(1)}%</span>
            </div>
            <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Absence Rates
// ─────────────────────────────────────────────────────────────────────────────

export default function Step4Absence() {
    const { config, updateAbsence, updateBenchmark, getSectorDefaults } = useConfig();

    const totalAbsence = computeTotalAbsence(config.absence);
    const sectorDefaults = getSectorDefaults(config.company.sector);
    const gap = totalAbsence - config.benchmark.sectorRate;
    const sectorLabel = SECTORS.find(s => s.value === config.company.sector)?.label || 'Sector';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                        <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900">Tasas de absentismo</h3>
                        <p className="text-sm text-zinc-500">Configura las tasas actuales por tipo de ausencia</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-zinc-900">{totalAbsence.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500">tasa total</div>
                </div>
            </div>

            {/* Absence Rates */}
            <div className="grid gap-4 md:grid-cols-2">
                <RateInput
                    label="Accidentes de Trabajo (AT)"
                    value={config.absence.AT}
                    onChange={(v) => updateAbsence({ AT: v })}
                    color="rose"
                    tooltip="Incluye accidentes laborales y de trayecto (ATEP)"
                />
                <RateInput
                    label="IT Corta (< 15 días)"
                    value={config.absence.IT_CORTA}
                    onChange={(v) => updateAbsence({ IT_CORTA: v })}
                    color="amber"
                    tooltip="Bajas de corta duración por enfermedad común"
                />
                <RateInput
                    label="IT Media (15-60 días)"
                    value={config.absence.IT_MEDIA}
                    onChange={(v) => updateAbsence({ IT_MEDIA: v })}
                    color="yellow"
                    tooltip="Bajas de duración media por enfermedad o lesión"
                />
                <RateInput
                    label="IT Larga (> 60 días)"
                    value={config.absence.IT_LARGA}
                    onChange={(v) => updateAbsence({ IT_LARGA: v })}
                    color="orange"
                    tooltip="Bajas de larga duración y enfermedades crónicas"
                />
            </div>

            {/* Benchmark Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm font-semibold text-zinc-900">Benchmark del sector</div>
                        <div className="text-xs text-zinc-500">Tasa media de referencia para {sectorLabel}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.1}
                            value={config.benchmark.sectorRate}
                            onChange={(e) => updateBenchmark({ sectorRate: parseFloat(e.target.value) || 0 })}
                            className="w-20 h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-center text-sm font-bold outline-none focus:border-violet-300"
                        />
                        <span className="text-sm text-zinc-500">%</span>
                    </div>
                </div>

                {/* Gap Indicator */}
                <div className={`rounded-xl p-4 ${gap > 0 ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <div className="flex items-center gap-3">
                        {gap > 0 ? (
                            <TrendingUp className="h-5 w-5 text-rose-600" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-emerald-600" />
                        )}
                        <div>
                            <div className={`text-sm font-semibold ${gap > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                                {gap > 0 ? `+${gap.toFixed(1)}pp por encima del sector` : `${gap.toFixed(1)}pp por debajo del sector`}
                            </div>
                            <div className={`text-xs ${gap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {gap > 0
                                    ? 'Tu tasa de absentismo supera la media del sector'
                                    : 'Tu tasa de absentismo es mejor que la media del sector'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Bar */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-semibold text-zinc-500 mb-3">Distribución del absentismo total</div>
                <div className="h-4 rounded-full bg-zinc-200 overflow-hidden flex">
                    <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(config.absence.AT / totalAbsence) * 100}%` }}
                        title={`AT: ${config.absence.AT.toFixed(1)}%`}
                    />
                    <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(config.absence.IT_CORTA / totalAbsence) * 100}%` }}
                        title={`IT Corta: ${config.absence.IT_CORTA.toFixed(1)}%`}
                    />
                    <div
                        className="bg-yellow-500 h-full"
                        style={{ width: `${(config.absence.IT_MEDIA / totalAbsence) * 100}%` }}
                        title={`IT Media: ${config.absence.IT_MEDIA.toFixed(1)}%`}
                    />
                    <div
                        className="bg-orange-500 h-full"
                        style={{ width: `${(config.absence.IT_LARGA / totalAbsence) * 100}%` }}
                        title={`IT Larga: ${config.absence.IT_LARGA.toFixed(1)}%`}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> AT</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> IT Corta</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> IT Media</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> IT Larga</span>
                </div>
            </div>
        </div>
    );
}
