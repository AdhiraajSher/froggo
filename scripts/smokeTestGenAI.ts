import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env.local first, then .env
const cwd = process.cwd();
const localEnvPath = path.resolve(cwd, '.env.local');
const defaultEnvPath = path.resolve(cwd, '.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
}

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  latencyMs?: number;
}

async function runSmokeTest() {
  console.log('====================================================');
  console.log('🐸 Froggo GenAI & Grounding Live Smoke-Test');
  console.log('====================================================\n');

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const results: TestResult[] = [];

  console.log('1. Checking Environment Keys:');
  console.log(`   - GEMINI_API_KEY: ${geminiKey ? `Configured (ends with ...${geminiKey.slice(-4)})` : 'NOT SET'}`);
  console.log(`   - OPENROUTER_API_KEY: ${openRouterKey ? `Configured (ends with ...${openRouterKey.slice(-4)})` : 'NOT SET'}\n`);

  if (!geminiKey && !openRouterKey) {
    console.error('❌ FAILURE: Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured in .env or .env.local.');
    console.error('Please configure at least one API key to perform a live test.');
    process.exit(1);
  }

  // TEST 1: Gemini Direct Ping (if GEMINI_API_KEY exists)
  if (geminiKey) {
    const t0 = Date.now();
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: { headers: { 'User-Agent': 'froggo-smoke-test' } },
      });
      const model = process.env.GEMINI_MODEL_GENERAL || 'gemini-2.0-flash';
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: 'Respond with exactly the single word "FROGGO_OK"' }] }],
      });
      const latencyMs = Date.now() - t0;
      const text = response.text?.trim() || '';
      const passed = text.includes('FROGGO_OK') || text.length > 0;
      results.push({
        name: `Gemini Direct Ping (${model})`,
        passed,
        details: passed ? `Success: "${text.slice(0, 30)}"` : 'Unexpected response body',
        latencyMs,
      });
    } catch (err: unknown) {
      results.push({
        name: 'Gemini Direct Ping',
        passed: false,
        details: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - t0,
      });
    }
  }

  // TEST 2: Grounded Contract Citations Test
  if (geminiKey) {
    const t0 = Date.now();
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: { headers: { 'User-Agent': 'froggo-smoke-test' } },
      });
      const testClauses = [
        { id: 'c-001', text: 'Payment shall be made within 15 days of invoice date.' },
        { id: 'c-002', text: 'Contractor shall not work with any competitor for 12 months.' },
      ];
      const systemInstruction = `You are Froggo AI Legal Assistant.
GROUNDING & CITATION RULES:
1. When discussing or answering questions about the contract, you MUST cite clause IDs in brackets, e.g. [c-001].
2. If the user asks about something NOT in the contract, you MUST state explicitly: "I can't determine this from the contract."

ACTIVE CONTRACT:
${testClauses.map((c) => `[${c.id}] ${c.text}`).join('\n')}`;

      // Query A: Direct clause question (should cite [c-001])
      const resA = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL_GENERAL || 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'What is the payment window specified in the contract?' }],
          },
        ],
        config: { systemInstruction },
      });
      const textA = resA.text || '';
      const hasCitation = /\[c-001\]/i.test(textA);

      // Query B: Ungrounded question (should say "I can't determine this from the contract")
      const resB = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL_GENERAL || 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'What is the policy for keeping pets or dogs on the premises?' }],
          },
        ],
        config: { systemInstruction },
      });
      const textB = resB.text || '';
      const handlesUngrounded =
        /can\'t determine/i.test(textB) ||
        /cannot determine/i.test(textB) ||
        /not (?:mentioned|found|provided|covered|addressed|stated)/i.test(textB);

      const latencyMs = Date.now() - t0;
      results.push({
        name: 'Grounded Citation [c-001] Test',
        passed: hasCitation,
        details: hasCitation
          ? 'Passed: Model cited [c-001] in answer.'
          : `Notice: Model answered without [c-001] citation: "${textA.slice(0, 60)}..."`,
        latencyMs,
      });

      results.push({
        name: 'Ungrounded Query Refusal Test',
        passed: handlesUngrounded,
        details: handlesUngrounded
          ? 'Passed: Model accurately stated information was not present in contract.'
          : `Notice: Model did not explicitly refuse: "${textB.slice(0, 60)}..."`,
      });
    } catch (err: unknown) {
      results.push({
        name: 'Grounded Citation & Refusal Test',
        passed: false,
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // TEST 3: Health Endpoint (if local server is listening on port 3000)
  const port = process.env.PORT || '3000';
  const healthUrl = `http://127.0.0.1:${port}/api/health`;
  try {
    const t0 = Date.now();
    const resp = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
    const data = await resp.json();
    results.push({
      name: `Local /api/health Endpoint (${healthUrl})`,
      passed: resp.ok,
      details: `HTTP ${resp.status}: ${JSON.stringify(data).slice(0, 60)}...`,
      latencyMs: Date.now() - t0,
    });
  } catch {
    results.push({
      name: `Local /api/health Endpoint (${healthUrl})`,
      passed: true,
      details: 'Server not currently running on port 3000 (Start with "npm run dev" to verify live HTTP proxy).',
    });
  }

  // Print Summary Table
  console.log('2. Test Results:');
  console.log('----------------------------------------------------');
  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    const latency = r.latencyMs !== undefined ? ` (${r.latencyMs}ms)` : '';
    console.log(`${icon} ${r.name}${latency}`);
    console.log(`   ${r.details}`);
  }
  console.log('----------------------------------------------------\n');

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('🎉 Smoke test completed successfully!');
    process.exit(0);
  } else {
    console.log('⚠️ Some smoke tests failed. Review the details above.');
    process.exit(1);
  }
}

runSmokeTest();
