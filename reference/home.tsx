import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Euro,
  Brain,
  CheckSquare,
  Search,
  Bell,
  Menu,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from "lucide-react";

// --- UI KIT (Apple-ish / Soft Zinc) ---
const Card = ({ children, className = "", title, right }: any) => (
  <div className={`bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </div>
);

const Badge = ({ t, children }: any) => {
  const s =
    t === "crit"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : t === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : t === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-zinc-100 text-zinc-600 border-zinc-200";
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s}`}>{children}</span>;
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
    {children}
  </span>
);

const Select = ({ label, value, onChange, options }: any) => (
  <label className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold text-zinc-500">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-violet-200"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

function fmtEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSeries(seed: number, base = 6.2) {
  const r = mulberry32(seed);
  const past: number[] = Array.from({ length: 7 }, (_, i) => {
    const wave = Math.sin((i / 6) * Math.PI * 1.8) * 0.8;
    const noise = (r() - 0.5) * 0.8;
    return clamp(base + wave + noise, 2.5, 14);
  });
  const today = clamp(base + 0.8 + (r() - 0.5) * 0.6, 2.5, 14);
  const future: number[] = Array.from({ length: 6 }, (_, i) => {
    const drift = (i + 1) * (r() > 0.6 ? 0.35 : -0.18);
    const noise = (r() - 0.5) * 0.55;
    return clamp(today + drift + noise, 2.5, 14);
  });
  return [...past, today, ...future]; // length 14
}

function buildPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function HealthChart({ values }: { values: number[] }) {
  const W = 720;
  const H = 170;
  const padX = 18;
  const padY = 18;

  const max = Math.max(10, ...values) * 1.1;
  const min = 0;

  const toXY = (idx: number, v: number) => {
    const x = padX + (idx / (values.length - 1)) * (W - padX * 2);
    const y = padY + (1 - (v - min) / (max - min)) * (H - padY * 2);
    return { x, y };
  };

  const pts = values.map((v, i) => toXY(i, v));
  const split = 7; // index 7 = HOY

  const realPts = pts.slice(0, split + 1);
  const futPts = pts.slice(split);

  const realPath = buildPath(realPts);
  const futPath = buildPath(futPts);

  const areaPath = `${realPath} L ${realPts[realPts.length - 1].x.toFixed(2)} ${(H - padY).toFixed(2)} L ${realPts[0].x.toFixed(2)} ${(H - padY).toFixed(2)} Z`;

  const today = pts[split];
  const thr = 8.0;
  const thrY = toXY(0, thr).y;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[170px]">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(124 58 237)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(124 58 237)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="future" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(124 58 237)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="rgb(124 58 237)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Grid subtle */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padY + t * (H - padY * 2)}
            y2={padY + t * (H - padY * 2)}
            stroke="rgb(228 228 231)"
            strokeWidth="1"
          />
        ))}

        {/* Threshold */}
        <line x1={padX} x2={W - padX} y1={thrY} y2={thrY} stroke="rgb(244 63 94)" strokeOpacity="0.35" strokeDasharray="5 5" />
        <text x={W - padX} y={thrY - 6} textAnchor="end" fontSize="10" fill="rgb(244 63 94)" opacity="0.75">
          Umbral {thr.toFixed(1)}%
        </text>

        {/* Area real */}
        <path d={areaPath} fill="url(#area)" />

        {/* Real line */}
        <path d={realPath} fill="none" stroke="rgb(24 24 27)" strokeOpacity="0.85" strokeWidth="2.25" strokeLinecap="round" />

        {/* Future line (dashed) */}
        <path d={futPath} fill="none" stroke="url(#future)" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="6 6" />

        {/* Split line HOY */}
        <line x1={today.x} x2={today.x} y1={padY} y2={H - padY} stroke="rgb(124 58 237)" strokeOpacity="0.35" strokeDasharray="4 6" />

        {/* Today dot */}
        <circle cx={today.x} cy={today.y} r={5} fill="white" stroke="rgb(124 58 237)" strokeWidth="2" />
      </svg>

      {/* X labels */}
      <div className="mt-2 grid grid-cols-14 text-[10px] font-medium text-zinc-400">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className={`text-center ${i === 7 ? "text-violet-700 font-semibold" : ""}`}>
            {i === 7 ? "HOY" : i < 7 ? `-${7 - i}d` : `+${i - 6}d`}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute right-2 top-2 hidden md:flex items-center gap-2">
        <Pill>
          <span className="h-2 w-2 rounded-full bg-zinc-600" /> Real
        </Pill>
        <Pill>
          <span className="h-2 w-2 rounded-full bg-violet-500 opacity-40" /> Predicción
        </Pill>
      </div>
    </div>
  );
}

