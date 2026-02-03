import React, { useMemo, useRef, useState } from "react";

// v3 — ITCC (prestación obligatoria + complementos + cotizaciones) + sustituciones + (opcional) coste oportunidad + absentismo no provisionado
// Sin librerías externas. Sin ?. / ??.

// ---------- helpers ----------
const num = (v: any) => { const n = Number(String(v == null ? "" : v).replace(",", ".")); return Number.isFinite(n) ? n : 0 };
const clamp = (n: number, a = 0, b = 100) => Math.min(b, Math.max(a, n));
const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(Number.isFinite(n) ? n : 0);
const money = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number.isFinite(n) ? n : 0);
const H = 8;
async function safeCopy(t: string, el: any) {
  try { if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") { await navigator.clipboard.writeText(t); return "copied" } } catch (e) { }
  try { if (el) { el.focus(); if (typeof el.select === "function") el.select(); if (document.execCommand) document.execCommand("copy"); return "copied" } } catch (e) { }
  return "manual";
}

// ---------- domain ----------
const CNAE = [{ code: "01", title: "Agricultura" }, { code: "10", title: "Alimentación" }, { code: "20", title: "Química" }, { code: "24", title: "Metalurgia" }, { code: "25", title: "Productos metálicos" }, { code: "33", title: "Reparación/instalación maquinaria" }, { code: "41", title: "Construcción edificios" }, { code: "42", title: "Ingeniería civil" }, { code: "43", title: "Construcción especializada" }, { code: "45", title: "Venta/rep. vehículos" }, { code: "46", title: "Comercio mayor" }, { code: "47", title: "Comercio menor" }, { code: "49", title: "Transporte terrestre" }, { code: "52", title: "Logística/almacenamiento" }, { code: "55", title: "Alojamiento" }, { code: "56", title: "Comidas/bebidas" }, { code: "62", title: "Informática" }, { code: "69", title: "Legal/contabilidad" }, { code: "81", title: "Servicios edificios" }, { code: "86", title: "Sanidad" }];
const PREMIUM: Record<string, number> = { "01": 2.6, "10": 2.0, "20": 3.25, "24": 4.0, "25": 3.6, "33": 3.4, "41": 5.0, "42": 5.5, "43": 6.0, "45": 2.6, "46": 1.9, "47": 1.9, "49": 3.4, "52": 3.4, "55": 2.25, "56": 2.25, "62": 1.0, "69": 1.0, "81": 3.25, "86": 2.0 };
const SS_FIXED = 29.9; // % fija orientativa (FOGASA+FP+Desempleo+CC) — editable
const TYPES = [{ k: "AT", l: "AT", n: "Accidente de trabajo" }, { k: "IT_CORTA", l: "IT corta", n: "IT (1–3 días)" }, { k: "IT_MEDIA", l: "IT media", n: "IT (4–20 días)" }, { k: "IT_LARGA", l: "IT larga", n: "IT (21+ días)" }];

const emptySub = () => ({ substitutedPct: 0, extraCostPct: 0 });

interface SubData {
  substitutedPct: number;
  extraCostPct: number;
}
interface AbsenceData {
  [key: string]: number;
}
interface SubsData {
  [key: string]: SubData;
}
interface Group {
  id: string;
  name: string;
  employees: number;
  salary: number;
  absence: AbsenceData;
  subs: SubsData;
}
interface Company {
  name: string;
  employees: number;
  salary: number;
  hours: number;
  cnae: string;
  ssFixed: number;
  ssVar: number;
  brDiv: number;
  revenue: number;
  includeOpp: boolean;
  subEff: number;
  comp13: number;
  comp420: number;
  comp21: number;
  provisionEur: number;
  provisionPct: number;
  avgDur: Record<string, number>;
}

// ---------- cálculo ----------
function splitDays(processes: number, avgD: number) {
  const D = Math.max(0, avgD), P = Math.max(0, processes);
  const d13 = P * Math.min(3, D);
  const d415 = P * Math.max(0, Math.min(15, D) - 3);
  const d1620 = P * Math.max(0, Math.min(20, D) - 15);
  const d21 = P * Math.max(0, D - 20);
  return { d13, d415, d1620, d21 };
}

function calcImpact(company: Company, absence: AbsenceData, subs: SubsData, groups: Group[]) {
  const emp = Math.max(0, Math.round(num(company.employees)));
  const hrs = Math.max(1, Math.round(num(company.hours)));
  const sal = Math.max(0, num(company.salary));
  const wh = hrs > 0 ? sal / hrs : 0;
  const payroll = emp * sal;
  const gEmp = (groups || []).reduce((s, g) => s + Math.max(0, Math.round(num(g.employees))), 0);
  const rem = emp - gEmp, ok = rem >= 0;

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
  const prodPerDay = (emp > 0 && rev > 0 && workDaysY > 0) ? (rev / emp) / workDaysY : 0;

  const totals = { hours: 0, days: 0, repl: 0, companyMandatory: 0, companyComplements: 0, companyCotiz: 0, mutuaBenefit: 0, opp: 0, companyTotal: 0, totalAll: 0 };
  const byType: any = {};

  const typeCalc = (k: string, empCount: number, absPct: number, subRow: SubData, sal2: number) => {
    const ap = clamp(num(absPct), 0, 100) / 100;
    const hours = empCount * hrs * ap;
    const days = hours / H;
    const wageH = hrs > 0 ? sal2 / hrs : 0;
    const brD = sal2 / brDiv; // aproximación Base Reguladora diaria

    const sub = clamp(num(subRow.substitutedPct), 0, 100) / 100;
    const extra = clamp(num(subRow.extraCostPct), 0, 300) / 100;
    const replH = hours * sub;
    const repl = replH * wageH * (1 + extra);

    // Estimación de procesos según duración media
    const aD = Math.max(1, num(avgDur[k] || 0) || (k === "IT_CORTA" ? 2 : k === "IT_MEDIA" ? 10 : k === "IT_LARGA" ? 60 : 5));
    const P = days > 0 ? days / aD : 0;
    const s = splitDays(P, aD);

    // ITCC (según tramos): empresa paga prestación obligatoria del día 4 al 15 (60% BR).
    // Mutua/SS: 60% del 16 al 20 y 75% desde el 21.
    let companyMandatory = 0, mutuaBenefit = 0, companyComplements = 0;
    if (k === "IT_CORTA" || k === "IT_MEDIA" || k === "IT_LARGA") {
      companyMandatory = 0.60 * brD * s.d415;
      mutuaBenefit = 0.60 * brD * s.d1620 + 0.75 * brD * s.d21;
      companyComplements = brD * (comp13 * s.d13 + comp420 * (s.d415 + s.d1620) + comp21 * s.d21);
    }

    // Cotizaciones empresariales (aprox) durante la IT
    const companyCotiz = brD * ssRate * days;

    // Coste oportunidad: días no recuperados por sustitución (eficacia configurable)
    const lostDays = Math.max(0, Math.min(days, days * (1 - sub * eff)));
    const opp = prodPerDay * lostDays;

    const companyTotal = companyMandatory + companyComplements + companyCotiz + repl + (company.includeOpp ? opp : 0);
    const totalAll = companyTotal + mutuaBenefit;

    return { hours, days, sub, companyMandatory, companyComplements, companyCotiz, mutuaBenefit, repl, opp, companyTotal, totalAll };
  };

  const cohorts = [{ id: "__rem__", name: "Resto", employees: Math.max(0, rem), salary: sal, absence: absence, subs: subs }].concat((groups || []).map(g => ({ id: g.id, name: g.name, employees: Math.max(0, Math.round(num(g.employees))), salary: Math.max(0, num(g.salary)) || sal, absence: g.absence || {}, subs: g.subs || {} })));

  for (let i = 0; i < TYPES.length; i++) {
    const k = TYPES[i].k;
    const agg = { hours: 0, days: 0, companyMandatory: 0, companyComplements: 0, companyCotiz: 0, mutuaBenefit: 0, repl: 0, opp: 0, companyTotal: 0, totalAll: 0, sub: 0 };
    let wDays = 0;
    for (let c = 0; c < cohorts.length; c++) {
      const co = cohorts[c];
      const r = typeCalc(k, co.employees, (co.absence && co.absence[k]) || 0, ((co.subs && co.subs[k]) || emptySub()), co.salary);
      agg.hours += r.hours; agg.days += r.days; agg.companyMandatory += r.companyMandatory; agg.companyComplements += r.companyComplements; agg.companyCotiz += r.companyCotiz; agg.mutuaBenefit += r.mutuaBenefit; agg.repl += r.repl; agg.opp += r.opp; agg.companyTotal += r.companyTotal; agg.totalAll += r.totalAll;
      wDays += r.days; agg.sub += r.sub * r.days;
    }
    agg.sub = wDays > 0 ? agg.sub / wDays : 0;
    byType[k] = agg;
    totals.hours += agg.hours; totals.days += agg.days; totals.companyMandatory += agg.companyMandatory; totals.companyComplements += agg.companyComplements; totals.companyCotiz += agg.companyCotiz; totals.mutuaBenefit += agg.mutuaBenefit; totals.repl += agg.repl; totals.opp += agg.opp; totals.companyTotal += agg.companyTotal; totals.totalAll += agg.totalAll;
  }

  const absRate = (emp > 0 && hrs > 0) ? (totals.hours / (emp * hrs)) * 100 : 0;
  const provisionEur = Math.max(0, num(company.provisionEur)) || ((clamp(num(company.provisionPct), 0, 100) / 100) * payroll);
  const unprov = Math.max(0, totals.companyTotal - provisionEur);

  return { ok, employees: emp, groupEmployees: gEmp, remainder: Math.max(0, rem), annualHours: hrs, salaryAvg: sal, wageH: wh, payroll, absRate, ssFixed, ssVar, ssRate, byType, totals, provisionEur, unprov, pctPayroll: payroll > 0 ? totals.companyTotal / payroll : 0 };
}

// ---------- UI atoms ----------
interface SegProps {
  value: string;
  onChange: (v: string) => void;
  items: { v: string; t: string }[];
}
const Seg = ({ value, onChange, items }: SegProps) => (
  <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">{items.map(it => (
    <button key={it.v} onClick={() => onChange(it.v)} className={"rounded-2xl px-4 py-2 text-sm font-medium transition " + (value === it.v ? "bg-violet-600 text-white shadow-sm" : "text-zinc-800 hover:bg-zinc-50")}>{it.t}</button>
  ))}</div>
);

