import React from 'react';
import { RefreshCcw, Info } from 'lucide-react';
import { useConfig } from '../../stores/configStore';

function Input({ label, tooltip, unit, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    tooltip?: string;
    unit?: string;
}) {
    return (
        <label className="flex flex-col gap-1.5 p-4 rounded-2xl border border-zinc-100 bg-white/50 hover:bg-white hover:border-zinc-200 transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
                {tooltip && (
                    <span className="group relative">
                        <Info className="h-3.5 w-3.5 text-zinc-300 hover:text-zinc-900 transition-colors" />
                        <span className="absolute left-0 top-full mt-2 z-[150] w-56 rounded-xl border border-zinc-200 bg-zinc-900 px-3 py-2 text-[10px] text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                            {tooltip}
                        </span>
                    </span>
                )}
            </div>
            <div className="relative">
                <input
                    {...props}
                    className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-bold text-zinc-900 shadow-sm outline-none focus:border-zinc-300 transition-all placeholder:text-zinc-300"
                />
                {unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-300 uppercase">{unit}</span>
                )}
            </div>
        </label>
    );
}

export default function Step5Substitutions() {
    const { config, updateSubstitution } = useConfig();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-5 p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 mb-8">
                <div className="h-14 w-14 rounded-[1.25rem] bg-white border border-zinc-100 flex items-center justify-center shadow-sm flex-shrink-0 text-zinc-900">
                    <RefreshCcw className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-1.5">Políticas de Sustitución</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Define los parámetros económicos que se aplican automáticamente cuando una ausencia requiere cobertura externa o interna.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Input
                    label="Coste hora extra/temporal"
                    type="number"
                    min={0}
                    step={0.5}
                    value={config.substitution.costDirect}
                    onChange={(e) => updateSubstitution({ costDirect: Math.max(0, parseFloat(e.target.value) || 0) })}
                    tooltip="Coste adicional por hora de trabajo de sustituto o extra"
                    unit="€/h"
                />
                <Input
                    label="Onboarding / Formación"
                    type="number"
                    min={0}
                    step={50}
                    value={config.substitution.costFormacion}
                    onChange={(e) => updateSubstitution({ costFormacion: Math.max(0, parseFloat(e.target.value) || 0) })}
                    tooltip="Coste estimado por persona de incorporar un sustituto (EPIs, claves, formación básica)."
                    unit="€"
                />
                <Input
                    label="Pérdida productividad"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={config.substitution.costQuality}
                    onChange={(e) => updateSubstitution({ costQuality: Math.max(0, parseFloat(e.target.value) || 0) })}
                    tooltip="% de eficiencia que se pierde con un sustituto vs un titular."
                    unit="%"
                />
            </div>

            <div className="p-8 rounded-[32px] border border-zinc-100 bg-zinc-50/50">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Nota sobre el cálculo</div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                    Estos valores se sincronizan con el módulo de Negocio y el bloque de Oportunidad de Payroll para determinar el impacto financiero total.
                </p>
            </div>
        </div>
    );
}
