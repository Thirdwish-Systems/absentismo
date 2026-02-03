import React, { useMemo, useState } from "react";
import { useCompanyData } from "./Module2Container";
import {
    AlertTriangle,
    Brain,
    ChevronRight,
    PiggyBank,
    Search,
    Sparkles,
    Target,
    X,
    TrendingDown,
    Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type UnitType = "Centro" | "Tienda" | "Planta";

type FocusRow = {
    unit: string;
    unitType: UnitType;
    role: string;
    shift: string;
    eur: number;
    absRate: number;
    trend: number;
    critical: boolean;
};

type EmployeeRow = {
    id: string;
    name: string;
    start: string;
    expected: string;
    costMonth: number;
    unit: string;
    dept: string;
    gender: "M" | "F" | "X";
    role: string;
    shift: string;
};

type RedUnitRow = {
    unit: string;
    unitType: UnitType;
    critical: boolean;
    absentToday: number;
    absentRate: number;
    costMonth: number;
    riskScore: number;
};

type CostLine = { key: string; label: string; desc: string; eur: number };

type ModalState =
    | { kind: "none" }
    | { kind: "absences" }
    | { kind: "units" }
    | { kind: "focus"; row: FocusRow };

const UNIT_TYPES: UnitType[] = ["Centro", "Tienda", "Planta"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const eur = (n: number) =>
    Math.round(Number.isFinite(n) ? n : 0).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
    });

const pct = (n: number) => `${((Number.isFinite(n) ? n : 0) * 100).toFixed(1)}%`;

