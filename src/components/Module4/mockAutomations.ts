import { Risk, Workflow, AutomationRun, MirrorCenterSuggestion, MirrorFinding, Severity } from './automationTypes';

// --- HELPER TO GENERATE MORE MOCKS ---
const generateMoreAutomations = (): Workflow[] => {
    const workflows: Workflow[] = [];
    const severities: Severity[] = ['ALTA', 'MEDIA', 'BAJA'];

    for (let i = 5; i <= 20; i++) {
        const severity = severities[i % 3];
        const riskDate = new Date();
        riskDate.setDate(riskDate.getDate() + (i % 10) - 2); // Some past, some future

        workflows.push({
            id: `auto_${i}`,
            name: `Protocolo Dinámico ${i}`,
            riskId: `risk_${i}`,
            createdAt: `2025-${(i % 12) + 1}-10`,
            createdBy: 'System',
            severity: severity,
            riskDate: riskDate.toISOString(),
            config: {
                condition: `Condición ${i} (> ${50 + i}%)`,
                scope: {
                    center: i % 2 === 0 ? `Tienda ${i}` : undefined,
                    province: i % 2 !== 0 ? 'Madrid' : 'Barcelona',
                }
            },
            tasks: [
                {
                    id: `t_${i}_1`,
                    title: 'Revisión inicial',
                    description: 'Check básico',
                    owner: 'Manager',
                    deadline: '24h',
                    targetDate: new Date(riskDate.getTime() - 86400000).toISOString(),
                    priority: 'BAJA',
                    status: i % 2 === 0 ? 'COMPLETADA' : 'PENDIENTE'
                },
                {
                    id: `t_${i}_2`,
                    title: 'Acción correctiva',
                    description: 'Llamada o reunión',
                    owner: 'HRBP',
                    deadline: '48h',
                    targetDate: new Date(riskDate.getTime()).toISOString(),
                    priority: 'MEDIA',
                    status: i % 4 === 0 ? 'COMPLETADA' : 'PENDIENTE'
                }
            ],
            runsCount: Math.floor(Math.random() * 50),
            successRate: Math.floor(Math.random() * 100),
            theoreticalSavings: Math.floor(Math.random() * 20000),
            realSavings: Math.floor(Math.random() * 15000),
            savedEur: Math.floor(Math.random() * 15000),
            activeStatus: i % 3 === 0 ? 'ACTIVE' : 'IDLE',
        });
    }
    return workflows;
};

export const MOCK_RISKS: Risk[] = [];

