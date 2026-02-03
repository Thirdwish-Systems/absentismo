import { RiskThresholds } from "../../stores/configStore";

export const SHIFTS = ["Mañana", "Tarde", "Noche"] as const;
export const ROLES = ["Caja", "Reposición", "Picking", "Atención", "Producción"] as const;

export type Shift = (typeof SHIFTS)[number];
export type Role = (typeof ROLES)[number];

export type Horizon = "1w" | "2w" | "1m" | "3m" | "6m" | "1y";

export type Center = {
    id: string;
    name: string;
    size: number;
    criticidad: "Alta" | "Media" | "Baja"
};

export type Driver = { label: string; s: number; why: string };

export type Cell = {
    key: string;
    centerId: string;
    centerName: string;
    criticidad: Center["criticidad"];
    dayTs: number;
    shift: Shift;
    role: Role;
    planned: number;
    minOp: number;
    riskAbs: number; // %
    riskBreak: number; // %
    absType: string;
    durDays: number;
    eur: number;
    eurTeorico: number;
    eurReal: number;
    eurNP: number;
    accuracy: number;
    pattern: string;
    why: string;
    drivers: Driver[];
};

export type Plan = {
    name: string;
    owner: string;
    deadline: string;
    riskDown: number;
    cost: number;
    net: number;
    roi: number;
    desc: string
};

export function riskTone(r: number, thresholds: RiskThresholds) {
    if (r >= thresholds.critical) return { label: "CRÍTICO", dot: "bg-rose-600", brd: "border-rose-200", bg: "bg-rose-50", tx: "text-rose-950" };
    if (r >= thresholds.warning) return { label: "ALERTA", dot: "bg-amber-500", brd: "border-amber-200", bg: "bg-amber-50", tx: "text-amber-950" };
    return { label: "ESTABLE", dot: "bg-emerald-500", brd: "border-emerald-200", bg: "bg-emerald-50", tx: "text-emerald-950" };
}
