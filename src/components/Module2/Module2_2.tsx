import React, { useMemo, useState } from "react";
import { Brain, Sparkles, Target, Wand2, X } from "lucide-react";

// Módulo 2.3  Escenarios económicos (capilar y accionable)

const PROVINCES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bizkaia"] as const;
type Province = (typeof PROVINCES)[number];

type Level = "Empresa" | "Provincia" | "Tienda";
type Period = "Mes" | "12m" | "Campaña";

type Store = {
  id: string;
  province: Province;
  name: string;
  employees: number;
  avgSalaryMonth: number;
  tag: "Principal" | "Normal";
};

const STORES: Store[] = [
  { id: "MAD-1", province: "Madrid", name: "Madrid · Gran Vía", employees: 46, avgSalaryMonth: 1900, tag: "Principal" },
  { id: "MAD-2", province: "Madrid", name: "Madrid · Retiro", employees: 22, avgSalaryMonth: 1700, tag: "Normal" },
  { id: "BCN-1", province: "Barcelona", name: "Barcelona · Diagonal", employees: 34, avgSalaryMonth: 1850, tag: "Principal" },
  { id: "VAL-1", province: "Valencia", name: "Valencia · Centro", employees: 28, avgSalaryMonth: 1650, tag: "Principal" },
  { id: "SEV-1", province: "Sevilla", name: "Sevilla · Nervión", employees: 24, avgSalaryMonth: 1600, tag: "Normal" },
  { id: "BIZ-1", province: "Bizkaia", name: "Bilbao · Centro", employees: 18, avgSalaryMonth: 1750, tag: "Normal" },
];

const COSTS = [
  { key: "direct", label: "Coste salarial directo", desc: "Tiempo no trabajado (base)" },
  { key: "complement", label: "Complemento", desc: "Pagos adicionales si existen" },
  { key: "substitution", label: "Sustitución", desc: "Cobertura externa/temporal" },
  { key: "overtime", label: "Horas extra", desc: "Cobertura interna" },
  { key: "lost_service", label: "Pérdida producción/servicio", desc: "Solo si la empresa lo monetiza" },
  { key: "efficiency", label: "Pérdida de eficiencia", desc: "Fricción, coordinación" },
  { key: "quality", label: "Baja calidad / retrabajo", desc: "Errores y retrabajo" },
  { key: "learning", label: "Curva de aprendizaje", desc: "Productividad inicial" },
  { key: "turnover", label: "Rotación + onboarding", desc: "Selección e incorporación" },
  { key: "opportunity", label: "Coste de oportunidad", desc: "Solo si está definido" },
] as const;

type CostKey = (typeof COSTS)[number]["key"];

type ModalKind = "none" | "explain" | "assumptions";

// ---------- Utils ----------

