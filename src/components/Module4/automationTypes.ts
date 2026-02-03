export type RiskSource = 'HISTORICO' | 'HRIS' | 'PATRONES_IA' | 'CENTROS_ESPEJO';
export type Severity = 'ALTA' | 'MEDIA' | 'BAJA';
export type RiskStatus = 'AUTOMATION_CREATED' | 'AUTOMATION_NOT_CREATED' | 'ALTERNATIVE_STUDY';
export type Outcome = 'AVOIDED' | 'REDUCED' | 'NO_EFFECT';

export interface Scope {
    company?: string;
    province?: string;
    center?: string;
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

export interface Workflow {
    id: string;
    riskId: string;
    createdAt: string;
    createdBy: string;
    config: {
        condition: string; // e.g. "Riesgo > 60%"
        scope: Scope;
    };
    tasks: {
        id: string;
        title: string;
        description: string;
        owner: string;
        deadline: string; // e.g. "24h", "3 días"
        priority: 'ALTA' | 'MEDIA' | 'BAJA';
        status: 'PENDIENTE' | 'COMPLETADA';
    }[];
    runsCount: number;
    successRate: number; // percentage
    savedEur: number;
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
