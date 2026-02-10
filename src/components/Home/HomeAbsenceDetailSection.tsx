import React, { useState } from 'react';
import {
    Users, Clock, Euro, PieChart, Filter,
    Info, ChevronDown, ExternalLink, AlertTriangle, X, MapPin, Briefcase, Calendar as CalendarIcon, Activity
} from 'lucide-react';
import { ABSENCE_DICTIONARY, calculateCost } from '../Module3/AbsenceDictionary';
import PersonAbsenceDetailDrawer from './PersonAbsenceDetailDrawer';

// MOCK DATA for Home Detail
const MOCK_TODAY_DATA = {
    absentCount: 14,
    minutesLost: 6720,
    costEstimated: 24640,
    quality: {
        schedules: 98,
        attendance: 94,
        mapping: 89
    },
    mix: [
        { label: 'IT (CC/AT/EP)', value: 45, color: '#8b5cf6' },
        { label: 'No-show / Injustificada', value: 25, color: '#f43f5e' },
        { label: 'Parcial (Tardes/Salidas)', value: 15, color: '#f59e0b' },
        { label: 'Permisos NR', value: 10, color: '#3b82f6' },
        { label: 'No gestionable', value: 5, color: '#94a3b8' }
    ]
};

const MOCK_ABSENT_PEOPLE = [
    { id: 1, name: 'Ana Martínez', role: 'Encargado', store: 'Tienda Gran Vía', type: 'IT Corta', start: '2026-01-25', cost: 420, critical: true, reportedBy: 'M. García (Store Manager)', reportedAt: '30/01/2026 07:45' },
    { id: 2, name: 'Carlos Ruiz', role: 'Mozo especializado', store: 'Almacén Logístico', type: 'No-show', start: '2026-01-20', cost: 310, critical: true, reportedBy: 'Sistema (No-fichaje)', reportedAt: '30/01/2026 06:15' },
    { id: 3, name: 'Lucía Sanz', role: 'Vendedor', store: 'Tienda Gran Vía', type: 'Entrada tardía', start: '2026-01-30', cost: 45, critical: false, reportedBy: 'Captura biométrica', reportedAt: '30/01/2026 09:12' },
    { id: 4, name: 'Roberto Gómez', role: 'Vendedor', store: 'Tienda Diagonal', type: 'Permiso NR', start: '2026-01-29', cost: 0, critical: false, reportedBy: 'L. Torres (Assistant)', reportedAt: '29/01/2026 18:30' },
    { id: 5, name: 'Elena Polo', role: 'Segundo Encargado', store: 'Tienda Diagonal', type: 'IT Media', start: '2026-01-22', cost: 1200, critical: true, reportedBy: 'M. García (Store Manager)', reportedAt: '22/01/2026 10:20' },
    { id: 6, name: 'Juan Pérez', role: 'Mozo', store: 'Almacén Logístico', type: 'IT Corta', start: '2026-01-28', cost: 280, critical: false, reportedBy: 'Portal Empleado', reportedAt: '28/01/2026 08:30' },
    { id: 7, name: 'Marta García', role: 'Vendedor', store: 'Tienda Gran Vía', type: 'No-show', start: '2026-01-30', cost: 210, critical: true, reportedBy: 'Sistema (No-fichaje)', reportedAt: '30/01/2026 09:45' },
    { id: 8, name: 'Diego López', role: 'Reponedor', store: 'Tienda Centro', type: 'Entrada tardía', start: '2026-01-30', cost: 35, critical: false, reportedBy: 'Captura biométrica', reportedAt: '30/01/2026 08:05' },
    { id: 9, name: 'Sofía Marín', role: 'Caja', store: 'Tienda Centro', type: 'IT Corta', start: '2026-01-29', cost: 240, critical: false, reportedBy: 'Portal Empleado', reportedAt: '29/01/2026 09:00' },
    { id: 10, name: 'Jorge Sánchez', role: 'Operario', store: 'Almacén 2', type: 'Permiso NR', start: '2026-01-30', cost: 0, critical: false, reportedBy: 'J. Valdés (Shift Leader)', reportedAt: '30/01/2026 06:00' },
    { id: 11, name: 'Laura Torres', role: 'Vendedor', store: 'Tienda Diagonal', type: 'IT Corta', start: '2026-01-27', cost: 305, critical: false, reportedBy: 'Portal Empleado', reportedAt: '27/01/2026 08:15' },
    { id: 12, name: 'Pablo Neruda', role: 'Vendedor', store: 'Tienda Gran Vía', type: 'No-show', start: '2026-01-30', cost: 210, critical: true, reportedBy: 'Sistema (No-fichaje)', reportedAt: '30/01/2026 09:30' },
    { id: 13, name: 'Sara Vidal', role: 'Caja', store: 'Tienda Diagonal', type: 'Entrada tardía', start: '2026-01-30', cost: 45, critical: false, reportedBy: 'Captura biométrica', reportedAt: '30/01/2026 09:15' },
    { id: 14, name: 'Luis Miguel', role: 'Mozo', store: 'Almacén Logístico', type: 'IT Media', start: '2026-01-15', cost: 1500, critical: true, reportedBy: 'J. Valdés (Shift Leader)', reportedAt: '15/01/2026 07:00' },
];

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