// --- DATA MOCK (Provincia ? Tienda) ---
const ORG = [
  { province: "Madrid", stores: [{ id: "mad_gv", name: "Flagship Gran Vía", seed: 11, base: 6.9 }, { id: "mad_s", name: "Serrano", seed: 12, base: 5.6 }] },
  { province: "Barcelona", stores: [{ id: "bcn_d", name: "Diagonal", seed: 21, base: 6.2 }, { id: "bcn_p", name: "Plaça Catalunya", seed: 22, base: 6.8 }] },
  { province: "Valencia", stores: [{ id: "vlc_c", name: "Centro", seed: 31, base: 5.9 }, { id: "vlc_a", name: "Avenida", seed: 32, base: 5.3 }] },
];

// --- ALERTS (añadimos coste, recomendación y ahorro) ---
const ALERTS = [
  {
    id: 1,
    type: "crit",
    title: "Rotura operativa prevista en Flagship Gran Vía",
    context: "Predicción · +1 día",
    costEUR: 18200,
    fix: "Activar cobertura express (bolsa horas + swap turnos) + limitar ventana de servicio 24h.",
    savingEUR: 11800,
  },
  {
    id: 2,
    type: "crit",
    title: "Absentismo disparado al 12% en Logística",
    context: "Diagnóstico · Hoy",
    costEUR: 24600,
    fix: "Plan fatiga 7 días: recorte horas extra + refuerzo temporal + auditoría de descansos.",
    savingEUR: 15300,
  },
  {
    id: 3,
    type: "warn",
    title: "Patrón repetitivo detectado: Turno Noche",
    context: "IA Insights · Ayer",
    costEUR: 9200,
    fix: "Rotación de turnos + micro-pausas planificadas + revisión de consecutivos.",
    savingEUR: 4200,
  },
  {
    id: 4,
    type: "warn",
    title: "Riesgo cobertura: 2 bajas sin cubrir",
    context: "Predicción · +3 días",
    costEUR: 7800,
    fix: "Pre-asignar sustitución y bloquear cambios de turno no críticos.",
    savingEUR: 3100,
  },
];

// --- WORKFLOWS ACTIVOS (ordenados por impacto P&L) ---
const WORKFLOWS = [
  { id: "wf_1", crit: "crit", name: "Cobertura crítica", place: "Madrid", unit: "Flagship Gran Vía", owner: "Ops", impactEUR: 28400, done: 4, total: 11 },
  { id: "wf_2", crit: "crit", name: "Plan Fatiga 7D", place: "Logística", unit: "Planta Norte", owner: "COO", impactEUR: 23100, done: 6, total: 14 },
  { id: "wf_3", crit: "warn", name: "Micro-ausencias L/V", place: "Barcelona", unit: "Diagonal", owner: "RRHH", impactEUR: 12600, done: 8, total: 10 },
  { id: "wf_4", crit: "warn", name: "Revisión descansos", place: "Valencia", unit: "Centro", owner: "WFM", impactEUR: 8400, done: 3, total: 9 },
];

function priorityScore(a: any) {
  const sev = a.type === "crit" ? 2 : 1;
  return sev * 1_000_000 + (a.costEUR || 0);
}

function wfScore(w: any) {
  const sev = w.crit === "crit" ? 2 : w.crit === "warn" ? 1.5 : 1;
  return sev * 1_000_000 + (w.impactEUR || 0);
}

const ModuleSlot = ({ t }: { t: string }) => (
  <div className="h-full min-h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 text-zinc-400">
    <div>Módulo cargado:</div>
    <div className="font-semibold text-zinc-600 text-xl">{t}</div>
  </div>
);

