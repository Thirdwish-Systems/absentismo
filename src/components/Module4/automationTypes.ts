export type RiskSource = 'HISTORICO' | 'HRIS' | 'PATRONES_IA' | 'CENTROS_ESPEJO';
export type Severity = 'ALTA' | 'MEDIA' | 'BAJA';
export type RiskStatus = 'AUTOMATION_CREATED' | 'AUTOMATION_NOT_CREATED' | 'ALTERNATIVE_STUDY';
export type Outcome = 'AVOIDED' | 'REDUCED' | 'NO_EFFECT';

export interface Scope {
    company?: string;
    province?: string;
    center?: string;
    centers?: string[]; // Multiple centers for pattern-based protocols
    shift?: string;
    role?: string;
}

export interface Risk {
    id: string;
    name: string;
    source: RiskSource;
    scope: Scope;
    probability?: number; // 0-100
    window?: string; // e.g. "2-6 semanas"
    severity: Severity;
    impactEur?: number;
    lastSeen?: string;
    recurrenceScore?: number;
    status: RiskStatus;
    automationId?: string;
    alternativeSolutionCount?: number;
}

export interface AutomationTask {
    id: string;
    title: string;
    description: string;
    owner: string;
    phone?: string;
    email?: string;
    deadline: string; // e.g. "24h", "3 días"
    targetDate?: string; // Specific ISO date for deadline calculation
    priority: 'ALTA' | 'MEDIA' | 'BAJA';
    status: 'PENDIENTE' | 'COMPLETADA' | 'ENTRÁMITE';
}

export interface Workflow {
    id: string;
    name: string; // User-facing name
    riskId: string;
    patternId?: string; // Link to a pattern if applicable
    createdAt: string;
    createdBy: string;
    severity: Severity;
    riskDate?: string;
    config: {
        condition: string;
        scope: Scope;
    };
    tasks: AutomationTask[];
    runsCount: number;
    successRate: number;
    theoreticalSavings: number;
    realSavings: number;
    savedEur: number;
    activeStatus: 'ACTIVE' | 'IDLE' | 'DRAFT';
}

export interface AutomationRun {
    id: string;
    automationId: string;
    date: string;
    scopeSnapshot: Scope;
    probAtTrigger: number;
    actionsExecuted: string[];
    outcome: Outcome;
    savedEurEstimated: number;
}

export interface MirrorCenterSuggestion {
    baseCenter: string;
    suggestedCenters: {
        id: string;
        name: string;
        similarity: number; // 0-100
    }[];
    similarityExplanation: string;
}

export interface MirrorFinding {
    id: string;
    baseCenter: string;
    mirrorGroup: string[];
    findingType: string;
    deltaMetrics: string;
    suspectedOperationalDrivers: string[];
    recommendedAutomationTemplate?: string;
}
