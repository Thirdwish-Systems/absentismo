import React, { useState, useMemo } from 'react';
import {
    Users2, Plus, Trash2, Building2, Warehouse, Store as StoreIcon,
    ChevronRight, ChevronDown, UserCircle2, Briefcase, LayoutGrid,
    Factory, Wrench, Settings, Truck
} from 'lucide-react';
import { useConfig, OrgNode, StoreOrg, FacilityType, SECTORS } from '../../stores/configStore';

// ─────────────────────────────────────────────────────────────────────────────
// Pyramidal Structure (HQ / Warehouse)
// ─────────────────────────────────────────────────────────────────────────────

interface OrgItemProps {
    node: OrgNode;
    depth: number;
    onUpdate: (updatedNode: OrgNode) => void;
    onRemove: () => void;
}

function OrgItem({ node, depth, onUpdate, onRemove }: OrgItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleAddChild = () => {
        const newNode: OrgNode = { id: `node_${Date.now()}`, name: 'Nuevo nivel/departamento' };
        onUpdate({ ...node, children: [...(node.children || []), newNode] });
        setIsExpanded(true);
    };

    const handleUpdateChild = (childId: string, updatedChild: OrgNode) => {
        onUpdate({
            ...node,
            children: node.children?.map(c => c.id === childId ? updatedChild : c)
        });
    };

    const handleRemoveChild = (childId: string) => {
        onUpdate({
            ...node,
            children: node.children?.filter(c => c.id !== childId)
        });
    };

    return (
        <div className="space-y-2">
            <div
                className={`group flex items-center gap-3 py-3 px-4 rounded-2xl transition-all duration-300 ${depth === 0 ? 'bg-zinc-50/50' : 'hover:bg-zinc-50'
                    }`}
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {node.children && node.children.length > 0 ? (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                ) : (
                    <div className="w-4 h-4" />
                )}

                <input
                    type="text"
                    value={node.name}
                    onChange={(e) => onUpdate({ ...node, name: e.target.value })}
                    className="flex-1 bg-transparent border-none text-sm font-bold text-zinc-900 focus:ring-0 outline-none placeholder:text-zinc-300"
                    placeholder="Escribe el nombre..."
                />

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                        onClick={handleAddChild}
                        className="h-8 px-3 rounded-xl bg-white border border-zinc-200 text-[10px] font-black text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" /> Nivel
                    </button>
                    <button
                        onClick={onRemove}
                        className="h-8 w-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {isExpanded && node.children?.map(child => (
                <OrgItem
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    onUpdate={(updated) => handleUpdateChild(child.id, updated)}
                    onRemove={() => handleRemoveChild(child.id)}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Structure (Encargado / Trabajadores)
// ─────────────────────────────────────────────────────────────────────────────

function StoreOrgView({ orgData, onUpdate }: { orgData: StoreOrg, onUpdate: (data: StoreOrg) => void }) {
    const [newWorker, setNewWorker] = useState('');

    const handleAddWorker = () => {
        if (!newWorker.trim()) return;
        onUpdate({
            ...orgData,
            workers: [...(orgData.workers || []), newWorker.trim()]
        });
        setNewWorker('');
    };

    const handleRemoveWorker = (index: number) => {
        onUpdate({
            ...orgData,
            workers: (orgData.workers || []).filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-10">
            {/* Manager Section */}
            <div>
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <UserCircle2 className="h-3.5 w-3.5" /> Responsable de Tienda
                </h4>
                <div className="flex items-center gap-4 border-b border-zinc-100 py-4 group">
                    <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Nombre del encargado..."
                        value={orgData.manager || ''}
                        onChange={(e) => onUpdate({ ...orgData, manager: e.target.value })}
                        className="flex-1 bg-transparent border-none text-xl font-black text-zinc-900 focus:ring-0 outline-none placeholder:text-zinc-200 tracking-tighter"
                    />
                </div>
            </div>

            {/* Workers Section */}
            <div>
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users2 className="h-3.5 w-3.5" /> Plantilla operativa
                </h4>

                <div className="space-y-6">
                    <div className="flex gap-4 items-center border-b border-zinc-100 pb-2 mb-4">
                        <input
                            type="text"
                            placeholder="Escribe un nombre y pulsa Enter..."
                            value={newWorker}
                            onChange={(e) => setNewWorker(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddWorker()}
                            className="flex-1 bg-transparent border-none text-sm font-bold text-zinc-900 focus:ring-0 outline-none placeholder:font-medium placeholder:text-zinc-300"
                        />
                        <button
                            onClick={handleAddWorker}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            Añadir trabajador
                        </button>
                    </div>

                    <div className="divide-y divide-zinc-50">
                        {orgData.workers?.map((worker, i) => (
                            <div key={i} className="group flex items-center justify-between py-3 hover:bg-zinc-50/50 px-2 rounded-lg transition-all">
                                <span className="text-sm font-bold text-zinc-900">{worker}</span>
                                <button
                                    onClick={() => handleRemoveWorker(i)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-200 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {(!orgData.workers || orgData.workers.length === 0) && (
                        <div className="text-center py-10 rounded-[32px] border-2 border-dashed border-zinc-100 text-zinc-400 text-sm italic">
                            No hay trabajadores registrados en esta tienda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Step4Org() {
    const { config, updateStoreOrg } = useConfig();
    const [selectedStore, setSelectedStore] = useState<{ provinceId: string, storeId: string, type: FacilityType, name: string } | null>(null);

    // Initial selected store if none
    useMemo(() => {
        if (!selectedStore && config.structure.length > 0 && config.structure[0].stores.length > 0) {
            const s = config.structure[0].stores[0];
            setSelectedStore({ provinceId: config.structure[0].id, storeId: s.id, type: s.type, name: s.name });
        }
    }, [config.structure, selectedStore]);

    const currentStore = useMemo(() => {
        if (!selectedStore) return null;
        return config.structure.find(p => p.id === selectedStore.provinceId)?.stores.find(s => s.id === selectedStore.storeId);
    }, [config.structure, selectedStore]);

    const handlePyramidUpdate = (updated: OrgNode[]) => {
        if (!selectedStore) return;
        updateStoreOrg(selectedStore.provinceId, selectedStore.storeId, updated);
    };

    const handleStoreOrgUpdate = (updated: StoreOrg) => {
        if (!selectedStore) return;
        updateStoreOrg(selectedStore.provinceId, selectedStore.storeId, updated);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm">
                    <Users2 className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Estructura Organizativa</h3>
                    <p className="text-xs text-zinc-500">Define los niveles de mando y la plantilla de cada centro</p>
                </div>
            </div>

            {/* Store Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                {config.structure.flatMap(p => p.stores.map(s => {
                    let Icon = Building2;
                    if (s.type === 'store') Icon = StoreIcon;
                    else if (s.type === 'warehouse' || s.type === 'logistics_center') Icon = Truck;
                    else if (s.type === 'factory') Icon = Factory;
                    else if (s.type === 'shop_floor' || s.type === 'workshop') Icon = Wrench;
                    else if (s.type === 'maintenance') Icon = Settings;

                    const isActive = selectedStore?.storeId === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setSelectedStore({ provinceId: p.id, storeId: s.id, type: s.type, name: s.name })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                                ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200'
                                : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {s.name}
                        </button>
                    );
                }))}
            </div>

            {/* Content Area */}
            {selectedStore && currentStore && (
                <div className="animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <h4 className="text-2xl font-black text-zinc-900 tracking-tighter">
                            {selectedStore.name}
                        </h4>
                        <div className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {selectedStore.type === 'store' ? 'Estructura de Tienda' :
                                (['factory', 'shop_floor', 'industrial_warehouse', 'maintenance'].includes(selectedStore.type) ? 'Estructura de Planta' : 'Estructura Piramidal')}
                        </div>
                    </div>

                    <div className="max-w-4xl">
                        {selectedStore.type === 'store' ? (
                            <StoreOrgView
                                orgData={(currentStore.orgData as StoreOrg) || { manager: '', workers: [] }}
                                onUpdate={handleStoreOrgUpdate}
                            />
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <LayoutGrid className="h-3.5 w-3.5" /> Niveles Jerárquicos / Departamentos
                                    </h4>
                                    <button
                                        onClick={() => {
                                            const current = (currentStore.orgData as OrgNode[]) || [];
                                            handlePyramidUpdate([...current, { id: `node_${Date.now()}`, name: 'Nuevo departamento' }]);
                                        }}
                                        className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Añadir Raíz
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {(currentStore.orgData as OrgNode[])?.map((node) => (
                                        <OrgItem
                                            key={node.id}
                                            node={node}
                                            depth={0}
                                            onUpdate={(updated) => {
                                                const current = (currentStore.orgData as OrgNode[]) || [];
                                                handlePyramidUpdate(current.map(n => n.id === node.id ? updated : n));
                                            }}
                                            onRemove={() => {
                                                const current = (currentStore.orgData as OrgNode[]) || [];
                                                handlePyramidUpdate(current.filter(n => n.id !== node.id));
                                            }}
                                        />
                                    ))}
                                    {(!(currentStore.orgData as OrgNode[]) || (currentStore.orgData as OrgNode[]).length === 0) && (
                                        <div className="text-center py-20 rounded-[40px] border-2 border-dashed border-zinc-100 bg-zinc-50/30 flex flex-col items-center justify-center text-zinc-300">
                                            <Building2 className="h-10 w-10 mb-4 opacity-20" />
                                            <p className="text-sm font-bold">Inicia la estructura piramidal</p>
                                            <button
                                                onClick={() => handlePyramidUpdate([{ id: `node_${Date.now()}`, name: 'Dirección General' }])}
                                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 border-b border-zinc-200"
                                            >
                                                Crear nodo raíz
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!selectedStore && (
                <div className="py-24 rounded-[48px] bg-zinc-50 border border-zinc-100 flex flex-col items-center justify-center text-center px-10">
                    <Users2 className="h-12 w-12 text-zinc-200 mb-6" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Sin centros configurados</h3>
                    <p className="text-zinc-400 text-sm max-w-xs"> Primero debes definir tu estructura física en la sección correspondiente.</p>
                </div>
            )}
        </div>
    );
}