export const MOCK_AUTOMATIONS: Workflow[] = [
    {
        id: 'auto_1',
        name: 'Protocolo de Contención Madrid',
        riskId: 'risk_1',
        createdAt: '2025-10-01',
        createdBy: 'Admin',
        severity: 'ALTA',
        riskDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        config: {
            condition: 'Alta Probabilidad (> 60%)',
            scope: { province: 'Madrid' }
        },
        activeStatus: 'ACTIVE',
        tasks: [
            { id: 's1', title: 'Notificación de alerta', description: 'Notificar a Managers de Madrid', owner: 'HR BP', deadline: 'Inmediato', targetDate: new Date(Date.now() + 86400000).toISOString(), priority: 'ALTA', status: 'COMPLETADA' },
            { id: 's2', title: 'Plan de choque', description: 'Activar bolsa de horas preventiva', owner: 'Area Manager', deadline: '24h', targetDate: new Date(Date.now() + 86400000 * 2).toISOString(), priority: 'ALTA', status: 'COMPLETADA' }
        ],
        runsCount: 14,
        successRate: 78,
        theoreticalSavings: 50000,
        realSavings: 45000,
        savedEur: 45000
    },
    {
        id: 'auto_complex',
        name: 'Gestión Integral Psicosocial',
        riskId: 'risk_complex',
        createdAt: '2026-01-20',
        createdBy: 'Director RRHH',
        severity: 'ALTA',
        riskDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        config: {
            condition: 'Riesgo Psicosocial Crítico',
            scope: { company: 'Global' }
        },
        activeStatus: 'ACTIVE',
        tasks: [
            { id: 'c1', title: 'Detección', description: 'Alerta temprana IA', owner: 'System', deadline: 'Inmediato', targetDate: new Date(Date.now() - 86400000 * 4).toISOString(), priority: 'ALTA', status: 'COMPLETADA' },
            { id: 'c2', title: 'Validación Médica', description: 'Revisión servicio médico', owner: 'Dr. Salud', deadline: '24h', targetDate: new Date(Date.now() - 86400000 * 3).toISOString(), priority: 'ALTA', status: 'COMPLETADA' },
            { id: 'c3', title: 'Entrevista', description: 'Reunión con empleado', owner: 'HRBP', deadline: '48h', targetDate: new Date(Date.now() + 86400000).toISOString(), priority: 'MEDIA', status: 'ENTRÁMITE' },
            { id: 'c4', title: 'Plan Adaptación', description: 'Propuesta de cambio turno', owner: 'Manager', deadline: '72h', targetDate: new Date(Date.now() + 86400000 * 3).toISOString(), priority: 'MEDIA', status: 'PENDIENTE' },
            { id: 'c5', title: 'Seguimiento', description: 'Check a los 15 días', owner: 'Prevención', deadline: '15d', targetDate: new Date(Date.now() + 86400000 * 15).toISOString(), priority: 'BAJA', status: 'PENDIENTE' },
            { id: 'c6', title: 'Cierre', description: 'Evaluación final', owner: 'Director HR', deadline: '30d', targetDate: new Date(Date.now() + 86400000 * 30).toISOString(), priority: 'BAJA', status: 'PENDIENTE' }
        ],
        runsCount: 8,
        successRate: 100,
        theoreticalSavings: 35000,
        realSavings: 32000,
        savedEur: 32000
    },
    {
        id: 'auto_2',
        name: 'Mitigación Gran Vía',
        riskId: 'risk_3',
        createdAt: '2026-01-05',
        createdBy: 'RRHH',
        severity: 'MEDIA',
        riskDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        config: {
            condition: 'Riesgo Crítico (> 80%)',
            scope: { center: 'Tienda Gran Vía' }
        },
        activeStatus: 'IDLE',
        tasks: [
            { id: 's3', title: 'Revisión técnica', description: 'Revisión de pipeline de contratación', owner: 'Talent', deadline: '48h', targetDate: new Date(Date.now() - 86400000 * 6).toISOString(), priority: 'MEDIA', status: 'COMPLETADA' },
            { id: 's4', title: 'Medida Operativa', description: 'Bloqueo de vacaciones en periodo crítico', owner: 'Store Manager', deadline: 'Inmediato', targetDate: new Date(Date.now() - 86400000 * 5).toISOString(), priority: 'ALTA', status: 'COMPLETADA' }
        ],
        runsCount: 3,
        successRate: 100,
        theoreticalSavings: 15000,
        realSavings: 12000,
        savedEur: 12000
    },
    {
        id: 'auto_3',
        name: 'Protocolo Carnavales Cádiz',
        riskId: 'risk_5',
        patternId: 'pat_carnavales',
        createdAt: '2026-01-15',
        createdBy: 'System',
        severity: 'BAJA',
        riskDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        config: {
            condition: 'Patrón IA Detectado',
            scope: { province: 'Cádiz' }
        },
        activeStatus: 'ACTIVE',
        tasks: [
            { id: 's5', title: 'Aviso carnavales', description: 'Refuerzo zona centro', owner: 'District Manager', deadline: '1 semana', targetDate: new Date(Date.now() + 86400000 * 5).toISOString(), priority: 'BAJA', status: 'PENDIENTE' }
        ],
        runsCount: 1,
        successRate: 0,
        theoreticalSavings: 5000,
        realSavings: 0,
        savedEur: 0
    },
    ...generateMoreAutomations()
];

export const MOCK_RUNS: AutomationRun[] = [];
export const MOCK_MIRROR_SUGGESTION: any = {};
export const MOCK_MIRROR_FINDINGS: any[] = [];