export default function HomeAbsenceDetailSection() {
    const [selectedFilter, setSelectedFilter] = useState('Todas');
    const [showList, setShowList] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const todayStr = "Hoy · 30 ene 2026";

    return (
        <div className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm">
            {/* Header with Tooltip/Date */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{todayStr}</span>
                    </div>
                    <h2 className="text-2xl font-light text-zinc-900 tracking-tight">Detalle · Absentismo hoy</h2>
                    <p className="text-xs text-zinc-400 mt-1 italic">
                        "Esto es tiempo planificado que hoy no se trabajó. No es medicina, es operación."
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5" />
                            Filtros: <span className="text-zinc-900 font-semibold">{selectedFilter}</span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                    <button className="h-9 w-9 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-all shadow-sm hidden md:flex">
                        <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setShowList(true)}
                    className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex items-center gap-4 group hover:bg-white hover:border-violet-100 transition-all text-left w-full"
                >
                    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-violet-600 shadow-sm transition-all">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Personas ausentes</div>
                        <div className="text-2xl font-light text-zinc-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight">{MOCK_TODAY_DATA.absentCount}</div>
                        <div className="text-[9px] text-violet-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 uppercase tracking-widest">
                            Ver listado <ChevronDown className="h-3 w-3 rotate-270" />
                        </div>
                    </div>
                </button>

                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex items-center gap-4 group hover:bg-white hover:border-violet-100 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-amber-600 shadow-sm transition-all">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Working days lost</div>
                        <div className="text-2xl font-light text-zinc-900 tracking-tight">{(MOCK_TODAY_DATA.minutesLost / 480).toLocaleString('es-ES')} <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">days</span></div>
                    </div>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex items-center gap-4 group hover:bg-white hover:border-violet-100 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 shadow-sm transition-all">
                        <Euro className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Coste estimado</div>
                        <div className="text-2xl font-light text-zinc-900 tracking-tight">{MOCK_TODAY_DATA.costEstimated.toLocaleString('es-ES')} <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">€</span></div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Visual Mix Chart */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Mix de absentismo hoy
                        </h3>
                        <div className="text-[10px] text-zinc-300 font-medium uppercase tracking-widest">Registros canónicos</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {MOCK_TODAY_DATA.mix.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-medium text-zinc-600 mb-1">
                                    <span>{item.label}</span>
                                    <span className="font-semibold text-zinc-900">{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ABSENT PEOPLE MODAL (LIST) */}
            {showList && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-light text-zinc-900 tracking-tight">Personal ausente hoy</h3>
                                    <p className="text-xs text-zinc-500 tracking-tight">Detalle de las {MOCK_TODAY_DATA.absentCount} incidencias activas en el sistema</p>
                                </div>
                            </div>
                            <button onClick={() => setShowList(false)} className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-sm focus:ring-2 ring-zinc-100 outline-none">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="divide-y divide-zinc-50">
                                {MOCK_ABSENT_PEOPLE.map(person => (
                                    <div
                                        key={person.id}
                                        className={cn("p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer group/row", person.critical ? "bg-rose-50/20" : "")}
                                        onClick={() => setSelectedPerson(person)}
                                    >
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-sm font-light shadow-inner ring-4 ring-white transition-transform group-hover/row:scale-110", person.critical ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-400")}>
                                                {person.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                                                <div>
                                                    <div className="text-zinc-900 font-semibold text-sm tracking-tight flex items-center gap-2">
                                                        {person.name}
                                                        {person.critical && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                                        <Briefcase className="h-3 w-3" /> {person.role}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5 tracking-tight">
                                                        <MapPin className="h-3.5 w-3.5 text-zinc-300" /> {person.store}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest border", person.critical ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-violet-50 text-violet-700 border-violet-100")}>
                                                            {person.type}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-1">
                                                        <CalendarIcon className="h-3 w-3" /> Desde {person.start}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-light text-zinc-900 tracking-tight">{person.cost.toLocaleString('es-ES')}€</div>
                                                    <div className="text-[9px] text-zinc-300 font-semibold uppercase tracking-widest">Impacto est.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between">
                            <div className="text-xs text-zinc-400 font-medium italic">
                                Total impacto hoy registrado: <span className="text-zinc-900 font-bold">{MOCK_TODAY_DATA.costEstimated.toLocaleString('es-ES')}€</span>
                            </div>
                            <button
                                onClick={() => setShowList(false)}
                                className="h-14 px-10 rounded-2xl bg-violet-600 text-white text-sm font-bold shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-[0.98] uppercase tracking-widest"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PERSON DETAIL DRAWER */}
            {selectedPerson && (
                <PersonAbsenceDetailDrawer
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                />
            )}
        </div>
    );
}
