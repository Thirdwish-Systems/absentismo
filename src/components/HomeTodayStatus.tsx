import React, { useState, useMemo } from 'react';
import {
    Users, AlertCircle, MapPin, ChevronRight, UserCircle2,
    ShieldAlert, ShieldCheck, TrendingUp, Search, X
} from 'lucide-react';
import { useConfig } from '../stores/configStore';
import { fmtPct } from '../utils/formatters';

interface Leave {
    id: string;
    name: string;
    position: string;
    store: string;
    startDate: string;
    isCritical: boolean;
}

const MOCK_LEAVES: Leave[] = [
    { id: 'l1', name: 'Ana Martínez', position: 'Encargado', store: 'Tienda Gran Vía', startDate: '2026-01-25', isCritical: true },
    { id: 'l2', name: 'Carlos Ruiz', position: 'Mozo especializado', store: 'Almacén Logístico', startDate: '2026-01-20', isCritical: true },
    { id: 'l3', name: 'Lucía Sanz', position: 'Vendedor', store: 'Tienda Gran Vía', startDate: '2026-01-28', isCritical: false },
    { id: 'l4', name: 'Roberto Gómez', position: 'Vendedor', store: 'Tienda Diagonal', startDate: '2026-01-29', isCritical: false },
    { id: 'l5', name: 'Elena Polo', position: 'Segundo Encargado', store: 'Tienda Diagonal', startDate: '2026-01-22', isCritical: true },
];

export default function HomeTodayStatus() {
    const { config } = useConfig();
    const [showList, setShowList] = useState(false);

    const storeRisks = useMemo(() => {
        // Mocking some risk logic based on current config
        // In a real app, this would compare active leaves vs commercialBreakdownThreshold
        return config.structure.flatMap(p => p.stores.map(s => {
            const leavesInStore = MOCK_LEAVES.filter(l => l.store === s.name).length;
            const threshold = s.commercialBreakdownThreshold || 10; // Default 10%
            const leaveRate = (leavesInStore / s.employees) * 100;

            let risk: 'none' | 'medium' | 'critical' = 'none';
            if (leaveRate >= threshold) risk = 'critical';
            else if (leaveRate >= threshold * 0.7) risk = 'medium';

            return { ...s, leaveRate, risk };
        }));
    }, [config.structure]);

    const criticalStores = storeRisks.filter(s => s.risk === 'critical');
    const mediumStores = storeRisks.filter(s => s.risk === 'medium');
    const criticalLeaves = MOCK_LEAVES.filter(l => l.isCritical).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* ACTIVE LEAVES SUMMARY */}
            <div className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm flex flex-col justify-between group hover:border-violet-100 transition-all cursor-pointer" onClick={() => setShowList(true)}>
                <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-all">
                        <Users className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Impacto hoy</div>
                    <div className="text-4xl font-light text-zinc-900 tracking-tighter mb-2">
                        {MOCK_LEAVES.length} <span className="text-xl font-medium text-zinc-300">bajas activas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold uppercase tracking-widest">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {criticalLeaves} Críticos
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Pulsa para ver detalle</div>
                    </div>
                </div>
            </div>

            {/* STORE RISK SUMMARY */}
            <div className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Riesgo rotura comercial</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100">
                        <div className="text-2xl font-light text-rose-600 tracking-tight">{criticalStores.length}</div>
                        <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest">Riesgo Crítico</div>
                    </div>
                    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100">
                        <div className="text-2xl font-light text-amber-600 tracking-tight">{mediumStores.length}</div>
                        <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Riesgo Medio</div>
                    </div>
                </div>

                {criticalStores.length > 0 && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 px-4 py-2 rounded-xl">
                        <ShieldAlert className="h-4 w-4 text-rose-500" />
                        <span>Tiendas con cobertura de plantilla debajo del umbral de seguridad.</span>
                    </div>
                )}
            </div>

            {/* LEAVES LIST MODAL (Drill down) */}
            {showList && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-light text-zinc-900 tracking-tight">Personal en baja activa</h3>
                                    <p className="text-xs text-zinc-500">Listado de incidencias registradas a fecha de hoy</p>
                                </div>
                            </div>
                            <button onClick={() => setShowList(false)} className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-sm">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="divide-y divide-zinc-50">
                                {MOCK_LEAVES.map(l => (
                                    <div key={l.id} className={`p-6 flex items-center justify-between hover:bg-zinc-50/30 transition-colors ${l.isCritical ? 'bg-amber-50/20' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-light ${l.isCritical ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                                {l.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-zinc-900">{l.name}</span>
                                                    {l.isCritical && (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[8px] font-bold uppercase tracking-widest border border-rose-100">Crítico</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-zinc-500 font-medium">{l.position} · {l.store}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Desde</div>
                                            <div className="text-xs font-bold text-zinc-600">{l.startDate}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50/80 border-t border-zinc-100 flex justify-end">
                            <button
                                onClick={() => setShowList(false)}
                                className="h-12 px-8 rounded-2xl bg-white border border-zinc-200 text-xs font-bold text-zinc-900 shadow-sm hover:bg-zinc-50 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
