
// src/stores/unifiedMockData.ts

export type Horizon = "7d" | "14d" | "30d" | "90d";

export interface Threat {
    id: string;
    unit: string;
    manager: string;
    role: string;
    shift: string;
    expectedLoss: number;
    breakageProb: number;
    peakDate: string;
    staffing: { minimum: number; estimated: number; gap: number };
    drivers: Array<{ name: string; weight: number; delta: string }>;
    actionPlan: {
        type: "OPERATIVE" | "COVERAGE" | "MANAGERIAL";
        title: string;
        savings: number;
        confidence: number;
    };
}

export interface KPIState {
    // HOME KPIs
    asOfDate: Date;
    costYTD: number;
    costYTD_LY: number;
    costToday: number;
    actionsCompletedYTD: number;
    costYTD_NoActions: number; // For "Sin Plan" metric

    // PREDICTION / FUTURE
    costRestYear_NoActions: number; // The "850k" big number
    costRestYear_LY: number;        // For sub-year comparisons
    costRestYear_WithRecommended: number;
    savingsRestYear: number;

    // RISK ENGINE (Subset of Future)
    totalActiveRisks: number; // e.g. 32
    expectedLossCurrentWindow: number; // e.g. 420.500€
    riskConfidence: number; // e.g. 78%
}

// --- THE TRUTH ---
export const UNIFIED_MOCK_DATA = {
    // 1. GLOBAL DASHBOARD NUMBERS
    KPI: {
        asOfDate: new Date(),
        costYTD: 138500,        // Real Actual (Improved vs LY)
        costYTD_LY: 145000,     // Last Year (Higher, so we are saving)
        costToday: 1240,
        actionsCompletedYTD: 24,
        costYTD_NoActions: 168500, // "Sin Plan" (Even worse scenario avoided)

        costRestYear_NoActions: 850000,
        costRestYear_LY: 810000,
        costRestYear_WithRecommended: 600000, // 850k - 250k
        savingsRestYear: 250000, // Matches Prediction V2 Card

        // These link directly to the Prediction Module
        totalActiveRisks: 32,
        expectedLossCurrentWindow: 420500,
        riskConfidence: 78
    } as KPIState,

    // 2. DETAILED THREATS (Must match the summary numbers above conceptually)
    TOP_THREATS: [
        {
            id: "T-102",
            unit: "MAD-Alcorcón",
            manager: "Carlos Ruiz",
            role: "Picking",
            shift: "Noche",
            expectedLoss: 42000,
            breakageProb: 0.92,
            peakDate: "Viernes 14 (3 días)",
            staffing: { minimum: 12, estimated: 9, gap: -3 },
            drivers: [
                { name: "Fatiga Acumulada (>4 noches)", weight: 0.85, delta: "+15%" },
                { name: "Horas Extra > Límite", weight: 0.60, delta: "+22h" },
            ],
            actionPlan: {
                type: "COVERAGE",
                title: "Activar Bolsa de Horas (3 FTEs)",
                savings: 28500,
                confidence: 0.88,
            },
        },
        {
            id: "T-105",
            unit: "BCN-Zona Franca",
            manager: "Laura Valls",
            role: "Carretilleros",
            shift: "Tarde",
            expectedLoss: 18500,
            breakageProb: 0.78,
            peakDate: "Lunes 17 (6 días)",
            staffing: { minimum: 8, estimated: 6.5, gap: -1.5 },
            drivers: [
                { name: "Vacío de Liderazgo (Change)", weight: 0.75, delta: "New Mgr" },
                { name: "Clima / Absentismo Parcial", weight: 0.45, delta: "+12%" },
            ],
            actionPlan: {
                type: "MANAGERIAL",
                title: "Intervención HRBP + Check-in",
                savings: 12000,
                confidence: 0.65,
            },
        },
        {
            id: "T-201",
            unit: "VAL-Turia",
            manager: "Miguel Soler",
            role: "Caja",
            shift: "Rotativo",
            expectedLoss: 9200,
            breakageProb: 0.64,
            peakDate: "Sábado 22",
            staffing: { minimum: 5, estimated: 4, gap: -1 },
            drivers: [
                { name: "Patrón Estacional (Fallas)", weight: 0.90, delta: "High" },
            ],
            actionPlan: {
                type: "OPERATIVE",
                title: "Ajuste Cuadrante (Swap)",
                savings: 5000,
                confidence: 0.92,
            },
        },
    ] as Threat[]
};
