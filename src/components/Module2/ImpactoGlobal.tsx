import React, { useMemo, useState } from "react";
import { useCompanyData, SubData, Group } from "./Module2Container";
import { Filter, TrendingDown, TrendingUp, PiggyBank, Building2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const num = (v: any) => {
    const n = Number(String(v == null ? "" : v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
};
const clamp = (n: number, a = 0, b = 100) => Math.min(b, Math.max(a, n));
const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(Number.isFinite(n) ? n : 0);
const money = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number.isFinite(n) ? n : 0);
const H = 8;

const TYPES = [
    { k: "AT", l: "AT", n: "Accidente de trabajo" },
    { k: "IT_CORTA", l: "IT corta", n: "IT (1–3 días)" },
    { k: "IT_MEDIA", l: "IT media", n: "IT (4–20 días)" },
    { k: "IT_LARGA", l: "IT larga", n: "IT (21+ días)" },
];

const COST_LINES = [
    { key: "complement", label: "Complemento", desc: "Pagos adicionales si existen." },
    { key: "substitution", label: "Sustitución", desc: "Coste extra por contratar cobertura." },
    { key: "overtime", label: "Horas extra", desc: "Cobertura con equipo interno." },
    { key: "lost_service", label: "Pérdida producción/servicio", desc: "Solo si la empresa define cómo monetizarlo." },
    { key: "efficiency", label: "Ineficiencia del equipo", desc: "Fricción, coordinación, tiempo improductivo." },
    { key: "quality", label: "Errores / retrabajo", desc: "Baja calidad, retrabajos." },
    { key: "learning", label: "Curva aprendizaje", desc: "Bajada temporal de productividad." },
    { key: "turnover", label: "Rotación + onboarding", desc: "Selección e incorporación (proxy)." },
    { key: "opportunity", label: "Oportunidad", desc: "Solo si está definido por la empresa." },
];

const emptySub = (): SubData => ({ substitutedPct: 0, extraCostPct: 0 });

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo de impacto
// ─────────────────────────────────────────────────────────────────────────────

function splitDays(processes: number, avgD: number) {
    const D = Math.max(0, avgD);
    const P = Math.max(0, processes);
    const d13 = P * Math.min(3, D);
    const d415 = P * Math.max(0, Math.min(15, D) - 3);
    const d1620 = P * Math.max(0, Math.min(20, D) - 15);
    const d21 = P * Math.max(0, D - 20);
    return { d13, d415, d1620, d21 };
}

function calcImpact(
    company: any,
    absence: any,
    subs: any,
    groups: Group[],
    filterGroupId: string | null
) {
    const emp = Math.max(0, Math.round(num(company.employees)));
    const hrs = Math.max(1, Math.round(num(company.hours)));
    const sal = Math.max(0, num(company.salary));
    const wh = hrs > 0 ? sal / hrs : 0;
    const payroll = emp * sal;
    const gEmp = (groups || []).reduce((s, g) => s + Math.max(0, Math.round(num(g.employees))), 0);
    const rem = emp - gEmp;
    const ok = rem >= 0;

    const ssFixed = clamp(num(company.ssFixed), 0, 60);
    const ssVar = clamp(num(company.ssVar), 0, 20);
    const ssRate = (ssFixed + ssVar) / 100;

    const brDiv = Math.max(1, num(company.brDiv || 360));
    const comp13 = clamp(num(company.comp13), 0, 100) / 100;
    const comp420 = clamp(num(company.comp420), 0, 40) / 100;
    const comp21 = clamp(num(company.comp21), 0, 25) / 100;

    const avgDur = company.avgDur || {};
    const eff = clamp(num(company.subEff), 0, 100) / 100;
    const rev = Math.max(0, num(company.revenue));
    const workDaysY = hrs / H;
    const prodPerDay = emp > 0 && rev > 0 && workDaysY > 0 ? rev / emp / workDaysY : 0;

    const totals = {
        hours: 0,
        days: 0,
        repl: 0,
        companyMandatory: 0,
        companyComplements: 0,
        companyCotiz: 0,
        mutuaBenefit: 0,
        opp: 0,
        companyTotal: 0,
        totalAll: 0,
    };
    const byType: any = {};

    const typeCalc = (
        k: string,
        empCount: number,
        absPct: number,
        subRow: SubData,
        sal2: number
    ) => {
        const ap = clamp(num(absPct), 0, 100) / 100;
        const hours = empCount * hrs * ap;
        const days = hours / H;
        const wageH = hrs > 0 ? sal2 / hrs : 0;
        const brD = sal2 / brDiv;

        const sub = clamp(num(subRow.substitutedPct), 0, 100) / 100;
        const extra = clamp(num(subRow.extraCostPct), 0, 300) / 100;
        const replH = hours * sub;
        const repl = replH * wageH * (1 + extra);

        const aD = Math.max(
            1,
            num(avgDur[k] || 0) || (k === "IT_CORTA" ? 2 : k === "IT_MEDIA" ? 10 : k === "IT_LARGA" ? 60 : 5)
        );
        const P = days > 0 ? days / aD : 0;
        const s = splitDays(P, aD);

        let companyMandatory = 0;
        let mutuaBenefit = 0;
        let companyComplements = 0;

        if (k === "IT_CORTA" || k === "IT_MEDIA" || k === "IT_LARGA") {
            companyMandatory = 0.6 * brD * s.d415;
            mutuaBenefit = 0.6 * brD * s.d1620 + 0.75 * brD * s.d21;
            companyComplements = brD * (comp13 * s.d13 + comp420 * (s.d415 + s.d1620) + comp21 * s.d21);
        }

        const companyCotiz = brD * ssRate * days;
        const lostDays = Math.max(0, Math.min(days, days * (1 - sub * eff)));
        const opp = prodPerDay * lostDays;

        const companyTotal =
            companyMandatory + companyComplements + companyCotiz + repl + (company.includeOpp ? opp : 0);
        const totalAll = companyTotal + mutuaBenefit;

        return {
            hours,
            days,
            sub,
            companyMandatory,
            companyComplements,
            companyCotiz,
            mutuaBenefit,
            repl,
            opp,
            companyTotal,
            totalAll,
        };
    };

    // Si hay filtro, solo calculamos para ese grupo
    let cohorts: any[];
    if (filterGroupId) {
        const g = groups.find((g) => g.id === filterGroupId);
        if (g) {
            cohorts = [
                {
                    id: g.id,
                    name: g.name,
                    employees: Math.max(0, Math.round(num(g.employees))),
                    salary: Math.max(0, num(g.salary)) || sal,
                    absence: g.absence || {},
                    subs: g.subs || {},
                },
            ];
        } else {
            cohorts = [];
        }
    } else {
        cohorts = [
            {
                id: "__rem__",
                name: "Resto",
                employees: Math.max(0, rem),
                salary: sal,
                absence: absence,
                subs: subs,
            },
        ].concat(
            (groups || []).map((g) => ({
                id: g.id,
                name: g.name,
                employees: Math.max(0, Math.round(num(g.employees))),
                salary: Math.max(0, num(g.salary)) || sal,
                absence: g.absence || {},
                subs: g.subs || {},
            }))
        );
    }

    for (let i = 0; i < TYPES.length; i++) {
        const k = TYPES[i].k;
        const agg = {
            hours: 0,
            days: 0,
            companyMandatory: 0,
            companyComplements: 0,
            companyCotiz: 0,
            mutuaBenefit: 0,
            repl: 0,
            opp: 0,
            companyTotal: 0,
            totalAll: 0,
            sub: 0,
        };
        let wDays = 0;
        for (let c = 0; c < cohorts.length; c++) {
            const co = cohorts[c];
            const r = typeCalc(
                k,
                co.employees,
                (co.absence && co.absence[k]) || 0,
                (co.subs && co.subs[k]) || emptySub(),
                co.salary
            );
            agg.hours += r.hours;
            agg.days += r.days;
            agg.companyMandatory += r.companyMandatory;
            agg.companyComplements += r.companyComplements;
            agg.companyCotiz += r.companyCotiz;
            agg.mutuaBenefit += r.mutuaBenefit;
            agg.repl += r.repl;
            agg.opp += r.opp;
            agg.companyTotal += r.companyTotal;
            agg.totalAll += r.totalAll;
            wDays += r.days;
            agg.sub += r.sub * r.days;
        }
        agg.sub = wDays > 0 ? agg.sub / wDays : 0;
        byType[k] = agg;
        totals.hours += agg.hours;
        totals.days += agg.days;
        totals.companyMandatory += agg.companyMandatory;
        totals.companyComplements += agg.companyComplements;
        totals.companyCotiz += agg.companyCotiz;
        totals.mutuaBenefit += agg.mutuaBenefit;
        totals.repl += agg.repl;
        totals.opp += agg.opp;
        totals.companyTotal += agg.companyTotal;
        totals.totalAll += agg.totalAll;
    }

    const totalEmp = filterGroupId
        ? cohorts.reduce((s, c) => s + c.employees, 0)
        : emp;
    const totalPayroll = filterGroupId
        ? cohorts.reduce((s, c) => s + c.employees * c.salary, 0)
        : payroll;

    const absRate = totalEmp > 0 && hrs > 0 ? (totals.hours / (totalEmp * hrs)) * 100 : 0;
    const provisionEur =
        Math.max(0, num(company.provisionEur)) || (clamp(num(company.provisionPct), 0, 100) / 100) * payroll;
    const unprov = Math.max(0, totals.companyTotal - (filterGroupId ? 0 : provisionEur));

    return {
        ok,
        employees: totalEmp,
        groupEmployees: gEmp,
        remainder: Math.max(0, rem),
        annualHours: hrs,
        salaryAvg: sal,
        wageH: wh,
        payroll: totalPayroll,
        absRate,
        ssFixed,
        ssVar,
        ssRate,
        byType,
        totals,
        provisionEur,
        unprov,
        pctPayroll: totalPayroll > 0 ? totals.companyTotal / totalPayroll : 0,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Card({
    title,
    subtitle,
    right,
    children,
}: {
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

function Badge({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "violet" | "amber" | "red" | "green";
}) {
    const cls =
        tone === "violet"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : tone === "amber"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : tone === "red"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : tone === "green"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
            {children}
        </span>
    );
}

function StatCard({
    icon,
    label,
    value,
    sub,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                {icon}
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
            {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
        </div>
    );
}

function MiniBar({ value, max }: { value: number; max: number }) {
    const w = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
    return (
        <div className="h-2 w-full rounded-full bg-zinc-100">
            <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-violet-600"
                style={{ width: `${Math.round(w * 100)}%` }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ImpactoGlobal() {
    const { company, absence, subs, groups } = useCompanyData();
    const [filterGroup, setFilterGroup] = useState<string | null>(null);

    const impact = useMemo(
        () => calcImpact(company, absence, subs, groups, filterGroup),
        [company, absence, subs, groups, filterGroup]
    );

    // Desglose de costes estimado (basado en proporciones típicas)
    const costBreakdown = useMemo(() => {
        const total = impact.totals.companyTotal;
        // Proporciones típicas
        const weights: Record<string, number> = {
            complement: 0.15,
            substitution: 0.25,
            overtime: 0.12,
            lost_service: 0.15,
            efficiency: 0.12,
            quality: 0.08,
            learning: 0.06,
            turnover: 0.04,
            opportunity: 0.03,
        };
        return COST_LINES.map((line) => ({
            ...line,
            eur: Math.round(total * (weights[line.key] || 0.05)),
        }));
    }, [impact.totals.companyTotal]);

    const costMax = useMemo(
        () => costBreakdown.reduce((m, x) => Math.max(m, x.eur), 0),
        [costBreakdown]
    );

    const filterLabel = filterGroup
        ? groups.find((g) => g.id === filterGroup)?.name || "Grupo"
        : "Toda la empresa";

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <header className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Impacto Global</h1>
                            <p className="mt-1 text-xs text-zinc-500">Coste anual del absentismo · Empresa vs Mutua</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-500" />
                            <select
                                value={filterGroup || ""}
                                onChange={(e) => setFilterGroup(e.target.value || null)}
                                className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm shadow-sm"
                            >
                                <option value="">Toda la empresa</option>
                                {groups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                            <Badge tone={filterGroup ? "violet" : "neutral"}>{filterLabel}</Badge>
                        </div>
                    </div>
                </header>

                {!impact.ok ? (
                    <Card title="Error de configuración">
                        <div className="text-sm text-rose-800">
                            Empleados en grupos superior al total. Corrige en Datos Iniciales.
                        </div>
                    </Card>
                ) : (
                    <main className="space-y-6">
                        {/* KPI Principal */}
                        <div className="rounded-[28px] border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Building2 className="h-5 w-5 text-violet-600" />
                                La empresa asume (estimación)
                            </div>
                            <div className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
                                {money(impact.totals.companyTotal)}
                            </div>
                            <div className="mt-3 text-sm text-zinc-600">
                                Equivale al <b>{(impact.pctPayroll * 100).toFixed(2)}%</b> de la masa salarial{" "}
                                {filterGroup ? "del grupo" : "anual"}.
                            </div>
                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                <StatCard
                                    icon={<TrendingDown className="h-4 w-4 text-rose-600" />}
                                    label="Absentismo no provisionado"
                                    value={money(impact.unprov)}
                                    sub={`Provisión usada: ${money(impact.provisionEur)}`}
                                />
                                <StatCard
                                    icon={<PiggyBank className="h-4 w-4 text-violet-600" />}
                                    label="Coste Mutua/SS"
                                    value={money(impact.totals.mutuaBenefit)}
                                    sub="Prestación desde día 16"
                                />
                                <StatCard
                                    label="Días de ausencia"
                                    value={`${fmt(Number(impact.totals.days.toFixed(1)))} días`}
                                    sub={`${fmt(Number(impact.totals.hours.toFixed(0)))} horas · tasa ${impact.absRate.toFixed(2)}%`}
                                />
                            </div>
                            <div className="mt-6 grid gap-3 md:grid-cols-4">
                                <StatCard
                                    label="Prestación obligatoria (empresa)"
                                    value={money(impact.totals.companyMandatory)}
                                    sub="Días 4–15 (ITCC)"
                                />
                                <StatCard
                                    label="Complementos"
                                    value={money(impact.totals.companyComplements)}
                                    sub="Según % configurado"
                                />
                                <StatCard
                                    label="Cotizaciones"
                                    value={money(impact.totals.companyCotiz)}
                                    sub={`SS total ${((impact.ssRate || 0) * 100).toFixed(2)}%`}
                                />
                                <StatCard
                                    label="Sustituciones"
                                    value={money(impact.totals.repl)}
                                    sub="ETT / overtime"
                                />
                            </div>
                            {company.includeOpp && (
                                <div className="mt-4">
                                    <StatCard
                                        icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
                                        label="Coste de oportunidad"
                                        value={money(impact.totals.opp)}
                                        sub={`Facturación ${money(company.revenue)} · eficacia ${clamp(num(company.subEff), 0, 100)}%`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Detalle por tipología */}
                        <Card
                            title="Detalle por tipología"
                            subtitle="Empresa (directo + sustituciones + oportunidad si aplica)"
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                {TYPES.map((t) => {
                                    const r = impact.byType[t.k];
                                    const w =
                                        impact.totals.companyTotal > 0
                                            ? (r.companyTotal / impact.totals.companyTotal) * 100
                                            : 0;
                                    return (
                                        <div
                                            key={t.k}
                                            className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-zinc-900">{t.n}</div>
                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        {fmt(Number(r.days.toFixed(1)))} días · {fmt(Number(r.hours.toFixed(0)))}h
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-zinc-900">
                                                        {money(r.companyTotal)}
                                                    </div>
                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        Sustit {money(r.repl)} · Mutua {money(r.mutuaBenefit)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <MiniBar value={w} max={100} />
                                            </div>
                                            <div className="mt-3 text-xs text-zinc-500">
                                                Mix empresa: oblig. {money(r.companyMandatory)} · compl.{" "}
                                                {money(r.companyComplements)} · cotiz. {money(r.companyCotiz)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Desglose de costes asociados */}
                        <Card
                            title="Costes asociados al absentismo"
                            subtitle="Desglose por concepto (estimación basada en proporciones típicas)"
                            right={<Badge tone="violet">{money(impact.totals.companyTotal)}</Badge>}
                        >
                            <div className="space-y-3">
                                {costBreakdown.map((l) => (
                                    <div
                                        key={l.key}
                                        className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900">{l.label}</div>
                                                <div className="mt-1 text-xs text-zinc-600">{l.desc}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-zinc-900">{money(l.eur)}</div>
                                                <div className="mt-1 text-xs text-zinc-500">Año</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <MiniBar value={l.eur} max={costMax} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                                <div className="font-semibold">Nota</div>
                                <div className="mt-1 text-zinc-700">
                                    Producción/servicio y oportunidad solo aparecen si la empresa define cómo
                                    monetizarlos. Los conceptos y fórmulas son configurables por empresa.
                                </div>
                            </div>
                        </Card>
                    </main>
                )}
            </div>
        </div>
    );
}
