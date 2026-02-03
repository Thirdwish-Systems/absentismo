import React, { useMemo, useState, useEffect } from "react";
import { useCompanyData, SubData, SubsData, AbsenceData, Group } from "./Module2Container";
import { Save, Info, Database, X } from "lucide-react";
import { setCompanyName } from "../../stores/companyStore";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const num = (v: any) => {
    const n = Number(String(v == null ? "" : v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
};
const clamp = (n: number, a = 0, b = 100) => Math.min(b, Math.max(a, n));
const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(Number.isFinite(n) ? n : 0);
const pct = (n: number) => `${n.toFixed(2)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// Domain
// ─────────────────────────────────────────────────────────────────────────────

const CNAE = [
    { code: "01", title: "Agricultura" },
    { code: "10", title: "Alimentación" },
    { code: "20", title: "Química" },
    { code: "24", title: "Metalurgia" },
    { code: "25", title: "Productos metálicos" },
    { code: "33", title: "Reparación/instalación maquinaria" },
    { code: "41", title: "Construcción edificios" },
    { code: "42", title: "Ingeniería civil" },
    { code: "43", title: "Construcción especializada" },
    { code: "45", title: "Venta/rep. vehículos" },
    { code: "46", title: "Comercio mayor" },
    { code: "47", title: "Comercio menor" },
    { code: "49", title: "Transporte terrestre" },
    { code: "52", title: "Logística/almacenamiento" },
    { code: "55", title: "Alojamiento" },
    { code: "56", title: "Comidas/bebidas" },
    { code: "62", title: "Informática" },
    { code: "69", title: "Legal/contabilidad" },
    { code: "81", title: "Servicios edificios" },
    { code: "86", title: "Sanidad" },
];

const PREMIUM: Record<string, number> = {
    "01": 2.6, "10": 2.0, "20": 3.25, "24": 4.0, "25": 3.6, "33": 3.4, "41": 5.0,
    "42": 5.5, "43": 6.0, "45": 2.6, "46": 1.9, "47": 1.9, "49": 3.4, "52": 3.4,
    "55": 2.25, "56": 2.25, "62": 1.0, "69": 1.0, "81": 3.25, "86": 2.0,
};

const TYPES = [
    { k: "AT", l: "AT", n: "Accidente de trabajo" },
    { k: "IT_CORTA", l: "IT corta", n: "IT (1–3 días)" },
    { k: "IT_MEDIA", l: "IT media", n: "IT (4–20 días)" },
    { k: "IT_LARGA", l: "IT larga", n: "IT (21+ días)" },
];

const FIELD_HINTS: Record<string, string> = {
    name: "Nombre de tu empresa. Este nombre aparecerá en todas las secciones de la aplicación (Diagnóstico, Informes, etc.).",
    employees: "Número total de empleados de la empresa. Base para calcular el impacto económico del absentismo.",
    salary: "Salario bruto anual medio por empleado. Se usa para calcular el coste por hora y el impacto total.",
    hours: "Horas trabajadas al año por empleado (media). Referencia: 1.780h es lo habitual en convenios.",
    cnae: "Código Nacional de Actividades Económicas. Determina la tarifa de AT/EP y los benchmarks sectoriales.",
    ssFixed: "Cuota fija de Seguridad Social a cargo de la empresa. Referencia: ~29,9% del salario bruto.",
    ssVar: "Tarifa AT/EP (Accidente de Trabajo y Enfermedad Profesional). Varía según el CNAE de la empresa.",
    revenue: "Facturación anual de la empresa. Se usa para calcular el coste de oportunidad cuando hay ausencias no sustituidas.",
    includeOpp: "Incluir o no el coste de oportunidad en los cálculos. Representa la pérdida de producción/servicio.",
    subEff: "Porcentaje del valor de trabajo que recuperas cuando sustituyes a un empleado ausente (curva de aprendizaje, adaptación).",
    comp13: "Complemento que paga la empresa durante los días 1 a 3 de IT. En algunos convenios es 0%, en otros hasta 100%.",
    comp420: "Complemento adicional sobre el 60% de la SS durante los días 4 a 20. Depende del convenio colectivo.",
    comp21: "Complemento adicional sobre el 75% de la SS a partir del día 21. Depende del convenio colectivo.",
    brDiv: "Divisor para calcular la Base Reguladora diaria. Por defecto 360 (12 meses × 30 días).",
    provisionEur: "Importe anual provisionado para absentismo. Se usa para calcular el 'absentismo no provisionado'.",
    provisionPct: "Porcentaje de la masa salarial provisionado. Se usa si no hay importe específico.",
    AT: "Tasa de absentismo por Accidente de Trabajo. Porcentaje de horas perdidas sobre el total.",
    IT_CORTA: "Tasa de IT de corta duración (1-3 días). Muy frecuente, bajo coste unitario pero alto volumen.",
    IT_MEDIA: "Tasa de IT de duración media (4-20 días). Donde la empresa asume el mayor coste directo.",
    IT_LARGA: "Tasa de IT de larga duración (21+ días). Alto coste por caso, la SS asume más parte.",
    substitutedPct: "Porcentaje de ausencias que se sustituyen (con ETT, horas extra, etc.).",
    extraCostPct: "Sobrecoste de la sustitución sobre el coste/hora normal (horas extra, ETT, urgencia).",
    avgDur: "Duración media por tipología. Mejora la precisión del cálculo de costes por tramos.",
};

const emptySub = (): SubData => ({ substitutedPct: 0, extraCostPct: 0 });

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block ml-1">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition"
            >
                <Info className="h-3 w-3" />
            </button>
            {open && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-xl shadow-lg">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" />
                </div>
            )}
        </span>
    );
}

function Card({ title, subtitle, right, children }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                    <div className="text-sm font-semibold text-zinc-900">{title}</div>
                    {subtitle && <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>}
                </div>
                {right}
            </div>
            <div className="h-px w-full bg-zinc-100" />
            <div className="p-5">{children}</div>
        </section>
    );
}

function Input({ label, right, hint, tooltip, ...p }: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    right?: React.ReactNode;
    hint?: React.ReactNode;
    tooltip?: string;
}) {
    return (
        <label className="block">
            <div className="flex items-end justify-between gap-3">
                <div className="flex items-center text-sm font-medium text-zinc-900">
                    {label}
                    {tooltip && <Tooltip text={tooltip} />}
                </div>
                {right && <div className="text-xs text-zinc-500">{right}</div>}
            </div>
            <input
                {...p}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
            />
            {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
        </label>
    );
}

function Select({ label, value, onChange, children, hint, tooltip }: {
    label: string;
    value?: string | number;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    children: React.ReactNode;
    hint?: React.ReactNode;
    tooltip?: string;
}) {
    return (
        <label className="block">
            <div className="flex items-center text-sm font-medium text-zinc-900">
                {label}
                {tooltip && <Tooltip text={tooltip} />}
            </div>
            <select
                value={value}
                onChange={onChange}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
            >
                {children}
            </select>
            {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
        </label>
    );
}

function Toggle({ label, value, onChange, tooltip }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    tooltip?: string;
}) {
    const cls = value
        ? "bg-zinc-900 text-white border-zinc-300"
        : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300";
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${cls}`}
        >
            <span className="font-medium flex items-center">
                {label}
                {tooltip && <Tooltip text={tooltip} />}
            </span>
            <span className={`text-xs ${value ? "text-white/80" : "text-zinc-500"}`}>
                {value ? "Sí" : "No"}
            </span>
        </button>
    );
}

