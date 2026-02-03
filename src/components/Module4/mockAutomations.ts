import { Risk, Workflow, AutomationRun, MirrorCenterSuggestion, MirrorFinding } from './automationTypes';

export const MOCK_RISKS: Risk[] = [
    // HISTORICO
    {
        id: 'risk_1',
        name: 'Brote estacional Gastro',
        source: 'HISTORICO',
        scope: { province: 'Madrid', role: 'Vendedor' },
        severity: 'ALTA',
        impactEur: 12500,
        lastSeen: '2025-11-15',
        recurrenceScore: 85,
        status: 'AUTOMATION_CREATED',
        automationId: 'auto_1'
    },
    {
        id: 'risk_2',
        name: 'Sobre-esfuerzo post-navidad',
        source: 'HISTORICO',
        scope: { center: 'Almacén Logístico', shift: 'Noche' },
        severity: 'MEDIA',
        impactEur: 8400,
        lastSeen: '2026-01-10',
        recurrenceScore: 60,
        status: 'ALTERNATIVE_STUDY',
        alternativeSolutionCount: 1
    },
    {
        id: 'risk_11',
        name: 'Fatiga Pico Rebajas',
        source: 'HISTORICO',
        scope: { province: 'Barcelona' },
        severity: 'MEDIA',
        impactEur: 6200,
        status: 'AUTOMATION_NOT_CREATED'
    },
    // HRIS
    {
        id: 'risk_3',
        name: 'Fin de contrato masivo',
        source: 'HRIS',
        scope: { center: 'Tienda Gran Vía', role: 'Caja' },
        probability: 95,
        window: '1-2 semanas',
        severity: 'ALTA',
        impactEur: 15000,
        status: 'AUTOMATION_CREATED',
        automationId: 'auto_2'
    },
    {
        id: 'risk_4',
        name: 'Acumulación de horas extra',
        source: 'HRIS',
        scope: { center: 'Tienda Diagonal' },
        probability: 45,
        window: '2-4 semanas',
        severity: 'MEDIA',
        impactEur: 4200,
        status: 'AUTOMATION_NOT_CREATED'
    },
    {
        id: 'risk_12',
        name: 'Vencimiento habilitaciones',
        source: 'HRIS',
        scope: { company: 'Retail Co' },
        probability: 30,
        window: '4-8 semanas',
        severity: 'BAJA',
        status: 'AUTOMATION_NOT_CREATED'
    },
    // PATRONES IA
    {
        id: 'risk_5',
        name: 'Febrero Cádiz / Carnavales',
        source: 'PATRONES_IA',
        scope: { province: 'Cádiz', role: 'Vendedor' },
        probability: 88,
        window: '2-4 semanas',
        severity: 'ALTA',
        impactEur: 18000,
        recurrenceScore: 92,
        status: 'AUTOMATION_CREATED',
        automationId: 'auto_3'
    },
    {
        id: 'risk_6',
        name: 'Patrón Noche / Lunes',
        source: 'PATRONES_IA',
        scope: { center: 'Almacén 2', shift: 'Noche' },
        probability: 65,
        window: 'Recurrente',
        severity: 'MEDIA',
        impactEur: 5500,
        status: 'AUTOMATION_NOT_CREATED'
    },
    {
        id: 'risk_13',
        name: 'Sensibilidad térmica (Ola calor)',
        source: 'PATRONES_IA',
        scope: { company: 'Retail Co' },
        probability: 40,
        severity: 'MEDIA',
        status: 'ALTERNATIVE_STUDY',
        alternativeSolutionCount: 1
    },
    // CENTROS ESPEJO
    {
        id: 'risk_7',
        name: 'Diferencial Absentismo (Anomalía)',
        source: 'CENTROS_ESPEJO',
        scope: { center: 'Tienda Serrano' },
        probability: 72,
        window: 'Continuo',
        severity: 'ALTA',
        impactEur: 9200,
        status: 'AUTOMATION_CREATED',
        automationId: 'auto_4'
    },
    {
        id: 'risk_8',
        name: 'No-show superior a espejos',
        source: 'CENTROS_ESPEJO',
        scope: { center: 'Tienda Fuencarral' },
        probability: 55,
        severity: 'MEDIA',
        impactEur: 3100,
        status: 'AUTOMATION_NOT_CREATED'
    },
    {
        id: 'risk_14',
        name: 'Baja rotación vs espejos',
        source: 'CENTROS_ESPEJO',
        scope: { center: 'Tienda Mallorca' },
        probability: 20,
        severity: 'BAJA',
        status: 'AUTOMATION_NOT_CREATED'
    }
];

