# Project Framing: PastryCost AI

## 1. Problem Statement
Boutique pastry chefs and dessert businesses face persistent financial and operational risks when pricing their products. Traditional pricing spreadsheets fail to account for:
- Environmental and structural failure risks (e.g., heat exposure, melting during transit, humidity damaging crisp pastry textures).
- Uncaptured operational overhead, particularly the separation between kitchen preparation hours and on-site sales/event booth staffing.
- Dynamic material wastage depending on decorative and structural complexity.

PastryCost AI is an agentic decision-support system that evaluates physical pastry vulnerabilities, calculates true labor and ingredient overhead across operational contexts (direct custom orders vs. pop-up booths), and generates structured, profitable client proposals.

## 2. Testable Definition of Done
The project is complete and production-ready when:
1. **Multi-Stage Pipeline Execution**: An environmental risk assessment agent and a financial calculation agent successfully chain outputs without data loss.
2. **Deterministic Schema Validation**: The system outputs strictly valid JSON adhering to the specified schema (`risk_factor`, `adjusted_overhead`, `recommended_price`, `client_summary`).
3. **Automated Verification Gates**: All test suites in `npm test` pass deterministically, catching edge cases such as extreme outdoor temperatures, zero margin thresholds, and structural pastry collapse risks.
4. **Deployable Web Interface**: A clean client interface connected via serverless architecture is live and functional.

## 3. Out-of-Scope
To maintain strict architectural focus, the following elements are intentionally excluded:
- No database persistence or user authentication sessions.
- No automated payment processing or checkout gateways.
- No AI image generation for dessert concepts.
- No external automated live inventory synchronization.
