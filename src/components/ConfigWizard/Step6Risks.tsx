import React, { useState } from 'react';
import { AlertTriangle, Calendar, Plus, Trash2, Info, Zap, Store as StoreIcon, ChevronRight, ShieldAlert, Users, Sparkles } from 'lucide-react';
import { useConfig, Campaign, RiskThresholds } from '../../stores/configStore';
import RiskSettingsSeasonal from './RiskSettingsSeasonal';
import RiskSettingsPersonal from './RiskSettingsPersonal';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function ThresholdSlider({ label, value, onChange, color, tooltip, icon: Icon }: {
    label: string,
    value: number,
    onChange: (v: number) => void,
    color: 'amber' | 'rose' | 'orange' | 'violet',
    tooltip: string,
    icon: any
}) {
    const colors = {
        amber: 'accent-amber-500 bg-amber-50 border-amber-200 text-amber-900',
        rose: 'accent-rose-500 bg-rose-50 border-rose-200 text-rose-900',
        orange: 'accent-orange-500 bg-orange-50 border-orange-200 text-orange-900',
        violet: 'accent-violet-500 bg-violet-50 border-violet-200 text-violet-900',
    };

    return (
        <div className={`rounded-2xl border p-4 ${colors[color].split(' ').slice(1).join(' ')}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-bold">{label}</span>
                    <span className="group relative">
                        <Info className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl border border-zinc-200 bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-normal">
                            {tooltip}
                        </span>
                    </span>
                </div>
                <span className="text-lg font-black">{value}%</span>
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={`w-full h-2 rounded-full appearance-none cursor-pointer ${colors[color].split(' ')[0]}`}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6: Risks & Campaigns
// ─────────────────────────────────────────────────────────────────────────────

export default function Step6Risks() {
    const { config, updateRisks, addCampaign, removeCampaign, updateStoreRisks, updateStoreThreshold, updateCriticals } = useConfig();
    const [selectedStore, setSelectedStore] = useState<{ regionId: string, storeId: string } | null>(null);
    const [newCamp, setNewCamp] = useState<Omit<Campaign, 'id'>>({
        name: '',
        startDate: '',
        endDate: '',
        type: 'sales'
    });

    const isRetail = config.company.sector === 'retail';

    const handleAddCampaign = () => {
        if (!newCamp.name || !newCamp.startDate || !newCamp.endDate) return;
        addCampaign(newCamp);
        setNewCamp({ name: '', startDate: '', endDate: '', type: 'sales' });
    };

    const currentStore = selectedStore
        ? config.structure.find(r => r.id === selectedStore.regionId)?.stores.find(s => s.id === selectedStore.storeId)
        : null;

    const currentRisks = currentStore?.risks || config.risks;

    const handleUpdate = (updates: Partial<RiskThresholds>) => {
        if (selectedStore) {
            updateStoreRisks(selectedStore.regionId, selectedStore.storeId, { ...currentRisks, ...updates });
        } else {
            updateRisks(updates);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header - Muted */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm">
                    <Zap className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Configuración de Riesgos</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-lg">
                        {isRetail ? 'Define umbrales globales o específicos por centro para las alarmas inteligentes.' : 'Establece los niveles de criticidad para las notificaciones de absentismo.'}
                    </p>
                </div>
            </div>

            {/* Store Selector (Retail Only) - Soft styling */}
            {isRetail && (
                <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner">
                    <button
                        onClick={() => setSelectedStore(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedStore ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        Configuración Global
                    </button>
                    {config.structure.flatMap(reg => reg.stores.map(store => (
                        <button
                            key={store.id}
                            onClick={() => setSelectedStore({ regionId: reg.id, storeId: store.id })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedStore?.storeId === store.id ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            <StoreIcon className="h-3.5 w-3.5" />
                            {store.name}
                            {store.risks && <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />}
                        </button>
                    )))}
                </div>
            )}

            {/* Thresholds Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {selectedStore ? 'Umbrales Específicos Tienda' : 'Ajustes de sensibilidad global'}
                    </div>
                    {selectedStore && (
                        <button
                            onClick={() => updateStoreRisks(selectedStore.regionId, selectedStore.storeId, undefined as any)}
                            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest border-b border-zinc-200"
                        >
                            Resetear a Global
                        </button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[32px] border border-zinc-100 bg-zinc-50/50 p-6 flex flex-col justify-between min-h-[160px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-zinc-500" />
                                <span className="text-sm font-bold text-zinc-900">Alerta de Riesgo</span>
                            </div>
                            <span className="text-2xl font-black text-zinc-900 tracking-tighter">{currentRisks.warning}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                            Probabilidad de absentismo que dispara el primer aviso preventivo.
                        </p>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={currentRisks.warning}
                            onChange={(e) => handleUpdate({ warning: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer mt-6 accent-zinc-500"
                        />
                    </div>

                    <div className="rounded-[32px] border border-zinc-100 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-zinc-900" />
                                <span className="text-sm font-bold text-zinc-900">Alerta Crítica</span>
                            </div>
                            <span className="text-2xl font-black text-zinc-900 tracking-tighter">{currentRisks.critical}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                            Nivel de riesgo donde la operación se considera comprometida.
                        </p>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={currentRisks.critical}
                            onChange={(e) => handleUpdate({ critical: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer mt-6 accent-zinc-500"
                        />
                    </div>

                    {selectedStore && (
                        <div className="rounded-[32px] border border-violet-100 bg-violet-50/50 p-6 flex flex-col justify-between min-h-[160px] md:col-span-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-violet-600" />
                                    <span className="text-sm font-bold text-violet-900">Umbral Rotura Comercial</span>
                                </div>
                                <span className="text-2xl font-black text-violet-700 tracking-tighter">{currentStore?.commercialBreakdownThreshold || 10}%</span>
                            </div>
                            <p className="text-[11px] text-violet-600/70 mt-2 leading-relaxed">
                                % máximo de bajas simultáneas permitido en este centro antes de declarar rotura comercial.
                            </p>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={currentStore?.commercialBreakdownThreshold || 10}
                                onChange={(e) => updateStoreThreshold(selectedStore.regionId, selectedStore.storeId, parseInt(e.target.value))}
                                className="w-full h-1.5 bg-violet-200 rounded-full appearance-none cursor-pointer mt-6 accent-violet-600"
                            />
                        </div>
                    )}
                </div>

                {/* Campaign Sensitivity - Rebranded */}
                <div className="rounded-[32px] border border-amber-100 bg-amber-50 p-8 text-amber-900 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-amber-200">
                                <Calendar className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-0.5">Sensibilidad en Campaña</div>
                                <div className="text-sm font-bold">Ajustes para periodos críticos</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl mb-8 border border-amber-100">
                            <Info className="h-4 w-4 text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-600 leading-relaxed italic">
                                "Recomendación: bajar umbrales un <span className="text-amber-900 font-bold">20-30%</span> durante campañas para asegurar la cobertura operativa bajo máxima presión."
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-amber-500">Umbral Preventivo</span>
                                    <span className="text-xl font-black text-amber-900">{currentRisks.campaignWarning}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={currentRisks.campaignWarning}
                                    onChange={(v) => handleUpdate({ campaignWarning: parseInt(v.target.value) })}
                                    className="w-full h-1.5 bg-amber-200 rounded-full appearance-none cursor-pointer accent-amber-600"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-amber-500">Umbral Crítico</span>
                                    <span className="text-xl font-black text-amber-900">{currentRisks.campaignCritical}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={currentRisks.campaignCritical}
                                    onChange={(v) => handleUpdate({ campaignCritical: parseInt(v.target.value) })}
                                    className="w-full h-1.5 bg-amber-200 rounded-full appearance-none cursor-pointer accent-amber-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEW: ADVANCED RISK BLOCKS */}
                {!selectedStore && (
                    <div className="grid grid-cols-1 gap-8 pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <RiskSettingsSeasonal />
                        <RiskSettingsPersonal />
                    </div>
                )}
            </div>

            {/* Campaigns CRUD - Neutralized */}
            {!selectedStore && (
                <div className="space-y-6 pt-8 border-t border-zinc-100">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Calendario Estratégico (Global)
                    </div>

                    {/* Add Campaign Form */}
                    <div className="grid gap-4 p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_auto] items-end">
                        <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Campaña</span>
                            <input
                                type="text"
                                placeholder="P. ej: Rebajas Verano"
                                value={newCamp.name}
                                onChange={e => setNewCamp({ ...newCamp, name: e.target.value })}
                                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 transition-all font-medium"
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Inicio</span>
                            <input
                                type="date"
                                value={newCamp.startDate}
                                onChange={e => setNewCamp({ ...newCamp, startDate: e.target.value })}
                                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 transition-all font-medium"
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Fin</span>
                            <input
                                type="date"
                                value={newCamp.endDate}
                                onChange={e => setNewCamp({ ...newCamp, endDate: e.target.value })}
                                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 transition-all font-medium"
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Tipo</span>
                            <select
                                value={newCamp.type}
                                onChange={e => setNewCamp({ ...newCamp, type: e.target.value as any })}
                                className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 transition-all font-medium cursor-pointer"
                            >
                                <option value="peak">Pico Demanda</option>
                                <option value="sales">Rebajas</option>
                                <option value="event">Evento</option>
                                <option value="holiday">Festivos</option>
                            </select>
                        </label>
                        <button
                            onClick={handleAddCampaign}
                            className="h-11 w-11 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                        >
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Campaign List */}
                    <div className="grid gap-3">
                        {config.campaigns.map(camp => (
                            <div key={camp.id} className="group flex items-center justify-between p-5 rounded-[28px] bg-white border border-zinc-100 hover:border-zinc-200 shadow-sm transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900">{camp.name}</div>
                                        <div className="text-[11px] text-zinc-400 font-medium tracking-tight mt-0.5">
                                            {camp.startDate} — {camp.endDate} <span className="mx-2 text-zinc-200">•</span> <span className="text-zinc-500">{camp.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeCampaign(camp.id)}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {config.campaigns.length === 0 && (
                            <div className="text-center py-12 rounded-[32px] border-2 border-dashed border-zinc-100 bg-zinc-50/50 text-zinc-400 text-sm italic">
                                No hay campañas estratégicas configuradas.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Critical Targets Configuration */}
            {!selectedStore && (
                <div className="space-y-6 pt-8 border-t border-zinc-100">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Objetivos y Personal Crítico
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Critical Positions */}
                        <div className="p-6 rounded-[32px] border border-zinc-100 bg-white shadow-sm">
                            <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-500" /> Puestos Críticos
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {config.criticalPositions.map(pos => (
                                    <span key={pos} className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-bold text-zinc-600 flex items-center gap-2">
                                        {pos}
                                        <button onClick={() => updateCriticals({ positions: config.criticalPositions.filter(p => p !== pos) })}>
                                            <Trash2 className="h-3 w-3 hover:text-rose-500" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="new-pos"
                                    type="text"
                                    placeholder="Añadir puesto..."
                                    className="flex-1 h-10 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-zinc-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                updateCriticals({ positions: [...config.criticalPositions, val] });
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Critical Workers */}
                        <div className="p-6 rounded-[32px] border border-zinc-100 bg-white shadow-sm">
                            <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Users className="h-4 w-4 text-violet-500" /> Personal Crítico
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {config.criticalWorkers.map(worker => (
                                    <span key={worker} className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-bold text-zinc-600 flex items-center gap-2">
                                        {worker}
                                        <button onClick={() => updateCriticals({ workers: config.criticalWorkers.filter(w => w !== worker) })}>
                                            <Trash2 className="h-3 w-3 hover:text-rose-500" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="new-worker"
                                    type="text"
                                    placeholder="Añadir empleado..."
                                    className="flex-1 h-10 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-zinc-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                updateCriticals({ workers: [...config.criticalWorkers, val] });
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
