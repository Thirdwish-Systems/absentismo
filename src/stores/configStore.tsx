import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FacilityType =
    | 'store'
    | 'warehouse'
    | 'hq'
    | 'darkstore'
    | 'workshop'
    | 'callcenter'
    | 'itinerant'
    | 'partner'
    // Industrial types
    | 'factory'
    | 'shop_floor'
    | 'industrial_warehouse'
    | 'logistics_center'
    | 'technical_office'
    | 'lab'
    | 'maintenance'
    | 'utilities'
    | 'project'
    | 'subcontractor';

export type StorePriority = 'high' | 'medium' | 'low';
export type OperationType = 'propio' | 'franquicia' | 'partner';

export interface Area {
    id: string;
    name: string;
}

export interface OrgNode {
    id: string;
    name: string;
    children?: OrgNode[];
}

export interface StoreOrg {
    manager?: string;
    workers?: string[];
}

export interface Store {
    id: string;
    code?: string; // ID único para imports
    name: string;
    employees: number;
    type: FacilityType;
    operation?: OperationType;
    active: boolean;
    city?: string;
    address?: string;
    areas: Area[];
    priority?: StorePriority;
    risks?: RiskThresholds;
    orgData?: OrgNode[] | StoreOrg;
    commercialBreakdownThreshold?: number; // % umbral para rotura comercial
}

export interface Province {
    id: string;
    code?: string; // MAD, BCN...
    name: string;
    stores: Store[];
}

export interface CompanyConfig {
    name: string;
    sector: string;
    cnae: string;
    employees: number;
    salaryAvg: number;
    ssContribution: number; // % SS empresa
}

export interface AbsenceConfig {
    AT: number;          // % Accidentes trabajo
    IT_CORTA: number;    // % IT < 15 días
    IT_MEDIA: number;    // % IT 15-60 días
    IT_LARGA: number;    // % IT > 60 días
}

export interface SubstitutionConfig {
    costDirect: number;      // € por hora extra/temporal
    costFormacion: number;   // € onboarding sustituto
    costQuality: number;     // % pérdida productividad
}

export interface BenchmarkConfig {
    sectorRate: number;  // % tasa media del sector
}

export interface RiskThresholds {
    warning: number;          // % Probabilidad para aviso (ej: 70%)
    critical: number;         // % Probabilidad para crítico (ej: 85%)
    campaignWarning: number;  // % Umbral reducido en campaña (ej: 50%)
    campaignCritical: number; // % Umbral crítico en campaña (ej: 70%)
}

export interface Campaign {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    type: 'peak' | 'sales' | 'event' | 'holiday';
}

export interface DisplayConfig {
    currency: 'EUR' | 'USD';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
}

// ─────────────────────────────────────────────────────────────────────────────
// Payroll Inputs (Blocks 1-11)
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplementoTramo {
    fromDay: number;
    toDay: number | null; // null = "adelante"
    percentage: number;
}

export interface PayrollInputs {
    governance: {
        definitions: string[];
        absenceTypes: string[];
        imputationRule: 'hours' | 'days';
        unit: 'company' | 'center' | 'shift' | 'role';
        timezone: string;
        currency: string;
        rounding: string;
        cutOffDate: number;
    };
    legal: {
        cccByCenter: Record<string, string>;
        mutuaByCenter: Record<string, string>;
    };
    agreements: {
        complementosCC: ComplementoTramo[];
        complementosCP: ComplementoTramo[];
        complementableConcepts: string[];
        variableAverageMonths: number;
    };
    workTime: {
        annualTeoricalHours: number;
        missingClockInRule: 'teorical' | 'manual' | 'zero';
    };
    mapping: {
        systemToStandard: Record<string, string>;
    };
    substitution: {
        policy: 'overtime' | 'ett' | 'none';
        ettRate: number;
        overtimeRate: number;
        onboardingCost: number;
    };
    opportunity: {
        kpiName: string;
        kpiValuePerHour: number;
        operationalMargin: number;
    };
    customFields: Record<string, string>; // Persistencia para campos manuales
    completeness: Record<string, number>; // % completeness per block
}

