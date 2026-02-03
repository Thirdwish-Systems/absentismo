export type AbsenceCategory = "GESTIONABLE" | "NO_GESTIONABLE";

export interface AbsenceType {
    id: string;
    label: string;
    category: AbsenceCategory;
    description: string;
    entraEnKPI: boolean;
    predecible: boolean;
    rule: string;
    source: string;
    recommendedAction?: string;
    qualityImpact: "Alta" | "Media" | "Baja";
}

export const ABSENCE_DICTIONARY: AbsenceType[] = [
    // --- GESTIONABLE ---
    {
        id: "IT_CC_CORTA",
        label: "IT · Contingencia común (corta)",
        category: "GESTIONABLE",
        description: "Incapacidad temporal por enfermedad común de corta duración (1-3 días).",
        entraEnKPI: true,
        predecible: true,
        rule: "absence_event(IT_CC) AND duration <= 3 days",
        source: "Fichaje + Parte Médico",
        recommendedAction: "Plan retorno + Ajuste de carga preventiva.",
        qualityImpact: "Alta"
    },
    {
        id: "IT_CC_MEDIA",
        label: "IT · Contingencia común (media)",
        category: "GESTIONABLE",
        description: "Incapacidad temporal (4-15 días).",
        entraEnKPI: true,
        predecible: true,
        rule: "absence_event(IT_CC) AND 4 <= duration <= 15 days",
        source: "Fichaje + Parte Médico",
        recommendedAction: "Cobertura temporal + Seguimiento RRHH.",
        qualityImpact: "Alta"
    },
    {
        id: "IT_AT",
        label: "IT · Accidente de trabajo (AT)",
        category: "GESTIONABLE",
        description: "Baja derivada de incidente en el puesto de trabajo.",
        entraEnKPI: true,
        predecible: true,
        rule: "absence_event(IT_AT)",
        source: "Mutua / Servicio Prevención",
        recommendedAction: "Revisión Ergonómica + Incident Review.",
        qualityImpact: "Media"
    },
    {
        id: "NO_SHOW",
        label: "No-show (Sin registro)",
        category: "GESTIONABLE",
        description: "Turno planificado sin presencia física y sin causa justificada registrada.",
        entraEnKPI: true,
        predecible: true,
        rule: "planned > 0 AND worked == 0 AND no_absence_event",
        source: "Sistema de Fichaje",
        recommendedAction: "Workflow disciplinario + Cobertura express.",
        qualityImpact: "Alta"
    },
    {
        id: "AUSENCIA_PARCIAL_TARDE",
        label: "Entrada tardía",
        category: "GESTIONABLE",
        description: "Retraso en la hora de entrada respecto al inicio de turno.",
        entraEnKPI: true,
        predecible: true,
        rule: "clock_in > planned_start + tolerancia",
        source: "Sistema de Fichaje",
        recommendedAction: "Control puntualidad + Feedback manager.",
        qualityImpact: "Media"
    },
    {
        id: "PERMISO_NO_RETRIBUIDO",
        label: "Permiso no retribuido",
        category: "GESTIONABLE",
        description: "Ausencia autorizada que conlleva reducción salarial.",
        entraEnKPI: true,
        predecible: false,
        rule: "absence_event(PERMISO_NR)",
        source: "Solicitud Empleado / CRM HR",
        recommendedAction: "Ajuste planificación mensual.",
        qualityImpact: "Baja"
    },

    // --- NO GESTIONABLE ---
    {
        id: "VACACIONES",
        label: "Vacaciones",
        category: "NO_GESTIONABLE",
        description: "Periodo de descanso reglamentario por contrato.",
        entraEnKPI: false,
        predecible: true, // Por calendario
        rule: "absence_event(VACACIONES)",
        source: "Calendario Anual",
        qualityImpact: "Alta"
    },
    {
        id: "NACIMIENTO",
        label: "Nacimiento y cuidado",
        category: "NO_GESTIONABLE",
        description: "Maternidad, paternidad y cuidado del menor protegidos.",
        entraEnKPI: false,
        predecible: true,
        rule: "absence_event(MAT_PAT)",
        source: "Seguridad Social / HR",
        qualityImpact: "Alta"
    },
    {
        id: "DEBER_INEXCUSABLE",
        label: "Deber inexcusable",
        category: "NO_GESTIONABLE",
        description: "Citaciones judiciales, jurado popular o similares.",
        entraEnKPI: false,
        predecible: false,
        rule: "absence_event(DEBER)",
        source: "Certificado Oficial",
        qualityImpact: "Baja"
    }
];

export interface DayData {
    plannedMinutes: number;
    workedMinutes: number;
    hasAbsenceEvent: boolean;
    absenceCode?: string;
    durationDays?: number;
}

/**
 * Universal Rule for calculating absence minutes
 */
export function computeAbsenceMinutes(data: DayData): number {
    return Math.max(data.plannedMinutes - data.workedMinutes, 0);
}

/**
 * Classify the type of absence based on event data
 */
export function classifyAbsence(data: DayData): string {
    if (data.hasAbsenceEvent && data.absenceCode) {
        // Here we would map to canonical types using codebook_absence_map
        return data.absenceCode;
    }

    if (data.workedMinutes === 0 && data.plannedMinutes > 0) {
        return "NO_SHOW";
    }

    if (data.workedMinutes > 0 && data.workedMinutes < data.plannedMinutes) {
        return "AUSENCIA_PARCIAL_TARDE"; // Simplified mapping
    }

    return "PRESENTE";
}

/**
 * Calculate cost based on base cost + replacement + opportunity
 */
export function calculateCost(minutes: number, costPerHour: number, substitutionFactor: number = 0.22): number {
    const baseCost = (minutes / 60) * costPerHour;
    const substitutionCost = baseCost * substitutionFactor;
    return baseCost + substitutionCost;
}
