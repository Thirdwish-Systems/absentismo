import React, { useState, useMemo } from 'react';
import {
    MapPin, Plus, Trash2, Store as StoreIcon,
    Building, Warehouse, X, Search,
    ChevronDown, ChevronRight, LayoutGrid, List,
    Upload, FileSpreadsheet, Zap, ShoppingBag, Sparkles,
    Wrench, Truck, Users, AlertCircle, CheckCircle2,
    Factory, FlaskConical, Construction, Settings,
    ArrowUpRight, MoreHorizontal
} from 'lucide-react';
import { useConfig, Store, FacilityType } from '../../stores/configStore';
import { fmtInt } from '../../utils/formatters';

// ─────────────────────────────────────────────────────────────────────────────
// Sector Taxonomies (Refined & Professional)
// ─────────────────────────────────────────────────────────────────────────────

const INDUSTRIAL_SITES: Record<FacilityType, { label: string; icon: any; color: string }> = {
    factory: { label: 'Planta', icon: Factory, color: 'text-blue-500' },
    shop_floor: { label: 'Taller', icon: Wrench, color: 'text-orange-500' },
    industrial_warehouse: { label: 'Almacén', icon: Warehouse, color: 'text-amber-500' },
    logistics_center: { label: 'Logística', icon: Truck, color: 'text-indigo-500' },
    technical_office: { label: 'Oficinas', icon: Building, color: 'text-zinc-500' },
    lab: { label: 'Laboratorio', icon: FlaskConical, color: 'text-emerald-500' },
    maintenance: { label: 'Mantenimiento', icon: Settings, color: 'text-rose-500' },
    utilities: { label: 'Energía', icon: Zap, color: 'text-yellow-500' },
    project: { label: 'Obra', icon: Construction, color: 'text-zinc-400' },
    subcontractor: { label: 'Externos', icon: Users, color: 'text-violet-500' },
} as any;

const RETAIL_SITES: Record<FacilityType, { label: string; icon: any; color: string }> = {
    store: { label: 'Tienda', icon: ShoppingBag, color: 'text-rose-500' },
    warehouse: { label: 'Almacén', icon: Truck, color: 'text-amber-500' },
    hq: { label: 'Oficinas', icon: Building, color: 'text-zinc-500' },
    darkstore: { label: 'Dark Store', icon: Zap, color: 'text-indigo-500' },
    workshop: { label: 'Taller SAT', icon: Wrench, color: 'text-orange-500' },
    callcenter: { label: 'Atención', icon: Settings, color: 'text-blue-500' },
    itinerant: { label: 'Itinerante', icon: Truck, color: 'text-zinc-400' },
    partner: { label: 'Partner', icon: Users, color: 'text-violet-500' },
} as any;

const INDUSTRIAL_AREAS = ['Producción', 'Mantenimiento', 'Calidad', 'Logística', 'PRL', 'Administración'];
const RETAIL_AREAS = ['Ventas', 'Caja', 'Almacén', 'Atención Cliente', 'Administración'];