const eur = (n: number) =>
  Math.round(Number.isFinite(n) ? n : 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

const pct = (n: number) => `${((Number.isFinite(n) ? n : 0) * 100).toFixed(1)}%`;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// ---------- UI (simple, Apple-ish) ----------

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "violet" | "amber";
}) {
  const cls =
    tone === "violet"
      ? "bg-violet-50 text-violet-700 border-violet-200"
      : tone === "amber"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-zinc-50 text-zinc-700 border-zinc-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{children}</span>;
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
  const w = max <= 0 ? 0 : clamp(value / max, 0, 1);
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
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl p-3 sm:bottom-auto sm:top-10">
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

function RangeRow({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-zinc-600">{label}</div>
          <div className="mt-1 text-xs text-zinc-500">{hint}</div>
        </div>
        <Badge>{`${value.toFixed(unit === "pp" ? 1 : 0)} ${unit}`}</Badge>
      </div>
      <input
        className="mt-3 w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function CopilotPanel({
  insight,
}: {
  insight: { headline: string; detail: string; note: string } | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Copiloto IA</div>
            <div className="text-xs text-zinc-500">Recomendación · Prioridad por </div>
          </div>
        </div>
        <Badge tone="violet">Visible</Badge>
      </div>
      <div className="h-px w-full bg-zinc-100" />

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {insight ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                  <Wand2 className="h-4 w-4 text-violet-700" /> Prioridad sugerida
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-900">{insight.headline}</div>
              </div>
              <Badge tone="violet">Por </Badge>
            </div>
            <div className="mt-2 text-sm text-zinc-700">{insight.detail}</div>
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
              <span className="font-semibold">Nota:</span> {insight.note}
            </div>
            <button
              type="button"
              disabled
              className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white opacity-60"
              title="Demo visual: la activación real se hará en Módulo 4"
            >
              Activar recomendación (demo)
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            Ajusta una palanca para que el Copiloto sugiera la prioridad por .
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
          <div className="font-semibold">Ejemplos</div>
          <div className="mt-2 grid gap-2">
            {[
              "¿Qué compensa más: bajar absentismo o sustitución?",
              "Explícamelo para CFO en 5 líneas",
              "3 decisiones accionables en 30 días",
            ].map((s) => (
              <div key={s} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] leading-relaxed text-zinc-500">
          Panel de ejemplo visual. La respuesta real vendrá del LLM conectado a tus datos.
        </div>
      </div>
    </div>
  );
}

// ---------- Economic engine (simple, defendible) ----------

function pickStores(level: Level, province: Province, storeId: string) {
  if (level === "Empresa") return STORES;
  if (level === "Provincia") return STORES.filter((s) => s.province === province);
  return STORES.filter((s) => s.id === storeId);
}

function periodScale(p: Period) {
  if (p === "Mes") return 1 / 12;
  if (p === "12m") return 1;
  return 2 / 12; // Campaña ~2 meses (ajustable)
}

function baseLines(annualSalary: number, absRate: number, scale: number): Record<CostKey, number> {
  const direct = annualSalary * absRate * scale;
  return {
    direct,
    complement: direct * 0.26,
    substitution: direct * 0.32,
    overtime: direct * 0.12,
    lost_service: direct * 0.08,
    efficiency: direct * 0.06,
    quality: direct * 0.035,
    learning: direct * 0.025,
    turnover: direct * 0.02,
    opportunity: direct * 0.02,
  };
}

function scenarioLines(
  base: Record<CostKey, number>,
  enabled: Record<CostKey, boolean>,
  absBase: number,
  absNew: number,
  substitutionPct: number,
  overtimePct: number
) {
  const absFactor = absBase <= 0 ? 1 : clamp(absNew / absBase, 0, 2);
  const s: Record<CostKey, number> = { ...base };

  s.direct = base.direct * absFactor;
  s.complement = base.complement * absFactor;
  s.substitution = base.substitution * (0.55 * absFactor + 0.45) * (1 - substitutionPct / 100);
  s.overtime = base.overtime * (0.5 * absFactor + 0.5) * (1 - overtimePct / 100);

  // Impactos (sin sliders, solo reacción al absentismo)
  s.lost_service = base.lost_service * (0.35 * absFactor + 0.65);
  s.efficiency = base.efficiency * (0.35 * absFactor + 0.65);
  s.quality = base.quality * (0.35 * absFactor + 0.65);
  s.learning = base.learning * (0.35 * absFactor + 0.65);
  s.turnover = base.turnover * (0.25 * absFactor + 0.75);
  s.opportunity = base.opportunity * (0.25 * absFactor + 0.75);

  (Object.keys(s) as CostKey[]).forEach((k) => {
    if (!enabled[k]) s[k] = 0;
  });

  return s;
}

function sumLines(x: Record<CostKey, number>) {
  return (Object.keys(x) as CostKey[]).reduce((a, k) => a + x[k], 0);
}

export default function Module2_3_EconomicScenarios() {
  const [modal, setModal] = useState<ModalKind>("none");

  const [level, setLevel] = useState<Level>("Empresa");
  const [province, setProvince] = useState<Province>("Madrid");
  const [storeId, setStoreId] = useState<string>(STORES[0].id);
  const [period, setPeriod] = useState<Period>("Mes");

  const [absMode, setAbsMode] = useState<"pp" | "%">("pp");
  const [absPP, setAbsPP] = useState<number>(0.3);
  const [absPct, setAbsPct] = useState<number>(10);
  const [subPct, setSubPct] = useState<number>(15);
  const [otPct, setOtPct] = useState<number>(10);

  const [enabled, setEnabled] = useState<Record<CostKey, boolean>>(() => ({
    direct: true,
    complement: true,
    substitution: true,
    overtime: true,
    lost_service: false,
    efficiency: true,
    quality: false,
    learning: false,
    turnover: false,
    opportunity: false,
  }));

  const stores = useMemo(() => pickStores(level, province, storeId), [level, province, storeId]);
  const employees = useMemo(() => stores.reduce((a, s) => a + s.employees, 0), [stores]);
  const avgSalaryMonth = useMemo(() => {
    if (employees <= 0) return 0;
    return stores.reduce((a, s) => a + s.employees * s.avgSalaryMonth, 0) / employees;
  }, [stores, employees]);

  const isPrincipalScope = useMemo(() => stores.some((s) => s.tag === "Principal"), [stores]);
  const absBase = useMemo(() => (isPrincipalScope && period === "Campaña" ? 0.072 : 0.062), [isPrincipalScope, period]);

  const absNew = useMemo(() => {
    if (absMode === "pp") return clamp(absBase - clamp(absPP, 0, 1.5) / 100, 0, 1);
    return clamp(absBase * (1 - clamp(absPct, 0, 25) / 100), 0, 1);
  }, [absMode, absBase, absPP, absPct]);

  const annualSalary = useMemo(() => employees * avgSalaryMonth * 12, [employees, avgSalaryMonth]);
  const scale = useMemo(() => periodScale(period), [period]);

  const base = useMemo(() => baseLines(annualSalary, absBase, scale), [annualSalary, absBase, scale]);

  const baseTotal = useMemo(() => {
    const b = scenarioLines(base, enabled, absBase, absBase, 0, 0);
    return sumLines(b);
  }, [base, enabled, absBase]);

  const scen = useMemo(() => {
    return scenarioLines(base, enabled, absBase, absNew, clamp(subPct, 0, 35), clamp(otPct, 0, 35));
  }, [base, enabled, absBase, absNew, subPct, otPct]);

  const scenTotal = useMemo(() => sumLines(scen), [scen]);
  const savings = useMemo(() => baseTotal - scenTotal, [baseTotal, scenTotal]);

  const confidence = useMemo(() => {
    const estimated: CostKey[] = ["lost_service", "quality", "learning", "turnover", "opportunity"];
    return estimated.some((k) => enabled[k]) ? "Media" : "Alta";
  }, [enabled]);

  const deltas = useMemo(() => {
    const rows = COSTS.filter((c) => enabled[c.key]).map((c) => {
      const b = scenarioLines(base, enabled, absBase, absBase, 0, 0)[c.key];
      const s = scen[c.key];
      return { key: c.key, label: c.label, desc: c.desc, base: b, scen: s, delta: b - s };
    });
    rows.sort((a, b) => b.delta - a.delta);
    const max = rows.reduce((m, r) => Math.max(m, r.delta), 0) || 1;
    return { rows, max };
  }, [base, enabled, absBase, scen]);

  const impacts = useMemo(() => {
    const onlySub = sumLines(scenarioLines(base, enabled, absBase, absBase, clamp(subPct, 0, 35), 0));
    const onlyAbs = sumLines(scenarioLines(base, enabled, absBase, absNew, 0, 0));
    const subImpact = baseTotal - onlySub;
    const absImpact = baseTotal - onlyAbs;
    return { subImpact, absImpact };
  }, [base, enabled, absBase, absNew, subPct, baseTotal]);

  const copilotInsight = useMemo(() => {
    if (savings <= 0) return null;

    const substitutionDominant = impacts.subImpact > impacts.absImpact * 1.1;
    const headline = substitutionDominant
      ? "Prioridad por : reducir sustitución de última hora"
      : "Prioridad por : reducir absentismo (sin olvidar cobertura)";

    const detail = substitutionDominant
      ? `En tu situación actual, lo que más impacta la cuenta de resultados no es tanto el % de absentismo, sino el coste de cubrirlo. En este alcance, la palanca sustitución aporta ~${eur(impacts.subImpact)} de ahorro potencial frente a ~${eur(impacts.absImpact)} por absentismo. ¿Quieres que planteemos una bolsa interna (y protocolo) para bajar sustitución urgente?`
      : `En este alcance, reducir absentismo es la palanca que más mueve : ~${eur(impacts.absImpact)} frente a ~${eur(impacts.subImpact)} por sustitución. La estrategia típica es combinar quick wins de cobertura con medidas estructurales (sin datos clínicos).`;

    const note = "Ejemplo visual. En Módulo 3 se generará la recomendación real y aquí verás el impacto simulado.";
    return { headline, detail, note };
  }, [savings, impacts.subImpact, impacts.absImpact]);

  const explainLevel = useMemo(() => {
    if (level === "Empresa") return "Empresa completa";
    if (level === "Provincia") return `Provincia: ${province}`;
    const nm = STORES.find((s) => s.id === storeId)?.name || storeId;
    return `Tienda: ${nm}`;
  }, [level, province, storeId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>

                <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Escenarios económicos</div>
                <div className="mt-1 text-sm text-zinc-600">Decisiones en  · Capilar por unidad</div>
              </div>
              <div className="flex items-center gap-2">

                <Badge tone={confidence === "Alta" ? "violet" : "amber"}>Confianza {confidence}</Badge>
                <button
                  type="button"
                  onClick={() => setModal("assumptions")}
                  className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Supuestos
                </button>
              </div>
            </div>

            <Card title={<>1) Alcance <span className="text-zinc-400">(capilar)</span></>} right={<Badge>{explainLevel}</Badge>}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Nivel</div>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as Level)}
                    className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                  >
                    <option value="Empresa">Empresa</option>
                    <option value="Provincia">Provincia</option>
                    <option value="Tienda">Tienda</option>
                  </select>
                  <div className="mt-2 text-xs text-zinc-500">Mismo cálculo, distinto alcance.</div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Objetivo</div>
                  {level === "Empresa" ? (
                    <div className="mt-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">Empresa ({employees} empleados)</div>
                  ) : level === "Provincia" ? (
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value as Province)}
                      className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                    >
                      {STORES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="mt-2 text-xs text-zinc-500">Salario medio: {eur(avgSalaryMonth)}/mes</div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-zinc-600">Periodo</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["Mes", "12m", "Campaña"] as Period[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={
                          "rounded-full border px-3 py-2 text-sm " +
                          (period === p
                            ? "border-violet-200 bg-violet-600 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">Baseline abs: {pct(absBase)}</div>
                </div>
              </div>
            </Card>

            <Card
              title={<>2) Palancas <span className="text-zinc-400">(decisión en )</span></>}
              right={<Badge tone="violet">Abs {pct(absBase)} ? {pct(absNew)}</Badge>}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge>Absentismo</Badge>
                  <button
                    type="button"
                    onClick={() => setAbsMode("pp")}
                    className={
                      "rounded-full border px-3 py-2 text-sm " +
                      (absMode === "pp"
                        ? "border-violet-200 bg-violet-600 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                    }
                  >
                    pp
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbsMode("%")}
                    className={
                      "rounded-full border px-3 py-2 text-sm " +
                      (absMode === "%"
                        ? "border-violet-200 bg-violet-600 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")
                    }
                  >
                    %
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModal("explain")}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  ¿Cómo leer esto?
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <RangeRow
                  label="Reducir sustitución"
                  value={clamp(subPct, 0, 35)}
                  unit="%"
                  min={0}
                  max={35}
                  step={1}
                  onChange={setSubPct}
                  hint="Cobertura externa/temporal"
                />

                {absMode === "pp" ? (
                  <RangeRow
                    label="Reducir absentismo"
                    value={clamp(absPP, 0, 1.5)}
                    unit="pp"
                    min={0}
                    max={1.5}
                    step={0.1}
                    onChange={setAbsPP}
                    hint="Reducción en puntos porcentuales"
                  />
                ) : (
                  <RangeRow
                    label="Reducir absentismo"
                    value={clamp(absPct, 0, 25)}
                    unit="%"
                    min={0}
                    max={25}
                    step={1}
                    onChange={setAbsPct}
                    hint="Reducción relativa"
                  />
                )}

                <RangeRow
                  label="Reducir horas extra"
                  value={clamp(otPct, 0, 35)}
                  unit="%"
                  min={0}
                  max={35}
                  step={1}
                  onChange={setOtPct}
                  hint="Cobertura interna"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-700" />
                  <span className="font-semibold">Principio</span>
                </div>
                <div className="mt-1 text-zinc-700">Esto existe para decidir por  (no por sensaciones).</div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card title="3) Resultado" right={<Badge tone="violet">Decisión en </Badge>}>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-zinc-600">Ahorro estimado</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{eur(savings)}</div>
                    <div className="mt-1 text-xs text-zinc-500">Periodo: {period} · {explainLevel}</div>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium text-zinc-600">Coste actual</div>
                        <div className="mt-1 text-lg font-semibold text-zinc-900">{eur(baseTotal)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-zinc-600">Coste escenario</div>
                        <div className="mt-1 text-lg font-semibold text-zinc-900">{eur(scenTotal)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-violet-700" />
                      <span className="font-semibold">Lectura RRHH</span>
                    </div>
                    <div className="mt-1 text-zinc-700">¿Qué compensa más? ? lo respondes con  y con alcance.</div>
                  </div>
                </div>
              </Card>

              <Card title="Desglose ahorro" right={<Badge>{eur(savings)}</Badge>}>
                <div className="space-y-3">
                  {deltas.rows.slice(0, 6).map((r) => (
                    <div key={r.key} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">{r.label}</div>
                          <div className="mt-1 text-xs text-zinc-600">{r.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-zinc-900">{eur(r.delta)}</div>
                          <div className="mt-1 text-xs text-zinc-500">Ahorro</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <MiniBar value={Math.max(0, r.delta)} max={deltas.max} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-zinc-500">
                        <span>Actual: {eur(r.base)}</span>
                        <span>Escenario: {eur(r.scen)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-zinc-500">Top 6 por utilidad (sin mil gráficos).</div>
                </div>
              </Card>

              <Card title="Costes monetizados" right={<Badge>Configurable</Badge>}>
                <div className="space-y-3">
                  {COSTS.map((c) => (
                    <label
                      key={c.key}
                      className="flex items-start justify-between gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">{c.label}</div>
                        <div className="mt-1 text-xs text-zinc-600">{c.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!enabled[c.key]}
                        onChange={(e) => setEnabled((cur) => ({ ...cur, [c.key]: e.target.checked }))}
                        className="mt-1 h-4 w-4 accent-violet-600"
                        title="Actívalo solo si la empresa lo monetiza"
                      />
                    </label>
                  ))}
                  <div className="text-xs text-zinc-500">Si no está monetizado ? impacto 0 (no inventamos).</div>
                </div>
              </Card>
            </div>

            <div className="lg:hidden">
              <CopilotPanel insight={copilotInsight} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-48px)]">
              <CopilotPanel insight={copilotInsight} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modal !== "none"}
        title={modal === "explain" ? "Cómo leer un escenario" : modal === "assumptions" ? "Supuestos del cálculo" : ""}
        onClose={() => setModal("none")}
      >
        {modal === "explain" ? (
          <div className="space-y-3 text-sm text-zinc-800">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="font-semibold">Qué estás viendo</div>
              <div className="mt-1 text-zinc-700">Coste actual vs coste con escenario. La diferencia es ahorro en .</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="font-semibold">Uso correcto</div>
              <div className="mt-1 text-zinc-700">Cambia el alcance (empresa/provincia/tienda) y decide la palanca que más  mueve.</div>
            </div>
          </div>
        ) : null}

        {modal === "assumptions" ? (
          <div className="space-y-3 text-sm text-zinc-800">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="font-semibold">Baseline absentismo</div>
              <div className="mt-1 text-zinc-700">Demo: {pct(absBase)} (en real viene del dato).</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="font-semibold">Costes por concepto</div>
              <div className="mt-1 text-zinc-700">
                Demo con proporciones. En real, cada concepto sale del dato del cliente y sus reglas: complemento, sustitución, horas extra,
                pérdida de servicio, eficiencia
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="font-semibold">No inventamos</div>
              <div className="mt-1 text-zinc-700">Si un concepto no está monetizado (checkbox apagado), su impacto en  es 0.</div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
