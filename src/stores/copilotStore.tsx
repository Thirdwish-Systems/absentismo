import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConfigSection =
    | 'impact-engines'
    | 'substitutions'
    | 'risk-settings'
    | 'mirror-centers'
    | 'available-data';

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
    metadata?: {
        detectedData?: any;
        appliedChanges?: string[];
        confidence?: number;
        fieldsFilled?: string[];
    };
}

export interface MissingField {
    id: string;
    section: ConfigSection;
    fieldName: string;
    displayName: string;
    type: 'text' | 'number' | 'percentage' | 'currency' | 'complex_rule';
    priority: 'critical' | 'high' | 'medium' | 'low';
    context?: string;
}

export interface SectionCompleteness {
    percentage: number;
    missing: MissingField[];
    warnings: string[];
    totalFields: number;
    filledFields: number;
}

export interface UserData {
    name: string;
    role?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context & Provider
// ─────────────────────────────────────────────────────────────────────────────

interface CopilotContextValue {
    isOpen: boolean;
    isMinimized: boolean;
    currentSection: ConfigSection | null;
    messages: Message[];
    isTyping: boolean;
    userData: UserData;
    completeness: Record<ConfigSection, SectionCompleteness>;
    pendingQuestions: MissingField[];
    currentQuestion: MissingField | null;
    openCopilot: (section?: ConfigSection) => void;
    closeCopilot: () => void;
    toggleMinimize: () => void;
    setSection: (section: ConfigSection) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    setTyping: (isTyping: boolean) => void;
    updateCompleteness: (section: ConfigSection, data: SectionCompleteness) => void;
    setUserData: (data: UserData) => void;
    clearMessages: () => void;
    askNextQuestion: () => void;
}

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined);

export function CopilotProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentSection, setCurrentSectionState] = useState<ConfigSection | null>(null);
    const [userData, setUserData] = useState<UserData>({ name: 'Usuario' });

    const initialMessages: Message[] = [
        {
            id: 'm1',
            sender: 'ai',
            content: '¡Hola! Soy tu asistente de configuración. He analizado los datos actuales y veo que estamos al **85%** de la configuración necesaria para certificar los costes.',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
            id: 'm2',
            sender: 'ai',
            content: 'He detectado que falta definir el **Coste de ETT** en las políticas de sustitución. ¿Me podrías decir cuál es la tarifa negociada por hora?',
            timestamp: new Date(Date.now() - 1000 * 60 * 4),
        },
        {
            id: 'm3',
            sender: 'user',
            content: 'Es de 18.20€/hora',
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
        },
        {
            id: 'm4',
            sender: 'ai',
            content: '✓ Perfecto. He actualizado el coste de la ETT. ¿Quieres que revisemos ahora el porcentaje de cobertura para el personal de planta?',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
        }
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [completeness, setCompleteness] = useState<Record<ConfigSection, SectionCompleteness>>({
        'impact-engines': { percentage: 90, missing: [], warnings: [], totalFields: 10, filledFields: 9 },
        'substitutions': { percentage: 75, missing: [], warnings: ['Coste ETT faltante'], totalFields: 8, filledFields: 6 },
        'risk-settings': { percentage: 100, missing: [], warnings: [], totalFields: 12, filledFields: 12 },
        'mirror-centers': { percentage: 60, missing: [], warnings: ['Faltan criterios de peso'], totalFields: 5, filledFields: 3 },
        'available-data': { percentage: 85, missing: [], warnings: ['6 campos bloqueantes'], totalFields: 20, filledFields: 17 },
    });
    const [pendingQuestions, setPendingQuestions] = useState<MissingField[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<MissingField | null>(null);

    const openCopilot = useCallback((section?: ConfigSection) => {
        setIsOpen(true);
        setIsMinimized(false);
        if (section) {
            setCurrentSectionState(section);
            const sectionData = completeness[section];
            if (sectionData.missing.length > 0) {
                askNextQuestionInternal(sectionData.missing, null, userData, section);
            }
        }
    }, [completeness, userData]);

    const closeCopilot = useCallback(() => setIsOpen(false), []);

    const toggleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);

    const setSection = useCallback((section: ConfigSection) => {
        setCurrentSectionState(section);
        const sectionData = completeness[section];
        if (sectionData.missing.length > 0) {
            askNextQuestionInternal(sectionData.missing, null, userData, section);
        }
    }, [completeness, userData]);

    const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            ...message,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const updateCompleteness = useCallback((section: ConfigSection, data: SectionCompleteness) => {
        setCompleteness(prev => ({
            ...prev,
            [section]: data,
        }));
        setPendingQuestions(data.missing);
    }, []);

    const clearMessages = useCallback(() => setMessages([]), []);

    const askNextQuestion = useCallback(() => {
        askNextQuestionInternal(pendingQuestions, currentQuestion, userData, currentSection);
    }, [pendingQuestions, currentQuestion, userData, currentSection]);

    const askNextQuestionInternal = (
        questions: MissingField[],
        current: MissingField | null,
        user: UserData,
        section: ConfigSection | null
    ) => {
        if (questions.length === 0 || current) return;

        const nextQuestion = questions[0];
        setCurrentQuestion(nextQuestion);

        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage({
                sender: 'ai',
                content: generateQuestionText(user.name, nextQuestion, section),
                metadata: { detectedData: { missingField: nextQuestion } },
            });
        }, 800);
    };

    const value: CopilotContextValue = {
        isOpen,
        isMinimized,
        currentSection,
        messages,
        isTyping,
        userData,
        completeness,
        pendingQuestions,
        currentQuestion,
        openCopilot,
        closeCopilot,
        toggleMinimize,
        setSection,
        addMessage,
        setTyping: setIsTyping,
        updateCompleteness,
        setUserData,
        clearMessages,
        askNextQuestion,
    };

    return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilotStore() {
    const context = useContext(CopilotContext);
    if (!context) {
        throw new Error('useCopilotStore must be used within CopilotProvider');
    }
    return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function generateQuestionText(
    userName: string,
    field: MissingField,
    section: ConfigSection | null
): string {
    const greetings = [
        `Hola ${userName}`,
        `${userName}`,
        `Hola`,
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (section === 'substitutions') {
        if (field.fieldName.includes('ett_rate')) {
            return `${greeting}, he estado revisando y me falta saber el coste medio que te cobra la ETT para las sustituciones${field.context ? ` de ${field.context}` : ''}. ¿Me podrías conseguir ese dato?`;
        }
        if (field.fieldName.includes('overtime_rate')) {
            return `${greeting}, necesito saber cuál es el coste por hora de las horas extra${field.context ? ` para ${field.context}` : ''}. ¿Lo tienes a mano?`;
        }
        if (field.fieldName.includes('coverage')) {
            return `${greeting}, veo que no has definido el porcentaje de cobertura${field.context ? ` para ${field.context}` : ''}. ¿Qué porcentaje necesitas cubrir?`;
        }
    }

    if (section === 'risk-settings') {
        return `${greeting}, necesito que me ayudes a configurar las alertas de riesgo. ¿Para qué ubicaciones o períodos quieres recibir avisos?`;
    }

    return `${greeting}, necesito tu ayuda con el campo "${field.displayName}". ¿Me podrías proporcionar este dato?`;
}
