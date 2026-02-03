import type { ConfigSection, MissingField, SectionCompleteness } from '../../../stores/copilotStore';

// ─────────────────────────────────────────────────────────────────────────────
// Natural Language Parsing
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedData {
    type: 'cost' | 'percentage' | 'complex_rule' | 'text' | 'confirmation';
    value: any;
    confidence: number;
    fields: Record<string, any>;
}

export function parseNaturalLanguage(input: string, context?: ConfigSection): ParsedData {
    const lowerInput = input.toLowerCase().trim();

    // Cost/Currency detection
    const costMatch = lowerInput.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?|eur)/i);
    if (costMatch) {
        return {
            type: 'cost',
            value: parseFloat(costMatch[1].replace(',', '.')),
            confidence: 0.95,
            fields: { rate: parseFloat(costMatch[1].replace(',', '.')) },
        };
    }

    // Percentage detection
    const percentMatch = lowerInput.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (percentMatch) {
        return {
            type: 'percentage',
            value: parseFloat(percentMatch[1].replace(',', '.')),
            confidence: 0.95,
            fields: { percentage: parseFloat(percentMatch[1].replace(',', '.')) },
        };
    }

    // Complex rule detection (for risk settings)
    if (context === 'risk-settings') {
        const complexRule = parseComplexRule(lowerInput);
        if (complexRule) {
            return {
                type: 'complex_rule',
                value: complexRule,
                confidence: 0.85,
                fields: complexRule,
            };
        }
    }

    // Confirmation detection
    if (lowerInput.match(/^(sí|si|yes|ok|vale|perfecto|correcto|exacto)$/i)) {
        return {
            type: 'confirmation',
            value: true,
            confidence: 1.0,
            fields: { confirmed: true },
        };
    }

    // Default: treat as text
    return {
        type: 'text',
        value: input,
        confidence: 0.5,
        fields: { text: input },
    };
}

