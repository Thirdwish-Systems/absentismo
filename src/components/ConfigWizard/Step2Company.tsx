import React from 'react';
import { Building2, Info, Zap } from 'lucide-react';
import { useConfig, SECTORS } from '../../stores/configStore';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Input({ label, tooltip, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; tooltip?: string }) {
    return (
        <label className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-600">{label}</span>
                {tooltip && (
                    <span className="group relative">
                        <Info className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border border-zinc-200 bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltip}
                        </span>
                    </span>
                )}
            </div>
            <input
                {...props}
                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
            />
        </label>
    );
}

function Select({ label, tooltip, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    tooltip?: string;
    options: { value: string; label: string }[]
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-600">{label}</span>
                {tooltip && (
                    <span className="group relative">
                        <Info className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border border-zinc-200 bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltip}
                        </span>
                    </span>
                )}
            </div>
            <select
                {...props}
                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all appearance-none cursor-pointer"
            >
                {options.map(o => {
                    const isDisabled = o.value !== 'retail' && o.value !== 'industrial';
                    return (
                        <option
                            key={o.value}
                            value={o.value}
                            disabled={isDisabled}
                            className={isDisabled ? 'text-zinc-400' : 'text-zinc-900'}
                        >
                            {o.label}{isDisabled ? ' (Coming soon)' : ''}
                        </option>
                    );
                })}
            </select>
        </label>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Company
// ─────────────────────────────────────────────────────────────────────────────

export default function Step2Company() {
    const { config, updateCompany, applySectorDefaults, getSectorDefaults, loadIndustrialDemo } = useConfig();

    const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sector = e.target.value;
        updateCompany({ sector });
        if (sector === 'industrial') {
            applySectorDefaults(sector);
            loadIndustrialDemo();
        }
    };

    const handleApplySectorDefaults = () => {
        applySectorDefaults(config.company.sector);
    };

    const sectorDefaults = getSectorDefaults(config.company.sector);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Form */}
            <div className="grid gap-6 md:grid-cols-2">
                <Input
                    label="Nombre de la empresa"
                    placeholder="Ej: ACME Retail España"
                    value={config.company.name}
                    onChange={(e) => updateCompany({ name: e.target.value })}
                    tooltip="El nombre aparecerá en todos los informes"
                />

                <Select
                    label="Sector principal"
                    value={config.company.sector}
                    onChange={handleSectorChange}
                    options={SECTORS}
                    tooltip="Usaremos benchmarks específicos de tu sector"
                />

                <Input
                    label="Código CNAE (opcional)"
                    placeholder="Ej: 4711"
                    value={config.company.cnae}
                    onChange={(e) => updateCompany({ cnae: e.target.value })}
                    tooltip="Para tarifas de AT/EP específicas"
                />

                <Input
                    label="Nº total de empleados"
                    type="number"
                    min={1}
                    placeholder="500"
                    value={config.company.employees}
                    onChange={(e) => updateCompany({ employees: Math.max(1, parseInt(e.target.value) || 1) })}
                    tooltip="Plantilla media en nómina"
                />
            </div>

            {/* Sector Suggestion - Rebranded to neutral */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-zinc-200 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-zinc-900">Configuración inteligente por sector</div>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                            Ajustamos los benchmarks según la media de <b>{SECTORS.find(s => s.value === config.company.sector)?.label}</b>.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleApplySectorDefaults}
                    className="h-10 px-6 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-all flex items-center justify-center shadow-sm"
                >
                    Aplicar recomendación
                </button>
            </div>
        </div>
    );
}
