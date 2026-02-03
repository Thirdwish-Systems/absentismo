import React, { useMemo, useState } from "react";
import { useCompanyData } from "./Module2Container";
import { Brain, Sparkles, TrendingDown, TrendingUp, Target, AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────────────────────

type Scope = "Mes" | "12m";
type Province = "Madrid" | "Barcelona" | "Valencia" | "Sevilla" | "Bizkaia";

const PROVINCES: Province[] = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bizkaia"];

const PROVINCE_TO_CCAA: Record<Province, string> = {
    Madrid: "Madrid",
    Barcelona: "Cataluña",
    Valencia: "Com. Valenciana",
    Sevilla: "Andalucía",
    Bizkaia: "País Vasco",
};

// Fuente: Randstad Research · Informe trimestral de absentismo laboral (Diciembre 2025)
const BENCH_CNAE47_ES = {
    cnae: "47",
    name: "Comercio al por menor (excepto vehículos)",
    period: "2025T3",
    absent: 0.07,
    absentYoYpp: 0.9,
    it: 0.055,
    itYoYpp: 0.6,
};

const CNAE_BENCHMARKS: Record<string, { name: string; absent: number; it: number }> = {
    "01": { name: "Agricultura", absent: 0.045, it: 0.035 },
    "10": { name: "Alimentación", absent: 0.062, it: 0.048 },
    "20": { name: "Química", absent: 0.058, it: 0.044 },
    "24": { name: "Metalurgia", absent: 0.068, it: 0.052 },
    "25": { name: "Productos metálicos", absent: 0.065, it: 0.050 },
    "33": { name: "Reparación maquinaria", absent: 0.061, it: 0.047 },
    "41": { name: "Construcción edificios", absent: 0.052, it: 0.040 },
    "42": { name: "Ingeniería civil", absent: 0.054, it: 0.042 },
    "43": { name: "Construcción especializada", absent: 0.056, it: 0.043 },
    "45": { name: "Venta vehículos", absent: 0.058, it: 0.045 },
    "46": { name: "Comercio mayor", absent: 0.064, it: 0.050 },
    "47": { name: "Comercio menor", absent: 0.070, it: 0.055 },
    "49": { name: "Transporte terrestre", absent: 0.072, it: 0.056 },
    "52": { name: "Logística/almacenamiento", absent: 0.075, it: 0.058 },
    "55": { name: "Alojamiento", absent: 0.068, it: 0.052 },
    "56": { name: "Comidas/bebidas", absent: 0.071, it: 0.055 },
    "62": { name: "Informática", absent: 0.038, it: 0.030 },
    "69": { name: "Legal/contabilidad", absent: 0.042, it: 0.033 },
    "81": { name: "Servicios edificios", absent: 0.078, it: 0.060 },
    "86": { name: "Sanidad", absent: 0.082, it: 0.064 },
};

const SERVICES_CCAA_2025T3 = [
    { ccaa: "España", absent: 0.066, it: 0.052 },
    { ccaa: "Madrid", absent: 0.057, it: 0.043 },
    { ccaa: "Cataluña", absent: 0.064, it: 0.05 },
    { ccaa: "Com. Valenciana", absent: 0.066, it: 0.053 },
    { ccaa: "Andalucía", absent: 0.065, it: 0.05 },
    { ccaa: "País Vasco", absent: 0.077, it: 0.059 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const pp = (x: number) => `${(x * 100).toFixed(1)} pp`;
const eur = (n: number) =>
    Math.round(Number.isFinite(n) ? n : 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

function tone(delta: number) {
    if (delta <= -0.001) return "good";
    if (delta >= 0.001) return "bad";
    return "neutral";
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ children, t = "neutral" }: { children: React.ReactNode; t?: "neutral" | "good" | "bad" | "violet" }) {
    const cls =
        t === "violet"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : t === "good"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : t === "bad"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
            {children}
        </span>
    );
}

function Card({ title, right, children }: { title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
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

function GapBar({ companyValue, benchValue, label }: { companyValue: number; benchValue: number; label: string }) {
    const gap = companyValue - benchValue;
    const maxVal = Math.max(companyValue, benchValue, 0.001);
    const companyWidth = (companyValue / (maxVal * 1.2)) * 100;
    const benchWidth = (benchValue / (maxVal * 1.2)) * 100;
    const isAbove = gap > 0.001;
    const isBelow = gap < -0.001;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>{label}</span>
                <Badge t={isAbove ? "bad" : isBelow ? "good" : "neutral"}>
                    {isAbove ? "+" : ""}{pp(gap)}
                </Badge>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <span className="w-20 text-xs text-zinc-500">Tu empresa</span>
                    <div className="flex-1 h-4 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={`h-4 rounded-full ${isAbove ? "bg-rose-500" : isBelow ? "bg-emerald-500" : "bg-zinc-400"}`}
                            style={{ width: `${Math.min(100, companyWidth)}%` }}
                        />
                    </div>
                    <span className="w-14 text-right text-sm font-semibold text-zinc-900">{pct(companyValue)}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-20 text-xs text-zinc-500">Benchmark</span>
                    <div className="flex-1 h-4 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-4 rounded-full bg-violet-500" style={{ width: `${Math.min(100, benchWidth)}%` }} />
                    </div>
                    <span className="w-14 text-right text-sm font-semibold text-zinc-900">{pct(benchValue)}</span>
                </div>
            </div>
        </div>
    );
}

function CopilotPanel({ text }: { text: string }) {
    return (
        <div className="flex h-full flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-900">Copiloto IA</div>
                        <div className="text-xs text-zinc-500">Benchmark · Lectura para dirección</div>
                    </div>
                </div>
                <Badge t="violet">Visible</Badge>
            </div>
            <div className="h-px w-full bg-zinc-100" />
            <div className="flex-1 space-y-3 overflow-auto p-4">
                <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                        <Sparkles className="h-4 w-4 text-violet-700" /> Análisis de brecha
                    </div>
                    <div className="mt-2 text-sm text-zinc-800">{text}</div>
                    <button
                        disabled
                        className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white opacity-60"
                        title="Demo visual"
                    >
                        Convertir en plan de acción (demo)
                    </button>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="font-semibold">Preguntas útiles</div>
                    <div className="mt-2 grid gap-2">
                        {["Explícamelo para CEO en 30s", "¿Dónde estoy peor: sector o región?", "¿Qué ahorro si igualo benchmark?"].map((s) => (
                            <div key={s} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Benchmark() {
    const { company, absence } = useCompanyData();
    const [province, setProvince] = useState<Province>("Madrid");
    const [scope, setScope] = useState<Scope>("12m");
    const [mult, setMult] = useState<number>(1.35);

    const ccaa = PROVINCE_TO_CCAA[province];

    // Obtener benchmark del sector según CNAE de la empresa
    const sectorBench = useMemo(() => {
        return CNAE_BENCHMARKS[company.cnae] || BENCH_CNAE47_ES;
    }, [company.cnae]);

    const regionServices = useMemo(() => {
        return SERVICES_CCAA_2025T3.find((r) => r.ccaa === ccaa) || SERVICES_CCAA_2025T3[0];
    }, [ccaa]);

    const spainServices = SERVICES_CCAA_2025T3[0];

    // Calcular tasa de absentismo de la empresa desde los datos reales
    const companyAbs = useMemo(() => {
        const total = (absence.AT || 0) + (absence.IT_CORTA || 0) + (absence.IT_MEDIA || 0) + (absence.IT_LARGA || 0);
        return clamp(total / 100, 0, 0.5);
    }, [absence]);

    const companyIt = useMemo(() => {
        const it = (absence.IT_CORTA || 0) + (absence.IT_MEDIA || 0) + (absence.IT_LARGA || 0);
        return clamp(it / 100, 0, 0.5);
    }, [absence]);

    // Ajuste regional estimado
    const estCnaeRegion = useMemo(() => {
        const fAbs = regionServices.absent / spainServices.absent;
        const fIT = regionServices.it / spainServices.it;
        return {
            absent: sectorBench.absent * fAbs,
            it: sectorBench.it * fIT,
            confidence: "Media",
        };
    }, [regionServices, spainServices, sectorBench]);

    const benchAbsES = sectorBench.absent;
    const benchItES = sectorBench.it;

    const deltaSector = companyAbs - benchAbsES;
    const deltaRegionEst = companyAbs - estCnaeRegion.absent;

    const payrollYear = company.employees * company.salary;
    const scale = scope === "Mes" ? 1 / 12 : 1;

    const savingIfSector = Math.max(0, deltaSector) * payrollYear * scale * mult;
    const savingIfRegionAdj = Math.max(0, deltaRegionEst) * payrollYear * scale * mult;

    const itShareCompany = companyAbs > 0 ? clamp(companyIt / companyAbs, 0, 1) : 0;
    const itShareBench = benchAbsES > 0 ? benchItES / benchAbsES : 0;

    const regionList = useMemo(() => {
        const rows = PROVINCES.map((p) => {
            const c = PROVINCE_TO_CCAA[p];
            const r = SERVICES_CCAA_2025T3.find((x) => x.ccaa === c) || spainServices;
            return { province: p, ccaa: c, absent: r.absent, it: r.it };
        });
        rows.sort((a, b) => b.absent - a.absent);
        const max = rows[0]?.absent || 0.01;
        return { rows, max };
    }, [spainServices]);

    const copilotText = useMemo(() => {
        const worse = deltaSector > 0;
        const main = worse
            ? `Estás ${pp(deltaSector)} por encima del benchmark sectorial (CNAE ${company.cnae}, España). Si igualaras el benchmark, el impacto estimado sería ~${eur(savingIfSector)} (${scope}).`
            : `Estás en línea o por debajo del benchmark sectorial (CNAE ${company.cnae}, España). Tu prioridad no es bajar tasa, sino controlar los costes de cobertura y la variabilidad por unidad.`;

        const itMsg =
            itShareCompany >= itShareBench + 0.05
                ? `Además, en tu mix hay más peso de IT que en el benchmark (IT ~${pct(itShareCompany)} del total vs ~${pct(itShareBench)}).`
                : itShareCompany <= itShareBench - 0.05
                    ? `Tu mix tiene menos peso de IT que el benchmark (IT ~${pct(itShareCompany)} vs ~${pct(itShareBench)}). Revisa ausencias no IT.`
                    : `Tu mix IT/no-IT está cerca del benchmark.`;

        const regionMsg = `En ${province} (proxy Servicios), la región está en ${pct(regionServices.absent)} (España: ${pct(spainServices.absent)}).`;

        return `${main} ${itMsg} ${regionMsg}`;
    }, [deltaSector, savingIfSector, scope, itShareCompany, itShareBench, province, regionServices.absent, spainServices.absent, company.cnae]);

    const health = tone(deltaSector);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[1400px] px-4 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Benchmark</h1>
                                <p className="mt-1 text-xs text-zinc-500">Tu empresa vs sector y región</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge t={health === "bad" ? "bad" : health === "good" ? "good" : "neutral"}>
                                    {health === "bad" ? "Por encima del benchmark" : health === "good" ? "Por debajo" : "En línea"}
                                </Badge>
                            </div>
                        </div>

                        {/* BRECHA PRINCIPAL - Visualización prominente */}
                        <div className="rounded-[28px] border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-violet-900">
                                <Target className="h-5 w-5" />
                                Brecha con el Sector
                            </div>
                            <div className="mt-4 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`text-6xl font-bold tracking-tight ${deltaSector > 0 ? "text-rose-600" : deltaSector < 0 ? "text-emerald-600" : "text-zinc-600"}`}>
                                        {deltaSector >= 0 ? "+" : ""}{pp(deltaSector)}
                                    </div>
                                    <div className="mt-2 text-sm text-zinc-600">
                                        Tu empresa: <b>{pct(companyAbs)}</b> vs Sector: <b>{pct(benchAbsES)}</b>
                                    </div>
                                    {deltaSector > 0 && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-rose-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-sm font-medium">Por encima del benchmark</span>
                                        </div>
                                    )}
                                    {deltaSector < 0 && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600">
                                            <TrendingDown className="h-4 w-4" />
                                            <span className="text-sm font-medium">Por debajo del benchmark</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <GapBar companyValue={companyAbs} benchValue={benchAbsES} label="Tasa de absentismo" />
                            </div>
                            {deltaSector > 0 && (
                                <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4">
                                    <div className="text-sm font-semibold text-rose-800">Impacto potencial</div>
                                    <div className="mt-2 text-2xl font-bold text-rose-900">{eur(savingIfSector)}</div>
                                    <div className="mt-1 text-xs text-rose-700">
                                        Ahorro estimado si igualaras el benchmark ({scope})
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Brecha Sector */}
                            <Card
                                title="Brecha (Sector)"
                                right={<Badge t={tone(deltaSector) === "bad" ? "bad" : tone(deltaSector) === "good" ? "good" : "neutral"}>{pp(deltaSector)}</Badge>}
                            >
                                <div className="space-y-3">
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="text-xs font-medium text-zinc-600">Tu empresa vs CNAE {company.cnae} (España)</div>
                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-xs text-zinc-500">Empresa</div>
                                                <div className="text-lg font-semibold text-zinc-900">{pct(companyAbs)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-zinc-500">Benchmark</div>
                                                <div className="text-lg font-semibold text-zinc-900">{pct(benchAbsES)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
                                            {deltaSector >= 0 ? <TrendingUp className="h-4 w-4 text-rose-600" /> : <TrendingDown className="h-4 w-4 text-emerald-600" />}
                                            <span>
                                                {deltaSector > 0 ? "Por encima" : deltaSector < 0 ? "Por debajo" : "En línea"} del benchmark sectorial.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="text-xs font-medium text-zinc-600">Si igualas benchmark sectorial</div>
                                        <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{eur(savingIfSector)}</div>
                                        <div className="mt-1 text-xs text-zinc-500">Aproximación: nómina × brecha × multiplicador ({mult.toFixed(2)}×).</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Brecha Regional */}
                            <Card title="Brecha (Ajustada a región)" right={<Badge t="neutral">Conf. {estCnaeRegion.confidence}</Badge>}>
                                <div className="space-y-3">
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="text-xs font-medium text-zinc-600">CNAE {company.cnae} estimado en {ccaa}</div>
                                        <div className="mt-2">
                                            <select
                                                className="w-full h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value as Province)}
                                            >
                                                {PROVINCES.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-xs text-zinc-500">Empresa</div>
                                                <div className="text-lg font-semibold text-zinc-900">{pct(companyAbs)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-zinc-500">Benchmark (estim.)</div>
                                                <div className="text-lg font-semibold text-zinc-900">{pct(estCnaeRegion.absent)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <div className="text-xs font-medium text-zinc-600">Si igualas benchmark regional</div>
                                        <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{eur(savingIfRegionAdj)}</div>
                                        <div className="mt-1 text-xs text-zinc-500">Más justo cuando el entorno regional empuja la tasa.</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Configuración */}
                        <Card title="Configuración del análisis" right={<Badge t="neutral">Editable</Badge>}>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-medium text-zinc-600">Sector (CNAE)</div>
                                    <div className="mt-2 text-sm font-semibold text-zinc-900">{company.cnae} · {sectorBench.name}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge t="neutral">Abs ES: {pct(benchAbsES)}</Badge>
                                        <Badge t="neutral">IT ES: {pct(benchItES)}</Badge>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-medium text-zinc-600">Alcance temporal</div>
                                    <div className="mt-2 flex gap-2">
                                        {(["Mes", "12m"] as Scope[]).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setScope(s)}
                                                className={
                                                    "rounded-full border px-3 py-2 text-sm " +
                                                    (scope === s ? "border-violet-200 bg-violet-600 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                                                }
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-medium text-zinc-600">Multiplicador coste</div>
                                    <div className="mt-2 text-sm text-zinc-700">{mult.toFixed(2)}× (directo + fricción)</div>
                                    <input
                                        className="mt-3 w-full"
                                        type="range"
                                        min={1.0}
                                        max={2.0}
                                        step={0.05}
                                        value={mult}
                                        onChange={(e) => setMult(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Lectura regional */}
                        <Card title="Lectura regional (proxy Servicios)" right={<Badge t="neutral">5 provincias demo</Badge>}>
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                                        <div className="font-semibold">Qué te aporta</div>
                                        <div className="mt-1 text-zinc-700">
                                            Si tu región ya es alta, parte del gap no es culpa interna. Si tu región es baja y tú estás alto, el problema es de gestión.
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {regionList.rows.map((r) => (
                                        <div
                                            key={r.province}
                                            className={`rounded-2xl border bg-white p-3 shadow-sm ${r.province === province ? "border-violet-300" : "border-zinc-200"}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-zinc-900">{r.province}</div>
                                                    <div className="text-xs text-zinc-500">{r.ccaa}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-zinc-900">{pct(r.absent)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="hidden lg:block">
                        <div className="sticky top-6 h-[calc(100vh-48px)]">
                            <CopilotPanel text={copilotText} />
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <CopilotPanel text={copilotText} />
                    </div>
                </div>
            </div>
        </div>
    );
}