function SubTable({ title, value, onChange }: {
    title: string;
    value: SubsData;
    onChange: (v: SubsData) => void;
}) {
    const getRow = (k: string) => (value && value[k]) || emptySub();
    const setRow = (k: string, patch: Partial<SubData>) => {
        const cur = getRow(k);
        const next = { ...cur, ...patch };
        onChange({ ...(value || {}), [k]: next });
    };

    return (
        <Card title={title} subtitle="% sustituidos y sobrecoste (overtime/ETT)">
            <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-left text-xs text-zinc-500">
                            <th className="px-2">Tipo</th>
                            <th className="px-2 flex items-center">
                                % sustituidos
                                <Tooltip text={FIELD_HINTS.substitutedPct} />
                            </th>
                            <th className="px-2">
                                <span className="flex items-center">
                                    Sobrecoste
                                    <Tooltip text={FIELD_HINTS.extraCostPct} />
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {TYPES.map((t) => {
                            const row = getRow(t.k);
                            return (
                                <tr key={t.k} className="rounded-2xl bg-zinc-50">
                                    <td className="px-2 py-3 text-sm font-medium text-zinc-900">{t.n}</td>
                                    <td className="px-2 py-3">
                                        <input
                                            className="w-32 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm"
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={row.substitutedPct}
                                            onChange={(e) => setRow(t.k, { substitutedPct: clamp(num(e.target.value), 0, 100) })}
                                        />
                                    </td>
                                    <td className="px-2 py-3">
                                        <input
                                            className="w-32 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm"
                                            type="number"
                                            min={0}
                                            max={300}
                                            step={1}
                                            value={row.extraCostPct}
                                            onChange={(e) => setRow(t.k, { extraCostPct: clamp(num(e.target.value), 0, 300) })}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Group Editor Modal
// ─────────────────────────────────────────────────────────────────────────────

function GroupEditor({ group, onSave, onCancel }: {
    group: Partial<Group> | null;
    onSave: (g: Omit<Group, "id">) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: group?.name || "",
        employees: group?.employees || 0,
        salary: group?.salary || 30000,
        absence: group?.absence || { AT: 0, IT_CORTA: 0, IT_MEDIA: 0, IT_LARGA: 0 },
        subs: group?.subs || {} as SubsData,
    });

    const totalAbsence = Object.values(form.absence).reduce((a, b) => a + clamp(num(b), 0, 100), 0);

    const handleSave = () => {
        if (!form.name.trim()) return;
        onSave({
            name: form.name.trim(),
            employees: Math.max(0, Math.round(num(form.employees))),
            salary: Math.max(0, num(form.salary)),
            absence: form.absence,
            subs: form.subs,
        });
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-zinc-950/30" onClick={onCancel} />
            <div className="absolute inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:top-10 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl">
                <div className="rounded-[28px] border border-zinc-200 bg-white shadow-xl max-h-[80vh] overflow-auto">
                    <div className="flex items-center justify-between gap-3 px-5 py-4 sticky top-0 bg-white border-b border-zinc-100">
                        <div>
                            <div className="text-sm font-semibold text-zinc-900">
                                {group?.id ? "Editar grupo" : "Nuevo grupo"}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                                Configura datos específicos de absentismo para este grupo
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Input
                                label="Nombre del grupo"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                tooltip="Identificador del grupo (ej: Región Norte, Turno Noche, Almacén Central)"
                                placeholder="Ej: Región Norte"
                            />
                            <Input
                                label="Empleados"
                                type="number"
                                min={0}
                                step={1}
                                value={form.employees}
                                onChange={(e) => setForm({ ...form, employees: Math.max(0, Math.round(num(e.target.value))) })}
                                tooltip={FIELD_HINTS.employees}
                            />
                            <Input
                                label="Salario medio"
                                type="number"
                                min={0}
                                step={100}
                                right="€"
                                value={form.salary}
                                onChange={(e) => setForm({ ...form, salary: Math.max(0, num(e.target.value)) })}
                                tooltip={FIELD_HINTS.salary}
                            />
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-zinc-900 mb-3">
                                Tasas de absentismo del grupo
                                <Tooltip text="Define las tasas específicas de absentismo de este grupo. Si un grupo tiene un 30% de absentismo, se calculará su impacto independiente." />
                            </div>
                            <div className="grid gap-4 md:grid-cols-4">
                                {TYPES.map((t) => (
                                    <Input
                                        key={t.k}
                                        label={t.n}
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        right="%"
                                        value={form.absence[t.k as keyof AbsenceData] || 0}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                absence: { ...form.absence, [t.k]: clamp(num(e.target.value), 0, 100) },
                                            })
                                        }
                                        tooltip={FIELD_HINTS[t.k]}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 text-sm text-zinc-600">
                                Total grupo: <b className={totalAbsence > 15 ? "text-rose-600" : ""}>{pct(totalAbsence)}</b>
                                {totalAbsence > 15 && <span className="ml-2 text-rose-600">⚠️ Por encima del 15%</span>}
                            </div>
                        </div>

                        <SubTable title="Sustituciones del grupo" value={form.subs} onChange={(v) => setForm({ ...form, subs: v })} />
                    </div>

                    <div className="flex justify-end gap-3 px-5 py-4 border-t border-zinc-100">
                        <button
                            onClick={onCancel}
                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                        >
                            Guardar grupo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DatosIniciales() {
    const { company, setCompany, absence, setAbsence, subs, setSubs, groups, setGroups } = useCompanyData();
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [addingGroup, setAddingGroup] = useState(false);

    // Sincronizar nombre de empresa con store global (para usar en otros módulos)
    useEffect(() => {
        setCompanyName(company.name);
    }, [company.name]);

    const cnaeHint = useMemo(() => {
        const c = company.cnae || "";
        return Object.prototype.hasOwnProperty.call(PREMIUM, c)
            ? `AT/EP sugerido: ${PREMIUM[c].toFixed(2)}% (editable)`
            : "Sin tarifa precargada.";
    }, [company.cnae]);

    const onCnaeChange = (code: string) => {
        const next = { ...company, cnae: code };
        if (Object.prototype.hasOwnProperty.call(PREMIUM, code)) {
            next.ssVar = PREMIUM[code];
        }
        setCompany(next);
    };

    // Cálculo tasa absentismo media (sin grupos)
    const avgAbsenceWithoutGroups = Object.values(absence).reduce((a, b) => a + clamp(num(b), 0, 100), 0);

    // Cálculo tasa absentismo total (ponderado)
    const totalWeightedAbsence = useMemo(() => {
        const baseEmp = company.employees - groups.reduce((s, g) => s + g.employees, 0);
        const baseWeight = Math.max(0, baseEmp);

        let totalWeight = baseWeight * avgAbsenceWithoutGroups;
        let totalEmp = baseWeight;

        groups.forEach((g) => {
            const gAbsence = Object.values(g.absence).reduce((a, b) => a + clamp(num(b), 0, 100), 0);
            totalWeight += g.employees * gAbsence;
            totalEmp += g.employees;
        });

        return totalEmp > 0 ? totalWeight / totalEmp : 0;
    }, [company.employees, groups, avgAbsenceWithoutGroups]);

    const handleAddGroup = (data: Omit<Group, "id">) => {
        const g: Group = { id: "g-" + Date.now(), ...data };
        setGroups([g, ...groups]);
        setAddingGroup(false);
    };

    const handleEditGroup = (data: Omit<Group, "id">) => {
        if (!editingGroup) return;
        setGroups(groups.map((g) => (g.id === editingGroup.id ? { ...data, id: editingGroup.id } : g)));
        setEditingGroup(null);
    };

    const delGroup = (id: string) => setGroups(groups.filter((g) => g.id !== id));

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 py-6">
                <header className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Datos Iniciales</h1>
                            <p className="mt-1 text-xs text-zinc-500">Configura los datos de tu empresa para todos los cálculos</p>
                        </div>
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition"
                            onClick={() => alert("Configuración guardada (demo)")}
                        >
                            <Save className="h-4 w-4" />
                            Guardar configuración
                        </button>
                    </div>
                </header>

                {/* Banner de datos manuales */}
                <div className="mb-6 rounded-[28px] border border-violet-200 bg-violet-50 p-4">
                    <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-violet-600 mt-0.5" />
                        <div>
                            <div className="text-sm font-semibold text-violet-900">Entrada manual de datos</div>
                            <div className="mt-1 text-xs text-violet-700">
                                Actualmente los datos se introducen manualmente. Cuando conectemos con los datos reales de tu compañía,
                                todos los parámetros se calcularán automáticamente basándose en históricos, situación presente y predicciones.
                            </div>
                        </div>
                    </div>
                </div>

                <main className="grid gap-6">
                    <Card title="Empresa" subtitle="Datos base + SS + productividad">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Nombre"
                                value={company.name}
                                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                tooltip={FIELD_HINTS.name}
                                placeholder="Nombre de tu empresa"
                            />
                            <Input
                                label="Empleados"
                                type="number"
                                min={0}
                                step={1}
                                value={company.employees}
                                onChange={(e) => setCompany({ ...company, employees: clamp(num(e.target.value), 0, 1000000) })}
                                tooltip={FIELD_HINTS.employees}
                            />
                            <Input
                                label="Salario bruto anual medio"
                                type="number"
                                min={0}
                                step={100}
                                right="€"
                                value={company.salary}
                                onChange={(e) => setCompany({ ...company, salary: Math.max(0, num(e.target.value)) })}
                                tooltip={FIELD_HINTS.salary}
                            />
                            <Input
                                label="Horas/año"
                                type="number"
                                min={1}
                                step={1}
                                value={company.hours}
                                onChange={(e) => setCompany({ ...company, hours: Math.max(1, Math.round(num(e.target.value))) })}
                                tooltip={FIELD_HINTS.hours}
                            />
                            <Select
                                label="CNAE"
                                value={company.cnae}
                                onChange={(e) => onCnaeChange(e.target.value)}
                                hint={cnaeHint}
                                tooltip={FIELD_HINTS.cnae}
                            >
                                <option value="">— Selecciona —</option>
                                {CNAE.map((x) => (
                                    <option key={x.code} value={x.code}>
                                        {x.code} · {x.title}
                                    </option>
                                ))}
                            </Select>
                            <div className="grid gap-3">
                                <Input
                                    label="SS fija"
                                    type="number"
                                    min={0}
                                    max={60}
                                    step={0.1}
                                    right="%"
                                    value={company.ssFixed}
                                    onChange={(e) => setCompany({ ...company, ssFixed: clamp(num(e.target.value), 0, 60) })}
                                    hint="Orientativo: 29,90%"
                                    tooltip={FIELD_HINTS.ssFixed}
                                />
                                <Input
                                    label="AT/EP (SS variable)"
                                    type="number"
                                    min={0}
                                    max={20}
                                    step={0.1}
                                    right="%"
                                    value={company.ssVar}
                                    onChange={(e) => setCompany({ ...company, ssVar: clamp(num(e.target.value), 0, 20) })}
                                    tooltip={FIELD_HINTS.ssVar}
                                />
                            </div>
                            <Input
                                label="Facturación anual"
                                type="number"
                                min={0}
                                step={1000}
                                right="€"
                                value={company.revenue}
                                onChange={(e) => setCompany({ ...company, revenue: Math.max(0, num(e.target.value)) })}
                                tooltip={FIELD_HINTS.revenue}
                            />
                            <div className="grid gap-3">
                                <Toggle
                                    label="Incluir coste de oportunidad"
                                    value={!!company.includeOpp}
                                    onChange={(v) => setCompany({ ...company, includeOpp: v })}
                                    tooltip={FIELD_HINTS.includeOpp}
                                />
                                <Input
                                    label="Eficacia de sustitución"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    right="%"
                                    value={company.subEff}
                                    onChange={(e) => setCompany({ ...company, subEff: clamp(num(e.target.value), 0, 100) })}
                                    tooltip={FIELD_HINTS.subEff}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Complementos empresariales" subtitle="Sobre Base Reguladora (aprox.)">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Input
                                label="Días 1–3"
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                right="%"
                                value={company.comp13}
                                onChange={(e) => setCompany({ ...company, comp13: clamp(num(e.target.value), 0, 100) })}
                                hint="Rango habitual 0–100"
                                tooltip={FIELD_HINTS.comp13}
                            />
                            <Input
                                label="Días 4–20 (extra)"
                                type="number"
                                min={0}
                                max={40}
                                step={1}
                                right="%"
                                value={company.comp420}
                                onChange={(e) => setCompany({ ...company, comp420: clamp(num(e.target.value), 0, 40) })}
                                hint="Extra sobre el 60%"
                                tooltip={FIELD_HINTS.comp420}
                            />
                            <Input
                                label="Día 21+ (extra)"
                                type="number"
                                min={0}
                                max={25}
                                step={1}
                                right="%"
                                value={company.comp21}
                                onChange={(e) => setCompany({ ...company, comp21: clamp(num(e.target.value), 0, 25) })}
                                hint="Extra sobre el 75%"
                                tooltip={FIELD_HINTS.comp21}
                            />
                        </div>
                        <div className="mt-3 text-xs text-zinc-500">
                            Base reguladora diaria ≈ salario anual / <b>{fmt(company.brDiv || 360)}</b>. Puedes ajustar el divisor.
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input
                                label="Divisor Base Reguladora"
                                type="number"
                                min={300}
                                step={1}
                                value={company.brDiv}
                                onChange={(e) => setCompany({ ...company, brDiv: Math.max(1, Math.round(num(e.target.value))) })}
                                hint="Por defecto 360 (12×30)."
                                tooltip={FIELD_HINTS.brDiv}
                            />
                        </div>
                    </Card>

                    <Card title="Duración media por tipología" subtitle="Mejora el cálculo de tramos 1–3 / 4–15 / 16–20 / 21+">
                        <div className="grid gap-4 md:grid-cols-4">
                            {TYPES.map((t) => (
                                <Input
                                    key={t.k}
                                    label={t.l}
                                    type="number"
                                    min={1}
                                    step={1}
                                    right="días"
                                    value={(company.avgDur && company.avgDur[t.k]) || ""}
                                    onChange={(e) =>
                                        setCompany({
                                            ...company,
                                            avgDur: { ...(company.avgDur || {}), [t.k]: Math.max(1, Math.round(num(e.target.value))) },
                                        })
                                    }
                                    tooltip={FIELD_HINTS.avgDur}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card title="Absentismo medio (empresa sin grupos especiales)" subtitle="% por tipología para empleados fuera de grupos específicos">
                        <div className="grid gap-4 md:grid-cols-4">
                            {TYPES.map((t) => (
                                <Input
                                    key={t.k}
                                    label={t.n}
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    right="%"
                                    value={absence[t.k]}
                                    onChange={(e) => setAbsence({ ...absence, [t.k]: clamp(num(e.target.value), 0, 100) })}
                                    tooltip={FIELD_HINTS[t.k]}
                                />
                            ))}
                        </div>
                        <div className="mt-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-zinc-700">Total absentismo medio:</div>
                                    <div className="text-xs text-zinc-500">(Empleados fuera de grupos especiales)</div>
                                </div>
                                <div className="text-xl font-bold text-zinc-900">{pct(avgAbsenceWithoutGroups)}</div>
                            </div>
                            {groups.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-violet-700">Total absentismo ponderado:</div>
                                        <div className="text-xs text-zinc-500">(Media + grupos, ponderado por empleados)</div>
                                    </div>
                                    <div className="text-xl font-bold text-violet-700">{pct(totalWeightedAbsence)}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <SubTable title="Sustituciones (general)" value={subs} onChange={setSubs} />

                    <Card title="Provisión" subtitle="Cuánto tienes reservado hoy (para calcular no provisionado)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Provisión anual (importe)"
                                type="number"
                                min={0}
                                step={100}
                                right="€"
                                value={company.provisionEur}
                                onChange={(e) => setCompany({ ...company, provisionEur: Math.max(0, num(e.target.value)) })}
                                hint="Si informas importe, tiene prioridad sobre %."
                                tooltip={FIELD_HINTS.provisionEur}
                            />
                            <Input
                                label="Provisión anual (% masa salarial)"
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                right="%"
                                value={company.provisionPct}
                                onChange={(e) => setCompany({ ...company, provisionPct: clamp(num(e.target.value), 0, 100) })}
                                tooltip={FIELD_HINTS.provisionPct}
                            />
                        </div>
                    </Card>

                    <Card
                        title="Grupos con absentismo diferenciado"
                        subtitle="Define grupos con tasas de absentismo diferentes a la media de la empresa"
                        right={
                            <button
                                onClick={() => setAddingGroup(true)}
                                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:border-zinc-300 shadow-sm"
                            >
                                + Añadir grupo
                            </button>
                        }
                    >
                        <div className="text-xs text-zinc-600 mb-4">
                            Añade grupos que tengan un absentismo significativamente diferente al resto de la empresa.
                            Por ejemplo: una región con el 30% de absentismo cuando la media es del 10%.
                        </div>

                        {groups.length > 0 ? (
                            <div className="space-y-3">
                                {groups.map((g) => {
                                    const gTotal = Object.values(g.absence).reduce((a, b) => a + clamp(num(b), 0, 100), 0);
                                    return (
                                        <div key={g.id} className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-semibold text-zinc-900">{g.name}</div>
                                                        {gTotal > avgAbsenceWithoutGroups * 1.5 && (
                                                            <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-700 rounded-full">
                                                                Alto
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        {fmt(g.employees)} empleados · Salario{" "}
                                                        {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(g.salary)}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {TYPES.map((t) => (
                                                            <span
                                                                key={t.k}
                                                                className="inline-flex items-center px-2 py-1 rounded-lg bg-zinc-100 text-xs text-zinc-700"
                                                            >
                                                                {t.l}: <b className="ml-1">{pct(g.absence[t.k as keyof AbsenceData] || 0)}</b>
                                                            </span>
                                                        ))}
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-violet-100 text-xs text-violet-700 font-medium">
                                                            Total: {pct(gTotal)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingGroup(g)}
                                                        className="rounded-2xl border border-zinc-200 px-3 py-2 text-xs text-zinc-700 hover:border-zinc-300"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => delGroup(g.id)}
                                                        className="rounded-2xl border border-rose-200 px-3 py-2 text-xs text-rose-700 hover:border-rose-300"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
                                No hay grupos definidos. Añade grupos si tienes regiones, turnos o departamentos con absentismo significativamente diferente.
                            </div>
                        )}
                    </Card>
                </main>
            </div>

            {(addingGroup || editingGroup) && (
                <GroupEditor
                    group={editingGroup}
                    onSave={editingGroup ? handleEditGroup : handleAddGroup}
                    onCancel={() => {
                        setAddingGroup(false);
                        setEditingGroup(null);
                    }}
                />
            )}
        </div>
    );
}
