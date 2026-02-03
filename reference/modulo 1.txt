import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Edit2,
  Filter,
  History,
  Info,
  Layers,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Store,
  Trash2,
  Undo2,
  Wand2,
  X,
  Zap,
} from "lucide-react";

// --- TIPOS ---

type StoreType = "Flagship" | "Calle secundaria" | "Centro comercial";
type Shift = "Mañana" | "Tarde" | "Noche" | "Fines";
type Role = "Vendedor" | "Supervisor" | "Operario" | "Técnico";
type Crit = "Baja" | "Media" | "Alta" | "Crítica";
type RiskMetric =
  | "pct_ausente_hoy"
  | "pct_promedio_X"
  | "dias_perdidos_fte"
  | "episodios_100";
type ScopeType = "empresa" | "provincia" | "tienda" | "tipo" | "turno" | "rol";

type AbsenceDay = {
  date: string; // YYYY-MM-DD
  totalPct: number;
  manageablePct: number;
  nonManageablePct: number;
  itPct: number;
  atepPct: number;
  permisosPct: number;
  otrosPct: number;
  lostDaysFTE: number;
  episodes100: number;
};

type StoreT = {
  id: string;
  name: string;
  provinceId: string;
  type: StoreType;
  baseCrit: Exclude<Crit, "Crítica">;
  employees: number;
  avgSalary: number;
  shifts: Shift[];
  roles: Role[];
  category: string;
  address: string;
  lat: number;
  lon: number;
  revenue: number;
  series90: AbsenceDay[];
};

type Province = { id: string; name: string; stores: StoreT[]; holidays: string[] };
type Company = { id: string; name: string; provinces: Province[] };

type DateRange = { from: string; to: string };

type Rule = {
  id: string;
  name: string;
  scope: { type: ScopeType; id?: string };
  metrics: { primary: RiskMetric; xDays: number };
  condition: {
    thresholdPct: number;
    persistenceDays: number;
    freqN: number;
    freqM: number;
    intensityDelta: number;
  };
  when: {
    campaigns: ("Navidad" | "Rebajas" | "Verano")[];
    daysOfWeek: number[]; // 0-6
    shifts: Shift[];
    roles: Role[];
    includeHolidays: boolean;
    events: string[];
  };
  severity: { crit: Crit; multipliers: { flagship: number; navidad: number; noche: number } };
  exclusions: { neverStores: string[]; neverRanges: DateRange[] };
  updatedAt: number;
  updatedBy: string;
};

type VersionLog = { id: string; at: number; by: string; note: string; snapshot: Rule[] };

type Sel =
  | { level: "empresa"; id: "empresa" }
  | { level: "provincia"; id: string }
  | { level: "tienda"; id: string };

type PeriodPreset =
  | "Día"
  | "Rango"
  | "Rolling 30"
  | "Rolling 90"
  | "Mes"
  | "Trimestre"
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "Año";

// --- UTILS & MOCKS ---

const PURPLE = "text-violet-700";
const PURPLE_BG = "bg-violet-600";
const PURPLE_RING = "ring-violet-200";

function clamp(n: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, n));
}
function round(n: number, d = 1) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}
function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function daysBetween(a: string, b: string) {
  const da = parseISO(a).getTime();
  const db = parseISO(b).getTime();
  return Math.round((db - da) / (24 * 3600 * 1000));
}
function addDays(s: string, n: number) {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}
function dow(s: string) {
  return parseISO(s).getDay();
}
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function campaignForDate(dateISO: string) {
  const d = parseISO(dateISO);
  const m = d.getMonth() + 1;
  const inD = (m1: number, d1: number, m2: number, d2: number) => {
    const a = new Date(d.getFullYear(), m1 - 1, d1).getTime();
    const b = new Date(d.getFullYear(), m2 - 1, d2).getTime();
    const x = d.getTime();
    return x >= a && x <= b;
  };
  const r: ("Navidad" | "Rebajas" | "Verano")[] = [];
  if (inD(12, 15, 12, 31)) r.push("Navidad");
  if (inD(1, 7, 1, 31)) r.push("Rebajas");
  if (inD(7, 1, 8, 31)) r.push("Verano");
  return r;
}