const cn = (...xs: (string | boolean | undefined)[]) => xs.filter(Boolean).join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, count }: { title: string; subtitle: string; count?: number }) {
    return (
        <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
                {count !== undefined && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {count} centros
                    </span>
                )}
            </div>
            <p className="text-sm text-zinc-500 font-medium">{subtitle}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Step3Structure() {
    const {
        config, addProvince, removeProvince, addStore, removeStore,
        updateStore, batchAddStores, loadIndustrialDemo
    } = useConfig();
    const isIndustrial = config.company.sector === 'industrial';
    const siteConfig = isIndustrial ? INDUSTRIAL_SITES : RETAIL_SITES;
    const areasList = isIndustrial ? INDUSTRIAL_AREAS : RETAIL_AREAS;

    // UI State
    const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeAction, setActiveAction] = useState<'none' | 'add' | 'bulk' | 'import'>('none');

    // Form State
    const [newSite, setNewSite] = useState({ name: '', code: '', type: isIndustrial ? 'factory' : 'store', regionId: '' });
    const [bulkText, setBulkText] = useState('');

    // Derived Data
    const sitesCount = useMemo(() => config.structure.reduce((acc, p) => acc + p.stores.length, 0), [config.structure]);

    const filteredStructure = useMemo(() => {
        if (!searchTerm) return config.structure;
        const s = searchTerm.toLowerCase();
        return config.structure.map(p => ({
            ...p,
            stores: p.stores.filter(st => st.name.toLowerCase().includes(s) || st.code?.toLowerCase().includes(s))
        })).filter(p => p.stores.length > 0 || p.name.toLowerCase().includes(s));
    }, [config.structure, searchTerm]);

    // Handlers
    const handleAddSingle = () => {
        if (!newSite.name || !newSite.regionId) return;
        addStore(newSite.regionId, {
            name: newSite.name,
            code: newSite.code || `${isIndustrial ? 'IND' : 'RET'}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            type: newSite.type as FacilityType,
            active: true,
            employees: isIndustrial ? 50 : 20,
            areas: areasList.slice(0, 3).map(a => ({ id: `a_${Date.now()}_${a}`, name: a }))
        });
        setNewSite({ name: '', code: '', type: isIndustrial ? 'factory' : 'store', regionId: '' });
        setActiveAction('none');
    };

    const handleAddBulk = () => {
        if (!bulkText || !newSite.regionId) return;
        const stores = bulkText.split('\n').filter(n => n.trim()).map((n, i) => ({
            name: n.trim(),
            code: `${isIndustrial ? 'IND' : 'RET'}-${Date.now().toString().slice(-4)}-${i + 1}`,
            type: newSite.type as FacilityType,
            active: true,
            employees: isIndustrial ? 50 : 20,
            areas: areasList.slice(0, 3).map(a => ({ id: `a_${Date.now()}_${i}_${a}`, name: a }))
        }));
        batchAddStores(newSite.regionId, stores);
        setBulkText('');
        setActiveAction('none');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">

            {/* 1. Header & Sector Indicator */}
            <div className="flex items-center justify-between">
                <SectionHeader
                    title={isIndustrial ? "Estructura Industrial" : "Estructura Retail"}
                    subtitle={isIndustrial ? "Configure sus plantas y centros de producción." : "Gestione su red de tiendas y almacenes."}
                    count={sitesCount}
                />
                <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
                    <button onClick={() => setViewMode('tree')} className={cn("p-2 rounded-lg transition-all", viewMode === 'tree' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400")}>
                        <LayoutGrid size={18} />
                    </button>
                    <button onClick={() => setViewMode('table')} className={cn("p-2 rounded-lg transition-all", viewMode === 'table' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400")}>
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* 2. Empty State / Action Picker */}
            {sitesCount === 0 && activeAction === 'none' ? (
                <div className="py-24 border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-200 mb-6">
                        <Building size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Comience a definir su estructura</h3>
                    <p className="text-sm text-zinc-500 mb-8 max-w-xs">Añada sus primeros centros de forma manual o importe un listado desde Excel.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => setActiveAction('add')} className="h-12 px-8 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">Añadir manualmente</button>
                        <button onClick={() => setActiveAction('import')} className="h-12 px-8 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all flex items-center gap-2">
                            <Upload size={16} /> Importar Excel
                        </button>
                    </div>
                    {isIndustrial && (
                        <button
                            onClick={loadIndustrialDemo}
                            className="mt-6 text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:underline flex items-center gap-2"
                        >
                            <Sparkles size={12} /> Cargar ejemplo industrial
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* 3. Action Bar (When data exists) */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar planta, tienda o código..."
                                className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setActiveAction(activeAction === 'add' ? 'none' : 'add')}
                            className={cn("h-11 px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                activeAction === 'add' ? "bg-zinc-900 text-white" : "border border-zinc-200 hover:border-zinc-900")}
                        >
                            <Plus size={16} /> Nuevo Centro
                        </button>
                    </div>

                    {/* 4. Action Panels */}
                    {activeAction === 'add' && (
                        <div className="p-8 border border-zinc-100 rounded-3xl bg-zinc-50/50 space-y-8 animate-in slide-in-from-top-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-4">
                                    <button onClick={() => setBulkText('')} className={cn("text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2", bulkText === '' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400")}>Unitario</button>
                                    <button onClick={() => setBulkText('\n')} className={cn("text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2", bulkText !== '' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400")}>Por Lote (Texto)</button>
                                </div>
                                <button onClick={() => setActiveAction('none')} className="text-zinc-300 hover:text-zinc-900"><X size={18} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Provincia / Región</label>
                                    <select className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm outline-none" value={newSite.regionId} onChange={e => setNewSite({ ...newSite, regionId: e.target.value })}>
                                        <option value="">Selección...</option>
                                        {config.structure.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        {config.structure.length === 0 && <option value="default">Crear automáticamente</option>}
                                    </select>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">{bulkText !== '' ? "Listado de centros (1 por línea)" : "Nombre del centro"}</label>
                                    {bulkText !== '' ? (
                                        <textarea className="w-full h-24 p-4 bg-white border border-zinc-200 rounded-xl text-sm outline-none resize-none" placeholder="Planta A&#10;Planta B..." value={bulkText} onChange={e => setBulkText(e.target.value)} />
                                    ) : (
                                        <input type="text" className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm outline-none" placeholder="Nombre..." value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })} />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Tipología</label>
                                    <select className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm outline-none" value={newSite.type} onChange={e => setNewSite({ ...newSite, type: e.target.value as FacilityType })}>
                                        {Object.entries(siteConfig).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={bulkText !== '' ? handleAddBulk : handleAddSingle}
                                    className="h-12 px-10 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-20 transition-all"
                                    disabled={(!newSite.name && bulkText === '') || (!newSite.regionId && config.structure.length > 0)}
                                >
                                    Confirmar y Añadir
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 5. Main Content Area */}
                    <div className="space-y-10 min-h-[400px]">
                        {viewMode === 'tree' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
                                {filteredStructure.map(p => (
                                    <div key={p.id} className="space-y-6 group">
                                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-bold text-zinc-900">{p.name}</h4>
                                                <span className="text-[10px] font-bold text-zinc-300 tabular-nums uppercase tracking-widest">{p.stores.length} centros</span>
                                            </div>
                                            <button onClick={() => removeProvince(p.id)} className="p-2 text-zinc-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {p.stores.map(s => <MinimalSiteCard key={s.id} site={s} provinceId={p.id} onRemove={removeStore} siteConfig={siteConfig} />)}
                                            <button
                                                onClick={() => { setActiveAction('add'); setNewSite({ ...newSite, regionId: p.id }); }}
                                                className="h-28 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all group/btn cursor-pointer"
                                            >
                                                <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Añadir Centro</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {config.structure.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                        <MapPin size={48} className="text-zinc-100 mb-6" />
                                        <h4 className="font-bold text-zinc-900 mb-2">No hay regiones definidas</h4>
                                        <button onClick={() => addProvince("Nueva Región")} className="text-xs font-bold text-violet-600 hover:underline">Crear primera región</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border border-zinc-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Centro / Código</th>
                                            <th className="px-6 py-4">Ubicación</th>
                                            <th className="px-6 py-4">Tipo</th>
                                            <th className="px-6 py-4">Áreas</th>
                                            <th className="px-6 py-4">Estado</th>
                                            <th className="px-6 py-4 text-right pr-8">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {filteredStructure.flatMap(p => p.stores.map(s => {
                                            const meta = siteConfig[s.type] || siteConfig.store;
                                            return (
                                                <tr key={s.id} className="group hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            className="block text-sm font-bold text-zinc-900 bg-transparent border-none p-0 focus:ring-0 outline-none w-full"
                                                            value={s.name}
                                                            onChange={e => updateStore(p.id, s.id, { name: e.target.value })}
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase">{s.code}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-zinc-500">{p.name}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <meta.icon size={14} className={meta.color} />
                                                            <span className="text-[11px] font-medium text-zinc-600">{meta.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {s.areas?.slice(0, 2).map(a => <span key={a.id} className="px-2 py-0.5 bg-zinc-50 rounded text-[9px] font-bold text-zinc-400 uppercase">{a.name}</span>)}
                                                            {(s.areas?.length || 0) > 2 && <span className="text-[9px] font-bold text-zinc-300">+{s.areas.length - 2}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => updateStore(p.id, s.id, { active: !s.active })} className={cn("h-6 px-3 rounded-full text-[9px] font-bold uppercase transition-all", s.active ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400")}>
                                                            {s.active ? 'Activo' : 'Baja'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right pr-8">
                                                        <button onClick={() => removeStore(p.id, s.id)} className="p-2 text-zinc-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        }))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* 6. Floating Region Input (Professional Integration) */}
            {sitesCount > 0 && (
                <div className="flex justify-center pt-10">
                    <div className="flex items-center gap-3 bg-white border border-zinc-200 p-1.5 pl-4 rounded-2xl shadow-xl shadow-zinc-200/20">
                        <MapPin size={16} className="text-zinc-300" />
                        <input
                            type="text"
                            placeholder="Nueva Provincia / Región..."
                            className="bg-transparent border-none text-xs font-bold outline-none w-48 placeholder:text-zinc-300"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.target as any).value) {
                                    addProvince((e.target as any).value);
                                    (e.target as any).value = '';
                                }
                            }}
                        />
                        <button className="h-10 px-6 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Registrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MinimalSiteCard({ site, provinceId, onRemove, siteConfig }: any) {
    const meta = siteConfig[site.type] || siteConfig.store;

    return (
        <div className="group relative p-6 border border-zinc-100 rounded-2xl bg-white hover:border-zinc-900 transition-all flex flex-col justify-between h-28 cursor-pointer">
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(provinceId, site.id); }}
                className="absolute top-4 right-4 text-zinc-100 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
                <Trash2 size={14} />
            </button>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <meta.icon size={14} className={meta.color} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-[0.05em] text-zinc-300">{site.code}</span>
                </div>
                <h5 className="text-sm font-bold text-zinc-900 truncate">{site.name}</h5>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{meta.label}</span>
                <div className={cn("h-1.5 w-1.5 rounded-full", site.active ? "bg-emerald-500" : "bg-zinc-200")} />
            </div>
        </div>
    );
}
