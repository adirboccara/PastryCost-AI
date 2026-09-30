import { PastryCostEngine } from '../../src/pastry-agent.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const spec = JSON.parse(event.body);
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("FATAL: OPENROUTER_API_KEY environment variable is missing or empty.");
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "Missing OPENROUTER_API_KEY in environment variables" })
            };
        }

        const engine = new PastryCostEngine(apiKey);
        const result = await engine.runPipeline(spec);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Pipeline Error:", error.message, error.stack);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
