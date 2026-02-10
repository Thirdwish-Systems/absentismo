import { Factory, AlertTriangle, Users, Calendar, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export interface ReturnCase {
    id: string;
    employeeName: string;
    employeeId: string;
    role: string;
    unit: string;
    returnDate: string; // YYYY-MM-DD
    probability: number; // 0-1
    riskScore: number; // 0-100 (Riesgo Recaída)
    status: "identified" | "preparing" | "day0" | "tracking" | "closed";
    aptitude: "Apto" | "Apto con limitaciones" | "No apto";
    limitations?: string[];
    costAtRisk: number;
    isCritical?: boolean; // Puesto crítico
}

export const MOCK_CASES: ReturnCase[] = [
    {
        id: "C-001",
        employeeName: "Juan Pérez",
        employeeId: "E-1042",
        role: "Operario Logística",
        unit: "Centro BCN-Zal",
        returnDate: "2026-02-05",
        probability: 0.92,
        riskScore: 85, // Alto riesgo de recaída
        status: "identified",
        aptitude: "Apto con limitaciones",
        limitations: ["Sin cargas > 10kg", "Evitar turno noche"],
        costAtRisk: 12500,
        isCritical: true
    },
    {
        id: "C-002",
        employeeName: "Ana López",
        employeeId: "E-2201",
        role: "Cajera",
        unit: "Tienda Madrid-Sol",
        returnDate: "2026-02-12",
        probability: 0.65,
        riskScore: 45,
        status: "preparing",
        aptitude: "Apto",
        costAtRisk: 4200,
        isCritical: false
    },
    {
        id: "C-003",
        employeeName: "Carlos Ruiz",
        employeeId: "E-1155",
        role: "Mantenimiento",
        unit: "Planta Sevilla",
        returnDate: "2026-02-02", // Hoy
        probability: 1.0,
        riskScore: 60,
        status: "day0",
        aptitude: "Apto con limitaciones",
        limitations: ["Pausas cada 2h", "No trabajos en altura"],
        costAtRisk: 8900,
        isCritical: true
    },
    {
        id: "C-004",
        employeeName: "Laura García",
        employeeId: "E-3302",
        role: "Supervisor",
        unit: "Centro BCN-Zal",
        returnDate: "2026-01-20",
        probability: 1.0,
        riskScore: 20,
        status: "tracking",
        aptitude: "Apto",
        costAtRisk: 2100,
        isCritical: true
    },
    {
        id: "C-005",
        employeeName: "Pedro Martín",
        employeeId: "E-4102",
        role: "Reponedor",
        unit: "Tienda Valencia-Centro",
        returnDate: "2026-02-08",
        probability: 0.8,
        riskScore: 30,
        status: "identified",
        aptitude: "Apto",
        costAtRisk: 3000,
        isCritical: false
    }
];

export const KPIS = {
    imminentReturns: 7,
    planCoverage: 0.85, // 85% tienen plan
    relapseRate: 0.12, // 12% recaídas
    costAtRisk: 45600,
    costAvoided: 18200
};
