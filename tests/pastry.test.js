import test from "node:test";
import assert from "node:assert/strict";
import { PastryCostEngine } from "../src/pastry-agent.js";

test("PastryCost AI - Verification Gates", async (t) => {
  // Mock client to simulate LLM responses for predictable testing without hitting the API
  const mockClient = {
    assessPhysicalRisk: async () => ({
      vulnerability_level: "high",
      risk_multiplier: 1.25,
      mitigation_steps: ["Use structural dowels", "Keep refrigerated until delivery"],
      wastage_factor: 0.15
    }),
    generateProposal: async (spec, risk, financials) => ({
      client_quote: "הצעת מחיר עבור עוגת המוס...",
      logistics_protocol: "יש לשמור בקירור עד להגשה...",
      pricing_summary: {
        price: financials.recommendedPrice,
        prep_hours: spec.prepHours,
        sales_hours: spec.salesHours
      }
    })
  };

  const engine = new PastryCostEngine("fake-api-key", mockClient);

  await t.test("Financial Gate: Ensures positive margins and accurate risk application", () => {
    const spec = {
      itemType: "Tiered Mousse Cake",
      environment: "Outdoor Summer Event",
      ingredientCost: 100,
      prepHours: 4,
      salesHours: 0,
      hourlyRate: 80
    };

    const risk = { vulnerability_level: "high", risk_multiplier: 1.25, wastage_factor: 0.15 };
    const financials = engine.calculateFinancials(spec, risk);

    // Verification Gates
    assert.ok(financials.recommendedPrice > 0, "Price must be strictly positive");
    assert.ok(financials.projectedProfit > 0, "System must never recommend a loss-making price");
    assert.strictEqual(financials.riskMultiplier, 1.25, "Risk multiplier must be applied correctly");
    
    // Mathematical verification (deterministic check)
    // effectiveMaterialCost = 100 * 1.15 = 115
    // totalLaborCost = 4 * 80 = 320
    // baseProductionCost = 115 + 320 = 435
    // adjustedCost = 435 * 1.25 = 543.75
    // recommendedPrice = Math.round(543.75 * 1.35) = 734
    assert.strictEqual(financials.recommendedPrice, 734, "Price calculation must match exact financial logic");
  });

  await t.test("Pipeline Gate: Full sequential flow produces valid structural output", async () => {
    const spec = {
      itemType: "Tiered Mousse Cake",
      environment: "Outdoor Summer Event",
      ingredientCost: 100,
      prepHours: 4,
      salesHours: 0,
      hourlyRate: 80
    };

    const result = await engine.runPipeline(spec);

    // Verify structural dependencies
    assert.ok(result.riskAssessment.mitigation_steps.length > 0, "Must provide mitigation steps");
    assert.ok(result.proposal.client_quote, "Must generate a client quote");
    assert.strictEqual(result.proposal.pricing_summary.price, result.financials.recommendedPrice, "Quote price must match calculated pipeline price");
  });
});