function makeCompany(seed = 7): Company {
  const rnd = mulberry32(seed);
  const provincesNames = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];
  const storeTypes: StoreType[] = ["Flagship", "Centro comercial", "Calle secundaria"];
  const categories = ["Moda", "Electrónica", "Hogar", "Deporte"];
  const roles: Role[] = ["Vendedor", "Supervisor", "Operario", "Técnico"];
  const shifts: Shift[] = ["Mañana", "Tarde", "Noche", "Fines"];

  const today = new Date();
  const end = iso(today);
  const start = addDays(end, -89);
  const dates: string[] = Array.from({ length: 90 }, (_, i) => addDays(start, i));

  const mkSeries = (
    storeSeed: number,
    employees: number,
    type: StoreType,
    baseCrit: Exclude<Crit, "Crítica">
  ): AbsenceDay[] => {
    const r = mulberry32(storeSeed);
    const base = 0.045 + r() * 0.03 + (baseCrit === "Alta" ? 0.01 : baseCrit === "Media" ? 0.005 : 0);
    const typeBump = type === "Flagship" ? 0.004 : type === "Centro comercial" ? 0.002 : 0;
    return dates.map((dt, idx) => {
      const wave = Math.sin((idx / 14) * Math.PI * 2) * (0.008 + r() * 0.004);
      const noise = (r() - 0.5) * 0.01;
      const camp = campaignForDate(dt);
      const campBump = camp.includes("Navidad") ? 0.012 : camp.includes("Rebajas") ? 0.007 : camp.includes("Verano") ? 0.005 : 0;
      const total = clamp(base + typeBump + wave + noise + campBump, 0.01, 0.18);
      const manageable = clamp(total * (0.55 + (r() - 0.5) * 0.12), 0, total);
      const non = clamp(total - manageable, 0, total);
      const it = clamp(total * (0.62 + (r() - 0.5) * 0.12), 0, total);
      const atep = clamp(total * (0.12 + (r() - 0.5) * 0.06), 0, total);
      const permisos = clamp(total * (0.18 + (r() - 0.5) * 0.08), 0, total);
      const otros = clamp(total - it - atep - permisos, 0, total);
      const lostDaysFTE = round(total * 0.9 + r() * 0.35, 2);
      const episodes100 = Math.round((total * employees * (0.9 + r() * 0.6)) / Math.max(1, employees) * 100);
      return {
        date: dt,
        totalPct: round(total * 100, 2),
        manageablePct: round(manageable * 100, 2),
        nonManageablePct: round(non * 100, 2),
        itPct: round(it * 100, 2),
        atepPct: round(atep * 100, 2),
        permisosPct: round(permisos * 100, 2),
        otrosPct: round(otros * 100, 2),
        lostDaysFTE,
        episodes100,
      };
    });
  };

  const provinces: Province[] = provincesNames.map((pName, pi) => {
    const pid = `prov_${pi + 1}`;
    const nStores = 2 + Math.floor(rnd() * 3);
    const holidays = [`${new Date().getFullYear()}-01-06`, `${new Date().getFullYear()}-05-01`];
    const stores: StoreT[] = Array.from({ length: nStores }, (_, si) => {
      const sid = `st_${pi + 1}_${si + 1}`;
      const type = storeTypes[(pi + si) % storeTypes.length];
      const baseCrit: Exclude<Crit, "Crítica"> = (pi + si) % 3 === 0 ? "Alta" : (pi + si) % 3 === 1 ? "Media" : "Baja";
      const employees = 25 + Math.floor(rnd() * 65);
      const avgSalary = 19000 + Math.floor(rnd() * 14000);
      const ss = shifts.filter(() => rnd() > 0.25);
      const rs = roles.filter(() => rnd() > 0.35);
      const lat = 40 + rnd() * 2;
      const lon = -3 + rnd() * 2;
      const revenue = 1_200_000 + Math.floor(rnd() * 4_800_000);
      return {
        id: sid,
        name: `${pName} — Tienda ${si + 1}`,
        provinceId: pid,
        type,
        baseCrit,
        employees,
        avgSalary,
        shifts: ss.length ? ss : ["Mañana", "Tarde"],
        roles: rs.length ? rs : ["Vendedor", "Supervisor"],
        category: categories[(pi + si) % categories.length],
        address: `C/ Demo ${10 + si}, ${pName}`,
        lat: round(lat, 4),
        lon: round(lon, 4),
        revenue,
        series90: mkSeries(1000 + pi * 50 + si * 7, employees, type, baseCrit),
      };
    });
    return { id: pid, name: pName, stores, holidays };
  });

  return { id: "co_1", name: "ACME Retail España", provinces };
}

// --- COMPONENTS ---

function fmtEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number) {
  return `${round(n, 2).toFixed(2)}%`;
}
function baseSev(crit: Crit) {
  return crit === "Crítica" ? 1.0 : crit === "Alta" ? 0.75 : crit === "Media" ? 0.5 : 0.3;
}
function inRange(date: string, r: DateRange) {
  return date >= r.from && date <= r.to;
}
function semaforo(priority: number) {
  if (priority >= 70) return { label: "Rojo", tone: "red" as const };
  if (priority >= 45) return { label: "Ámbar", tone: "amber" as const };
  return { label: "Verde", tone: "green" as const };
}