interface CardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}
const Card = ({ title, subtitle, right, children }: CardProps) => (
  <section className="rounded-[28px] border border-zinc-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 px-5 py-4"><div><div className="text-sm font-semibold text-zinc-900">{title}</div>{subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}</div>{right}</div>
    <div className="h-px w-full bg-zinc-100" />
    <div className="p-5">{children}</div>
  </section>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  right?: React.ReactNode;
  hint?: React.ReactNode;
}
const Input = ({ label, right, hint, ...p }: InputProps) => (
  <label className="block"><div className="flex items-end justify-between gap-3"><div className="text-sm font-medium text-zinc-900">{label}</div>{right ? <div className="text-xs text-zinc-500">{right}</div> : null}</div>
    <input {...p} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200" />
    {hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
  </label>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: React.ReactNode;
}
const Select = ({ label, value, onChange, children, hint }: SelectProps) => (
  <label className="block"><div className="text-sm font-medium text-zinc-900">{label}</div>
    <select value={value} onChange={onChange} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200">{children}</select>
    {hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
  </label>
);

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
const Toggle = ({ label, value, onChange }: ToggleProps) => {
  const cls = value ? "bg-zinc-900 text-white border-zinc-300" : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300";
  return (
    <button type="button" onClick={() => onChange(!value)} className={"flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition " + cls}>
      <span className="font-semibold">{label}</span><span className={"text-xs " + (value ? "text-white/80" : "text-zinc-500")}>{value ? "Sí" : "No"}</span>
    </button>
  );
};

const StatL = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
  <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm"><div className="text-xs text-zinc-500 font-medium">{label}</div>
    <div className="mt-1 text-xl font-light tracking-tight text-zinc-900">{value}</div>{sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
  </div>
);

function ExportPanel({ open, json, onClose }: { open: boolean, json: string, onClose: () => void }) {
  const ref = useRef<any>(null); const [status, setStatus] = useState("ready"); if (!open) return null;
  const copy = async () => { setStatus("copying"); const r = await safeCopy(json, ref.current); setStatus(r) };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3"><div><div className="text-lg font-semibold text-neutral-900">Exportar datos (JSON)</div><div className="mt-1 text-sm text-neutral-600">Copia desde aquí si el portapapeles está bloqueado.</div></div>
          <button onClick={onClose} className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 hover:border-neutral-300">Cerrar</button>
        </div>
        <div className="mt-4">
          <textarea ref={ref} readOnly value={json} className="h-72 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs text-neutral-800 outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-neutral-500">{status === "copied" ? "? Copiado." : status === "manual" ? "?? Selecciona y copia." : status === "copying" ? "Copiando…" : ""}</div>
            <div className="flex items-center gap-2">
              <button onClick={copy} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700">Copiar</button>
              <button onClick={() => { if (ref.current) { ref.current.focus(); if (typeof ref.current.select === "function") ref.current.select(); setStatus("manual") } }} className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 hover:border-neutral-300">Seleccionar todo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubTable({ title, value, onChange }: { title: string, value: SubsData, onChange: (v: SubsData) => void }) {
  const getRow = (k: string) => (value && value[k]) ? value[k] : emptySub();
  const setRow = (k: string, patch: Partial<SubData>) => { const cur = getRow(k); const next = { ...cur, ...patch }; const out = { ...(value || {}) }; out[k] = next; onChange(out) };
  return (
    <Card title={title} subtitle="% sustituidos y sobrecoste (overtime/ETT)" right={null}>
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full border-separate border-spacing-y-2">
          <thead><tr className="text-left text-xs text-neutral-500"><th className="px-2">Tipo</th><th className="px-2">% sustituidos</th><th className="px-2">Sobrecoste</th></tr></thead>
          <tbody>{TYPES.map(t => {
            const row = getRow(t.k); return (
              <tr key={t.k} className="rounded-2xl bg-neutral-50">
                <td className="px-2 py-3 text-sm font-medium text-neutral-900">{t.n}</td>
                <td className="px-2 py-3"><input className="w-44 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm" type="number" min={0} max={100} step={1} value={row.substitutedPct} onChange={e => setRow(t.k, { substitutedPct: clamp(num(e.target.value), 0, 100) })} /></td>
                <td className="px-2 py-3"><input className="w-44 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm" type="number" min={0} max={300} step={1} value={row.extraCostPct} onChange={e => setRow(t.k, { extraCostPct: clamp(num(e.target.value), 0, 300) })} /></td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-neutral-500">Nota: el coste de sustitución se calcula con tu coste/hora medio y el sobrecoste indicado.</div>
    </Card>
  );
}

// ================= MAIN APP =================
export default function AbsentismoApp() {
  const [tab, setTab] = useState("datos");
  const [exportOpen, setExportOpen] = useState(false);

  // Demo
  const [company, setCompany] = useState<Company>({
    name: "NovaLogística S.L.", employees: 320, salary: 31500, hours: 1780, cnae: "52",
    ssFixed: SS_FIXED, ssVar: 3.4, brDiv: 360,
    revenue: 18000000, includeOpp: true, subEff: 70,
    comp13: 0, comp420: 0, comp21: 0,
    provisionEur: 0, provisionPct: 0,
    avgDur: { IT_CORTA: 2, IT_MEDIA: 10, IT_LARGA: 60, AT: 5 }
  });
  const [absence, setAbsence] = useState<AbsenceData>({ AT: 1.2, IT_CORTA: 2.5, IT_MEDIA: 3.4, IT_LARGA: 2.9 });
  const [subs, setSubs] = useState<SubsData>({ AT: { substitutedPct: 30, extraCostPct: 25 }, IT_CORTA: { substitutedPct: 10, extraCostPct: 20 }, IT_MEDIA: { substitutedPct: 40, extraCostPct: 30 }, IT_LARGA: { substitutedPct: 55, extraCostPct: 35 } });
  const [groups, setGroups] = useState<Group[]>([
    { id: "g-bcn", name: "Barcelona · Plataforma", employees: 140, salary: 33000, absence: { AT: 1.4, IT_CORTA: 2.6, IT_MEDIA: 3.6, IT_LARGA: 3.0 }, subs: { AT: { substitutedPct: 35, extraCostPct: 25 }, IT_CORTA: { substitutedPct: 12, extraCostPct: 20 }, IT_MEDIA: { substitutedPct: 45, extraCostPct: 30 }, IT_LARGA: { substitutedPct: 60, extraCostPct: 35 } } },
    { id: "g-mad", name: "Madrid · Oficinas", employees: 60, salary: 42000, absence: { AT: 0.6, IT_CORTA: 2.1, IT_MEDIA: 3.0, IT_LARGA: 2.3 }, subs: { AT: { substitutedPct: 10, extraCostPct: 30 }, IT_CORTA: { substitutedPct: 0, extraCostPct: 0 }, IT_MEDIA: { substitutedPct: 15, extraCostPct: 35 }, IT_LARGA: { substitutedPct: 25, extraCostPct: 40 } } },
    { id: "g-cad", name: "Cádiz · Fábrica", employees: 80, salary: 28500, absence: { AT: 1.8, IT_CORTA: 2.9, IT_MEDIA: 3.7, IT_LARGA: 3.1 }, subs: { AT: { substitutedPct: 40, extraCostPct: 20 }, IT_CORTA: { substitutedPct: 15, extraCostPct: 20 }, IT_MEDIA: { substitutedPct: 50, extraCostPct: 28 }, IT_LARGA: { substitutedPct: 65, extraCostPct: 33 } } }
  ]);

  const sumGroupEmp = useMemo(() => groups.reduce((s, g) => s + Math.max(0, Math.round(num(g.employees))), 0), [groups]);
  const allocOk = useMemo(() => sumGroupEmp <= Math.max(0, Math.round(num(company.employees))), [sumGroupEmp, company.employees]);
  const remainder = useMemo(() => Math.max(0, Math.round(num(company.employees)) - sumGroupEmp), [company.employees, sumGroupEmp]);
  const cnaeHint = useMemo(() => { const c = company.cnae || ""; return Object.prototype.hasOwnProperty.call(PREMIUM, c) ? "AT/EP sugerido: " + PREMIUM[c].toFixed(2) + "% (editable)" : "Sin tarifa precargada."; }, [company.cnae]);
  const onCnaeChange = (code: string) => { const next = { ...company, cnae: code }; if (Object.prototype.hasOwnProperty.call(PREMIUM, code)) next.ssVar = PREMIUM[code]; setCompany(next) };

  const impact = useMemo(() => calcImpact(company, absence, subs, groups), [company, absence, subs, groups]);
  const json = useMemo(() => JSON.stringify({ company, absence, subs, groups }, null, 2), [company, absence, subs, groups]);

  // Group form
  const [addingGroup, setAddingGroup] = useState(false);
  const [gForm, setGForm] = useState<Group>({ id: "", name: "", employees: 0, salary: 0, absence: { AT: 0, IT_CORTA: 0, IT_MEDIA: 0, IT_LARGA: 0 }, subs: {} });
  const addGroup = () => { const name = String(gForm.name || "").trim(); if (!name) return; const g = { id: "g-" + String(Date.now()), name, employees: Math.max(0, Math.round(num(gForm.employees))), salary: Math.max(0, num(gForm.salary)), absence: { ...gForm.absence }, subs: gForm.subs || {} }; setGroups([g].concat(groups)); setGForm({ id: "", name: "", employees: 0, salary: 0, absence: { AT: 0, IT_CORTA: 0, IT_MEDIA: 0, IT_LARGA: 0 }, subs: {} }); setAddingGroup(false) };
  const delGroup = (id: string) => setGroups(groups.filter(g => g.id !== id));

  const reportTypes = useMemo(() => { const arr = TYPES.map(t => { const r = impact.byType[t.k] || {}; return { key: t.k, name: t.n, total: r.companyTotal || 0, all: r.totalAll || 0, repl: r.repl || 0, mand: r.companyMandatory || 0, comp: r.companyComplements || 0, cot: r.companyCotiz || 0, mut: r.mutuaBenefit || 0, opp: r.opp || 0, days: r.days || 0, sub: r.sub || 0 }; }); arr.sort((a, b) => b.total - a.total); return arr; }, [impact]);

  const viewDatos = (
    <main className="grid gap-6">
      <Card title="Empresa" subtitle="Datos base + SS + productividad" right={null}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
          <Input label="Empleados" type="number" min={0} step={1} value={company.employees} onChange={e => setCompany({ ...company, employees: clamp(num(e.target.value), 0, 1000000) })} />
          <Input label="Salario bruto anual medio" type="number" min={0} step={100} right="€" value={company.salary} onChange={e => setCompany({ ...company, salary: Math.max(0, num(e.target.value)) })} />
          <Input label="Horas/año" type="number" min={1} step={1} value={company.hours} onChange={e => setCompany({ ...company, hours: Math.max(1, Math.round(num(e.target.value))) })} />
          <Select label="CNAE" value={company.cnae} onChange={e => onCnaeChange(e.target.value)} hint={cnaeHint}>
            <option value="">— Selecciona —</option>
            {CNAE.map(x => <option key={x.code} value={x.code}>{x.code + " · " + x.title}</option>)}
          </Select>
          <div className="grid gap-3">
            <Input label="SS fija" type="number" min={0} max={60} step={0.1} right="%" value={company.ssFixed} onChange={e => setCompany({ ...company, ssFixed: clamp(num(e.target.value), 0, 60) })} hint="Orientativo: 29,90%" />
            <Input label="AT/EP (SS variable)" type="number" min={0} max={20} step={0.1} right="%" value={company.ssVar} onChange={e => setCompany({ ...company, ssVar: clamp(num(e.target.value), 0, 20) })} />
          </div>
          <Input label="Facturación anual" type="number" min={0} step={1000} right="€" value={company.revenue} onChange={e => setCompany({ ...company, revenue: Math.max(0, num(e.target.value)) })} hint="Se usa para coste de oportunidad (opcional)." />
          <div className="grid gap-3">
            <Toggle label="Incluir coste de oportunidad" value={!!company.includeOpp} onChange={v => setCompany({ ...company, includeOpp: v })} />
            <Input label="Eficacia de sustitución" type="number" min={0} max={100} step={1} right="%" value={company.subEff} onChange={e => setCompany({ ...company, subEff: clamp(num(e.target.value), 0, 100) })} hint="% del valor recuperado cuando sustituyes." />
          </div>
        </div>
      </Card>

      <Card title="Complementos empresariales" subtitle="Sobre Base Reguladora (aprox.)" right={null}>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Días 1–3" type="number" min={0} max={100} step={1} right="%" value={company.comp13} onChange={e => setCompany({ ...company, comp13: clamp(num(e.target.value), 0, 100) })} hint="Rango habitual 0–100" />
          <Input label="Días 4–20 (extra)" type="number" min={0} max={40} step={1} right="%" value={company.comp420} onChange={e => setCompany({ ...company, comp420: clamp(num(e.target.value), 0, 40) })} hint="Extra sobre el 60%" />
          <Input label="Día 21+ (extra)" type="number" min={0} max={25} step={1} right="%" value={company.comp21} onChange={e => setCompany({ ...company, comp21: clamp(num(e.target.value), 0, 25) })} hint="Extra sobre el 75%" />
        </div>
        <div className="mt-3 text-xs text-neutral-500">Base reguladora diaria ˜ salario anual / <b>{fmt(company.brDiv || 360)}</b>. Puedes ajustar el divisor.</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Divisor Base Reguladora" type="number" min={300} step={1} right="" value={company.brDiv} onChange={e => setCompany({ ...company, brDiv: Math.max(1, Math.round(num(e.target.value))) })} hint="Por defecto 360 (12×30)." />
          <div className="rounded-[26px] border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold text-neutral-900">Absentismo estimado</div>
            <div className="mt-2 text-sm text-neutral-700">Tasa anual: <b>{impact.absRate.toFixed(2)}%</b></div>
            <div className="mt-1 text-xs text-neutral-500">(Horas ausencia / horas totales)</div>
          </div>
        </div>
      </Card>

      <Card title="Duración media por tipología" subtitle="Mejora el cálculo de tramos 1–3 / 4–15 / 16–20 / 21+" right={null}>
        <div className="grid gap-4 md:grid-cols-4">
          {TYPES.map(t => (
            <Input key={t.k} label={t.l} type="number" min={1} step={1} right="días" value={(company.avgDur && company.avgDur[t.k]) || ""} onChange={e => setCompany({ ...company, avgDur: { ...(company.avgDur || {}), [t.k]: Math.max(1, Math.round(num(e.target.value))) } })} />
          ))}
        </div>
        <div className="mt-3 text-xs text-neutral-500">Si no sabes los días medios, deja valores por defecto. Para máxima precisión, en el siguiente módulo añadimos entrada por procesos y días por tramo.</div>
      </Card>

      <Card title="Absentismo" subtitle="% por tipología" right={null}>
        <div className="grid gap-4 md:grid-cols-3">{TYPES.map(t => (
          <Input key={t.k} label={t.n} type="number" min={0} max={100} step={0.1} right="%" value={absence[t.k]} onChange={e => setAbsence({ ...absence, [t.k]: clamp(num(e.target.value), 0, 100) })} />
        ))}</div>
        <div className="mt-4 text-sm text-neutral-600">Total: <b>{(clamp(num(absence.AT)) + clamp(num(absence.IT_CORTA)) + clamp(num(absence.IT_MEDIA)) + clamp(num(absence.IT_LARGA))).toFixed(2)}%</b></div>
      </Card>

      <SubTable title="Sustituciones (general)" value={subs} onChange={setSubs} />

      <Card title="Provisión (para calcular el no provisionado)" subtitle="Cuánto tienes reservado hoy" right={null}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Provisión anual (importe)" type="number" min={0} step={100} right="€" value={company.provisionEur} onChange={e => setCompany({ ...company, provisionEur: Math.max(0, num(e.target.value)) })} hint="Si informas importe, tiene prioridad sobre %." />
          <Input label="Provisión anual (% masa salarial)" type="number" min={0} max={100} step={0.1} right="%" value={company.provisionPct} onChange={e => setCompany({ ...company, provisionPct: clamp(num(e.target.value), 0, 100) })} />
        </div>
        <div className="mt-3 text-xs text-neutral-500">Resultado clave en IMPACTO P&L ? “Absentismo no provisionado”.</div>
      </Card>

      <Card title="Grupos" subtitle="Especiales (con empleados)" right={
        <button onClick={() => setAddingGroup(!addingGroup)} className={"rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition " + (addingGroup ? "bg-violet-600 text-white" : "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300")}>{addingGroup ? "Cerrar alta" : "+ Añadir"}</button>
      }>
        {!allocOk ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">La suma de empleados en grupos supera el total.</div> : null}
        {addingGroup ? (
          <div className="rounded-[26px] border border-neutral-200 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Nombre" value={gForm.name} onChange={e => setGForm({ ...gForm, name: e.target.value })} />
              <Input label="Empleados" type="number" min={0} step={1} value={gForm.employees} onChange={e => setGForm({ ...gForm, employees: Math.max(0, Math.round(num(e.target.value))) })} />
              <Input label="Salario" type="number" min={0} step={100} right="€" value={gForm.salary} onChange={e => setGForm({ ...gForm, salary: Math.max(0, num(e.target.value)) })} />
            </div>
            <div className="mt-4 text-sm font-semibold text-neutral-900">Absentismo del grupo</div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">{TYPES.map(t => (
              <Input key={t.k} label={t.l + " · " + t.n} type="number" min={0} max={100} step={0.1} right="%" value={gForm.absence[t.k]} onChange={e => setGForm({ ...gForm, absence: { ...gForm.absence, [t.k]: clamp(num(e.target.value), 0, 100) } })} />
            ))}</div>
            <div className="mt-4"><SubTable title="Sustituciones (grupo)" value={gForm.subs} onChange={v => setGForm({ ...gForm, subs: v })} /></div>
            <div className="mt-4 flex justify-end"><button onClick={addGroup} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700">Guardar grupo</button></div>
          </div>
        ) : null}
        {groups.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">{groups.map(g => (
            <div key={g.id} className="rounded-[26px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-neutral-900">{g.name}</div><div className="mt-1 text-xs text-neutral-500">Empleados {fmt(g.employees)} · Salario {money(g.salary)}</div></div>
                <button onClick={() => delGroup(g.id)} className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 hover:border-neutral-300">Eliminar</button>
              </div>
            </div>
          ))}</div>
        ) : (<div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">No hay grupos todavía.</div>)}
      </Card>
    </main>
  );

  const viewImpacto = (
    <main className="grid gap-6">
      {!impact.ok ? (<Card title="IMPACTO P&L" subtitle="No se puede calcular" right={null}><div className="text-sm text-rose-800">Empleados en grupos superior al total. Corrige en DATOS.</div></Card>) : (
        <React.Fragment>
          <Card title="IMPACTO P&L" subtitle="Coste anual · Empresa vs Mutua" right={null}>
            <div className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="text-sm text-neutral-600">La empresa asume (estimación)</div>
              <div className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">{money(impact.totals.companyTotal)}</div>
              <div className="mt-3 text-sm text-neutral-600">Equivale al <b>{(impact.pctPayroll * 100).toFixed(2)}%</b> de tu masa salarial anual.</div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StatL label="Absentismo no provisionado" value={money(impact.unprov)} sub={"Provisión usada: " + money(impact.provisionEur)} />
                <StatL label="Coste Mutua/SS" value={money(impact.totals.mutuaBenefit)} sub="Prestación desde día 16" />
                <StatL label="Días de ausencia" value={fmt(Number(impact.totals.days.toFixed(1))) + " días"} sub={fmt(Number(impact.totals.hours.toFixed(0))) + " horas · tasa " + impact.absRate.toFixed(2) + "%"} />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <StatL label="Prestación obligatoria (empresa)" value={money(impact.totals.companyMandatory)} sub="Días 4–15 (ITCC)" />
                <StatL label="Complementos" value={money(impact.totals.companyComplements)} sub="Según % configurado" />
                <StatL label="Cotizaciones" value={money(impact.totals.companyCotiz)} sub={"SS total " + ((impact.ssRate || 0) * 100).toFixed(2) + "%"} />
                <StatL label="Sustituciones" value={money(impact.totals.repl)} sub="ETT / overtime" />
              </div>
              {company.includeOpp ? (<div className="mt-4"><StatL label="Coste de oportunidad" value={money(impact.totals.opp)} sub={"Facturación " + money(company.revenue) + " · eficacia " + clamp(num(company.subEff), 0, 100) + "%"} /></div>) : null}
            </div>
          </Card>

          <Card title="Detalle por tipología" subtitle="Empresa (directo + sustituciones + oportunidad si aplica)" right={null}>
            <div className="grid gap-3 md:grid-cols-2">{TYPES.map(t => {
              const r = impact.byType[t.k]; const w = impact.totals.companyTotal > 0 ? (r.companyTotal / impact.totals.companyTotal) * 100 : 0; return (
                <div key={t.k} className="rounded-[26px] border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="text-sm font-semibold text-neutral-900">{t.n}</div><div className="mt-1 text-xs text-neutral-500">{fmt(Number(r.days.toFixed(1)))} días · {fmt(Number(r.hours.toFixed(0)))}h</div></div>
                    <div className="text-right"><div className="text-sm font-semibold text-neutral-900">{money(r.companyTotal)}</div><div className="mt-1 text-xs text-neutral-500">Sustit {money(r.repl)} · Mutua {money(r.mutuaBenefit)}</div></div>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" style={{ width: Math.min(100, Math.max(0, w)) + "%" }} /></div>
                  <div className="mt-3 text-xs text-neutral-500">Mix empresa: oblig. {money(r.companyMandatory)} · compl. {money(r.companyComplements)} · cotiz. {money(r.companyCotiz)}</div>
                </div>
              )
            })}</div>
            <div className="mt-4 text-xs text-neutral-500">AT se muestra como sustituciones (y oportunidad si aplica). Prestaciones AT no están modeladas en detalle.</div>
          </Card>
        </React.Fragment>
      )}
    </main>
  );

  const viewInforme = (
    <main className="grid gap-6">
      <Card title="INFORME" subtitle="Resumen ejecutivo" right={null}>
        {!impact.ok ? <div className="text-sm text-rose-800">Corrige asignación en DATOS.</div> : (
          <React.Fragment>
            <div className="grid gap-4 md:grid-cols-3">
              <StatL label="Coste empresa" value={money(impact.totals.companyTotal)} sub={"No provisionado: " + money(impact.unprov)} />
              <StatL label="Coste Mutua/SS" value={money(impact.totals.mutuaBenefit)} sub="Prestación" />
              <StatL label="Días de ausencia" value={fmt(Number(impact.totals.days.toFixed(1))) + " días"} sub={fmt(Number(impact.totals.hours.toFixed(0))) + " horas"} />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[26px] border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Resumen</div>
                <div className="mt-3 text-sm text-neutral-800">• Prestación obligatoria empresa: <b>{money(impact.totals.companyMandatory)}</b></div>
                <div className="mt-2 text-sm text-neutral-800">• Complementos: <b>{money(impact.totals.companyComplements)}</b></div>
                <div className="mt-2 text-sm text-neutral-800">• Cotizaciones: <b>{money(impact.totals.companyCotiz)}</b></div>
                <div className="mt-2 text-sm text-neutral-800">• Sustituciones: <b>{money(impact.totals.repl)}</b></div>
                {company.includeOpp ? <div className="mt-2 text-sm text-neutral-800">• Oportunidad: <b>{money(impact.totals.opp)}</b></div> : null}
                <div className="mt-2 text-sm text-neutral-800">• Total empresa: <b>{money(impact.totals.companyTotal)}</b></div>
              </div>
              <div className="rounded-[26px] border border-neutral-200 bg-white p-5">
                <div className="text-sm font-semibold text-neutral-900">Drivers y foco</div>
                <div className="mt-3 text-sm text-neutral-800">• Top driver: <b>{reportTypes[0] ? reportTypes[0].name : "—"}</b></div>
                <div className="mt-2 text-sm text-neutral-800">• Top 2: <b>{reportTypes[1] ? reportTypes[1].name : "—"}</b></div>
                <div className="mt-2 text-xs text-neutral-500">Consejo: actúa donde hay más días y más % sustitución.</div>
              </div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-[26px] border border-neutral-200 bg-white p-5">
              <div className="text-sm font-semibold text-neutral-900">Desglose por tipología (empresa)</div>
              <table className="mt-4 min-w-[980px] w-full border-separate border-spacing-y-2">
                <thead><tr className="text-left text-xs text-neutral-500"><th className="px-2">Tipo</th><th className="px-2">Empresa</th><th className="px-2">Sustit</th><th className="px-2">Oblig.</th><th className="px-2">Compl.</th><th className="px-2">Cotiz.</th><th className="px-2">Mutua</th><th className="px-2">Días</th></tr></thead>
                <tbody>{reportTypes.map(t => (
                  <tr key={t.key} className="rounded-2xl bg-neutral-50">
                    <td className="px-2 py-3 text-sm font-medium text-neutral-900">{t.name}</td>
                    <td className="px-2 py-3 text-sm">{money(t.total)}</td>
                    <td className="px-2 py-3 text-sm">{money(t.repl)}</td>
                    <td className="px-2 py-3 text-sm">{money(t.mand)}</td>
                    <td className="px-2 py-3 text-sm">{money(t.comp)}</td>
                    <td className="px-2 py-3 text-sm">{money(t.cot)}</td>
                    <td className="px-2 py-3 text-sm">{money(t.mut)}</td>
                    <td className="px-2 py-3 text-sm">{fmt(t.days.toFixed(1))}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </React.Fragment>
        )}
      </Card>
    </main>
  );

  const views: any = { datos: viewDatos, impacto: viewImpacto };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-light tracking-tight text-zinc-900">Calculadora de absentismo</h1>
              <p className="mt-1 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">DATOS · IMPACTO P&L</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Seg value={tab} onChange={setTab} items={[{ v: "datos", t: "DATOS" }, { v: "impacto", t: "IMPACTO P&L" }]} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm">Empleados: <b className="ml-1">{fmt(Math.max(0, Math.round(num(company.employees))))}</b></span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm">En grupos: <b className="ml-1">{fmt(sumGroupEmp)}</b></span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm">Resto: <b className="ml-1">{fmt(remainder)}</b></span>
            <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs shadow-sm " + (allocOk ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800")}>{allocOk ? "Asignación OK" : "Ajusta empleados"}</span>
          </div>
        </header>

        {views[tab] || viewDatos}
        <ExportPanel open={exportOpen} json={json} onClose={() => setExportOpen(false)} />
      </div>
    </div>
  );
}