export default function App() {
  const [view, setView] = useState("home");
  const [sb, setSb] = useState(true);

  const [province, setProvince] = useState(ORG[0].province);
  const [storeId, setStoreId] = useState(ORG[0].stores[0].id);

  const storeOptions = useMemo(() => {
    const p = ORG.find((x) => x.province === province) || ORG[0];
    return p.stores;
  }, [province]);

  // keep store valid when province changes
  React.useEffect(() => {
    if (!storeOptions.some((s) => s.id === storeId)) setStoreId(storeOptions[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  const series = useMemo(() => {
    const p = ORG.find((x) => x.province === province) || ORG[0];
    const s = p.stores.find((x) => x.id === storeId) || p.stores[0];
    return makeSeries(s.seed, s.base);
  }, [province, storeId]);

  const today = series[7];
  const maxNext = Math.max(...series.slice(8));
  const worstInDays = 8 + series.slice(8).findIndex((v) => v === maxNext);

  const sortedAlerts = useMemo(() => [...ALERTS].sort((a, b) => priorityScore(b) - priorityScore(a)), []);
  const sortedWorkflows = useMemo(() => [...WORKFLOWS].sort((a, b) => wfScore(b) - wfScore(a)), []);

  return (
    <div className="flex h-screen bg-[#F7F7F8] font-sans text-zinc-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ${sb ? "w-64" : "w-20"}`}>
        <div className="h-16 flex items-center justify-center border-b border-zinc-100 text-xl font-semibold tracking-tight">
          A<span className="text-violet-600">.Flow</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: "home", l: "Inicio", i: LayoutDashboard },
            { id: "diag", l: "Diagnóstico", i: Activity },
            { id: "cost", l: "Impacto P&L", i: Euro },
            { id: "pred", l: "Predicción", i: Brain },
            { id: "work", l: "Gestión", i: CheckSquare },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setView(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${view === m.id ? "bg-violet-50 text-violet-700 font-semibold shadow-sm" : "text-zinc-500 hover:bg-zinc-50"}`}
            >
              <m.i className={`h-5 w-5 ${view === m.id ? "text-violet-600" : "text-zinc-400"}`} />
              {sb && <span>{m.l}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSb(!sb)} className="p-4 flex justify-center text-zinc-400 hover:text-zinc-600">
          <Menu className="h-5 w-5" />
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
            Organización <ChevronRight className="h-4 w-4" />
            <span className="text-zinc-900 font-semibold">{view === "home" ? "Vista General" : view.toUpperCase()}</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                className="pl-10 pr-4 py-2 bg-zinc-100 rounded-full text-sm outline-none focus:ring-2 ring-violet-200 transition-all w-72"
                placeholder="Buscar empleado, centro..."
              />
            </div>
            <Bell className="h-5 w-5 text-zinc-500 hover:text-violet-600 cursor-pointer" />
            <div className="h-9 w-9 bg-zinc-900 rounded-full text-white flex items-center justify-center text-xs font-bold ring-4 ring-zinc-100">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {view === "home" ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* MONITOR SALUD (APPLE MODE) */}
                <Card
                  title={
                    <>
                      <Activity className="text-violet-600" /> Monitor de Salud · 14 días
                    </>
                  }
                  right={
                    <div className="flex items-end gap-3">
                      <div className="hidden lg:flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-500">-7d / +6d</span>
                      </div>
                      <div className="flex gap-3">
                        <Select
                          label="Provincia"
                          value={province}
                          onChange={setProvince}
                          options={ORG.map((p) => ({ value: p.province, label: p.province }))}
                        />
                        <Select
                          label="Tienda"
                          value={storeId}
                          onChange={setStoreId}
                          options={storeOptions.map((s) => ({ value: s.id, label: s.name }))}
                        />
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-9">
                      <HealthChart values={series} />
                    </div>
                    <div className="lg:col-span-3 space-y-3">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <div className="text-[11px] font-semibold text-zinc-500">Hoy</div>
                        <div className="mt-1 text-2xl font-semibold text-zinc-900">{fmtPct(today)}</div>
                        <div className="mt-2 text-xs text-zinc-600">
                          Riesgo máximo en <span className="font-semibold text-violet-700">+{Math.max(1, worstInDays - 7)}d</span> ({fmtPct(maxNext)})
                        </div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="text-[11px] font-semibold text-zinc-500 mb-2">Conclusión automática</div>
                        <div className="text-sm text-zinc-800 leading-relaxed">
                          {maxNext >= 8.0 ? (
                            <>
                              Probable tensión operativa. Prioriza <span className="font-semibold">cobertura</span> y <span className="font-semibold">fatiga</span> para evitar impacto en servicio.
                            </>
                          ) : (
                            <>Evolución estable. Oportunidad de optimizar el bloque gestionable sin riesgo de rotura.</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* FEED DE ALERTAS */}
                  <Card title={<><AlertTriangle className="text-amber-500" /> Feed de alertas · ordenado por impacto</>} className="lg:col-span-2">
                    <div className="space-y-3">
                      {sortedAlerts.map((a) => {
                        const savingPct = a.costEUR ? Math.round((a.savingEUR / a.costEUR) * 100) : 0;
                        return (
                          <div
                            key={a.id}
                            className="group rounded-3xl border border-zinc-200 bg-white p-4 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${a.type === "crit" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.35)]" : "bg-amber-500"}`} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold text-zinc-900 text-sm">{a.title}</div>
                                    <Badge t={a.type === "crit" ? "crit" : "warn"}>{a.type === "crit" ? "Crítico" : "Atención"}</Badge>
                                  </div>
                                  <div className="mt-1 text-[11px] text-zinc-500">{a.context}</div>
                                </div>
                              </div>
                              <ArrowRight className="mt-1 h-4 w-4 text-zinc-300 group-hover:text-violet-500" />
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="text-[11px] font-semibold text-zinc-500">Coste aprox.</div>
                                <div className="mt-1 text-sm font-semibold text-zinc-900">{fmtEUR(a.costEUR)}</div>
                              </div>
                              <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                                <div className="text-[11px] font-semibold text-zinc-500">Solución recomendada</div>
                                <div className="mt-1 text-sm text-zinc-800 leading-snug">{a.fix}</div>
                              </div>
                              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                                <div className="text-[11px] font-semibold text-emerald-700">Ahorro si aplicas</div>
                                <div className="mt-1 text-sm font-semibold text-emerald-800">
                                  {fmtEUR(a.savingEUR)} <span className="text-xs font-semibold text-emerald-700">({savingPct}% ?)</span>
                                </div>
                                <div className="mt-1 text-[11px] text-emerald-700">Reducción estimada del coste</div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <button
                                onClick={() => setView("pred")}
                                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                              >
                                Ver detalle
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              <div className="text-[11px] text-zinc-400">?? Sin datos médicos · basado en drivers operativos</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setView("pred")}
                      className="mt-4 w-full py-2 text-xs font-semibold text-zinc-600 hover:text-violet-700 hover:bg-violet-50 rounded-2xl transition-colors"
                    >
                      Ver todas las alertas
                    </button>
                  </Card>

                  {/* WORKFLOWS ACTIVOS */}
                  <Card title={<><CheckSquare className="text-emerald-600" /> Workflows activos</>}
                    right={<Badge t="good">Ordenado por P&L</Badge>}
                  >
                    <div className="space-y-3">
                      {sortedWorkflows.map((w) => {
                        const pctDone = Math.round((w.done / Math.max(1, w.total)) * 100);
                        const pctLeft = 100 - pctDone;
                        return (
                          <div key={w.id} className="rounded-3xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50/40 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold text-zinc-900">{w.name}</div>
                                  <Badge t={w.crit}>{w.crit === "crit" ? "Crítico" : "Atención"}</Badge>
                                </div>
                                <div className="mt-1 text-[11px] text-zinc-500">
                                  {w.place} · <span className="font-medium text-zinc-700">{w.unit}</span> · Owner: {w.owner}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[11px] font-semibold text-zinc-500">Impacto P&L</div>
                                <div className="text-sm font-semibold text-zinc-900">{fmtEUR(w.impactEUR)}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                <span>{w.done}/{w.total} tareas completadas</span>
                                <span className={`font-semibold ${pctLeft > 40 ? "text-rose-600" : "text-zinc-600"}`}>Pendiente {pctLeft}%</span>
                              </div>
                              <div className="mt-2 h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pctDone}%` }} />
                              </div>
                            </div>

                            <button
                              onClick={() => setView("work")}
                              className="mt-3 w-full rounded-2xl bg-zinc-900 py-2 text-xs font-bold text-white hover:bg-zinc-800"
                            >
                              Abrir workflow
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              view === "diag" ? <ModuleSlot t="Módulo 1: Diagnóstico" /> : view === "cost" ? <ModuleSlot t="Módulo 2: P&L" /> : view === "pred" ? <ModuleSlot t="Módulo 3: Predicción" /> : <ModuleSlot t="Módulo 4: Workflows" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