function Card(props: { title?: string; icon?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${props.className || ""}`}>
      {(props.title || props.right) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {props.icon}
            {props.title && <div className="text-sm font-semibold text-slate-800">{props.title}</div>}
          </div>
          {props.right}
        </div>
      )}
      <div className="p-5">{props.children}</div>
    </div>
  );
}

function Badge(props: { tone?: "purple" | "gray" | "green" | "amber" | "red"; children: React.ReactNode }) {
  const tone = props.tone || "gray";
  const cls =
    tone === "purple"
      ? "bg-violet-50 text-violet-700 ring-violet-200"
      : tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "red"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{props.children}</span>;
}

function IconButton(props: { label: string; onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}

function Tooltip(props: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center group cursor-help">
      {props.children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-800 px-3 py-2 text-xs text-white shadow-xl opacity-0 transition group-hover:opacity-100">
        {props.text}
      </span>
    </span>
  );
}

function Modal(props: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; size?: "md" | "lg" | "xl" }) {
  if (!props.open) return null;
  const w = props.size === "xl" ? "max-w-5xl" : props.size === "lg" ? "max-w-3xl" : "max-w-md";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full ${w} rounded-2xl border border-slate-200 bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-base font-semibold text-slate-900">{props.title}</div>
          <button onClick={props.onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{props.children}</div>
        {props.footer && <div className="border-t border-slate-100 p-5 bg-slate-50/50 rounded-b-2xl">{props.footer}</div>}
      </div>
    </div>
  );
}

function Segmented<T extends string>(props: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/50 p-1">
      {props.options.map((o) => {
        const active = o.value === props.value;
        return (
          <button
            key={o.value}
            onClick={() => props.onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// --- NUEVO COMPONENTE DE GRÁFICO MEJORADO ---
function TimelineChart(props: { data: { date: string; val: number }[]; threshold: number; label?: string }) {
  // Calculamos el máximo para que las barras tengan sentido, dejando un poco de aire arriba
  const maxVal = Math.max(...props.data.map((d) => d.val), props.threshold * 1.1);
  const thresholdPct = clamp(props.threshold / maxVal, 0, 1) * 100;

  return (
    <div className="w-full mt-4 select-none">
      {props.label && (
        <div className="mb-4 text-xs font-medium text-slate-500 flex justify-between">
          <span>{props.label}</span>
          <span className="text-rose-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Límite: {props.threshold}%
          </span>
        </div>
      )}

      {/* Contenedor del gráfico */}
      <div className="relative h-32 flex items-end gap-1.5 border-b border-slate-200 pb-6 w-full">
        {/* Línea de umbral (Riesgo) */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-rose-400 z-0 pointer-events-none opacity-60"
          style={{ bottom: `calc(${thresholdPct}% + 24px)` }}
        >
          <span className="absolute right-0 -top-3 text-[9px] text-rose-500 bg-white px-1">Risk {props.threshold}%</span>
        </div>

        {props.data.map((d) => {
          const heightPct = clamp(d.val / maxVal, 0, 1) * 100;
          const isRisk = d.val > props.threshold;

          return (
            <div key={d.date} className="group relative flex-1 h-full flex items-end justify-center">
              {/* Barra */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-md transition-all duration-300 relative z-10
                    ${isRisk ? "bg-rose-500" : "bg-violet-500"} 
                    opacity-80 group-hover:opacity-100 group-hover:scale-x-110`}
              />

              {/* Etiqueta flotante (Tooltip) al pasar el ratón */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl flex flex-col items-center">
                <span className="font-bold text-xs">{fmtPct(d.val)}</span>
                <span className="text-slate-300">{d.date}</span>
              </div>

              {/* Fecha abajo (Día) */}
              <div className="absolute -bottom-5 w-full text-center">
                <div className="text-[9px] text-slate-400 group-hover:text-slate-800 font-medium transition-colors">{d.date.split("-")[2]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Table(props: { columns: { key: string; label: string; render: (row: any) => React.ReactNode }[]; rows: any[] }) {
  if (props.rows.length === 0) return <div className="p-4 text-center text-sm text-slate-500 italic">No hay datos</div>;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {props.columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {props.rows.map((r, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              {props.columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-middle text-slate-700">
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- LOGIC HELPERS ---

function calcMetricValue(series: AbsenceDay[], date: string, metric: RiskMetric, xDays: number) {
  const idx = series.findIndex((d) => d.date === date);
  const at = idx >= 0 ? series[idx] : series[series.length - 1];
  if (metric === "pct_ausente_hoy") return at.totalPct;
  if (metric === "dias_perdidos_fte") return at.lostDaysFTE;
  if (metric === "episodios_100") return at.episodes100;
  const n = Math.max(1, xDays);
  const from = Math.max(0, (idx >= 0 ? idx : series.length - 1) - (n - 1));
  const window = series.slice(from, (idx >= 0 ? idx : series.length - 1) + 1);
  const avg = window.reduce((s, d) => s + d.totalPct, 0) / window.length;
  return avg;
}

function triggeredDays(series: AbsenceDay[], date: string, rule: Rule) {
  const idx = series.findIndex((d) => d.date === date);
  const i = idx >= 0 ? idx : series.length - 1;
  const { primary, xDays } = rule.metrics;
  const { thresholdPct, persistenceDays, freqN, freqM, intensityDelta } = rule.condition;

  const val = calcMetricValue(series, date, primary, xDays);
  const above = val > thresholdPct;

  const persistOk = (() => {
    const k = Math.max(1, persistenceDays);
    const win = series.slice(Math.max(0, i - (k - 1)), i + 1);
    if (win.length < k) return false;
    return win.every((d) => calcMetricValue(series, d.date, primary, xDays) > thresholdPct);
  })();

  const freqOk = (() => {
    const M = Math.max(1, freqM);
    const N = Math.max(1, freqN);
    const win = series.slice(Math.max(0, i - (M - 1)), i + 1);
    const hits = win.filter((d) => calcMetricValue(series, d.date, primary, xDays) > thresholdPct).length;
    return hits >= N;
  })();

  const intensityOk = (() => {
    if (intensityDelta <= 0) return true;
    const prevFrom = Math.max(0, i - 14);
    const prevWin = series.slice(prevFrom, Math.max(prevFrom + 1, i - 7));
    const prevAvg = prevWin.reduce((s, d) => s + calcMetricValue(series, d.date, primary, xDays), 0) / Math.max(1, prevWin.length);
    return val > prevAvg + intensityDelta;
  })();

  return { val, above, persistOk, freqOk, intensityOk, ok: above && persistOk && freqOk && intensityOk };
}

function appliesWhen(rule: Rule, date: string, store: StoreT, province: Province, events: string[]) {
  if (rule.exclusions.neverStores.includes(store.id)) return false;
  if (rule.exclusions.neverRanges.some((r) => inRange(date, r))) return false;

  const c = campaignForDate(date);
  const wd = dow(date);
  const isHoliday = province.holidays.includes(date);

  const okDow = rule.when.daysOfWeek.length ? rule.when.daysOfWeek.includes(wd) : true;
  const okCamp = rule.when.campaigns.length ? rule.when.campaigns.some((x) => c.includes(x)) : true;
  const okShift = rule.when.shifts.length ? rule.when.shifts.some((s) => store.shifts.includes(s)) : true;
  const okRole = rule.when.roles.length ? rule.when.roles.some((r) => store.roles.includes(r)) : true;
  const okHoliday = rule.when.includeHolidays ? true : !isHoliday;
  const okEvents = rule.when.events.length ? rule.when.events.some((e) => events.includes(e)) : true;

  return okDow && okCamp && okShift && okRole && okHoliday && okEvents;
}

function resolveRulesForStore(all: Rule[], store: StoreT, province: Province) {
  const by = (t: ScopeType, id?: string) => all.filter((r) => r.scope.type === t && (id ? r.scope.id === id : true));
  const base = by("empresa")[0];
  const prov = by("provincia", province.id)[0];
  const st = by("tienda", store.id)[0];
  const extra = [...by("tipo", store.type), ...store.shifts.flatMap((s) => by("turno", s)), ...store.roles.flatMap((r) => by("rol", r))];
  return { base, prov, st, extra };
}

// --- MAIN MODULE ---

export default function Module1() {
  const company = useMemo(() => makeCompany(7), []);
  const allStores = useMemo(() => company.provinces.flatMap((p) => p.stores.map((s) => ({ store: s, prov: p }))), [company]);
  const storeById = useMemo(() => new Map(allStores.map((x) => [x.store.id, x])), [allStores]);
  const provById = useMemo(() => new Map(company.provinces.map((p) => [p.id, p])), [company]);

  // STATE
  const [sel, setSel] = useState<Sel>({ level: "empresa", id: "empresa" });
  const [tab, setTab] = useState<"Empresa" | "Metodología" | "Reglas de riesgo">("Empresa");
  const seriesEnd = allStores[0]?.store.series90[allStores[0].store.series90.length - 1]?.date || iso(new Date());
  const seriesStart = allStores[0]?.store.series90[0]?.date || addDays(seriesEnd, -89);

  const [preset, setPreset] = useState<PeriodPreset>("Rolling 30");
  const [date, setDate] = useState<string>(seriesEnd);
  const [from, setFrom] = useState<string>(addDays(seriesEnd, -29));
  const [to, setTo] = useState<string>(seriesEnd);

  const [events] = useState<string[]>(["Promo Enero"]);
  const [useTaxonomy, setUseTaxonomy] = useState(true);

  // RULES
  const initialRules = useMemo<Rule[]>(
    () => [
      {
        id: "r_base",
        name: "Base Corporativa",
        scope: { type: "empresa" },
        metrics: { primary: "pct_ausente_hoy", xDays: 7 },
        condition: { thresholdPct: 6.5, persistenceDays: 2, freqN: 2, freqM: 7, intensityDelta: 0 },
        when: { campaigns: [], daysOfWeek: [], shifts: [], roles: [], includeHolidays: true, events: [] },
        severity: { crit: "Media", multipliers: { flagship: 1.5, navidad: 2.0, noche: 1.2 } },
        exclusions: { neverStores: [], neverRanges: [] },
        updatedAt: Date.now(),
        updatedBy: "System",
      },
      {
        id: "r_flag",
        name: "Flagships (Exigente)",
        scope: { type: "tipo", id: "Flagship" },
        metrics: { primary: "pct_ausente_hoy", xDays: 7 },
        condition: { thresholdPct: 5.5, persistenceDays: 1, freqN: 1, freqM: 1, intensityDelta: 0 },
        when: { campaigns: [], daysOfWeek: [], shifts: [], roles: [], includeHolidays: true, events: [] },
        severity: { crit: "Alta", multipliers: { flagship: 1.0, navidad: 1.5, noche: 1.0 } },
        exclusions: { neverStores: [], neverRanges: [] },
        updatedAt: Date.now(),
        updatedBy: "Director Ops",
      },
    ],
    []
  );

  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [versions, setVersions] = useState<VersionLog[]>([]);

  // UI STATE
  const [openProv, setOpenProv] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [fProv, setFProv] = useState("all");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [draft, setDraft] = useState<Rule | null>(null);
  const [simThreshold, setSimThreshold] = useState(6.5);
  const [aiQ, setAiQ] = useState("");
  const [aiA, setAiA] = useState("Hola. Soy tu copiloto de riesgo. Pregúntame sobre datos de absentismo o reglas.");

  // SELECTION & FILTER
  const selStores = useMemo(() => {
    if (sel.level === "empresa") return allStores;
    if (sel.level === "provincia") return provById.get(sel.id)?.stores.map((s) => ({ store: s, prov: provById.get(sel.id)! })) || [];
    const x = storeById.get(sel.id);
    return x ? [x] : [];
  }, [sel, allStores, provById, storeById]);

  const filteredStores = useMemo(() => {
    return allStores.filter(({ store }) => {
      if (fProv !== "all" && store.provinceId !== fProv) return false;
      if (q && !store.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allStores, q, fProv]);

  // KPI CALCS
  const kpiToday = useMemo(() => {
    let tot = 0,
      man = 0,
      non = 0,
      emp = 0;
    selStores.forEach(({ store }) => {
      const d = store.series90.find((x) => x.date === date) || store.series90[store.series90.length - 1];
      tot += d.totalPct * store.employees;
      man += d.manageablePct * store.employees;
      non += d.nonManageablePct * store.employees;
      emp += store.employees;
    });
    const div = Math.max(1, emp);
    return { emp, tot: tot / div, man: man / div, non: non / div };
  }, [selStores, date]);

  // RISK ENGINE
  function evalStore(store: StoreT, prov: Province, dISO: string, overrideRule?: Rule) {
    const { base, prov: pr, st, extra } = resolveRulesForStore(rules, store, prov);
    const main = overrideRule || st || pr || base;
    if (!main) return { ok: false, priority: 0, why: "No rule" };

    const app = appliesWhen(main, dISO, store, prov, events);
    if (!app) return { ok: false, priority: 0, why: "Out of scope" };

    const t = triggeredDays(store.series90, dISO, main);
    let m = 1;
    if (store.type === "Flagship") m *= main.severity.multipliers.flagship;
    const camps = campaignForDate(dISO);
    if (camps.includes("Navidad")) m *= main.severity.multipliers.navidad;

    // Extra boost if generic rules trigger
    if (!overrideRule) {
      extra.forEach((r) => {
        if (triggeredDays(store.series90, dISO, r).ok) m *= 1.1;
      });
    }

    const excess = 1 + Math.max(0, t.val - main.condition.thresholdPct) / Math.max(0.01, main.condition.thresholdPct);
    const prio = clamp(baseSev(main.severity.crit) * m * excess, 0, 1) * 100;

    return { ok: t.ok, priority: prio, why: t.ok ? `Supera ${fmtPct(main.condition.thresholdPct)}` : "OK", val: t.val, thr: main.condition.thresholdPct };
  }

  const riskToday = useMemo(() => {
    return allStores
      .map(({ store, prov }) => ({ store, prov, ...evalStore(store, prov, date) }))
      .filter((x) => x.ok)
      .sort((a, b) => b.priority - a.priority);
  }, [allStores, rules, date, events]);

  // SIMULATOR
  const simResults = useMemo(() => {
    if (!draft) return { count: 0, delta: 0 };
    const baseCount = riskToday.length;
    const simCount = allStores.filter(({ store, prov }) => {
      // simple check if draft applies conceptually
      const matchScope =
        draft.scope.type === "empresa" ||
        (draft.scope.type === "tienda" && draft.scope.id === store.id) ||
        (draft.scope.type === "provincia" && draft.scope.id === prov.id);
      if (!matchScope) return evalStore(store, prov, date).ok; // keep original status
      return evalStore(store, prov, date, { ...draft, condition: { ...draft.condition, thresholdPct: simThreshold } }).ok;
    }).length;
    return { count: simCount, delta: simCount - baseCount };
  }, [draft, simThreshold, allStores, date, riskToday]);

  // COPILOT
  const handleAiAsk = () => {
    const qL = aiQ.toLowerCase();
    let ans = "";
    if (qL.includes("cuant") || qL.includes("baja")) {
      ans = `Para la selección actual (${kpiToday.emp} empleados), hoy tienes un absentismo del ${fmtPct(kpiToday.tot)}. \n\nDesglose: \n• Gestionable: ${fmtPct(kpiToday.man)} \n• No gestionable: ${fmtPct(kpiToday.non)}`;
    } else if (qL.includes("riesgo")) {
      ans = `Hay ${riskToday.length} unidades en riesgo hoy. \nTop 3 prioridades:\n${riskToday
        .slice(0, 3)
        .map((x) => `- ${x.store.name} (${Math.round(x.priority)})`)
        .join("\n")}`;
    } else if (qL.includes("accion") || qL.includes("reducir")) {
      ans =
        "Aquí tienes 3 acciones recomendadas:\n\n[ ] Revisar cobertura de turnos en Flagships (Driver: Carga)\n[ ] Auditoría de micro-ausencias (Lunes/Viernes)\n[ ] Contacto preventivo en IT > 15 días";
    } else {
      ans =
        "Entendido. Basado en los datos mostrados, te sugiero revisar las reglas de la pestaña 'Reglas de riesgo' o filtrar por provincia para ver detalles.";
    }
    setAiA(ans + "\n\n?? Sin datos médicos.");
  };

  // --- RENDERS ---

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${PURPLE_BG} text-white`}>
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              People Analytics <span className="text-slate-400 font-light">| Risk Module</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            {["Empresa", "Metodología", "Reglas de riesgo"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-900">Admin User</div>
              <div className="text-[10px] text-slate-500">HQ - Madrid</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TREE */}
        <aside className="w-64 flex-col border-r border-slate-200 bg-white hidden md:flex">
          <div className="p-4 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estructura</div>
            <button
              onClick={() => setSel({ level: "empresa", id: "empresa" })}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${sel.level === "empresa" ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Building2 className="h-4 w-4" /> {company.name}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {company.provinces.map((p) => (
              <div key={p.id}>
                <button
                  onClick={() => {
                    setOpenProv((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                    setSel({ level: "provincia", id: p.id });
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${sel.id === p.id ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className="flex items-center gap-2">
                    {openProv[p.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} {p.name}
                  </span>
                </button>
                {openProv[p.id] && (
                  <div className="ml-4 mt-1 space-y-0.5 pl-2 border-l border-slate-100">
                    {p.stores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSel({ level: "tienda", id: s.id })}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${sel.id === s.id ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        <Store className="h-3 w-3" /> {s.name.split("— ")[1]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {tab === "Empresa" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* FILTERS CARD */}
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Periodo</label>
                      <select value={preset} onChange={(e) => setPreset(e.target.value as any)} className="w-full rounded-lg border-slate-200 text-sm py-2">
                        {["Día", "Rolling 30", "Mes", "Trimestre", "Año"].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Día Foco</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border-slate-200 text-sm py-2" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Desde</label>
                      <input
                        type="date"
                        value={from}
                        disabled={preset === "Día"}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full rounded-lg border-slate-200 text-sm py-2 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Hasta</label>
                      <input
                        type="date"
                        value={to}
                        disabled={preset === "Día"}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full rounded-lg border-slate-200 text-sm py-2 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone="purple">Selección: {sel.level.toUpperCase()}</Badge>
                    <Badge>Emp: {kpiToday.emp}</Badge>
                  </div>
                </div>
              </Card>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="col-span-1 md:col-span-1 border-violet-200 bg-violet-50/30">
                  <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-violet-600" /> Absentismo Total
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">{fmtPct(kpiToday.tot)}</div>
                  <div className="text-xs text-slate-500 mt-1">Día {date}</div>
                </Card>
                <Card className="col-span-1 md:col-span-1">
                  <div className="text-sm font-medium text-slate-600">Gestionable</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">{fmtPct(kpiToday.man)}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(kpiToday.man / kpiToday.tot) * 100}%` }} />
                  </div>
                </Card>
                <Card className="col-span-1 md:col-span-1">
                  <div className="text-sm font-medium text-slate-600">No Gestionable</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">{fmtPct(kpiToday.non)}</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{ width: `${(kpiToday.non / kpiToday.tot) * 100}%` }} />
                  </div>
                </Card>
                <Card className="col-span-1 md:col-span-1 border-l-4 border-l-rose-500">
                  <div className="text-sm font-medium text-slate-600">Unidades en Riesgo</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">{riskToday.length}</div>
                  <div
                    className="text-xs text-rose-600 mt-1 cursor-pointer hover:underline"
                    onClick={() => document.getElementById("risk-table")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Ver detalle ?
                  </div>
                </Card>
              </div>

              {/* SELECTED STORE VIEW */}
              {sel.level === "tienda" && (
                <Card
                  title={`Ficha: ${storeById.get(sel.id)?.store.name}`}
                  icon={<Store className="h-4 w-4" />}
                  right={
                    <IconButton
                      label="Regla"
                      onClick={() => {
                        setTab("Reglas de riesgo");
                        setTimeout(() => setRuleOpen(true), 100);
                      }}
                    >
                      <Wand2 className="h-4 w-4" /> Configurar Regla
                    </IconButton>
                  }
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge>{storeById.get(sel.id)?.store.type}</Badge>
                        <Badge>Criticidad: {storeById.get(sel.id)?.store.baseCrit}</Badge>
                      </div>

                      {/* AQUÍ ESTÁ EL CAMBIO PRINCIPAL: TimelineChart en lugar de MiniBars */}
                      <div>
                        <TimelineChart
                          label="Tendencia (Últimos 14 días)"
                          data={storeById.get(sel.id)!.store.series90.slice(-14).map((d) => ({ date: d.date, val: d.totalPct }))}
                          threshold={evalStore(storeById.get(sel.id)!.store, storeById.get(sel.id)!.prov, date).thr || 6.5}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 border border-slate-100 h-fit">
                      <div className="font-semibold text-slate-900 mb-2">Detalles Operativos</div>
                      <div className="flex justify-between">
                        <span>Empleados:</span> <span>{storeById.get(sel.id)?.store.employees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salario Medio:</span> <span>{fmtEUR(storeById.get(sel.id)?.store.avgSalary || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Turnos:</span> <span className="text-right">{storeById.get(sel.id)?.store.shifts.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* RISK TABLE */}
              <div id="risk-table">
                <Card title="Unidades con Riesgo Activo (Hoy)" icon={<ShieldAlert className="h-4 w-4 text-rose-600" />}>
                  <Table
                    columns={[
                      {
                        key: "name",
                        label: "Tienda",
                        render: (r) => (
                          <div className="font-medium text-slate-900 cursor-pointer" onClick={() => setSel({ level: "tienda", id: r.store.id })}>
                            {r.store.name}
                          </div>
                        ),
                      },
                      { key: "prov", label: "Provincia", render: (r) => r.prov.name },
                      { key: "val", label: "Valor Actual", render: (r) => <span className="font-mono text-rose-700">{fmtPct(r.val)}</span> },
                      { key: "thr", label: "Umbral Regla", render: (r) => <span className="text-slate-500 text-xs"> &gt; {fmtPct(r.thr)}</span> },
                      { key: "prio", label: "Prioridad", render: (r) => <Badge tone={semaforo(r.priority).tone}>{Math.round(r.priority)}/100</Badge> },
                      { key: "why", label: "Motivo", render: (r) => r.why },
                    ]}
                    rows={riskToday}
                  />
                </Card>
              </div>
            </div>
          )}

          {tab === "Metodología" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card title="Taxonomía de Absentismo" icon={<BadgeCheck className={`h-4 w-4 ${PURPLE}`} />}>
                <div className="p-4 bg-slate-50 rounded-xl mb-6 text-sm text-slate-700 leading-relaxed border border-slate-200">
                  Separamos el absentismo en dos grandes bloques para enfocar la acción.
                  <strong> Gestionable</strong> es aquel donde la operativa influye;
                  <strong> No Gestionable</strong> es estructural o protegido, donde solo podemos mitigar el impacto.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-emerald-100 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">Gestionable (Reducible)</span>
                    </div>
                    <ul className="p-4 space-y-2 text-sm text-slate-600">
                      {[
                        "Injustificado",
                        "Micro-ausencias (L/V)",
                        "Corta duración recurrente",
                        "Desorganización operativa",
                        "Clima / Liderazgo",
                        "IT Corta (Gestión activa)",
                      ].map((i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                      <X className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold text-slate-700">No Gestionable (Estructural)</span>
                    </div>
                    <ul className="p-4 space-y-2 text-sm text-slate-600">
                      {[
                        "Permisos legales / nacimiento",
                        "Enfermedad grave / IT larga",
                        "Riesgos protegidos",
                        "Ausencias colectivas (Huelga)",
                      ].map((i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-300">•</span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "Reglas de riesgo" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Mapa de Reglas</h2>
                <div className="flex gap-2">
                  <IconButton label="JSON" onClick={() => setJsonOpen(true)}>
                    <Download className="h-4 w-4" /> Exportar Mapa
                  </IconButton>
                  <button
                    onClick={() => {
                      if (!setDraft) return;
                      setDraft({
                        id: uid("r"),
                        name: "Nueva Regla",
                        scope: { type: "empresa" },
                        metrics: { primary: "pct_ausente_hoy", xDays: 7 },
                        condition: { thresholdPct: 6.5, persistenceDays: 2, freqN: 1, freqM: 1, intensityDelta: 0 },
                        when: { campaigns: [], daysOfWeek: [], shifts: [], roles: [], includeHolidays: true, events: [] },
                        severity: { crit: "Media", multipliers: { flagship: 1.5, navidad: 2, noche: 1.2 } },
                        exclusions: { neverStores: [], neverRanges: [] },
                        updatedAt: Date.now(),
                        updatedBy: "Admin",
                      });
                      setSimThreshold(6.5);
                      setRuleOpen(true);
                    }}
                    className={`flex items-center gap-2 rounded-xl ${PURPLE_BG} px-4 py-2 text-sm font-medium text-white shadow hover:bg-violet-700`}
                  >
                    <Plus className="h-4 w-4" /> Crear Regla
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {rules.map((r) => (
                  <Card key={r.id} className="hover:border-violet-300 cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => {
                          setDraft({ ...r });
                          setSimThreshold(r.condition.thresholdPct);
                          setRuleOpen(true);
                        }}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge tone="purple">
                            {r.scope.type.toUpperCase()} {r.scope.id ? `: ${r.scope.id}` : ""}
                          </Badge>
                          <h3 className="font-bold text-slate-900">{r.name}</h3>
                        </div>
                        <div className="text-sm text-slate-600 mt-2 flex flex-wrap gap-4">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Umbral &gt; {r.condition.thresholdPct}%
                          </span>
                          <span className="flex items-center gap-1">
                            <History className="h-3 w-3" /> Persiste {r.condition.persistenceDays}d
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Sev: {r.severity.crit}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setRules((prev) => prev.filter((x) => x.id !== r.id))}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* AI COPILOT PANEL */}
        <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-xl z-20">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Copiloto IA
            </div>
            <div className="text-xs text-slate-500 mt-1">Tier-1 Advisor • No médico</div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Wand2 className="h-4 w-4 text-slate-500" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 text-sm text-slate-700 whitespace-pre-line">{aiA}</div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {["Qué riesgo tengo hoy", "Explícame la gráfica", "3 acciones para reducir"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setAiQ(t);
                    setTimeout(handleAiAsk, 500);
                  }}
                  className="text-[10px] bg-slate-50 border border-slate-200 rounded-full px-2 py-1 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={aiQ}
                onChange={(e) => setAiQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAiAsk();
                }}
                placeholder="Pregunta sobre tus datos..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-violet-200 focus:outline-none"
              />
              <button
                onClick={handleAiAsk}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-600 hover:bg-violet-100 p-1 rounded-md"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* RULE EDITOR MODAL */}
      <Modal
        open={ruleOpen}
        onClose={() => setRuleOpen(false)}
        title={draft?.id.startsWith("id_") ? "Nueva Regla de Riesgo" : "Editar Regla"}
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-slate-500">Simulación: {simResults.delta > 0 ? "+" : ""}{simResults.delta} unidades cambiarían de estado.</div>
            <div className="flex gap-2">
              <button onClick={() => setRuleOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (draft) {
                    setRules((prev) => {
                      const idx = prev.findIndex((r) => r.id === draft.id);
                      if (idx >= 0) {
                        const n = [...prev];
                        n[idx] = draft;
                        return n;
                      }
                      return [...prev, draft];
                    });
                    setRuleOpen(false);
                  }
                }}
                className={`px-4 py-2 text-sm text-white ${PURPLE_BG} rounded-lg hover:bg-violet-700`}
              >
                Guardar Regla
              </button>
            </div>
          </div>
        }
      >
        {draft && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nombre Regla</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Scope (Alcance)</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={draft.scope.type}
                    onChange={(e) => setDraft({ ...draft, scope: { ...draft.scope, type: e.target.value as any } })}
                    className="flex-1 border border-slate-200 rounded-lg text-sm px-2 py-2"
                  >
                    {["empresa", "provincia", "tienda", "tipo", "turno"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  {draft.scope.type !== "empresa" && (
                    <input
                      placeholder="ID (opcional)"
                      value={draft.scope.id || ""}
                      onChange={(e) => setDraft({ ...draft, scope: { ...draft.scope, id: e.target.value } })}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Condiciones de Disparo
                </h4>
                <Badge tone="amber">Simulador Activo</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block">Umbral Absentismo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      step="0.1"
                      value={draft.condition.thresholdPct}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setDraft({ ...draft, condition: { ...draft.condition, thresholdPct: v } });
                        setSimThreshold(v);
                      }}
                      className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                    />
                    <span className="text-sm text-slate-600">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Persistencia (días)</label>
                  <input
                    type="number"
                    value={draft.condition.persistenceDays}
                    onChange={(e) => setDraft({ ...draft, condition: { ...draft.condition, persistenceDays: parseInt(e.target.value) } })}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Criticidad Base</label>
                  <select
                    value={draft.severity.crit}
                    onChange={(e) => setDraft({ ...draft, severity: { ...draft.severity, crit: e.target.value as any } })}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-2 text-sm"
                  >
                    {["Baja", "Media", "Alta", "Crítica"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-2">
                  Simulador: {simResults.count} unidades afectadas ({simResults.delta >= 0 ? "+" : ""}{simResults.delta} vs actual)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={simThreshold}
                  onChange={(e) => setSimThreshold(parseFloat(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Contexto y Multiplicadores</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between border p-3 rounded-lg text-sm">
                  <span>Es Flagship (x{draft.severity.multipliers.flagship})</span>
                  <input type="checkbox" checked={draft.severity.multipliers.flagship > 1} readOnly className="accent-violet-600" />
                </label>
                <label className="flex items-center justify-between border p-3 rounded-lg text-sm">
                  <span>Es Campaña Navidad (x{draft.severity.multipliers.navidad})</span>
                  <input type="checkbox" checked={draft.severity.multipliers.navidad > 1} readOnly className="accent-violet-600" />
                </label>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* JSON EXPORT MODAL */}
      <Modal open={jsonOpen} onClose={() => setJsonOpen(false)} title="Exportar Mapa de Reglas" size="lg">
        <div className="relative bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[500px]">
          <button
            className="absolute top-4 right-4 p-2 bg-slate-800 rounded hover:bg-slate-700 text-white"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(rules, null, 2))}
          >
            <Copy className="h-4 w-4" />
          </button>
          <pre>{JSON.stringify(rules, null, 2)}</pre>
        </div>
      </Modal>
    </div>
  );
}
