import { PastryCostEngine } from '../../src/pastry-agent.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const spec = JSON.parse(event.body);
        
        // Fetch API key from Netlify Environment Variables
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("Missing OpenRouter API Key in environment variables");
        }

        const engine = new PastryCostEngine(apiKey);
        const result = await engine.runPipeline(spec);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
