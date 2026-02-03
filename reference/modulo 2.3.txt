import React, { useMemo, useState } from "react";
import { Brain, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

// Módulo 2.3 — Benchmark económico (poco pero MUY útil)
// Demo con 1 CNAE: 47 Comercio al por menor (España) + ajuste regional (Servicios)

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

// Fuente: Randstad Research · Informe trimestral de absentismo laboral (Diciembre 2025) · periodo 2025T3
const BENCH_CNAE47_ES = {
  cnae: "47",
  name: "Comercio al por menor (excepto vehículos)",
  period: "2025T3",
  absent: 0.07,
  absentYoYpp: 0.9,
  it: 0.055,
  itYoYpp: 0.6,
  epaK: 2079,
  itK: 115,
  absentK: 144,
};

const SERVICES_CCAA_2025T3 = [
  { ccaa: "España", absent: 0.066, it: 0.052 },
  { ccaa: "Madrid", absent: 0.057, it: 0.043 },
  { ccaa: "Cataluña", absent: 0.064, it: 0.05 },
  { ccaa: "Com. Valenciana", absent: 0.066, it: 0.053 },
  { ccaa: "Andalucía", absent: 0.065, it: 0.05 },
  { ccaa: "País Vasco", absent: 0.077, it: 0.059 },
];

// ---------- utils ----------
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

function Badge({ children, t = "neutral" }: { children: React.ReactNode; t?: "neutral" | "good" | "bad" | "violet" }) {
  const cls =
    t === "violet"
      ? "bg-violet-50 text-violet-700 border-violet-200"
      : t === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : t === "bad"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-zinc-50 text-zinc-700 border-zinc-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{children}</span>;
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

function MiniBar({ value, max }: { value: number; max: number }) {
  const w = max <= 0 ? 0 : clamp(value / max, 0, 1);
  return (
    <div className="h-2 w-full rounded-full bg-zinc-100">
      <div className="h-2 rounded-full bg-violet-600" style={{ width: `${Math.round(w * 100)}%` }} />
    </div>
  );
}

function Field({ label, value, onChange, suffix, min, max, step }: any) {
  return (
    <label className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-zinc-600">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <input
          className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <Badge>{suffix}</Badge>
      </div>
    </label>
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
            <Sparkles className="h-4 w-4 text-violet-700" /> Recomendación (ejemplo)
          </div>
          <div className="mt-2 text-sm text-zinc-800">{text}</div>
          <button
            disabled
            className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white opacity-60"
            title="Demo visual: aquí iría la acción real"
          >
            Convertir en plan de acción (demo)
          </button>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
          <div className="font-semibold">Preguntas útiles</div>
          <div className="mt-2 grid gap-2">
            {["Explícamelo para CEO en 30s", "¿Dónde estoy peor: sector o región?", "¿Qué ahorro si igualo benchmark?"]
              .slice(0, 3)
              .map((s) => (
                <div key={s} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
                  {s}
                </div>
              ))}
          </div>
        </div>
        <div className="text-[11px] leading-relaxed text-zinc-500">Panel visual. La respuesta real vendrá del LLM con tus datos.</div>
      </div>
    </div>
  );
}

export default function Module2_3_BenchmarkEconomico() {
  // En real viene de Módulo 1; aquí lo simulamos con inputs.
  const [province, setProvince] = useState<Province>("Madrid");
  const [scope, setScope] = useState<Scope>("Mes");

  const [employees, setEmployees] = useState<number>(600);
  const [avgSalaryMonth, setAvgSalaryMonth] = useState<number>(1850);

  const [companyAbsent, setCompanyAbsent] = useState<number>(7.8); // %
  const [companyIT, setCompanyIT] = useState<number>(6.1); // %

  const [mult, setMult] = useState<number>(1.35); // multiplica para acercar coste total

  const ccaa = PROVINCE_TO_CCAA[province];

  const regionServices = useMemo(() => {
    return SERVICES_CCAA_2025T3.find((r) => r.ccaa === ccaa) || SERVICES_CCAA_2025T3[0];
  }, [ccaa]);

  const spainServices = SERVICES_CCAA_2025T3[0];

  // Ajuste regional estimado (no hay tabla CNAE×CCAA en la fuente)
  const estCnaeRegion = useMemo(() => {
    const fAbs = regionServices.absent / spainServices.absent;
    const fIT = regionServices.it / spainServices.it;
    return {
      absent: BENCH_CNAE47_ES.absent * fAbs,
      it: BENCH_CNAE47_ES.it * fIT,
      confidence: "Media", // por ser estimación
    };
  }, [regionServices, spainServices]);

  const companyAbs = clamp(companyAbsent / 100, 0, 0.5);
  const companyIt = clamp(companyIT / 100, 0, 0.5);

  const benchAbsES = BENCH_CNAE47_ES.absent;
  const benchItES = BENCH_CNAE47_ES.it;

  const deltaSector = companyAbs - benchAbsES;
  const deltaRegionEst = companyAbs - estCnaeRegion.absent;

  const payrollYear = employees * avgSalaryMonth * 12;
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
      ? `Estás ${pp(deltaSector)} por encima del benchmark sectorial (CNAE 47, España). Si igualaras el benchmark, el impacto estimado sería ~${eur(
          savingIfSector
        )} (${scope}).`
      : `Estás en línea o por debajo del benchmark sectorial (CNAE 47, España). Tu prioridad no es “bajar tasa”, sino controlar los costes de cobertura y la variabilidad por unidad.`;

    const itMsg =
      itShareCompany >= itShareBench + 0.05
        ? `Además, en tu mix hay más peso de IT que en el benchmark (IT ~${pct(itShareCompany)} del total vs ~${pct(itShareBench)}).`
        : itShareCompany <= itShareBench - 0.05
        ? `Tu mix tiene menos peso de IT que el benchmark (IT ~${pct(itShareCompany)} vs ~${pct(itShareBench)}). Revisa ausencias no IT y disciplina operativa.`
        : `Tu mix IT/no-IT está cerca del benchmark. Buen punto de partida para priorizar por €.`;

    const regionMsg = `En ${province} (proxy Servicios), la región está en ${pct(regionServices.absent)} (España: ${pct(spainServices.absent)}). Esto te ayuda a separar “problema interno” vs “entorno”.`;

    return `${main} ${itMsg} ${regionMsg}`;
  }, [deltaSector, savingIfSector, scope, itShareCompany, itShareBench, province, regionServices.absent, spainServices.absent]);

  const health = tone(deltaSector);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-500">Módulo 2 · Benchmark económico</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Tu empresa vs benchmark</div>
                <div className="mt-1 text-sm text-zinc-600">Poco pero útil: brecha, lectura y euros.</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge t="violet">Apple UI</Badge>
                <Badge t={health === "bad" ? "bad" : health === "good" ? "good" : "neutral"}>
                  {health === "bad" ? "Por encima" : health === "good" ? "Por debajo" : "En línea"}
                </Badge>
              </div>
            </div>

            <Card
              title={<>1) Contexto de benchmark</>}
              right={<Badge t="neutral">{BENCH_CNAE47_ES.period} · Randstad/INE</Badge>}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">CNAE</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">{BENCH_CNAE47_ES.cnae} · {BENCH_CNAE47_ES.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge t="neutral">Absentismo ES: {pct(benchAbsES)}</Badge>
                    <Badge t="neutral">IT ES: {pct(benchItES)}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">Variación interanual: +{BENCH_CNAE47_ES.absentYoYpp}pp (abs) · +{BENCH_CNAE47_ES.itYoYpp}pp (IT)</div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Provincia (demo)</div>
                  <select
                    className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                    value={province}
                    onChange={(e) => setProvince(e.target.value as Province)}
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-zinc-500">Se usa la CCAA asociada: <span className="font-medium text-zinc-800">{ccaa}</span> (proxy Servicios).</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge t="neutral">Servicios: {pct(regionServices.absent)}</Badge>
                    <Badge t="neutral">IT: {pct(regionServices.it)}</Badge>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Alcance de €</div>
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
                  <div className="mt-2 text-xs text-zinc-500">Multiplicador coste total: {mult.toFixed(2)}× (directo + fricción).</div>
                  <input className="mt-3 w-full" type="range" min={1.0} max={2.0} step={0.05} value={mult} onChange={(e) => setMult(Number(e.target.value))} />
                </div>
              </div>
            </Card>

            <Card title={<>2) Tus datos (en real vienen del Módulo 1)</>} right={<Badge t="neutral">Editable</Badge>}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <Field label="Plantilla" value={employees} onChange={setEmployees} suffix="empleados" min={0} max={500000} step={10} />
                <Field label="Salario medio" value={avgSalaryMonth} onChange={setAvgSalaryMonth} suffix="€/mes" min={0} max={20000} step={50} />
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Nómina anual (estimada)</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{eur(payrollYear)}</div>
                  <div className="mt-1 text-xs text-zinc-500">Sirve para traducir la brecha a €.</div>
                </div>

                <Field label="Absentismo empresa" value={companyAbsent} onChange={setCompanyAbsent} suffix="%" min={0} max={25} step={0.1} />
                <Field label="Absentismo por IT" value={companyIT} onChange={setCompanyIT} suffix="%" min={0} max={25} step={0.1} />
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Mix IT</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge t="neutral">Empresa: {pct(itShareCompany)}</Badge>
                    <Badge t="neutral">Benchmark: {pct(itShareBench)}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">IT como % del absentismo total.</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card title="3) Brecha (sector)" right={<Badge t={tone(deltaSector) === "bad" ? "bad" : tone(deltaSector) === "good" ? "good" : "neutral"}>{pp(deltaSector)}</Badge>}>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">Empresa vs CNAE 47 (España)</div>
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
                        {deltaSector > 0 ? "Estás por encima" : deltaSector < 0 ? "Estás por debajo" : "Estás en línea"} del benchmark sectorial.
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="font-semibold">Traducción a decisión</div>
                    <div className="mt-1 text-zinc-700">Aquí no hay “más gráficos”: solo brecha y € potencial.</div>
                  </div>
                </div>
              </Card>

              <Card title="Brecha (ajustada a región)" right={<Badge t="neutral">Conf. {estCnaeRegion.confidence}</Badge>}>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">CNAE 47 estimado en {ccaa}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-zinc-500">Empresa</div>
                        <div className="text-lg font-semibold text-zinc-900">{pct(companyAbs)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Benchmark (estim.)</div>
                        <div className="text-lg font-semibold text-zinc-900">{pct(estCnaeRegion.absent)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">Estimación: CNAE España × factor regional (Servicios). No hay cruce CNAE×CCAA en la fuente.</div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">Brecha estimada</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{pp(deltaRegionEst)}</div>
                    <div className="mt-1 text-xs text-zinc-500">Útil para separar “entorno” vs “gestión interna”.</div>
                  </div>
                </div>
              </Card>

              <Card title="4) Impacto €" right={<Badge t="violet">{scope}</Badge>}>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">Si igualas benchmark sectorial</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{eur(savingIfSector)}</div>
                    <div className="mt-1 text-xs text-zinc-500">Aproximación: nómina × brecha × multiplicador ({mult.toFixed(2)}×).</div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">Si igualas benchmark ajustado a región</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{eur(savingIfRegionAdj)}</div>
                    <div className="mt-1 text-xs text-zinc-500">Más justo cuando el entorno regional empuja la tasa.</div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="font-semibold">Uso CFO</div>
                    <div className="mt-1 text-zinc-700">Define objetivo en €: “Cerrar brecha” se convierte en ahorro cuantificado.</div>
                  </div>
                </div>
              </Card>
            </div>

            <Card title="5) Lectura regional (proxy Servicios)" right={<Badge t="neutral">5 provincias demo</Badge>}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="font-semibold">Qué te aporta</div>
                    <div className="mt-1 text-zinc-700">Si tu región ya es alta, parte del gap no es “culpa interna”. Si tu región es baja y tú estás alto, el problema es de gestión/diseño del trabajo.</div>
                  </div>
                  <div className="text-xs text-zinc-500">Ordenado por absentismo (Servicios).</div>
                </div>

                <div className="space-y-3">
                  {regionList.rows.map((r) => (
                    <div
                      key={r.province}
                      className={
                        "rounded-3xl border bg-white p-4 shadow-sm " +
                        (r.province === province ? "border-violet-200" : "border-zinc-200")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">{r.province}</div>
                          <div className="mt-1 text-xs text-zinc-500">{r.ccaa} · Servicios</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-zinc-900">{pct(r.absent)}</div>
                          <div className="mt-1 text-xs text-zinc-500">IT {pct(r.it)}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <MiniBar value={r.absent} max={regionList.max} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Fuente · Fecha · Confianza" right={<Badge t="neutral">Transparente</Badge>}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Fuente</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">Randstad Research</div>
                  <div className="mt-1 text-xs text-zinc-500">Basado en cifras oficiales (INE · ETCL).</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Fecha / periodo</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">Diciembre 2025 · {BENCH_CNAE47_ES.period}</div>
                  <div className="mt-1 text-xs text-zinc-500">Benchmark sectorial (CNAE) + regional (CCAA).</div>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Confianza</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge t="good">Alta</Badge>
                    <Badge t="neutral">CNAE España</Badge>
                    <Badge t="bad">Media</Badge>
                    <Badge t="neutral">CNAE×Región (estim.)</Badge>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">Mostramos cuándo el dato es directo y cuándo es estimado.</div>
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
