/**
 * PastryCost AI - Core Sequential Multi-Agent Pipeline
 */

export class PastryCostEngine {
  constructor(apiKey, mockClient = null) {
    this.apiKey = apiKey;
    this.mockClient = mockClient;
  }

  /**
   * Stage 1: Structural & Environmental Vulnerability Assessment
   */
  async assessPhysicalRisk(spec) {
    if (this.mockClient) {
      return this.mockClient.assessPhysicalRisk(spec);
    }

    const prompt = `Analyze pastry structural and thermal vulnerabilities.
Item: ${spec.itemType}
Environment: ${spec.environment} (Outdoor/Transit)
Return strictly valid JSON:
{
  "vulnerability_level": "low" | "medium" | "high" | "critical",
  "risk_multiplier": <number between 1.0 and 1.4>,
  "mitigation_steps": ["step1", "step2"],
  "wastage_factor": <number between 0.05 and 0.25>
}`;

    return await this._callLLM(prompt);
  }

  /**
   * Stage 2: Financial Margins & Labor Pricing Model
   */
  calculateFinancials(spec, riskAssessment) {
    const rawMaterialCost = Number(spec.ingredientCost) || 0;
    const prepHours = Number(spec.prepHours) || 0;
    const salesHours = Number(spec.salesHours) || 0;
    const hourlyRate = Number(spec.hourlyRate) || 80;

    // Apply wastage factor from Stage 1 risk assessment
    const effectiveMaterialCost = rawMaterialCost * (1 + riskAssessment.wastage_factor);

    // Differentiate kitchen craft labor vs. operational booth sales labor
    const kitchenLaborCost = prepHours * hourlyRate;
    const boothLaborCost = salesHours * (hourlyRate * 0.75); // sales labor weighted at operational baseline
    const totalLaborCost = kitchenLaborCost + boothLaborCost;

    // Base cost before dynamic risk mitigation
    const baseProductionCost = effectiveMaterialCost + totalLaborCost;

    // Apply Stage 1 structural/thermal risk multiplier
    const adjustedCost = baseProductionCost * riskAssessment.risk_multiplier;

    // Minimum target net margin (35%)
    const recommendedPrice = Math.round(adjustedCost * 1.35);
    const projectedProfit = Math.round(recommendedPrice - adjustedCost);

    return {
      effectiveMaterialCost: Math.round(effectiveMaterialCost),
      totalLaborCost: Math.round(totalLaborCost),
      baseProductionCost: Math.round(baseProductionCost),
      riskMultiplier: riskAssessment.risk_multiplier,
      recommendedPrice,
      projectedProfit
    };
  }

  /**
   * Stage 3: Operational Synthesis & Client Proposal Generation
   */
  async generateProposal(spec, riskAssessment, financials) {
    if (this.mockClient) {
      return this.mockClient.generateProposal(spec, riskAssessment, financials);
    }

    const prompt = `Generate a professional client quote and handling protocol for a boutique pastry order.
Context:
- Item: ${spec.itemType}
- Environment: ${spec.environment}
- Recommended Price: ₪${financials.recommendedPrice}
- Identified Risks: ${riskAssessment.vulnerability_level}
- Mitigations: ${riskAssessment.mitigation_steps.join(", ")}

Return strictly valid JSON:
{
  "client_quote": "<polite commercial quote in Hebrew explaining the scope>",
  "logistics_protocol": "<handling, transport, and refrigeration instructions in Hebrew>",
  "pricing_summary": {
    "price": ${financials.recommendedPrice},
    "prep_hours": ${spec.prepHours},
    "sales_hours": ${spec.salesHours}
  }
}`;

    return await this._callLLM(prompt);
  }

  /**
   * Full Pipeline Execution
   */
  async runPipeline(spec) {
    const riskAssessment = await this.assessPhysicalRisk(spec);
    const financials = this.calculateFinancials(spec, riskAssessment);
    const proposal = await this.generateProposal(spec, riskAssessment, financials);

    return {
      riskAssessment,
      financials,
      proposal
    };
  }

  async _callLLM(prompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}