function parseComplexRule(input: string): any | null {
    // Pattern: "para todas las [type] de [location] durante [period] si [condition] [action]"

    const locationMatch = input.match(/(?:de|en)\s+([a-záéíóúñ\s]+?)(?:\s+durante|\s+si|\s+que|\s+y|$)/i);
    const typeMatch = input.match(/(?:todas?\s+las?\s+|los?\s+)([a-záéíóúñ]+)/i);
    const periodMatch = input.match(/durante\s+([^,]+?)(?:\s+(?:si|que|avisame)|$)/i);
    const thresholdMatch = input.match(/(?:superior|mayor|supera|>)\s+a?l?\s*(\d+)\s*%/i);
    const actionMatch = input.match(/(avisame|alertame|notifica|warning)/i);

    if (!locationMatch && !thresholdMatch) return null;

    return {
        scope: {
            location: locationMatch ? locationMatch[1].trim() : null,
            type: typeMatch ? typeMatch[1].trim() : null,
        },
        period: periodMatch ? periodMatch[1].trim() : null,
        condition: thresholdMatch
            ? {
                metric: 'staffing_risk',
                threshold: parseInt(thresholdMatch[1]),
                operator: '>',
            }
            : null,
        action: actionMatch ? 'warning' : null,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Question Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateProactiveQuestion(
    userName: string,
    field: MissingField,
    section: ConfigSection
): string {
    const templates: Record<string, (f: MissingField) => string> = {
        'substitutions-ett_rate': (f) =>
            `Hola ${userName}, he estado revisando y me falta saber el coste medio que te cobra la ETT para las sustituciones${f.context ? ` de ${f.context}` : ''}. ¿Me podrías conseguir ese dato?`,

        'substitutions-overtime_rate': (f) =>
            `${userName}, necesito saber cuál es el coste por hora de las horas extra${f.context ? ` para ${f.context}` : ''}. ¿Lo tienes a mano?`,

        'substitutions-coverage': (f) =>
            `Veo que no has definido el porcentaje de cobertura${f.context ? ` para ${f.context}` : ''}. ¿Qué porcentaje necesitas cubrir?`,

        'risk-settings-threshold': (f) =>
            `${userName}, ¿a partir de qué umbral de riesgo quieres recibir alertas? Por ejemplo, si supera el 60%, 70%...`,

        'mirror-centers-criteria': (f) =>
            `Para que la IA encuentre centros más parecidos, ¿qué peso le darías al criterio de ${f.displayName}?`,

        'impact-engines-absenteeism': (f) =>
            `Hola ${userName}, para calcular el impacto económico exacto necesito saber el coste de absentismo en ${f.context || 'tu empresa'}. ¿Tienes una cifra estimada?`,

        'default': (f) =>
            `${userName}, necesito tu ayuda con "${f.displayName}". ¿Me podrías proporcionar este dato?`,
    };

    const key = `${section}-${field.fieldName}`;
    const generator = templates[key] || templates['default'];

    return generator(field);
}

// ─────────────────────────────────────────────────────────────────────────────
// Completeness Detection
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeSubstitutionPolicies(data: any): SectionCompleteness {
    const missing: MissingField[] = [];
    let totalFields = 0;
    let filledFields = 0;

    // Check rates
    const rates = data.rates || [];
    rates.forEach((rate: any) => {
        totalFields++;
        if (rate.rate > 0) {
            filledFields++;
        } else {
            missing.push({
                id: `rate-${rate.id}`,
                section: 'substitutions',
                fieldName: 'ett_rate',
                displayName: rate.type,
                type: 'currency',
                priority: 'high',
                context: rate.type.toLowerCase(),
            });
        }
    });

    // Check rules
    const rules = data.rules || [];
    rules.forEach((rule: any) => {
        totalFields += 2; // coverage + minStaffing

        if (rule.coveragePct > 0) {
            filledFields++;
        } else {
            missing.push({
                id: `coverage-${rule.id}`,
                section: 'substitutions',
                fieldName: 'coverage',
                displayName: `Cobertura ${rule.collective}`,
                type: 'percentage',
                priority: 'medium',
                context: rule.collective,
            });
        }

        if (rule.minStaffing >= 0) filledFields++;
    });

    const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;

    return {
        percentage,
        missing,
        warnings: missing.length > 0 ? ['Configuración incompleta'] : [],
        totalFields,
        filledFields,
    };
}

export function analyzeRiskSettings(data: any): SectionCompleteness {
    return {
        percentage: 100,
        missing: [],
        warnings: [],
        totalFields: 5,
        filledFields: 5,
    };
}

export function analyzeRiskMirrors(data: any): SectionCompleteness {
    const missing: MissingField[] = [];
    const criteria = data.criteria || [];
    let filled = criteria.filter((c: any) => c.value !== '').length;

    if (filled < criteria.length) {
        missing.push({
            id: 'mirror-weights',
            section: 'mirror-centers',
            fieldName: 'criteria',
            displayName: 'Pesos de Criterios',
            type: 'number',
            priority: 'medium'
        });
    }

    return {
        percentage: Math.round((filled / criteria.length) * 100),
        missing,
        warnings: filled < criteria.length ? ['Faltan pesos de criterios'] : [],
        totalFields: criteria.length,
        filledFields: filled
    };
}

export function analyzeAvailableData(data: any): SectionCompleteness {
    const dictionary = data.dictionary || [];
    let total = 0;
    let captured = 0;

    dictionary.forEach((block: any) => {
        block.fields.forEach((f: any) => {
            total++;
            if (f.status === 'captured') captured++;
        });
    });

    const percentage = Math.round((captured / total) * 100);

    return {
        percentage,
        missing: [],
        warnings: percentage < 100 ? [`${total - captured} campos faltantes`] : [],
        totalFields: total,
        filledFields: captured
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateConfirmation(parsed: ParsedData, field?: MissingField): string {
    if (parsed.type === 'cost') {
        return `Perfecto ✓ He guardado ${parsed.value}€${field ? ` para ${field.displayName}` : ''}. ¿Hay algún otro dato que necesites actualizar?`;
    }

    if (parsed.type === 'percentage') {
        return `Entendido ✓ He configurado ${parsed.value}%${field ? ` en ${field.displayName}` : ''}. ¿Necesitas algo más?`;
    }

    if (parsed.type === 'complex_rule') {
        const rule = parsed.value;
        return `He creado la regla personalizada:\n\n📍 ${rule.scope.location || 'Todas las ubicaciones'}\n📅 ${rule.period || 'Todo el año'}\n⚠️ Umbral: ${rule.condition?.threshold || 'N/A'}%\n🔔 Acción: ${rule.action || 'Alerta'}\n\n¿Es correcto?`;
    }

    if (parsed.type === 'confirmation') {
        return `Genial, cambios aplicados ✓ ¿Alguna otra cosa que necesites configurar?`;
    }

    return `Gracias. Procesando tu información...`;
}