export interface GlobalConfig {
    company: CompanyConfig;
    structure: Province[];
    absence: AbsenceConfig;
    substitution: SubstitutionConfig;
    benchmark: BenchmarkConfig;
    risks: RiskThresholds;
    campaigns: Campaign[];
    display: DisplayConfig;
    criticalPositions: string[];
    criticalWorkers: string[];
    payrollInputs: PayrollInputs;
    isConfigured: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────────────────────────────────────

const SECTOR_DEFAULTS: Record<string, { rate: number; ss: number }> = {
    'industrial': { rate: 5.8, ss: 34 },
    'retail': { rate: 6.5, ss: 32 },
    'restauracion': { rate: 7.8, ss: 32 },
    'hotelero': { rate: 6.9, ss: 35 },
    'callcenter': { rate: 8.5, ss: 30 },
    'consultoria': { rate: 4.2, ss: 33 },
    'logistico': { rate: 6.2, ss: 32 },
    'hospitales': { rate: 8.2, ss: 34 },
    'construccion': { rate: 7.5, ss: 35 },
    'agroalimentaria': { rate: 6.8, ss: 33 },
    'other': { rate: 5.5, ss: 32 },
};

export const DEFAULT_CONFIG: GlobalConfig = {
    company: {
        name: 'Mi Empresa',
        sector: 'retail',
        cnae: '4711',
        employees: 500,
        salaryAvg: 28000,
        ssContribution: 32,
    },
    structure: [
        {
            id: 'reg_1',
            code: 'MAD',
            name: 'Madrid',
            stores: [
                {
                    id: 'st_1_1',
                    code: 'HQ-MAD',
                    name: 'Oficinas Centrales',
                    employees: 45,
                    type: 'hq',
                    active: true,
                    areas: [{ id: 'a1', name: 'General' }, { id: 'a2', name: 'Gerencia' }]
                },
                {
                    id: 'st_1_2',
                    code: 'STORE-001',
                    name: 'Tienda Gran Vía',
                    employees: 28,
                    type: 'store',
                    priority: 'high',
                    active: true,
                    areas: [{ id: 'a3', name: 'General' }, { id: 'a4', name: 'Caja' }, { id: 'a5', name: 'Sala' }]
                },
                {
                    id: 'st_1_3',
                    code: 'LOG-MAD',
                    name: 'Almacén Logístico',
                    employees: 60,
                    type: 'warehouse',
                    active: true,
                    areas: [{ id: 'a6', name: 'General' }, { id: 'a7', name: 'Muelles' }]
                },
            ],
        },
        {
            id: 'reg_2',
            code: 'BCN',
            name: 'Barcelona',
            stores: [
                {
                    id: 'st_2_1',
                    code: 'STORE-BCN-01',
                    name: 'Tienda Diagonal',
                    employees: 35,
                    type: 'store',
                    priority: 'high',
                    active: true,
                    areas: [{ id: 'a8', name: 'General' }]
                },
            ],
        },
    ],
    absence: {
        AT: 0.8,
        IT_CORTA: 2.5,
        IT_MEDIA: 1.8,
        IT_LARGA: 1.4,
    },
    substitution: {
        costDirect: 18,
        costFormacion: 450,
        costQuality: 15,
    },
    benchmark: {
        sectorRate: 6.5,
    },
    risks: {
        warning: 4.0,
        critical: 8.0,
        campaignWarning: 3.5,
        campaignCritical: 7.0,
    },
    campaigns: [
        { id: 'camp_1', name: 'Rebajas Invierno', startDate: '2026-01-07', endDate: '2026-02-28', type: 'sales' },
        { id: 'camp_2', name: 'Black Friday', startDate: '2026-11-20', endDate: '2026-11-30', type: 'peak' },
    ],
    display: {
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
    },
    criticalPositions: ['Encargado', 'Segundo Encargado', 'Mozo especializado'],
    criticalWorkers: ['Juan Pérez', 'María García'],
    payrollInputs: {
        governance: {
            definitions: ['IT', 'Permisos', 'Injustificadas'],
            absenceTypes: ['IT_CC', 'IT_AT', 'IT_EP', 'Permiso_R', 'Injustificada'],
            imputationRule: 'hours',
            unit: 'center',
            timezone: 'Europe/Madrid',
            currency: 'EUR',
            rounding: '2_decimals',
            cutOffDate: 25,
        },
        legal: {
            cccByCenter: {},
            mutuaByCenter: {},
        },
        agreements: {
            complementosCC: [
                { fromDay: 1, toDay: 3, percentage: 0 },
                { fromDay: 4, toDay: 20, percentage: 75 },
                { fromDay: 21, toDay: null, percentage: 100 },
            ],
            complementosCP: [
                { fromDay: 1, toDay: null, percentage: 100 },
            ],
            complementableConcepts: ['Salario Base', 'Antigüedad', 'Prorrata Pagas'],
            variableAverageMonths: 12,
        },
        workTime: {
            annualTeoricalHours: 1760,
            missingClockInRule: 'teorical',
        },
        mapping: {
            systemToStandard: {},
        },
        substitution: {
            policy: 'ett',
            ettRate: 18.5,
            overtimeRate: 22,
            onboardingCost: 450,
        },
        opportunity: {
            kpiName: 'Ventas',
            kpiValuePerHour: 120,
            operationalMargin: 25,
        },
        customFields: {
            // Marco del Cálculo
            'framework.period': 'Últimos 12 meses móviles',
            'framework.unit': 'Centro de Trabajo / Tienda',
            'framework.agreements': 'Convenio Comercio 2024',
            // Datos de Plantilla
            'headcount.annualHours': '1.765 h/año (Promedio)',
            // Datos de Ausencias
            'absences.gravity': 'Media-Baja (Predeterminado)',
            'absences.incidents': 'Ajuste de Desviación: 3,5%',
            // Cobertura
            'coverage.ett_ratio': '12% del volumen total',
            'coverage.ett_lead_time': '24-48 horas hábiles',
            // Oportunidad
            'opportunity.margin': '28% de margen bruto operativo',
            'opportunity.kpi': 'Ventas por hora (Venta Asistida)',
            // PRL / Mutua
            'prl.bonus': '€12,50 por episodio gestionado',
            'prl.malus': 'Penalización del 5% en cuotas AT/EP',
            'prl.investigation': '72 horas máximo tras el accidente',
            // Costes Adicioneles
            'additional.admin': 'Avg €540 / mes',
            'additional.outsourcing': 'Incluido en fee',
            'additional.recruiting': 'Estimado: 25% Salario',
            // Predicción
            'prediction.sensitivity': 'Media-Alta',
            'prediction.horizon': 'Horizonte 30 días',
        },
        completeness: {
            governance: 100,
            legal: 0,
            agreements: 80,
            workTime: 50,
            mapping: 0,
            substitution: 100,
            opportunity: 0,
        }
    },
    isConfigured: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'absentismo_global_config';

function loadConfig(): GlobalConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Deep merge para asegurar que todos los sub-objetos tengan sus campos obligatorios
            return {
                ...DEFAULT_CONFIG,
                ...parsed,
                company: { ...DEFAULT_CONFIG.company, ...(parsed.company || {}) },
                absence: { ...DEFAULT_CONFIG.absence, ...(parsed.absence || {}) },
                substitution: { ...DEFAULT_CONFIG.substitution, ...(parsed.substitution || {}) },
                benchmark: { ...DEFAULT_CONFIG.benchmark, ...(parsed.benchmark || {}) },
                risks: { ...DEFAULT_CONFIG.risks, ...(parsed.risks || {}) },
                payrollInputs: {
                    ...DEFAULT_CONFIG.payrollInputs,
                    ...(parsed.payrollInputs || {}),
                    customFields: {
                        ...DEFAULT_CONFIG.payrollInputs.customFields,
                        ...(parsed.payrollInputs?.customFields || {})
                    },
                    completeness: {
                        ...DEFAULT_CONFIG.payrollInputs.completeness,
                        ...(parsed.payrollInputs?.completeness || {})
                    }
                }
            };
        }
    } catch (e) {
        console.warn('Failed to load config:', e);
    }
    return DEFAULT_CONFIG;
}

