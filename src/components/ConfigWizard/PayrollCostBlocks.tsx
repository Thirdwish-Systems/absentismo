import React, { useState } from 'react';
import {
    Info, Search, Globe, Shield, Scale,
    Calendar, ClipboardList, CreditCard,
    Users, Briefcase, TrendingUp, History,
    CheckCircle2, AlertCircle, Bot, Zap,
    ChevronDown, ChevronRight, FileJson,
    Upload, Download, Plus, Trash2,
    Building2, Activity, Cpu, Database
} from 'lucide-react';
import { useConfig, PayrollInputs, ComplementoTramo } from '../../stores/configStore';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    description: string;
    source: 'api' | 'manual';
    required?: boolean;
    children: React.ReactNode;
}

export function PayrollInput({ value, placeholder, onChange }: { value: string, placeholder?: string, onChange?: (v: string) => void }) {
    return (
        <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-[11px] font-medium text-zinc-900 placeholder:text-zinc-300 focus:ring-0 outline-none"
        />
    );
}

export function PayrollField({ label, description, source, required, children }: FieldProps) {
    return (
        <div className={`group flex flex-col gap-1.5 p-3 rounded-2xl border transition-all ${source === 'api'
            ? 'border-zinc-100/60 bg-white/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
            : 'border-zinc-200/50 bg-white shadow-sm hover:border-violet-200/50 hover:shadow-violet-500/5'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight">{label}</span>
                    {required && <span className="w-1 h-1 rounded-full bg-rose-400/60" />}

                    <div className="group/info relative">
                        <Info className="h-3 w-3 text-zinc-300 group-hover/info:text-zinc-500 transition-colors cursor-help" />
                        <div className="absolute left-0 top-full mt-2 z-[100] w-64 p-3 rounded-xl bg-zinc-900 text-[10px] text-zinc-100 opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none shadow-xl border border-white/10 font-light">
                            {description}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-all">
                    {source === 'api' ? (
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-[8px] font-bold text-zinc-400 tracking-tighter uppercase">API</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                            <span className="text-[8px] font-bold text-zinc-400 tracking-tighter uppercase">Manual</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`mt-0.5 min-h-[1.5rem] flex items-center ${source === 'manual' ? 'cursor-text' : ''}`}>
                {children}
            </div>
        </div>
    );
}

interface BlockWrapperProps {
    id: string;
    title: string;
    objective: string;
    progress: number;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function BlockWrapper({ id, title, objective, progress, icon, children }: BlockWrapperProps) {
    const [isOpen, setIsOpen] = useState(progress < 100);

    return (
        <div className={`rounded-[32px] border transition-all duration-700 ${isOpen
            ? 'bg-white border-zinc-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            : 'bg-zinc-50/30 border-zinc-100/50 hover:bg-zinc-50/50 shadow-none'
            }`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 cursor-pointer"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${isOpen ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-300'
                        }`}>
                        {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-light text-sm tracking-tight ${isOpen ? 'text-zinc-900' : 'text-zinc-400'}`}>{title}</h3>
                            {progress === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/80" />}
                        </div>
                        <p className="text-[9px] text-zinc-400 font-light mt-0.5">{objective}</p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-[9px] font-medium text-zinc-300 tracking-widest">{progress}%</div>
                        <div className="w-16 h-0.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-400/60' : 'bg-zinc-400'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-zinc-200" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="h-px bg-zinc-50/50 mb-6 mx-2" />
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// Block Components (Example: Block 1 & 3)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Block 0: Marco del Cálculo
// ─────────────────────────────────────────────────────────────────────────────

export function BlockFramework() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="framework"
            title="Marco del Cálculo"
            objective="Periodo, unidades y definiciones base"
            progress={100}
            icon={<Globe className="h-6 w-6" />}
        >
            <PayrollField label="Periodo de análisis" description="YTD, últimos 12 meses móviles, año natural, campaña..." source="manual" required>
                <PayrollInput
                    value={fields['framework.period'] || ''}
                    onChange={(v) => handleChange('framework.period', v)}
                />
            </PayrollField>
            <PayrollField label="Unidad de análisis" description="Empresa / centro / tienda / sección / turno / puesto / manager." source="manual" required>
                <PayrollInput
                    value={fields['framework.unit'] || ''}
                    onChange={(v) => handleChange('framework.unit', v)}
                />
            </PayrollField>
            <PayrollField label="Definición de Absentismo" description="IT, Permisos retribuidos, Ausencias injustificadas, Maternidad/Paternidad, Huelga, Formación." source="manual" required>
                <div className="flex flex-wrap gap-1">
                    {['IT CC', 'IT CP', 'Permisos', 'Injustificadas', 'Maternidad'].map(t => (
                        <div key={t} className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-[8px] font-medium text-zinc-400">
                            {t}
                        </div>
                    ))}
                </div>
            </PayrollField>
            <PayrollField label="Calendario laboral" description="Festivos locales/autonómicos, cierres, domingos, etc." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium">68 festivos detectados</div>
            </PayrollField>
            <PayrollField label="Convenios Aplicables" description="Convenio estatal de comercio + Mejoras IT de empresa." source="manual">
                <PayrollInput
                    value={fields['framework.agreements'] || ''}
                    onChange={(v) => handleChange('framework.agreements', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 1: Datos de Plantilla
// ─────────────────────────────────────────────────────────────────────────────

export function BlockHeadcount() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="headcount"
            title="Datos de Plantilla"
            objective="Estructura, FTEs y segmentación"
            progress={100}
            icon={<Users className="h-6 w-6" />}
        >
            <PayrollField label="Headcount & FTE" description="Promedio periodo y FTE por mes." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado via ERP</div>
            </PayrollField>
            <PayrollField label="Tipo de contrato" description="Indef/Temporal, Parcial %, Fijo-discontinuo, ETT." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Distribución completa OK</div>
            </PayrollField>
            <PayrollField label="Jornada Anual" description="Horas teóricas por colectivo y centro." source="manual" required>
                <PayrollInput
                    value={fields['headcount.annualHours'] || ''}
                    onChange={(v) => handleChange('headcount.annualHours', v)}
                />
            </PayrollField>
            <PayrollField label="Calendarios y Turnos" description="M/T/N, rotaciones, fines, ciclos." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Mapeado desde Horario</div>
            </PayrollField>
            <PayrollField label="Puestos y Roles" description="Categoría profesional y grupo de cotización." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium">12 categorías activas</div>
            </PayrollField>
            <PayrollField label="Antigüedad y Tramos" description="Impacto en mejoras de convenio y costes." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado</div>
            </PayrollField>
            <PayrollField label="Distribución Geográfica" description="Provincia/CCAA (Mutuas, Convenios, Festivos)." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium">7 Sedes Vinculadas</div>
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 2: Datos de Ausencias (La Materia Prima)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockAbsenceData() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="absences"
            title="Datos de Ausencias"
            objective="Materia prima: los episodios de baja"
            progress={100}
            icon={<ClipboardList className="h-6 w-6" />}
        >
            <PayrollField label="ID Empleado" description="Anonimizado + centro/turno/rol." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Dataset Protegido</div>
            </PayrollField>
            <PayrollField label="Catálogo de Ausencias" description="IT CC, IT CP, Permisos, Injustificada, Maternidad, Riesgo, Hospitalización, Citas Médicas." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-zinc-900 font-medium">16 Tipos Mapeados</div>
            </PayrollField>
            <PayrollField label="Inicio / Fin" description="Fecha y hora para cálculo exacto de días y horas." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado</div>
            </PayrollField>
            <PayrollField label="Parcialidad" description="Día completo vs horas sueltas." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado</div>
            </PayrollField>
            <PayrollField label="Recaídas (Flags)" description="Relación automática con episodio anterior." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Auto-detectado (12%)</div>
            </PayrollField>
            <PayrollField label="Gravedad Prevista" description="Corta (1-4), Media (5-30), Larga (>30)." source="manual">
                <PayrollInput
                    value={fields['absences.gravity'] || ''}
                    onChange={(v) => handleChange('absences.gravity', v)}
                />
            </PayrollField>
            <PayrollField label="Situación de Pago" description="Pago delegado / Pago directo (Impacta caja)." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Detectado vía SS</div>
            </PayrollField>
            <PayrollField label="Incidencias de Gestión" description="Retrasos en partes, bajas mal cerradas." source="manual">
                <PayrollInput
                    value={fields['absences.incidents'] || ''}
                    onChange={(v) => handleChange('absences.incidents', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 3: Nómina y Cotización (Coste Directo)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockPayrollDetails() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="payroll"
            title="Nómina y Cotización"
            objective="Coste directo 'de verdad'"
            progress={100}
            icon={<CreditCard className="h-6 w-6" />}
        >
            <PayrollField label="Salario Base" description="Salario base mensual por empleado." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Importado (Nómina)</div>
            </PayrollField>
            <PayrollField label="Complementos Fijos" description="Plus convenio, puesto, turnicidad, nocturnidad." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sync OK</div>
            </PayrollField>
            <PayrollField label="Variables & Primas" description="Comisiones, incentivos y regla de cómputo en IT." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Importado (L12M)</div>
            </PayrollField>
            <PayrollField label="Conceptos Extrasalariales" description="Dietas, KM, Transporte y devengo en ausencia." source="manual">
                <PayrollInput
                    value={fields['payroll.non_salary'] || 'Excluidos del cálculo IT'}
                    onChange={(v) => handleChange('payroll.non_salary', v)}
                />
            </PayrollField>
            <PayrollField label="Pagas Extra" description="Prorrata, número de pagas e importes." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado</div>
            </PayrollField>
            <PayrollField label="Coste Empresa SS" description="Tipos por contingencias (CC, AT, CP, FOGASA)." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium">Cálculo Automático</div>
            </PayrollField>
            <PayrollField label="Mejoras de IT" description="% complementado por tramos, topes y condiciones." source="manual" required>
                <PayrollInput
                    value={fields['payroll.agreement_improvement'] || 'Ver Tramos (95%/100%)'}
                    onChange={(v) => handleChange('payroll.agreement_improvement', v)}
                />
            </PayrollField>
            <PayrollField label="Bases de Cotización" description="Bases de CC y CP mensuales por empleado." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sync Directo</div>
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 4: Datos de Cobertura (Coste Indirecto)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockCoverageCost() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="coverage"
            title="Datos de Cobertura"
            objective="Coste indirecto operativo"
            progress={100}
            icon={<TrendingUp className="h-6 w-6" />}
        >
            <PayrollField label="Regla de Cobertura" description="¿Se cubre o no se cubre? por puesto/turno." source="manual" required>
                <PayrollInput
                    value={fields['coverage.rule'] || 'Regla 1:1 en Operativo'}
                    onChange={(v) => handleChange('coverage.rule', v)}
                />
            </PayrollField>
            <PayrollField label="Método de Cobertura" description="Horas extra, bolsa interna, contrato temporal, ETT, Subcontrata." source="manual">
                <PayrollInput
                    value={fields['coverage.method'] || 'Matriz de prioridad OK'}
                    onChange={(v) => handleChange('coverage.method', v)}
                />
            </PayrollField>
            <PayrollField label="Coste Unitario (€)" description="Coste por hora extra o tarifa ETT (fee incl)." source="manual" required>
                <PayrollInput
                    value={fields['coverage.unit_cost'] || 'Avg €24.20 / hora'}
                    onChange={(v) => handleChange('coverage.unit_cost', v)}
                />
            </PayrollField>
            <PayrollField label="Horas Cubiertas" description="Horas/días reales cubiertos por episodio." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado (92%)</div>
            </PayrollField>
            <PayrollField label="Coste Onboarding" description="Formación y curva de aprendizaje del sustituto." source="manual">
                <PayrollInput
                    value={fields['coverage.onboarding'] || '€420 por incidencia'}
                    onChange={(v) => handleChange('coverage.onboarding', v)}
                />
            </PayrollField>
            <PayrollField label="Sobrecostes Planif." description="Cambios de turno, dietas, transporte, logística." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sync Cuadrantes</div>
            </PayrollField>
            <PayrollField label="Coste 'En Cadena'" description="Fatiga, sobrecarga, errores, segundas bajas." source="manual">
                <PayrollInput
                    value={fields['coverage.chain_cost'] || 'Estimación: 5% Indirecto'}
                    onChange={(v) => handleChange('coverage.chain_cost', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 5: Productividad y Oportunidad (P&L Real)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockOpportunityCost() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="productivity"
            title="Productividad & P&L"
            objective="Coste de oportunidad y negocio"
            progress={100}
            icon={<Activity className="h-6 w-6" />}
        >
            <PayrollField label="Ingresos x Centro" description="Ventas, producción, pedidos, llamadas." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado via BI</div>
            </PayrollField>
            <PayrollField label="Margen Contribución" description="Margen bruto operativo por línea/centro." source="manual" required>
                <PayrollInput
                    value={fields['opportunity.margin'] || '18% (Target)'}
                    onChange={(v) => handleChange('opportunity.margin', v)}
                />
            </PayrollField>
            <PayrollField label="Eficiencia / Ratio" description="Cuánto output se pierde por 1 hora sin cubrir." source="manual">
                <PayrollInput
                    value={fields['opportunity.efficiency'] || '0.85 (Impacto Alto)'}
                    onChange={(v) => handleChange('opportunity.efficiency', v)}
                />
            </PayrollField>
            <PayrollField label="Capacidad Utilizada" description="% de utilización y margen de absorción." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium">Avg 88.5%</div>
            </PayrollField>
            <PayrollField label="KPIs de Servicio" description="SLA, OTIF, tiempos espera, NPS, roturas." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">6 KPIs vinculados</div>
            </PayrollField>
            <PayrollField label="Penalizaciones" description="Incumplimiento de contratos o logística." source="manual">
                <PayrollInput
                    value={fields['opportunity.penalties'] || 'Ninguna activa'}
                    onChange={(v) => handleChange('opportunity.penalties', v)}
                />
            </PayrollField>
            <PayrollField label="Coste de Calidad" description="Scrap, retrabajos, accidentes asociados." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sync Calidad</div>
            </PayrollField>
            <PayrollField label="Ventas No Realizadas" description="Retail (ventas) o Industrial (producción)." source="manual">
                <PayrollInput
                    value={fields['opportunity.unrealized_sales'] || 'Auto-estimado'}
                    onChange={(v) => handleChange('opportunity.unrealized_sales', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 6: PRL / Mutua / Siniestralidad
// ─────────────────────────────────────────────────────────────────────────────

export function BlockPRLMutua() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="prl"
            title="PRL / Mutua"
            objective="Accidentalidad y ROI preventivo"
            progress={100}
            icon={<Shield className="h-6 w-6" />}
        >
            <PayrollField label="Accidentes Trabajo" description="Nº, duración, coste, centro, recurrencia." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sync Delt@</div>
            </PayrollField>
            <PayrollField label="Enfermedades Prof." description="EP registradas y sospechas analizadas." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Vinculado</div>
            </PayrollField>
            <PayrollField label="Índices PRL" description="Frecuencia, Gravedad e Incidencia." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Calculado OK</div>
            </PayrollField>
            <PayrollField label="Recargos & Sanciones" description="Costes por falta de medidas o recargos." source="manual">
                <PayrollInput
                    value={fields['prl.sanctions'] || 'No registrados'}
                    onChange={(v) => handleChange('prl.sanctions', v)}
                />
            </PayrollField>
            <PayrollField label="Adaptación Puesto" description="Costes de adecuación tras ausencia." source="manual">
                <PayrollInput
                    value={fields['prl.adaptation'] || '€1.200 (YTD)'}
                    onChange={(v) => handleChange('prl.adaptation', v)}
                />
            </PayrollField>
            <PayrollField label="Programas Preventivos" description="Coste de programas y cálculo de ROI." source="manual">
                <PayrollInput
                    value={fields['prl.preventive_programs'] || '3 programas activos'}
                    onChange={(v) => handleChange('prl.preventive_programs', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 7: Costes Olvidados
// ─────────────────────────────────────────────────────────────────────────────

export function BlockAdditionalCosts() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="additional"
            title="Costes Adicionales"
            objective="Gestión interna y rotura estructural"
            progress={100}
            icon={<History className="h-6 w-6" />}
        >
            <PayrollField label="Gestión Administrativa" description="Tiempo de RRHH, nóminas, operaciones." source="manual">
                <PayrollInput
                    value={fields['additional.admin'] || 'Avg €540 / mes'}
                    onChange={(v) => handleChange('additional.admin', v)}
                />
            </PayrollField>
            <PayrollField label="Asesoría / Gestoría" description="Coste externo de gestión de bajas." source="manual">
                <PayrollInput
                    value={fields['additional.outsourcing'] || 'Incluido en fee'}
                    onChange={(v) => handleChange('additional.outsourcing', v)}
                />
            </PayrollField>
            <PayrollField label="Reemplazo Estructural" description="Recruiting, selección, formación, ramp-up." source="manual">
                <PayrollInput
                    value={fields['additional.recruiting'] || 'Estimado: 25% Salario'}
                    onChange={(v) => handleChange('additional.recruiting', v)}
                />
            </PayrollField>
            <PayrollField label="Coste Legal / Laboral" description="Conflictos, impugnaciones, vigilancia." source="manual">
                <PayrollInput
                    value={fields['additional.legal'] || 'Puntuales'}
                    onChange={(v) => handleChange('additional.legal', v)}
                />
            </PayrollField>
            <PayrollField label="Seguros & Pólizas" description="Franquicias o coberturas externas." source="manual">
                <PayrollInput
                    value={fields['additional.insurance'] || 'No aplicable'}
                    onChange={(v) => handleChange('additional.insurance', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 9: Maestro de Empleados (Data Central)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockMasterData() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="master-data"
            title="Maestro de Empleados"
            objective="Ficha centralizada y perfiles de usuario"
            progress={100}
            icon={<Database className="h-6 w-6" />}
        >
            <PayrollField label="Ficha Maestra" description="Datos biográficos, contacto, ID único." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado (4.250 registros)</div>
            </PayrollField>
            <PayrollField label="Estructura Org." description="Mapeo de jerarquías y centros de coste." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Matriz actualizada</div>
            </PayrollField>
            <PayrollField label="Histórico de Puestos" description="Cambios de rol, promociones y movilidad." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Logs completos</div>
            </PayrollField>
            <PayrollField label="Campos Personalizados" description="Dimensiones específicas para analítica." source="manual">
                <PayrollInput
                    value={fields['master.custom_dims'] || '12 dimensiones activas'}
                    onChange={(v) => handleChange('master.custom_dims', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 10: Calendarios Laborales
// ─────────────────────────────────────────────────────────────────────────────

export function BlockCalendars() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="calendars"
            title="Calendarios y Turnos"
            objective="Gestión de tiempos y jornadas teóricas"
            progress={100}
            icon={<Calendar className="h-6 w-6" />}
        >
            <PayrollField label="Calendario Oficial" description="Festivos nacionales, locales y de sector." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Calendario 2024-2025 OK</div>
            </PayrollField>
            <PayrollField label="Patrones de Turno" description="Definición de rotaciones (M/T/N/FS)." source="manual" required>
                <PayrollInput
                    value={fields['calendars.shift_patterns'] || '8 patrones configurados'}
                    onChange={(v) => handleChange('calendars.shift_patterns', v)}
                />
            </PayrollField>
            <PayrollField label="Horas Contratadas" description="Cálculo de deuda horaria y balances." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Sincronizado</div>
            </PayrollField>
            <PayrollField label="Cierres y Paradas" description="Periodos de inactividad programada." source="manual">
                <PayrollInput
                    value={fields['calendars.shutdowns'] || '2 periodos registrados'}
                    onChange={(v) => handleChange('calendars.shutdowns', v)}
                />
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 11: Motor de Predicción
// ─────────────────────────────────────────────────────────────────────────────

export function BlockPrediction() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="prediction"
            title="Configuración de Predicción"
            objective="IA y parámetros de alerta temprana"
            progress={100}
            icon={<Cpu className="h-6 w-6" />}
        >
            <PayrollField label="Modelos Activos" description="Algoritmos de detección de riesgo." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-violet-600 font-medium italic">XGBoost + LSTM (V2.1)</div>
            </PayrollField>
            <PayrollField label="Umbrales de Alerta" description="Sensibilidad de las notificaciones de riesgo." source="manual" required>
                <PayrollInput
                    value={fields['prediction.sensitivity'] || 'Sensibilidad: Media-Alta'}
                    onChange={(v) => handleChange('prediction.sensitivity', v)}
                />
            </PayrollField>
            <PayrollField label="Ventana de Tiempo" description="Proyección de predicción (7d, 15d, 30d)." source="manual">
                <PayrollInput
                    value={fields['prediction.horizon'] || 'Horizonte 30 días'}
                    onChange={(v) => handleChange('prediction.horizon', v)}
                />
            </PayrollField>
            <PayrollField label="Ponderación Variables" description="Importancia de factores externos e internos." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-violet-600 font-medium italic">Ajuste Dinámico ON</div>
            </PayrollField>
        </BlockWrapper>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 8: Datos Técnicos (Auditabilidad)
// ─────────────────────────────────────────────────────────────────────────────

export function BlockTechnicalData() {
    const { config, updatePayrollInputs } = useConfig();
    const fields = config.payrollInputs?.customFields || {};

    const handleChange = (key: string, value: string) => {
        updatePayrollInputs({
            customFields: { ...fields, [key]: value }
        });
    };

    return (
        <BlockWrapper
            id="technical"
            title="Datos Técnicos"
            objective="Auditoría y trazabilidad de fuentes"
            progress={100}
            icon={<Zap className="h-6 w-6" />}
        >
            <PayrollField label="Mapeo de Fuentes" description="ERP, HCM, Fichajes, ETT, Ventas." source="api" required>
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">8 fuentes conectadas</div>
            </PayrollField>
            <PayrollField label="Diccionario de Datos" description="Definición clara de cada campo." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Actualizado</div>
            </PayrollField>
            <PayrollField label="Reglas de Imputación" description="Lógica de asignación a centro/turno." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Consistente</div>
            </PayrollField>
            <PayrollField label="Datos Incompletos" description="Tratamiento de partes sin fin o sin causa." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Auto-depuración OK</div>
            </PayrollField>
            <PayrollField label="Trazabilidad" description="Reconstrucción del cálculo por episodio." source="api">
                <div className="h-8 flex items-center px-2 text-[10px] text-emerald-600 font-medium italic">Full Logs</div>
            </PayrollField>
        </BlockWrapper>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// Other blocks can follow the same pattern...
// ─────────────────────────────────────────────────────────────────────────────
