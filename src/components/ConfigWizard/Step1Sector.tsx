import React from 'react';
import { Factory, ShoppingBag, Utensils, Hotel, Headphones, Check, Briefcase } from 'lucide-react';
import { useConfig, SECTORS } from '../../stores/configStore';

const SECTOR_ICONS: Record<string, any> = {
    industrial: Factory,
    retail: ShoppingBag,
    restauracion: Utensils,
    hotelero: Hotel,
    callcenter: Headphones,
    consultoria: Briefcase,
};

export default function Step1Sector() {
    const { config, applySectorDefaults } = useConfig();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">¿En qué sector compites?</h3>
                <p className="text-zinc-500 text-sm">
                    Personalizaremos las métricas, algoritmos y benchmarks según las necesidades específicas de tu industria.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTORS.map((s) => {
                    const Icon = SECTOR_ICONS[s.value] || Factory;
                    const isSelected = config.company.sector === s.value;

                    return (
                        <button
                            key={s.value}
                            onClick={() => applySectorDefaults(s.value)}
                            className={`relative flex flex-col items-center p-6 rounded-[32px] border-2 transition-all duration-300 ${isSelected
                                ? 'border-violet-600 bg-violet-50/50 shadow-xl shadow-violet-100 ring-4 ring-violet-50'
                                : 'border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-lg'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 h-6 w-6 bg-violet-600 rounded-full flex items-center justify-center text-white animate-in zoom-in scale-110">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                            )}

                            <div className={`h-16 w-16 rounded-2xl mb-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                <Icon className="h-8 w-8" />
                            </div>

                            <span className={`font-bold text-center ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                {s.label}
                            </span>

                            {s.value !== 'retail' && s.value !== 'industrial' && (
                                <span className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    Próximamente
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {config.company.sector && (
                <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center animate-in slide-in-from-bottom-4 shadow-sm">
                    <p className="text-sm text-zinc-500 font-medium">
                        Has seleccionado <span className="text-zinc-900 font-bold">{SECTORS.find(s => s.value === config.company.sector)?.label}</span>.
                        {config.company.sector === 'retail' && ' Motor de IA especializado en Retail activado.'}
                        {config.company.sector === 'industrial' && ' Configuración técnica para Plantas y Factorías activada.'}
                        {!['retail', 'industrial'].includes(config.company.sector) && ' Usando configuración estándar de absentismo.'}
                    </p>
                </div>
            )}
        </div>
    );
}