function saveConfig(config: GlobalConfig): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save config:', e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface ConfigContextType {
    config: GlobalConfig;
    updateConfig: (updates: Partial<GlobalConfig>) => void;
    updateCompany: (updates: Partial<CompanyConfig>) => void;
    updateAbsence: (updates: Partial<AbsenceConfig>) => void;
    updateSubstitution: (updates: Partial<SubstitutionConfig>) => void;
    updateBenchmark: (updates: Partial<BenchmarkConfig>) => void;
    setStructure: (provinces: Province[]) => void;
    addProvince: (name: string) => void;
    removeProvince: (id: string) => void;
    addStore: (provinceId: string, store: Omit<Store, 'id'>) => void;
    removeStore: (provinceId: string, storeId: string) => void;
    resetToDefaults: () => void;
    applySectorDefaults: (sector: string) => void;
    markConfigured: () => void;
    getSectorDefaults: (sector: string) => { rate: number; ss: number };
    updateRisks: (updates: Partial<RiskThresholds>) => void;
    addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
    removeCampaign: (id: string) => void;
    updateStoreRisks: (provinceId: string, storeId: string, risks: RiskThresholds) => void;
    updateStoreOrg: (provinceId: string, storeId: string, orgData: OrgNode[] | StoreOrg) => void;
    updateStoreThreshold: (provinceId: string, storeId: string, threshold: number) => void;
    updateStore: (provinceId: string, storeId: string, updates: Partial<Store>) => void;
    batchAddStores: (provinceId: string, stores: Omit<Store, 'id'>[]) => void;
    loadIndustrialDemo: () => void;
    updateCriticals: (updates: { positions?: string[], workers?: string[] }) => void;
    updatePayrollInputs: (updates: Partial<PayrollInputs>) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<GlobalConfig>(() => loadConfig());

    // Persist on every change
    useEffect(() => {
        saveConfig(config);
    }, [config]);

    const updateConfig = useCallback((updates: Partial<GlobalConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    const updateCompany = useCallback((updates: Partial<CompanyConfig>) => {
        setConfig(prev => ({ ...prev, company: { ...prev.company, ...updates } }));
    }, []);

    const updateAbsence = useCallback((updates: Partial<AbsenceConfig>) => {
        setConfig(prev => ({ ...prev, absence: { ...prev.absence, ...updates } }));
    }, []);

    const updateSubstitution = useCallback((updates: Partial<SubstitutionConfig>) => {
        setConfig(prev => ({ ...prev, substitution: { ...prev.substitution, ...updates } }));
    }, []);

    const updateBenchmark = useCallback((updates: Partial<BenchmarkConfig>) => {
        setConfig(prev => ({ ...prev, benchmark: { ...prev.benchmark, ...updates } }));
    }, []);

    const setStructure = useCallback((provinces: Province[]) => {
        setConfig(prev => ({ ...prev, structure: provinces }));
    }, []);

    const addProvince = useCallback((name: string, code?: string) => {
        const newProvince: Province = {
            id: `prov_${Date.now()}`,
            code: code || name.slice(0, 3).toUpperCase(),
            name,
            stores: [],
        };
        setConfig(prev => ({ ...prev, structure: [...prev.structure, newProvince] }));
    }, []);

    const removeProvince = useCallback((id: string) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.filter(p => p.id !== id),
        }));
    }, []);

    const addStore = useCallback((provinceId: string, store: Omit<Store, 'id'>) => {
        const newStore: Store = {
            ...store,
            id: `st_${Date.now()}`,
            active: store.active ?? true,
            areas: store.areas?.length ? store.areas : [{ id: `area_${Date.now()}`, name: 'General' }]
        };
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId ? { ...p, stores: [...p.stores, newStore] } : p
            ),
        }));
    }, []);

    const removeStore = useCallback((provinceId: string, storeId: string) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId
                    ? { ...p, stores: p.stores.filter(s => s.id !== storeId) }
                    : p
            ),
        }));
    }, []);

    const resetToDefaults = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
    }, []);

    const getSectorDefaults = useCallback((sector: string) => {
        return SECTOR_DEFAULTS[sector] || SECTOR_DEFAULTS['other'];
    }, []);

    const applySectorDefaults = useCallback((sector: string) => {
        const defaults = getSectorDefaults(sector);
        setConfig(prev => ({
            ...prev,
            company: { ...prev.company, sector, ssContribution: defaults.ss },
            benchmark: { sectorRate: defaults.rate },
            // If switching specifically to industrial, clear structure to avoid retail leftovers
            structure: sector === 'industrial' ? [] : prev.structure
        }));
    }, [getSectorDefaults]);

    const markConfigured = useCallback(() => {
        setConfig(prev => ({ ...prev, isConfigured: true }));
    }, []);

    const updateRisks = useCallback((updates: Partial<RiskThresholds>) => {
        setConfig(prev => ({ ...prev, risks: { ...prev.risks, ...updates } }));
    }, []);

    const addCampaign = useCallback((campaign: Omit<Campaign, 'id'>) => {
        const newCampaign: Campaign = { ...campaign, id: `camp_${Date.now()}` };
        setConfig(prev => ({ ...prev, campaigns: [...prev.campaigns, newCampaign] }));
    }, []);

    const removeCampaign = useCallback((id: string) => {
        setConfig(prev => ({ ...prev, campaigns: prev.campaigns.filter(c => c.id !== id) }));
    }, []);

    const updateStoreRisks = useCallback((provinceId: string, storeId: string, risks: RiskThresholds) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId
                    ? {
                        ...p,
                        stores: p.stores.map(s =>
                            s.id === storeId ? { ...s, risks } : s
                        )
                    }
                    : p
            ),
        }));
    }, []);

    const updateStoreOrg = useCallback((provinceId: string, storeId: string, orgData: OrgNode[] | StoreOrg) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId
                    ? {
                        ...p,
                        stores: p.stores.map(s =>
                            s.id === storeId ? { ...s, orgData } : s
                        )
                    }
                    : p
            ),
        }));
    }, []);

    const updateStoreThreshold = useCallback((provinceId: string, storeId: string, threshold: number) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId
                    ? {
                        ...p,
                        stores: p.stores.map(s =>
                            s.id === storeId ? { ...s, commercialBreakdownThreshold: threshold } : s
                        )
                    }
                    : p
            ),
        }));
    }, []);

    const updateStore = useCallback((provinceId: string, storeId: string, updates: Partial<Store>) => {
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId
                    ? {
                        ...p,
                        stores: p.stores.map(s =>
                            s.id === storeId ? { ...s, ...updates } : s
                        )
                    }
                    : p
            ),
        }));
    }, []);

    const batchAddStores = useCallback((provinceId: string, newStores: Omit<Store, 'id'>[]) => {
        const formatted = newStores.map((s, i) => ({
            ...s,
            id: `st_${Date.now()}_${i}`,
            active: s.active ?? true,
            areas: s.areas?.length ? s.areas : [{ id: `area_${Date.now()}_${i}`, name: 'General' }]
        }));
        setConfig(prev => ({
            ...prev,
            structure: prev.structure.map(p =>
                p.id === provinceId ? { ...p, stores: [...p.stores, ...formatted] } : p
            ),
        }));
    }, []);

    const loadIndustrialDemo = useCallback(() => {
        const demoStructure: Province[] = [
            {
                id: 'prov_gipuzkoa',
                name: 'Gipuzkoa',
                stores: [
                    {
                        id: 'site_mondragon',
                        code: 'MON-PL-01',
                        name: 'Planta de Ensamblaje Mondragón',
                        type: 'factory',
                        employees: 450,
                        active: true,
                        areas: [
                            { id: 'a1', name: 'Mecanizado' },
                            { id: 'a2', name: 'Pintura' },
                            { id: 'a3', name: 'Logística' }
                        ]
                    },
                    {
                        id: 'site_donostia',
                        code: 'SS-LAB-05',
                        name: 'Centro I+D Donostia',
                        type: 'lab',
                        employees: 120,
                        active: true,
                        areas: [
                            { id: 'a4', name: 'Ensayos' },
                            { id: 'a5', name: 'Prototipado' },
                            { id: 'a6', name: 'Administración' }
                        ]
                    }
                ]
            },
            {
                id: 'prov_madrid',
                name: 'Madrid',
                stores: [
                    {
                        id: 'site_coslada',
                        code: 'MAD-T-02',
                        name: 'Nave de Mecanizado Coslada',
                        type: 'shop_floor',
                        employees: 85,
                        active: true,
                        areas: [
                            { id: 'a7', name: 'Corte' },
                            { id: 'a8', name: 'Fresado' },
                            { id: 'a9', name: 'Mantenimiento' }
                        ]
                    },
                    {
                        id: 'site_a2',
                        code: 'LOG-MAD-A2',
                        name: 'Logística Central A-2',
                        type: 'logistics_center',
                        employees: 210,
                        active: true,
                        areas: [
                            { id: 'a10', name: 'Expediciones' },
                            { id: 'a11', name: 'Muelles' },
                            { id: 'a12', name: 'Picking' }
                        ]
                    }
                ]
            },
            {
                id: 'prov_vizcaya',
                name: 'Vizcaya',
                stores: [
                    {
                        id: 'site_sestao',
                        code: 'SEZ-IND-01',
                        name: 'Fábrica Metalúrgica Sestao',
                        type: 'factory',
                        employees: 680,
                        active: true,
                        areas: [
                            { id: 'a13', name: 'Fundición' },
                            { id: 'a14', name: 'Laminado' },
                            { id: 'a15', name: 'HSE / PRL' }
                        ]
                    },
                    {
                        id: 'site_mant',
                        code: 'BIL-MANT-01',
                        name: 'Taller de Mantenimiento Crítico',
                        type: 'maintenance',
                        employees: 45,
                        active: true,
                        areas: [
                            { id: 'a16', name: 'Eléctrico' },
                            { id: 'a17', name: 'Mecánico' }
                        ]
                    }
                ]
            }
        ];

        setConfig(prev => ({
            ...prev,
            company: { ...prev.company, sector: 'industrial' },
            structure: demoStructure
        }));
    }, []);

    const updateCriticals = useCallback((updates: { positions?: string[], workers?: string[] }) => {
        setConfig(prev => ({
            ...prev,
            ...(updates.positions ? { criticalPositions: updates.positions } : {}),
            ...(updates.workers ? { criticalWorkers: updates.workers } : {}),
        }));
    }, []);

    const updatePayrollInputs = useCallback((updates: Partial<PayrollInputs>) => {
        setConfig(prev => ({
            ...prev,
            payrollInputs: { ...prev.payrollInputs, ...updates }
        }));
    }, []);

    return (
        <ConfigContext.Provider value={{
            config,
            updateConfig,
            updateCompany,
            updateAbsence,
            updateSubstitution,
            updateBenchmark,
            setStructure,
            addProvince,
            removeProvince,
            addStore,
            removeStore,
            resetToDefaults,
            applySectorDefaults,
            markConfigured,
            getSectorDefaults,
            updateRisks,
            addCampaign,
            removeCampaign,
            updateStoreRisks,
            updateStoreOrg,
            updateStoreThreshold,
            updateStore,
            batchAddStores,
            loadIndustrialDemo,
            updateCriticals,
            updatePayrollInputs,
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig(): ConfigContextType {
    const ctx = useContext(ConfigContext);
    if (!ctx) {
        throw new Error('useConfig must be used within ConfigProvider');
    }
    return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Computed Values (helpers)
// ─────────────────────────────────────────────────────────────────────────────

export function computeTotalAbsence(absence: AbsenceConfig): number {
    if (!absence) return 0;
    return (absence.AT || 0) + (absence.IT_CORTA || 0) + (absence.IT_MEDIA || 0) + (absence.IT_LARGA || 0);
}

export function computeAnnualCost(config: GlobalConfig): number {
    if (!config || !config.absence || !config.company || !config.substitution) return 0;

    const totalRate = computeTotalAbsence(config.absence) / 100;
    const avgDailyCost = (config.company.salaryAvg || 0) / 220; // ~220 días laborales
    const ssCost = avgDailyCost * ((config.company.ssContribution || 0) / 100);
    const substitutionCost = (config.substitution.costDirect || 0) * 8; // 8h día

    const costPerDay = avgDailyCost + ssCost + substitutionCost;
    const daysLostPerEmployee = 220 * totalRate;

    return (config.company.employees || 0) * daysLostPerEmployee * costPerDay;
}

export function computeGapVsSector(config: GlobalConfig): number {
    if (!config || !config.absence || !config.benchmark) return 0;
    const total = computeTotalAbsence(config.absence);
    return total - (config.benchmark.sectorRate || 0);
}

export const SECTORS = [
    { value: 'industrial', label: 'Industrial' },
    { value: 'retail', label: 'Retail / Comercio' },
    { value: 'restauracion', label: 'Restauración' },
    { value: 'hotelero', label: 'Hotelero' },
    { value: 'callcenter', label: 'Call centers' },
    { value: 'consultoria', label: 'Consultoría' },
    { value: 'logistico', label: 'Logístico' },
    { value: 'hospitales', label: 'Hospitales' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'agroalimentaria', label: 'Industria Agroalimentaria' },
];
