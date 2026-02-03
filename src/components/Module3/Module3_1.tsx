import React, { useMemo, useRef, useState } from "react";
import { ArrowUp, Brain, Copy, RefreshCw, Search, Sparkles, Info, TrendingUp, Calendar, ShieldCheck, Zap, ArrowRight, BarChart3, Download, FileText, CheckCircle2, Activity, HeartPulse, AlertCircle, EyeOff } from "lucide-react";
import { useConfig, RiskThresholds, GlobalConfig } from "../../stores/configStore";

/**
 * MÓDULO 3 — Predicción & Decisión (VERSIÓN MEJORADA)
 * - Mapa de riesgos dinámico
 * - Horizonte: 1w | 2w | 1m | 3m | 6m | 1y
 * - Comparativa Coste Teórico vs Coste Real
 * - Métricas de precisión IA
 */

import {
  Cell,
  Horizon,
  Shift,
  Role,
  Driver,
  Plan,
  SHIFTS,
  ROLES,
  riskTone
} from "./types";
import { ABSENCE_DICTIONARY } from "./AbsenceDictionary";
import PredictionDetail from "./PredictionDetail";

type Obs = { actualBreak: boolean; ts: number };
type Msg = { id: string; role: "user" | "assistant"; text: string; ts: number };

const DAY = 24 * 60 * 60 * 1000;

const CENTERS: Center[] = [
  { id: "MAD-ALC", name: "Madrid · Alcorcón", size: 78, criticidad: "Alta" },
  { id: "BCN-ZF", name: "Barcelona · Zona Franca", size: 84, criticidad: "Alta" },
  { id: "VAL-TUR", name: "Valencia · Turia", size: 56, criticidad: "Media" },
  { id: "SEV-NEV", name: "Sevilla · Nervión", size: 44, criticidad: "Media" },
  { id: "BIL-IBA", name: "Bilbao · Ibaiondo", size: 38, criticidad: "Baja" },
  { id: "ZAR-DEL", name: "Zaragoza · Delicias", size: 40, criticidad: "Media" },
];

/* ---------------- helpers ---------------- */

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const pct = (n: number) => `${Math.round(clamp(n, 0, 100))}%`;
const iso = (d: number) => new Date(d).toISOString().slice(0, 10);
const ddmm = (d: number) => new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(new Date(d));
const dow = (d: number) => ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][new Date(d).getDay()];
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
}

function mkId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(seed: string) {
  return (hashStr(seed) % 10000) / 10000;
}

type Center = { id: string; name: string; size: number; criticidad: "Alta" | "Media" | "Baja" };

function horizonLabel(h: Horizon) {
  return h === "1w" ? "1 semana" : h === "2w" ? "2 semanas" : h === "1m" ? "1 mes" : h === "3m" ? "3 meses" : h === "6m" ? "6 meses" : "1 año";
}

function horizonDays(h: Horizon) {
  return h === "1w" ? 7 : h === "2w" ? 14 : h === "1m" ? 30 : h === "3m" ? 90 : h === "6m" ? 180 : 365;
}

function buildDays(h: Horizon) {
  const start = startOfToday();
  const n = Math.min(horizonDays(h), 90); // Cap simulation at 90 days for performance in demo
  return Array.from({ length: n }, (_, i) => start + i * DAY);
}

function accuracyFor(h: Horizon, samples: number) {
  const base = h === "1w" ? 88 : h === "2w" ? 80 : h === "1m" ? 68 : 55;
  const bonus = clamp(samples * 0.6, 0, 10);
  return clamp(base + bonus, 40, 92);
}

function keyOf(centerId: string, dayTs: number, shift: Shift, role: Role) {
  return `${centerId}__${iso(dayTs)}__${shift}__${role}`;
}

function scoreRisk(c: Cell) {
  const critW = c.criticidad === "Alta" ? 1.15 : c.criticidad === "Media" ? 1 : 0.9;
  return (c.riskBreak * 1000 + Math.round(c.eurNP / 10)) * critW;
}

