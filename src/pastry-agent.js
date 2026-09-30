export class PastryCostEngine {
    constructor(apiKey, mockClient = null) {
        this.apiKey = apiKey;
        this.mockClient = mockClient;
    }

    async _callLLM(systemPrompt, userPrompt) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://pastrycostai.netlify.app",
                "X-Title": "PastryCost AI"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();

        // 1. תפיסת שגיאות מה-API (כמו מודל לא זמין או הרשאה חסרה)
        if (data.error) {
            throw new Error(`OpenRouter API Error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        // 2. תפיסת מצב של פלט ריק
        if (!data.choices || !data.choices[0]) {
            throw new Error(`Unexpected Response from LLM: ${JSON.stringify(data)}`);
        }

        return data.choices[0].message.content;
    }

    async assessPhysicalRisk(spec) {
        if (this.mockClient) return this.mockClient.assessPhysicalRisk(spec);

        const sys = `You are a pastry risk assessment AI. Respond ONLY in valid JSON: {"vulnerability_level": "low|medium|high", "risk_multiplier": number, "mitigation_steps": ["..."], "wastage_factor": number}. Risk multiplier should be 1.0 to 1.5 based on heat/transport.`;
        const user = `Item: ${spec.itemType}\nEnvironment: ${spec.environment}`;
        const result = await this._callLLM(sys, user);
        return JSON.parse(result);
    }

    calculateFinancials(spec, risk) {
        const effectiveMaterialCost = spec.ingredientCost * (1 + risk.wastage_factor);
        const totalLaborCost = (spec.prepHours + spec.salesHours) * spec.hourlyRate;
        const baseProductionCost = effectiveMaterialCost + totalLaborCost;
        const adjustedCost = baseProductionCost * risk.risk_multiplier;
        const recommendedPrice = Math.round(adjustedCost * 1.35); // 35% margin
        return { recommendedPrice, projectedProfit: recommendedPrice - baseProductionCost, riskMultiplier: risk.risk_multiplier };
    }

    async generateProposal(spec, risk, financials) {
        if (this.mockClient) return this.mockClient.generateProposal(spec, risk, financials);

        const sys = `You are a boutique pastry AI. Respond ONLY in valid JSON: {"client_quote": "...", "logistics_protocol": "...", "pricing_summary": {"price": number, "prep_hours": number, "sales_hours": number}}. Write the quote and protocol in professional Hebrew.`;
        const user = `Item: ${spec.itemType}\nPrice: ${financials.recommendedPrice}\nMitigation: ${risk.mitigation_steps.join(", ")}`;
        const result = await this._callLLM(sys, user);
        return JSON.parse(result);
    }

    async runPipeline(spec) {
        const risk = await this.assessPhysicalRisk(spec);
        const financials = this.calculateFinancials(spec, risk);
        const proposal = await this.generateProposal(spec, risk, financials);
        return { riskAssessment: risk, financials, proposal };
    }
}