const dmy = (iso: string) => {
    const s = String(iso || "");
    const p = s.split("-");
    if (p.length !== 3) return s;
    return `${p[2]}/${p[1]}/${p[0]}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo data (conectado con datos de empresa)
// ─────────────────────────────────────────────────────────────────────────────

function generateDemoData(groups: any[], companyEmployees: number) {
    // Generar datos basados en los grupos reales
    const TOP_FOCI: FocusRow[] = groups.slice(0, 4).map((g, i) => ({
        unit: g.name,
        unitType: (["Centro", "Planta", "Tienda"] as UnitType[])[i % 3],
        role: "Operario",
        shift: ["Mañana", "Tarde", "Noche", "Finde"][i % 4],
        eur: Math.round(g.employees * g.salary * 0.08 / 12),
        absRate: (g.absence?.AT || 0) / 100 + (g.absence?.IT_MEDIA || 0) / 100,
        trend: 0.1 + Math.random() * 0.1,
        critical: i < 2,
    }));

    const RED_UNITS: RedUnitRow[] = groups.slice(0, 4).map((g, i) => ({
        unit: g.name,
        unitType: (["Centro", "Planta", "Tienda"] as UnitType[])[i % 3],
        critical: i < 2,
        absentToday: Math.round(g.employees * 0.06),
        absentRate: (g.absence?.IT_MEDIA || 3) / 100,
        costMonth: Math.round(g.employees * g.salary * 0.06 / 12),
        riskScore: 90 - i * 5,
    }));

    const ABSENCES: EmployeeRow[] = [
        { id: "E-10021", name: "Laura Santos", start: "2026-01-04", expected: "2026-01-28", costMonth: 1240, unit: groups[0]?.name || "Centro Norte", dept: "Operaciones", gender: "F", role: "Operario", shift: "Mañana" },
        { id: "E-11002", name: "Pablo García", start: "2026-01-05", expected: "2026-01-23", costMonth: 1580, unit: groups[1]?.name || "Planta A", dept: "Producción", gender: "M", role: "Técnico", shift: "Noche" },
        { id: "E-08818", name: "Sara Núñez", start: "2026-01-12", expected: "2026-01-25", costMonth: 740, unit: groups[2]?.name || "Centro Sur", dept: "Operaciones", gender: "F", role: "Operario", shift: "Tarde" },
        { id: "E-12019", name: "Aina Vidal", start: "2026-01-09", expected: "2026-01-22", costMonth: 690, unit: groups[0]?.name || "Tienda 14", dept: "Retail", gender: "F", role: "Supervisor", shift: "Finde" },
    ];

    const totalAbsentRate = 0.062 + Math.random() * 0.02;
    const costMonth = Math.round(companyEmployees * 30000 * totalAbsentRate / 12);
    const costR12 = costMonth * 12;

    // ROI YTD Logic
    const predictedAnnualCost = companyEmployees * 30000 * 0.085; // Baseline 8.5%
    const realAnnualCost = costR12;
    const savingsCaptured = predictedAnnualCost - realAnnualCost;

    return { TOP_FOCI, RED_UNITS, ABSENCES, totalAbsentRate, costMonth, costR12, predictedAnnualCost, savingsCaptured };
}

const COST_LINES: CostLine[] = [
    { key: "complement", label: "Complemento", desc: "Pagos adicionales si existen.", eur: 68000 },
    { key: "substitution", label: "Sustitución", desc: "Coste extra por contratar cobertura.", eur: 54000 },
    { key: "overtime", label: "Horas extra", desc: "Cobertura con equipo interno.", eur: 22000 },
    { key: "lost_service", label: "Pérdida producción/servicio", desc: "Solo si la empresa define cómo monetizarlo.", eur: 18000 },
    { key: "efficiency", label: "Ineficiencia del equipo", desc: "Fricción, coordinación, tiempo improductivo.", eur: 12000 },
    { key: "quality", label: "Errores / retrabajo", desc: "Baja calidad, retrabajos.", eur: 9000 },
    { key: "learning", label: "Curva aprendizaje", desc: "Bajada temporal de productividad.", eur: 6500 },
    { key: "turnover", label: "Rotación + onboarding", desc: "Selección e incorporación (proxy).", eur: 5000 },
    { key: "opportunity", label: "Oportunidad", desc: "Solo si está definido por la empresa.", eur: 3000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Badge({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "violet" | "amber" | "red";
}) {
    const cls =
        tone === "violet"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : tone === "amber"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : tone === "red"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
            {children}
        </span>
    );
}

function Card({
    title,
    right,
    children,
}: {
    title: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="text-sm font-semibold text-zinc-900">{title}</div>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
            <div className="h-px w-full bg-zinc-100" />
            <div className="p-5">{children}</div>
        </div>
    );
}

function MiniBar({ value, max }: { value: number; max: number }) {
    const w = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
    return (
        <div className="h-2 w-full rounded-full bg-zinc-100">
            <div className="h-2 rounded-full bg-violet-600" style={{ width: `${Math.round(w * 100)}%` }} />
        </div>
    );
}

function Modal({
    open,
    title,
    onClose,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-zinc-950/30" onClick={onClose} />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl p-3 sm:bottom-auto sm:top-10">
                <div className="rounded-[28px] border border-zinc-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between gap-3 px-5 py-4">
                        <div>
                            <div className="text-sm font-semibold text-zinc-900">{title}</div>
                            <div className="mt-1 text-xs text-zinc-500">Sin datos clínicos · Todo configurable</div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="h-px w-full bg-zinc-100" />
                    <div className="max-h-[70vh] overflow-auto p-5">{children}</div>
                </div>
            </div>
        </div>
    );
}

function CopilotPanel() {
    const shortcuts = [
        "Desglosa el coste del mes por conceptos",
        "¿Qué unidades están en rojo hoy?",
        "Explícamelo para CEO en 5 líneas",
    ];
    const [q, setQ] = useState("");
    const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([
        { role: "assistant", text: "Soy tu copiloto IA. Puedo explicar costes y concentraciones (sin datos médicos)." },
    ]);

    const send = (text: string) => {
        const t = text.trim();
        if (!t) return;
        setMsgs((m) => [...m, { role: "user", text: t }]);
        setMsgs((m) => [...m, { role: "assistant", text: "[Demo] Respondería con insights, drivers no sensibles y próximos pasos." }]);
        setQ("");
    };

    return (
        <div className="flex h-full flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-900">Copiloto IA</div>
                        <div className="text-xs text-zinc-500">Situación Actual</div>
                    </div>
                </div>
                <Badge tone="violet">Visible</Badge>
            </div>
            <div className="h-px w-full bg-zinc-100" />

            <div className="flex-1 space-y-3 overflow-auto p-4">
                <div className="space-y-2">
                    {shortcuts.map((s) => (
                        <button
                            key={s}
                            onClick={() => send(s)}
                            type="button"
                            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-white"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    {msgs.map((m, i) => (
                        <div
                            key={i}
                            className={
                                "rounded-2xl px-3 py-2 text-sm shadow-sm " +
                                (m.role === "assistant"
                                    ? "border border-zinc-200 bg-white text-zinc-800"
                                    : "bg-violet-600 text-white")
                            }
                        >
                            {m.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-zinc-100" />

            <div className="space-y-2 p-4">
                <textarea
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Pregunta"
                    className="min-h-[72px] w-full resize-none rounded-2xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-300"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setQ("")}
                        type="button"
                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={() => send(q)}
                        type="button"
                        className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Enviar <ChevronRight className="ml-2 inline h-4 w-4" />
                    </button>
                </div>
                <div className="text-[11px] leading-relaxed text-zinc-500">Sin datos clínicos · Configurable por empresa</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SituacionActual() {
    const { company, groups } = useCompanyData();
    const [modal, setModal] = useState<ModalState>({ kind: "none" });
    const [unitType, setUnitType] = useState<UnitType>("Centro");
    const [unitQuery, setUnitQuery] = useState("");
    const [criticalOnly, setCriticalOnly] = useState(false);
    const [scope, setScope] = useState<"empresa" | "unidad">("empresa");

    const demoData = useMemo(
        () => generateDemoData(groups, company.employees),
        [groups, company.employees]
    );

    const kpi = useMemo(
        () => ({
            absentToday: demoData.totalAbsentRate,
            redUnits: demoData.RED_UNITS.length,
            costMonth: demoData.costMonth,
            costR12: demoData.costR12,
            predictedAnnual: demoData.predictedAnnualCost,
            savings: demoData.savingsCaptured,
        }),
        [demoData]
    );

    const filteredTop = useMemo(() => {
        const q = unitQuery.trim().toLowerCase();
        return demoData.TOP_FOCI.filter((r) => (!criticalOnly ? true : r.critical))
            .filter((r) => r.unitType === unitType)
            .filter((r) => (!q ? true : r.unit.toLowerCase().includes(q)));
    }, [criticalOnly, unitQuery, unitType, demoData.TOP_FOCI]);

    const filteredUnits = useMemo(() => {
        const q = unitQuery.trim().toLowerCase();
        return demoData.RED_UNITS.filter((u) => (!q ? true : u.unit.toLowerCase().includes(q)))
            .filter((u) => (unitType ? u.unitType === unitType : true))
            .filter((u) => (!criticalOnly ? true : u.critical))
            .slice()
            .sort((a, b) => b.riskScore - a.riskScore);
    }, [criticalOnly, unitQuery, unitType, demoData.RED_UNITS]);

    const costLines = useMemo(() => {
        const scale = company.employees / 320; // Escalar respecto demo
        if (scope === "empresa") return COST_LINES.map((x) => ({ ...x, eur: Math.round(x.eur * scale) }));
        if (!unitQuery.trim()) return COST_LINES.map((x) => ({ ...x, eur: 0 }));
        return COST_LINES.map((x) => ({ ...x, eur: Math.round(x.eur * 0.18 * scale) }));
    }, [scope, unitQuery, company.employees]);

    const costTotal = useMemo(() => costLines.reduce((a, b) => a + b.eur, 0), [costLines]);
    const costMax = useMemo(() => costLines.reduce((m, x) => Math.max(m, x.eur), 0), [costLines]);

    const focusDetail = useMemo(() => {
        if (modal.kind !== "focus") return null;
        const row = modal.row;
        const weights: Array<[string, number]> = [
            ["complement", 0.18], ["substitution", 0.18], ["overtime", 0.08], ["lost_service", 0.12],
            ["efficiency", 0.16], ["quality", 0.10], ["learning", 0.08], ["turnover", 0.06], ["opportunity", 0.04],
        ];
        const dict = new Map(COST_LINES.map((l) => [l.key, l] as const));
        const lines = weights.map(([k, w]) => {
            const base = dict.get(k);
            return base ? { ...base, eur: Math.round(row.eur * w) } : null;
        }).filter(Boolean) as CostLine[];
        return { row, lines };
    }, [modal]);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1400px] px-4 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-zinc-900">Situación Actual</h1>
                                <p className="mt-1 text-xs text-zinc-500 font-medium">Análisis de impacto y ahorro capturado · {new Date().toLocaleDateString("es-ES")}</p>
                            </div>
                        </div>

                        {/* ROI YTD Section */}
                        <div className="rounded-[32px] border border-emerald-100 bg-emerald-50/30 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-600">
                                <Zap size={80} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Ahorro Capturado YTD (ROI)</div>
                                    <div className="text-4xl font-bold text-zinc-900 tracking-tighter">
                                        {eur(kpi.savings)}
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500 font-medium max-w-sm">
                                        Impacto directo en P&L gracias a la reducción de la tasa de absentismo respecto al baseline previsto.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 border-l border-emerald-100 pl-8">
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Coste Previsto</div>
                                        <div className="text-lg font-bold text-zinc-400 line-through decoration-zinc-300 decoration-1">{eur(kpi.predictedAnnual)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Coste Real</div>
                                        <div className="text-lg font-bold text-zinc-900">{eur(kpi.costR12)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge>Filtros</Badge>
                                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                                        <Search className="h-4 w-4 text-zinc-500" />
                                        <input
                                            value={unitQuery}
                                            onChange={(e) => setUnitQuery(e.target.value)}
                                            placeholder="Unidad (ej: Barcelona)"
                                            className="w-[200px] bg-transparent text-sm outline-none"
                                        />
                                    </div>
                                    <select
                                        value={unitType}
                                        onChange={(e) => setUnitType(e.target.value as UnitType)}
                                        className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm shadow-sm"
                                    >
                                        {UNIT_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                                    <span className="text-sm font-medium text-zinc-700">Solo críticos</span>
                                    <input
                                        type="checkbox"
                                        checked={criticalOnly}
                                        onChange={(e) => setCriticalOnly(e.target.checked)}
                                        className="h-4 w-4 accent-violet-600"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <Target className="h-4 w-4 text-violet-700" /> Hoy · % plantilla ausente
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{pct(kpi.absentToday)}</div>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => setModal({ kind: "absences" })}
                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                        type="button"
                                    >
                                        Ver más <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <AlertTriangle className="h-4 w-4 text-violet-700" /> Unidades en rojo
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{kpi.redUnits}</div>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => setModal({ kind: "units" })}
                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                        type="button"
                                    >
                                        Ver más <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <PiggyBank className="h-4 w-4 text-violet-700" /> Coste mes (acumulado)
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{eur(kpi.costMonth)}</div>
                                <div className="mt-1 text-xs text-zinc-500">MTD = Month To Date</div>
                            </div>

                            <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                    <PiggyBank className="h-4 w-4 text-violet-700" /> Coste anual móvil (12m)
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-zinc-900">{eur(kpi.costR12)}</div>
                                <div className="mt-1 text-xs text-zinc-500">Rolling 12</div>
                            </div>
                        </div>

                        <Card
                            title={<span>Costes asociados al absentismo <span className="text-zinc-400">(desglose)</span></span>}
                            right={<Badge tone="violet">{eur(costTotal)}</Badge>}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setScope("empresa")}
                                        className={
                                            "rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm " +
                                            (scope === "empresa"
                                                ? "border-violet-200 bg-violet-600 text-white"
                                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                                        }
                                    >
                                        Empresa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScope("unidad")}
                                        className={
                                            "rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm " +
                                            (scope === "unidad"
                                                ? "border-violet-200 bg-violet-600 text-white"
                                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                                        }
                                    >
                                        Por unidad
                                    </button>
                                    <Badge>
                                        {scope === "empresa" ? "Vista empresa" : unitQuery.trim() ? `Unidad: ${unitQuery.trim()}` : "Selecciona unidad"}
                                    </Badge>
                                </div>
                            </div>

                            {scope === "unidad" && !unitQuery.trim() && (
                                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                                    Escribe una unidad en el filtro para ver su desglose.
                                </div>
                            )}

                            <div className="mt-4 space-y-3">
                                {costLines.map((l) => (
                                    <div key={l.key} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900">{l.label}</div>
                                                <div className="mt-1 text-xs text-zinc-600">{l.desc}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-zinc-900">{eur(l.eur)}</div>
                                                <div className="mt-1 text-xs text-zinc-500">Mes</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <MiniBar value={l.eur} max={costMax} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            title={<span>Top focos de coste <span className="text-zinc-400">(ver detalle)</span></span>}
                            right={<Badge tone="violet">Top {Math.min(4, filteredTop.length)}</Badge>}
                        >
                            <div className="space-y-2">
                                {filteredTop.slice(0, 4).map((r) => (
                                    <div key={`${r.unit}-${r.role}-${r.shift}`} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-semibold text-zinc-900">{r.unit}</div>
                                                    {r.critical ? <Badge tone="violet">crítico</Badge> : <Badge>no crítico</Badge>}
                                                </div>
                                                <div className="mt-1 text-xs text-zinc-600">{r.role} · {r.shift}</div>
                                                <div className="mt-1 text-xs text-zinc-500">Tasa {pct(r.absRate)} · Tendencia {(r.trend * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-zinc-900">{eur(r.eur)}</div>
                                                <div className="mt-1 text-xs text-zinc-500">Mes</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setModal({ kind: "focus", row: r })}
                                                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                                            >
                                                Ver detalle <ChevronRight className="ml-2 inline h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {filteredTop.length === 0 && (
                                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                                        No hay resultados.
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div id="copilot" className="lg:hidden">
                            <CopilotPanel />
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="sticky top-6 h-[calc(100vh-48px)]">
                            <CopilotPanel />
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={modal.kind !== "none"}
                title={
                    modal.kind === "absences"
                        ? "Personas ausentes hoy"
                        : modal.kind === "units"
                            ? "Unidades en rojo"
                            : modal.kind === "focus"
                                ? "Detalle foco de coste"
                                : ""
                }
                onClose={() => setModal({ kind: "none" })}
            >
                {modal.kind === "absences" && (
                    <div className="space-y-3">
                        <div className="text-sm text-zinc-700">
                            Listado con los datos disponibles (nombre, fechas, coste, unidad, etc.).
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                            <table className="min-w-[900px] w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-xs text-zinc-600">
                                    <tr>
                                        <th className="p-3">Persona</th>
                                        <th className="p-3">Inicio</th>
                                        <th className="p-3">Prev. alta</th>
                                        <th className="p-3">Coste mes</th>
                                        <th className="p-3">Unidad</th>
                                        <th className="p-3">Depto</th>
                                        <th className="p-3">Rol</th>
                                        <th className="p-3">Turno</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demoData.ABSENCES.map((e) => (
                                        <tr key={e.id} className="border-t border-zinc-200 bg-white">
                                            <td className="p-3">
                                                <div className="font-medium text-zinc-900">{e.name}</div>
                                                <div className="text-xs text-zinc-500">{e.id}</div>
                                            </td>
                                            <td className="p-3 text-zinc-700">{dmy(e.start)}</td>
                                            <td className="p-3 text-zinc-700">{dmy(e.expected)}</td>
                                            <td className="p-3 font-medium text-zinc-900">{eur(e.costMonth)}</td>
                                            <td className="p-3 text-zinc-700">{e.unit}</td>
                                            <td className="p-3 text-zinc-700">{e.dept}</td>
                                            <td className="p-3 text-zinc-700">{e.role}</td>
                                            <td className="p-3 text-zinc-700">{e.shift}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {modal.kind === "units" && (
                    <div className="space-y-3">
                        <div className="text-sm text-zinc-700">Listado de unidades fuera de umbral hoy.</div>
                        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                            <table className="min-w-[700px] w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-xs text-zinc-600">
                                    <tr>
                                        <th className="p-3">Unidad</th>
                                        <th className="p-3">Tipo</th>
                                        <th className="p-3">Crítica</th>
                                        <th className="p-3">Ausentes</th>
                                        <th className="p-3">Tasa</th>
                                        <th className="p-3">Coste mes</th>
                                        <th className="p-3">Riesgo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnits.map((u) => (
                                        <tr key={`${u.unit}-${u.unitType}`} className="border-t border-zinc-200 bg-white">
                                            <td className="p-3 font-medium text-zinc-900">{u.unit}</td>
                                            <td className="p-3 text-zinc-700">{u.unitType}</td>
                                            <td className="p-3">{u.critical ? <Badge tone="violet">Sí</Badge> : <Badge>No</Badge>}</td>
                                            <td className="p-3 text-zinc-700">{u.absentToday}</td>
                                            <td className="p-3 text-zinc-700">{pct(u.absentRate)}</td>
                                            <td className="p-3 font-medium text-zinc-900">{eur(u.costMonth)}</td>
                                            <td className="p-3">
                                                <Badge tone={u.riskScore >= 85 ? "red" : u.riskScore >= 70 ? "amber" : "neutral"}>{u.riskScore}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {modal.kind === "focus" && focusDetail && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <div className="text-sm font-semibold text-zinc-900">{focusDetail.row.unit}</div>
                                <div className="mt-1 text-xs text-zinc-600">{focusDetail.row.role} · {focusDetail.row.shift}</div>
                                <div className="mt-1 text-xs text-zinc-500">Tasa {pct(focusDetail.row.absRate)} · Tendencia {(focusDetail.row.trend * 100).toFixed(0)}%</div>
                            </div>
                            <Badge tone="violet">{eur(focusDetail.row.eur)} / mes</Badge>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-violet-700" />
                                <span className="font-semibold">Qué incluye</span>
                            </div>
                            <div className="mt-1 text-zinc-700">Desglose por conceptos. Ajustable por empresa y por unidad.</div>
                        </div>

                        <div className="space-y-3">
                            {focusDetail.lines.map((l) => (
                                <div key={l.key} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-zinc-900">{l.label}</div>
                                            <div className="mt-1 text-xs text-zinc-600">{l.desc}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-zinc-900">{eur(l.eur)}</div>
                                            <div className="mt-1 text-xs text-zinc-500">Mes</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