function Badge({ children, tone = "neutral", IA = false }: { children: React.ReactNode; tone?: "neutral" | "violet" | "amber" | "red" | "green"; IA?: boolean }) {
  const cls =
    tone === "violet" ? "bg-violet-50 text-violet-700 border-violet-200" :
      tone === "amber" ? "bg-amber-50 text-amber-800 border-amber-200" :
        tone === "red" ? "bg-rose-50 text-rose-700 border-rose-200" :
          tone === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            "bg-zinc-50 text-zinc-700 border-zinc-200";

  if (IA) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-violet-400/30 uppercase tracking-tighter">
        <Sparkles className="h-2.5 w-2.5" />
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function Pill({ cls, children, title }: { cls: string; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
}

function Btn({ tone = "zinc", onClick, children }: { tone?: "zinc" | "violet" | "dark"; onClick?: () => void; children: React.ReactNode }) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-violet-300";
  const cls =
    tone === "violet"
      ? "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
      : tone === "dark"
        ? "border-violet-600 bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
        : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50";
  return (
    <button type="button" className={cn(base, cls)} onClick={onClick}>
      {children}
    </button>
  );
}

function Card({ title, desc, right, children }: { title: string; desc?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <div className="text-sm font-medium text-zinc-900">{title}</div>
          {desc ? <div className="mt-1 text-xs text-zinc-400 font-light">{desc}</div> : null}
        </div>
        {right}
      </div>
      <div className="h-px w-full bg-zinc-100" />
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({ label, value, subValue, hint, accent = false }: { label: string; value: string; subValue?: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-3xl border p-5 transition-all shadow-sm flex flex-col justify-between", accent ? "bg-violet-50 border-violet-100 text-violet-900" : "bg-white border-zinc-100")}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className={cn("text-[10px] font-medium uppercase tracking-widest", accent ? "text-violet-700/60" : "text-zinc-500")}>{label}</div>
          {hint ? (
            <div className="text-[10px] opacity-40" title={hint}>
              <Info size={12} />
            </div>
          ) : null}
        </div>
        <div className={cn("text-2xl font-light tracking-tight leading-none", accent ? "text-violet-900" : "text-zinc-900")}>{value}</div>
      </div>
      {subValue && (
        <div className="mt-3 pt-3 border-t border-zinc-100/50">
          {subValue}
        </div>
      )}
    </div>
  );
}

/* ---------------- motor demo ---------------- */

function calcCell(center: Center, dayTs: number, shift: Shift, role: Role, cal: number, config: GlobalConfig, horizon: Horizon): Cell {
  const seed = `${center.id}|${dayTs}|${shift}|${role}`;
  const now = new Date(dayTs);
  const wDay = now.getDay();
  const dayIdx = Math.floor((dayTs - startOfToday()) / DAY);

  // Campaign Check
  const isCampaign = config.campaigns.some(c => {
    const start = new Date(c.startDate).getTime();
    const end = new Date(c.endDate).getTime();
    return dayTs >= start && dayTs <= end;
  });

  const shiftW = shift === "Noche" ? 0.9 : shift === "Mañana" ? 1.05 : 1;
  const roleW = role === "Producción" ? 1.2 : role === "Picking" ? 1.1 : role === "Caja" ? 0.9 : 1;
  const base = center.size / (SHIFTS.length * 2.1);
  const planned = Math.max(2, Math.round(base * shiftW * roleW + rand01(seed + "|hc") * 2));
  const minOp = Math.max(1, Math.round(planned * 0.85));

  const fat = clamp(0.2 + 0.7 * rand01(seed + "|fat") + (shift === "Noche" ? 0.08 : 0), 0, 1);
  const chg = clamp(0.15 + 0.75 * rand01(seed + "|chg") + (shift === "Tarde" ? 0.05 : 0), 0, 1);
  const cons = clamp(0.2 + 0.7 * rand01(seed + "|cons") + (shift === "Noche" ? 0.08 : 0), 0, 1);
  const cx = clamp(0.2 + 0.7 * rand01(center.id + "|cx"), 0, 1);
  const rot = clamp(0.08 + 0.28 * rand01(center.id + "|rot"), 0, 1);

  const heat = dayIdx >= 6 && dayIdx <= 9 ? 0.18 : 0;
  const camp = isCampaign ? (wDay === 4 || wDay === 5 ? 0.22 : 0.12) : 0;
  const recurrent = (role === "Caja" && wDay === 5 ? 0.12 : 0) + (center.id === "SEV-NEV" && role === "Picking" && wDay === 1 ? 0.18 : 0);
  const ext = clamp(heat + camp + recurrent, 0, 0.6);

  const riskAbs = clamp((0.14 + 0.35 * fat + 0.2 * chg + 0.22 * ext + 0.15 * rot) * 100, 5, 95);

  const absentExp = clamp(planned * (0.03 + 0.04 * fat + 0.02 * ext + 0.012 * chg), 0, Math.max(0, planned - 0.5));
  const presentExp = planned - absentExp;
  const gap = Math.max(0, (minOp - presentExp) / Math.max(1, minOp));
  const riskBreak = clamp((gap * 120 + riskAbs * 0.25 + cx * 14) * (1 + cal), 0, 100);

  const getAbs = () => {
    if (ext > 0.3) return ABSENCE_DICTIONARY.find(t => t.id === 'NO_SHOW')?.label || "No-show";
    if (fat > 0.55) return ABSENCE_DICTIONARY.find(t => t.id === 'IT_CC_CORTA')?.label || "IT Corta";
    if (chg > 0.55) return ABSENCE_DICTIONARY.find(t => t.id === 'AUSENCIA_PARCIAL_TARDE')?.label || "Entrada tardía";
    return ABSENCE_DICTIONARY.find(t => t.id === 'PERMISO_NO_RETRIBUIDO')?.label || "Permiso NR";
  };
  const absType = getAbs();
  const durDays = clamp(1.1 + (absType === "Baja (IT) corta" ? 2.7 : 1.1) + ext * 1.2, 1, 6);

  const costPerDay = 220;
  const baseCost = absentExp * costPerDay;
  const urgent = riskBreak >= 70 ? 1.25 : 1;
  const sub = baseCost * 0.55 * urgent * (1 + fat * 0.25);
  const hidden = (riskBreak / 100) * absentExp * 140;
  const eur = baseCost + sub + hidden;
  const eurNP = Math.max(0, eur - baseCost);

  let pattern = "Mixto";
  let why = "Riesgo moderado; decide por impacto y rapidez.";
  if (ext >= 0.35) {
    pattern = `Pico externo (${dow(dayTs)})`;
    why = "Factores externos elevan el riesgo en una fecha concreta.";
  } else if (fat >= 0.62 && cons >= 0.62) {
    pattern = "Espiral de fatiga";
    why = "Fatiga + turnos seguidos ? bola de nieve.";
  } else if (planned <= 3) {
    pattern = "Mínimo crítico";
    why = "Vas justo: una ausencia te deja por debajo del mínimo.";
  } else if (chg >= 0.62) {
    pattern = "Fricción por cambios";
    why = "Cambios elevan urgencias y coste fuera de presupuesto.";
  } else if (cx >= 0.66 && rot >= 0.2) {
    pattern = "Fragilidad estructural";
    why = "Mismo % puede costar más por complejidad.";
  }

  const drivers: Driver[] = [
    { label: "Fatiga", s: fat, why: "Horas extra/descanso ? sube ausencias." },
    { label: "Turnos seguidos", s: cons, why: "Bloques sin descanso ? aumenta el pico." },
    { label: "Cambios de turno", s: chg, why: "Variabilidad ? más urgencia y coste." },
    { label: "Factores externos", s: ext, why: "Clima/campañas/eventos ? amplifican." },
    { label: "Rotación", s: rot, why: "Vacantes crónicas ? más carga." },
    { label: "Complejidad", s: cx, why: "SLA/rigidez ? fragilidad." },
  ];

  const accuracy = accuracyFor(horizon, 5);

  return {
    key: keyOf(center.id, dayTs, shift, role),
    centerId: center.id,
    centerName: center.name,
    criticidad: center.criticidad,
    dayTs,
    shift,
    role,
    planned,
    minOp,
    riskAbs,
    riskBreak,
    absType,
    durDays,
    eur,
    eurTeorico: eur,
    eurReal: eur - (eur * 0.18), // 18% reduction proxy
    eurNP,
    accuracy,
    pattern,
    why,
    drivers,
  };
}

function plansFor(cell: Cell): Plan[] {
  const base = cell.eur;
  const br = cell.riskBreak;
  const critW = cell.criticidad === "Alta" ? 1.1 : cell.criticidad === "Media" ? 1.0 : 0.9;

  const defs = [
    { name: "Refuerzo preventivo", desc: "Bolsa/ETT con antelación.", owner: "RRHH + Operaciones", deadline: "48h", costF: 0.22, brF: 0.45, min: 10, max: 55 },
    { name: "Mover cobertura", desc: "Reequilibrar desde unidad similar.", owner: "Operaciones", deadline: "24–48h", costF: 0.12, brF: 0.3, min: 8, max: 40 },
    { name: "Ajuste de turnos", desc: "Reducir cambios/turnos seguidos.", owner: "Planificación", deadline: "72h", costF: 0.05, brF: 0.18, min: 5, max: 28 },
  ];

  return defs
    .map((d) => {
      const cost = base * d.costF;
      const riskDown = clamp(br * d.brF * critW, d.min, d.max);
      const newEur = base * (1 - (riskDown / 100) * 0.55);
      const savings = Math.max(0, base - newEur);
      const net = Math.max(0, savings - cost);
      const roi = cost ? Math.round(((savings - cost) / cost) * 100) : 0;
      return { name: d.name, desc: d.desc, owner: d.owner, deadline: d.deadline, riskDown, cost, net, roi };
    })
    .sort((a, b) => b.net - a.net || b.riskDown - a.riskDown);
}

function ensureDemoCounts(cells: Cell[], thresholds: RiskThresholds, horizon: Horizon) {
  const sorted = cells.slice().sort((a, b) => scoreRisk(b) - scoreRisk(a));
  const overrides: Record<string, Partial<Cell>> = {};

  const getRB = (c: Cell) => overrides[c.key]?.riskBreak ?? c.riskBreak;

  const targetH = 8;
  const targetM = 12;

  const hiTargets = Array.from({ length: targetH }, (_, i) => thresholds.critical + 2 + (i % 8));
  const midTargets = Array.from({ length: targetM }, (_, i) => thresholds.warning + 5 + (i % 15));

  let h = 0;
  for (const c of sorted) {
    if (h >= targetH) break;
    overrides[c.key] = { ...(overrides[c.key] || {}), riskBreak: hiTargets[h], riskAbs: 75 };
    h++;
  }

  let m = 0;
  for (const c of sorted) {
    if (m >= targetM) break;
    const rb = getRB(c);
    if (rb < thresholds.critical) {
      overrides[c.key] = { ...(overrides[c.key] || {}), riskBreak: midTargets[m], riskAbs: 55 };
      m++;
    }
  }

  return cells.map((c) => (overrides[c.key] ? ({ ...c, ...overrides[c.key] } as Cell) : c));
}

function copilotReply(q: string, ctx: { sel: Cell; top: Cell[]; acc: number; horizon: string }) {
  const t = String(q || "").toLowerCase();
  const { sel, top, acc, horizon } = ctx;

  const head = [
    `Horizonte: ${horizon} · Precisión orientativa: ${pct(acc)}`,
    `Selección: ${sel.centerName} · ${dow(sel.dayTs)} ${iso(sel.dayTs)} · ${sel.shift} · ${sel.role}`,
    `Probabilidad de rotura: ${pct(sel.riskBreak)} (quedarse por debajo del mínimo operativo)`
  ].join("\n");

  if (t.includes("dónde") || t.includes("donde") || t.includes("mayor") || t.includes("prior")) {
    const lines = top.slice(0, 6).map((c, i) =>
      `${i + 1}) ${c.centerName} · ${dow(c.dayTs)} ${ddmm(c.dayTs)} · ${c.shift} · ${c.role} · rotura ${pct(c.riskBreak)} · coste ${money(c.eurTeorico)}`
    );
    return [head, "", "Riesgos más urgentes:", "", ...lines].join("\n");
  }

  if (t.includes("acciones") || t.includes("qué hago") || t.includes("que hago")) {
    const ps = plansFor(sel).slice(0, 3).map((p, i) =>
      `${i + 1}) ${p.name} · rotura ? ${pct(p.riskDown)} · neto ${money(p.net)} · ROI ${p.roi}% · ${p.owner} · ${p.deadline}`
    );
    return [head, "", "Acciones recomendadas (por impacto neto):", "", ...ps].join("\n");
  }

  return [head, "", "Pídeme: 'dónde está el mayor riesgo', 'acciones', 'por qué', 'precisión'."].join("\n");
}

/* ---------------- UI ---------------- */

export default function Modulo3PredictivoLista() {
  const { config } = useConfig();
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [horizon, setHorizon] = useState<Horizon>("2w");
  const [query, setQuery] = useState("");
  const [onlyHigh, setOnlyHigh] = useState(false);
  const [showNoRisk, setShowNoRisk] = useState(false);

  const getThresholds = (centerId: string, dayTs: number): RiskThresholds => {
    const isCampaign = config.campaigns.some(camp => {
      const start = new Date(camp.startDate).getTime();
      const end = new Date(camp.endDate).getTime();
      return dayTs >= start && dayTs <= end;
    });

    let source = config.risks;
    for (const reg of config.structure) {
      const s = reg.stores.find(st => st.id === centerId || st.name.includes(centerId));
      if (s?.risks) { source = s.risks; break; }
    }

    return isCampaign
      ? { ...source, warning: source.campaignWarning, critical: source.campaignCritical }
      : source;
  };

  const [cal, setCal] = useState<Record<string, number>>({});
  const [obs, setObs] = useState<Record<string, Obs>>({});
  const [selKey, setSelKey] = useState<string>(keyOf(CENTERS[0].id, startOfToday(), SHIFTS[0], ROLES[0]));

  const days = useMemo(() => buildDays(horizon), [horizon]);

  const all = useMemo(() => {
    const out: Cell[] = [];
    for (const c of CENTERS) {
      const calV = cal[c.id] || 0;
      for (const d of days) for (const s of SHIFTS) for (const r of ROLES) out.push(calcCell(c, d, s, r, calV, config, horizon));
    }
    return ensureDemoCounts(out, config.risks, horizon);
  }, [days, cal, config, horizon]);

  const acc = useMemo(() => accuracyFor(horizon, Object.keys(obs).length), [horizon, obs]);

  const risks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((c) => {
        const th = getThresholds(c.centerId, c.dayTs);
        const min = onlyHigh ? th.critical : th.warning;
        return c.riskBreak >= min;
      })
      .filter((c) => {
        if (!q) return true;
        return [c.centerName, iso(c.dayTs), dow(c.dayTs), c.shift, c.role, c.pattern, c.absType].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => a.dayTs - b.dayTs)
      .slice(0, horizon === "1w" ? 15 : horizon === "2w" ? 30 : horizon === "1m" ? 60 : 120);
  }, [all, query, onlyHigh, config.risks, config.campaigns, horizon]);

  const noRiskCenters = useMemo(() => {
    return CENTERS.filter(c => !risks.some(r => r.centerId === c.id));
  }, [risks]);

  const sel = useMemo(() => {
    const f = all.find((c) => c.key === selKey);
    return f || risks[0] || all[0];
  }, [all, selKey, risks]);

  const best = useMemo(() => plansFor(sel)[0], [sel]);

  const summary = useMemo(() => {
    let high = 0, mid = 0, hc = 0, mc = 0, hcr = 0, mcr = 0, tt = 0, tr = 0;

    risks.forEach(c => {
      const th = getThresholds(c.centerId, c.dayTs);
      const isHigh = c.riskBreak >= th.critical;
      const isMid = !isHigh && c.riskBreak >= th.warning;

      if (isHigh) { high++; hc += c.eurTeorico; hcr += c.eurReal; }
      else if (isMid) { mid++; mc += c.eurTeorico; mcr += c.eurReal; }

      tt += c.eurTeorico;
      tr += c.eurReal;
    });

    return { high, mid, highCost: hc, midCost: mc, highCostReal: hcr, midCostReal: mcr, totalTeorico: tt, totalReal: tr };
  }, [risks, config.risks, config.campaigns, config.structure]);

  const [msgs, setMsgs] = useState<Msg[]>([
    { id: mkId(), role: "assistant", ts: Date.now(), text: "Soy tu Copiloto. Pídeme: 'dónde está el mayor riesgo', 'acciones'..." },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  function send(text?: string) {
    const qq = (text ?? draft).trim();
    if (!qq) return;
    setDraft("");
    setMsgs(p => [...p, { id: mkId(), role: "user", text: qq, ts: Date.now() }]);
    setTimeout(() => {
      setMsgs(p => [...p, { id: mkId(), role: "assistant", text: copilotReply(qq, { sel, top: risks.slice(0, 10), acc, horizon: horizonLabel(horizon) }), ts: Date.now() }]);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  if (viewMode === "detail") {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-6">
        <div className="mx-auto max-w-[1500px]">
          <PredictionDetail
            prediction={sel}
            horizon={horizon}
            accuracy={acc}
            onBack={() => setViewMode("list")}
            thresholds={getThresholds(sel.centerId, sel.dayTs)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill cls="border-violet-200 bg-violet-50 text-violet-900"><Sparkles className="h-4 w-4" /><span className="ml-1">Predicción de rotura</span></Pill>
            </div>
            <h1 className="mt-3 text-4xl font-light tracking-tight text-zinc-900">Riesgos futuros</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
              {(["1w", "2w", "1m", "3m", "6m", "1y"] as Horizon[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={cn(
                    "rounded-full px-3 py-2 text-xs font-semibold",
                    horizon === h ? "bg-violet-600 text-white" : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  {horizonLabel(h)}
                </button>
              ))}
            </div>
            <Pill cls="border-zinc-200 bg-white text-zinc-800" title="Precisión orientativa.">Precisión {pct(acc)}</Pill>
            <Btn onClick={() => { setQuery(""); setMsgs(p => p.slice(0, 1)); }}><RefreshCw className="h-4 w-4" />Reset</Btn>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Stat
                label="Riesgos altos"
                value={String(summary.high)}
                hint="Críticos detectados."
                subValue={
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium uppercase"><span className="text-zinc-400">Teórico</span> <span className="text-zinc-400">{money(summary.highCost)}</span></div>
                    <div className="flex justify-between text-[11px] font-normal uppercase"><span className="text-emerald-600">Real</span> <span className="text-emerald-700">{money(summary.highCostReal)}</span></div>
                  </div>
                }
              />
              <Stat
                label="Riesgos medios"
                value={String(summary.mid)}
                hint="Alertas detectadas."
                subValue={
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium uppercase"><span className="text-zinc-400">Teórico</span> <span className="text-zinc-400">{money(summary.midCost)}</span></div>
                    <div className="flex justify-between text-[11px] font-normal uppercase"><span className="text-emerald-600">Real</span> <span className="text-emerald-700">{money(summary.midCostReal)}</span></div>
                  </div>
                }
              />
              <Stat label="Total Teórico" value={money(summary.totalTeorico)} hint="Impacto total sin intervención." />
              <Stat label="Total Real" value={money(summary.totalReal)} hint="Impacto total tras acciones." accent />
            </div>

            <Card
              title="Lista de riesgos"
              desc={onlyHigh ? "Solo críticos." : "Medios y altos."}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-[200px] rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-zinc-900 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => { setOnlyHigh(!onlyHigh); setShowNoRisk(false); }}
                    className={cn("rounded-full border px-3 py-2 text-xs font-semibold transition-all", onlyHigh ? "border-rose-200 bg-rose-50 text-rose-950" : "border-zinc-200 bg-white text-zinc-700")}
                  >
                    Solo críticos
                  </button>
                  <button
                    onClick={() => { setShowNoRisk(!showNoRisk); setOnlyHigh(false); }}
                    className={cn("rounded-full border px-3 py-2 text-xs font-semibold transition-all", showNoRisk ? "border-violet-200 bg-violet-600 text-white" : "border-zinc-200 bg-white text-zinc-700")}
                  >
                    Sin riesgo ({noRiskCenters.length})
                  </button>
                </div>
              }
            >
              <div className="space-y-2">
                {showNoRisk ? (
                  noRiskCenters.length > 0 ? (
                    noRiskCenters.map(c => (
                      <div key={c.id} className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="text-emerald-500 h-4 w-4" />
                          <div>
                            <div className="text-sm font-bold text-zinc-900">{c.name}</div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase">Operativa estable · Sin alertas previstas</div>
                          </div>
                        </div>
                        <Badge tone="green">Seguro</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <EyeOff className="mx-auto h-8 w-8 text-zinc-200 mb-2" />
                      <p className="text-xs text-zinc-400 font-bold">No hay centros sin riesgo en este periodo.</p>
                    </div>
                  )
                ) : (
                  risks.map((c) => {
                    const th = getThresholds(c.centerId, c.dayTs);
                    const t = riskTone(c.riskBreak, th);
                    return (
                      <button key={c.key} onClick={() => { setSelKey(c.key); setViewMode("detail"); }} className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left hover:bg-zinc-50 transition shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={cn("mt-1.5 h-3 w-3 rounded-full", t.dot)} />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-zinc-900">{c.centerName}</span>
                                <Badge tone={c.riskBreak >= th.critical ? 'red' : 'amber'}>Riesgo {pct(c.riskBreak)}</Badge>
                                <span className="text-[11px] text-zinc-400 font-medium">{dow(c.dayTs)} {ddmm(c.dayTs)} · {c.shift} · {c.role}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 flex items-center gap-1 uppercase tracking-tighter">
                                  <Activity size={10} /> {c.absType}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-100 px-1.5 py-0.5 rounded italic">Patrón: {c.pattern}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              {c.riskBreak > 85 && <Badge IA>Crítico</Badge>}
                              <div>
                                <div className="text-[9px] text-zinc-400 uppercase font-bold">Escenario Teórico</div>
                                <div className="text-xs font-medium text-zinc-400 line-through opacity-50">{money(c.eurTeorico)}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] text-emerald-600 uppercase font-bold">Impacto Real Previsto</div>
                              <div className="text-lg font-light text-zinc-900">{money(c.eurReal)}</div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* OPERATIONAL WARNINGS SECTION */}
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.2em]">Warnings Operativos Previstos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white rounded-[32px] border border-zinc-100 shadow-sm flex gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-zinc-900">Fatiga Estructural (Burnout)</h4>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded uppercase">Inminente</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        Logística Z. Franca: Horas extra acumuladas &gt;20% en mandos intermedios. Riesgo alto de IT por estrés en 10-15 días.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-[32px] border border-zinc-100 shadow-sm flex gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-zinc-900">Pico de No-shows (Eventos)</h4>
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-bold rounded uppercase">Crítico</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        Alcorcón: Solapamiento con festividad local. Prealerta de 12% de ausencias sin previo aviso en turno de tarde.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 h-[calc(100vh-48px)] flex flex-col rounded-[28px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
                <div className="h-10 w-10 bg-violet-600 rounded-xl flex items-center justify-center text-white"><Brain size={20} /></div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">Copiloto IA</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Decisión Predictiva</div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {msgs.map(m => (
                  <div key={m.id} className={cn("p-3 rounded-2xl text-xs", m.role === 'assistant' ? 'bg-zinc-50 text-zinc-700 border border-zinc-100' : 'bg-violet-600 text-white ml-auto max-w-[80%]')}>
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                <div className="relative">
                  <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Enviar mensaje..." className="w-full rounded-2xl border border-zinc-200 p-3 pr-12 text-sm resize-none outline-none focus:ring-2 focus:ring-violet-300" rows={2} />
                  <button onClick={() => send()} className="absolute right-2 bottom-2 h-8 w-8 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg"><ArrowUp size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