export const MOCK_AUTOMATIONS: Workflow[] = [
    {
        id: 'auto_1',
        riskId: 'risk_1',
        createdAt: '2025-10-01',
        createdBy: 'Admin',
        config: {
            condition: 'Alta Probabilidad (> 60%)',
            scope: { province: 'Madrid' }
        },
        tasks: [
            { id: 's1', title: 'Notificación de alerta', description: 'Notificar a Managers de Madrid', owner: 'HR BP', deadline: 'Inmediato', priority: 'ALTA', status: 'COMPLETADA' },
            { id: 's2', title: 'Plan de choque', description: 'Activar bolsa de horas preventiva', owner: 'Area Manager', deadline: '24h', priority: 'ALTA', status: 'COMPLETADA' }
        ],
        runsCount: 14,
        successRate: 78,
        savedEur: 45000
    },
    {
        id: 'auto_2',
        riskId: 'risk_3',
        createdAt: '2026-01-05',
        createdBy: 'RRHH',
        config: {
            condition: 'Riesgo Crítico (> 80%)',
            scope: { center: 'Tienda Gran Vía' }
        },
        tasks: [
            { id: 's3', title: 'Revisión técnica', description: 'Revisión de pipeline de contratación', owner: 'Talent', deadline: '48h', priority: 'MEDIA', status: 'COMPLETADA' },
            { id: 's4', title: 'Medida Operativa', description: 'Bloqueo de vacaciones en periodo crítico', owner: 'Store Manager', deadline: 'Inmediato', priority: 'ALTA', status: 'COMPLETADA' }
        ],
        runsCount: 3,
        successRate: 100,
        savedEur: 12000
    },
    {
        id: 'auto_3',
        riskId: 'risk_5',
        createdAt: '2026-01-15',
        createdBy: 'System',
        config: {
            condition: 'Patrón IA Detectado',
            scope: { province: 'Cádiz' }
        },
        tasks: [
            { id: 's5', title: 'Aviso carnavales', description: 'Refuerzo zona centro', owner: 'District Manager', deadline: '1 semana', priority: 'BAJA', status: 'PENDIENTE' }
        ],
        runsCount: 1,
        successRate: 0,
        savedEur: 0
    },
    {
        id: 'auto_4',
        riskId: 'risk_7',
        createdAt: '2025-12-10',
        createdBy: 'Data Team',
        config: {
            condition: 'Desviación vs Espejos',
            scope: { center: 'Tienda Serrano' }
        },
        tasks: [
            { id: 's6', title: 'Análisis de clima', description: 'Plan de choque de clima laboral', owner: 'HR BP', deadline: '2 semanas', priority: 'MEDIA', status: 'PENDIENTE' }
        ],
        runsCount: 5,
        successRate: 40,
        savedEur: 8500
    }
];

export const MOCK_RUNS: AutomationRun[] = [
    {
        id: 'run_1',
        automationId: 'auto_1',
        date: '2025-11-20',
        scopeSnapshot: { province: 'Madrid' },
        probAtTrigger: 85,
        actionsExecuted: ['Notificar a Managers', 'Activar bolsa de horas'],
        outcome: 'AVOIDED',
        savedEurEstimated: 4200
    },
    {
        id: 'run_2',
        automationId: 'auto_1',
        date: '2025-12-02',
        scopeSnapshot: { province: 'Madrid' },
        probAtTrigger: 72,
        actionsExecuted: ['Notificar a Managers', 'Activar bolsa de horas'],
        outcome: 'REDUCED',
        savedEurEstimated: 1500
    }
];

export const MOCK_MIRROR_SUGGESTION: MirrorCenterSuggestion = {
    baseCenter: 'Madrid - Serrano',
    suggestedCenters: [
        { id: 'mad_l', name: 'Madrid - Calle Lista', similarity: 98 },
        { id: 'bcn_d', name: 'Barcelona - Diagonal', similarity: 94 },
        { id: 'vlc_b', name: 'Valencia - Bonaire', similarity: 82 },
        { id: 'sev_n', name: 'Sevilla - Nervión', similarity: 75 }
    ],
    similarityExplanation: 'Análisis basado en Tier A+, headcount (>50 pers) y composición de roles 80/20.'
};

export const MOCK_MIRROR_FINDINGS: MirrorFinding[] = [
    {
        id: 'find_1',
        baseCenter: 'Madrid - Serrano',
        mirrorGroup: ['Madrid - Calle Lista', 'Barcelona - Diagonal'],
        findingType: 'Diferencial de absentismo anómalo',
        deltaMetrics: '+4.2% vs media espejos',
        suspectedOperationalDrivers: ['Acumulación de horas extra en fines de semana', 'Menor rotación de descansos'],
        recommendedAutomationTemplate: 'Plan de choque climatización / descansos'
    },
    {
        id: 'find_2',
        baseCenter: 'Barcelona - Diagonal',
        mirrorGroup: ['Barcelona - Rambla'],
        findingType: 'Patrón de no-show superior',
        deltaMetrics: 'Frecuencia x2.5 vs espejos',
        suspectedOperationalDrivers: ['Concentración en turno tarde-noche', 'Distancia media domicilio > 45min'],
        recommendedAutomationTemplate: 'Aviso preventivo No-show'
    },
    {
        id: 'find_3',
        baseCenter: 'Sevilla - Nervión',
        mirrorGroup: ['Cádiz - El Puerto'],
        findingType: 'Desviación en rotación voluntaria',
        deltaMetrics: '+1.8% vs red afín',
        suspectedOperationalDrivers: ['Fricción en mando intermedio', 'Sobrecarga por vacantes no cubiertas'],
        recommendedAutomationTemplate: 'Plan de fidelización / Entrevistas de salida'
    }
];
