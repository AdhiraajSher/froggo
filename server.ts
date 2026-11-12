import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import {
  GoogleGenAI,
  GenerateContentResponse,
  LiveServerMessage,
  Modality,
} from '@google/genai';
import dotenv from 'dotenv';

// Load .env.local first (takes precedence), then .env
const cwd = process.cwd();
const localEnvPath = path.resolve(cwd, '.env.local');
const defaultEnvPath = path.resolve(cwd, '.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment-configurable Model IDs (can be overridden via env vars)
const GEMINI_MODELS = {
  fast: process.env.GEMINI_MODEL_FAST || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  general: process.env.GEMINI_MODEL_GENERAL || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  complex: process.env.GEMINI_MODEL_COMPLEX || process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  live: process.env.GEMINI_MODEL_LIVE || 'gemini-2.0-flash-exp',
};

// Rate limiting state per IP (in-memory)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

// Clean stale rate limit entries every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Please add GEMINI_API_KEY to your .env or .env.local file.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(
  roleLens?: string,
  contractTitle?: string,
  contractClauses?: Array<{ id: string; text: string }> | string[]
): string {
  const normalizedClauses = (contractClauses || []).map((c, i) => {
    if (typeof c === 'string') {
      return { id: `c-${String(i + 1).padStart(3, '0')}`, text: c };
    }
    return {
      id: c.id || `c-${String(i + 1).padStart(3, '0')}`,
      text: c.text || '',
    };
  });

  const clauseContext =
    normalizedClauses.length > 0
      ? `\n\nACTIVE CONTRACT IN WORKSPACE ("${contractTitle || 'Current Agreement'}"):\n${normalizedClauses
          .map((c) => `[${c.id}] ${c.text}`)
          .join('\n')}`
      : '\n\n(No contract clauses loaded in workspace.)';

  return `You are Froggo AI Legal Assistant, an accurate, grounded contract analysis assistant designed for Indian freelancers, residential tenants, students, and startup founders.
Current User Perspective (Role Lens): ${roleLens || 'Freelancer'}.

GROUNDING & CITATION RULES (MANDATORY):
1. CITATION REQUIREMENT: When explaining, summarizing, or discussing terms from the contract, you MUST cite the specific clause identifier in brackets, e.g. [c-001], [c-014]. Every factual statement about contract provisions must link to its [c-XXX] identifier.
2. UNGROUNDED / MISSING CLAUSES: If the user asks about a term or question that is NOT covered or mentioned in the contract clauses, you MUST state explicitly: "I can't determine this from the contract." Never speculate, assume standard provisions exist, or invent obligations not present in the text.
3. INDIAN STATUTORY PROTECTIONS:
   - Section 27, Indian Contract Act, 1872 (post-termination non-compete restraints are void in India).
   - Sections 15 & 16, MSMED Act, 2006 & Section 43B(h), Income Tax Act (maximum 45-day payment cycle for MSMEs; 3x RBI bank rate compound interest for delays; disallowance of buyer tax deductions if unpaid past 45 days).
   - Section 194J vs 194J(b), Income Tax Act (2% TDS for technical/software services vs 10% for professional services).
   - Digital Personal Data Protection Act, 2023 (DPDP Act) (purpose limitation, consent withdrawal, mandatory data deletion).
   - Residential Leave & License protections (24-hour advance entry notice, wear-and-tear exemptions, deposit refund upon handover).
4. NEGOTIATION RECOMMENDATIONS: Suggest polite, professional questions or redline replacement clauses when asked how to push back on unfair terms.
5. Remind users briefly when appropriate that you provide educational contract information, not formal legal advice or advocate certification under the Advocates Act, 1961.${clauseContext}`;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

const OPENROUTER_MODELS: Record<'fast' | 'general' | 'complex', string[]> = {
  fast: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'openrouter/auto',
  ],
  general: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'openrouter/auto',
  ],
  complex: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-chat',
    'openrouter/auto',
  ],
};

async function callOpenRouter(
  apiKey: string,
  systemInstruction: string,
  history: ChatHistoryItem[],
  message: string,
  models: string[]
): Promise<{ text: string; modelUsed: string; fallbackNotice?: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction },
  ];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (item && typeof item.text === 'string' && item.text.trim()) {
        messages.push({
          role: item.role === 'model' ? 'assistant' : 'user',
          content: item.text,
        });
      }
    }
  }

  messages.push({ role: 'user', content: message });

  // OpenRouter strictly requires models array to have 3 items or fewer
  const safeModels = (models && models.length > 0 ? models : [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'openrouter/auto',
  ]).slice(0, 3);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://froggo.local',
      'X-Title': 'Froggo AI Legal Assistant',
    },
    body: JSON.stringify({
      models: safeModels,
      messages,
    }),
  });

  const data = (await response.json()) as any;

  if (!response.ok) {
    const errorDetails = data?.error?.message || data?.error || response.statusText;
    throw new Error(
      `OpenRouter Error (${response.status}): ${
        typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)
      }`
    );
  }

  const text =
    data.choices?.[0]?.message?.content ||
    data.choices?.[0]?.text ||
    'I reviewed your request, but no text response was returned.';
  const modelUsed = data.model || models[0];

  return { text, modelUsed };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Startup check for GEMINI_API_KEY
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  if (!hasGeminiKey) {
    console.warn('[Froggo Server] Startup check: GEMINI_API_KEY is not configured. /api/chat will return 503 unless configured.');
  } else {
    console.log('[Froggo Server] Startup check: GEMINI_API_KEY is configured.');
  }

  app.use(express.json({ limit: '2mb' }));

  // ===========================================================================
  // HEALTH CHECK ENDPOINT (/api/health)
  // Makes one tiny test call to verify AI service connectivity & model validity
  // ===========================================================================
  app.get('/api/health', async (_req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!geminiKey && !openRouterKey) {
      res.status(503).json({
        status: 'unconfigured',
        message: 'No AI API key found. Set GEMINI_API_KEY in .env or .env.local.',
        geminiConfigured: false,
        openRouterConfigured: false,
        model: GEMINI_MODELS.general,
      });
      return;
    }

    const startTime = Date.now();
    const provider = geminiKey ? 'gemini' : 'openrouter';
    const testModel = geminiKey
      ? (GEMINI_MODELS.fast || GEMINI_MODELS.general)
      : 'openrouter/auto';

    try {
      if (geminiKey) {
        const ai = getGenAIClient();
        const testRes = await ai.models.generateContent({
          model: testModel,
          contents: 'ping',
        });
        const latencyMs = Date.now() - startTime;
        res.json({
          status: 'ok',
          provider: 'gemini',
          model: testModel,
          latencyMs,
          sample: testRes.text ? testRes.text.slice(0, 30).trim() : 'ok',
        });
        return;
      }

      if (openRouterKey) {
        const testModels = ['meta-llama/llama-3.3-70b-instruct:free', 'openrouter/auto'].slice(0, 3);
        const result = await callOpenRouter(
          openRouterKey,
          'Respond with pong',
          [],
          'ping',
          testModels
        );
        const latencyMs = Date.now() - startTime;
        res.json({
          status: 'ok',
          provider: 'openrouter',
          model: result.modelUsed,
          latencyMs,
          sample: result.text.slice(0, 30).trim(),
        });
        return;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Froggo Health Check Error]:', errMsg);
      res.status(502).json({
        status: 'error',
        provider,
        model: testModel,
        latencyMs: Date.now() - startTime,
        error: errMsg,
      });
    }
  });

  // ===========================================================================
  // 1. MULTI-TURN AI CHATBOT ENDPOINT (/api/chat)
  // Supports OpenRouter (with multi-model fallbacks) & Google Gemini SDK
  // ===========================================================================
  app.post('/api/chat', async (req, res) => {
    try {
      // 1. Per-IP Rate Limiting
      const rawForwarded = req.headers['x-forwarded-for'];
      const clientIp = typeof rawForwarded === 'string'
        ? rawForwarded.split(',')[0].trim()
        : req.socket.remoteAddress || '127.0.0.1';
      const rateStatus = checkRateLimit(clientIp);
      if (!rateStatus.allowed) {
        res.setHeader('Retry-After', String(rateStatus.retryAfterSeconds || 60));
        res.status(429).json({
          error: `Rate limit exceeded. Please wait ${rateStatus.retryAfterSeconds || 60} seconds before sending another message.`,
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      // 2. Startup / Unconfigured Check (Return 503)
      const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
      const geminiKey = process.env.GEMINI_API_KEY?.trim();
      if (!geminiKey && !openRouterKey) {
        res.status(503).json({
          error: 'AI service unconfigured: GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in your .env or .env.local file.',
          code: 'UNCONFIGURED_AI_SERVICE',
        });
        return;
      }

      // 3. Input Limits & Validation
      const MAX_MESSAGE_LENGTH = 10000;
      const MAX_HISTORY_ITEMS = 50;
      const MAX_HISTORY_TEXT_LENGTH = 10000;
      const MAX_CLAUSES_COUNT = 200;
      const MAX_CLAUSE_TEXT_LENGTH = 5000;

      const {
        message,
        history = [],
        modelTier = 'general',
        roleLens = 'Freelancer',
        contractTitle = '',
        contractClauses = [],
      } = req.body as {
        message: string;
        history?: ChatHistoryItem[];
        modelTier?: 'fast' | 'general' | 'complex';
        roleLens?: string;
        contractTitle?: string;
        contractClauses?: (string | { id?: string; text: string })[];
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'A non-empty message string is required.' });
        return;
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({
          error: `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`,
        });
        return;
      }

      if (!Array.isArray(history)) {
        res.status(400).json({ error: 'history must be an array.' });
        return;
      }

      if (history.length > MAX_HISTORY_ITEMS) {
        res.status(400).json({
          error: `Chat history exceeds maximum of ${MAX_HISTORY_ITEMS} turns.`,
        });
        return;
      }

      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        if (!item || typeof item.text !== 'string' || item.text.length > MAX_HISTORY_TEXT_LENGTH) {
          res.status(400).json({
            error: `History item at index ${i} is invalid or exceeds ${MAX_HISTORY_TEXT_LENGTH} characters.`,
          });
          return;
        }
      }

      const normalizedClauses: Array<{ id: string; text: string }> = [];
      if (contractClauses && Array.isArray(contractClauses)) {
        if (contractClauses.length > MAX_CLAUSES_COUNT) {
          res.status(400).json({
            error: `Contract clauses list exceeds maximum of ${MAX_CLAUSES_COUNT} clauses.`,
          });
          return;
        }
        for (let i = 0; i < contractClauses.length; i++) {
          const raw = contractClauses[i];
          const id =
            raw && typeof raw === 'object' && typeof raw.id === 'string'
              ? raw.id.slice(0, 50)
              : `c-${String(i + 1).padStart(3, '0')}`;
          const text =
            typeof raw === 'string'
              ? raw
              : raw && typeof raw.text === 'string'
              ? raw.text
              : '';

          if (text.length > MAX_CLAUSE_TEXT_LENGTH) {
            res.status(400).json({
              error: `Clause at index ${i} exceeds maximum length of ${MAX_CLAUSE_TEXT_LENGTH} characters.`,
            });
            return;
          }
          if (text.trim()) {
            normalizedClauses.push({ id, text: text.trim() });
          }
        }
      }

      const cleanTitle = typeof contractTitle === 'string' ? contractTitle.slice(0, 300) : '';
      const cleanRoleLens = typeof roleLens === 'string' ? roleLens.slice(0, 100) : 'Freelancer';

      const systemInstruction = buildSystemInstruction(
        cleanRoleLens,
        cleanTitle,
        normalizedClauses
      );

      // Primary Option: OpenRouter (with multi-model fallback chain)
      if (openRouterKey) {
        try {
          const fallbackModels =
            OPENROUTER_MODELS[modelTier] || OPENROUTER_MODELS.general;
          const openRouterResult = await callOpenRouter(
            openRouterKey,
            systemInstruction,
            history,
            message,
            fallbackModels
          );
          res.json(openRouterResult);
          return;
        } catch (openRouterErr) {
          console.warn('OpenRouter request failed:', openRouterErr);
          if (!geminiKey) {
            throw openRouterErr;
          }
          console.warn('Falling back to Google Gemini...');
        }
      }

      // Secondary Option / Direct: Google Gemini SDK
      if (geminiKey) {
        const ai = getGenAIClient();
        let selectedModel = GEMINI_MODELS.general;
        if (modelTier === 'fast') {
          selectedModel = GEMINI_MODELS.fast;
        } else if (modelTier === 'complex') {
          selectedModel = GEMINI_MODELS.complex;
        }

        const formattedHistory = Array.isArray(history)
          ? history
              .filter(
                (item) => item && typeof item.text === 'string' && item.text.trim()
              )
              .map((item) => ({
                role: item.role === 'model' ? 'model' : 'user',
                parts: [{ text: item.text }],
              }))
          : [];

        const runChatWithModel = async (modelName: string) => {
          const chat = ai.chats.create({
            model: modelName,
            history: formattedHistory,
            config: {
              systemInstruction,
            },
          });
          const response: GenerateContentResponse = await chat.sendMessage({
            message,
          });
          return {
            text:
              response.text ?? 'I analyzed your request, but no text was returned.',
            modelUsed: modelName,
          };
        };

        try {
          const result = await runChatWithModel(selectedModel);
          res.json(result);
          return;
        } catch (innerErr: unknown) {
          const errMessage =
            innerErr instanceof Error ? innerErr.message : String(innerErr);
          if (selectedModel === GEMINI_MODELS.complex) {
            console.warn(
              `${GEMINI_MODELS.complex} unavailable on current key, falling back to ${GEMINI_MODELS.general}:`,
              errMessage
            );
            const fallbackResult = await runChatWithModel(GEMINI_MODELS.general);
            res.json({
              ...fallbackResult,
              fallbackNotice: `Answered using ${GEMINI_MODELS.general} (complex model unavailable).`,
            });
            return;
          }
          throw innerErr;
        }
      }

      res.status(503).json({
        error:
          'No AI API key found. Please add GEMINI_API_KEY to your .env or .env.local file.',
      });
    } catch (error: unknown) {
      console.error('Error in /api/chat:', error);
      const errMsg =
        error instanceof Error ? error.message : 'Failed to generate AI response.';
      res.status(500).json({ error: errMsg });
    }
  });

  // ===========================================================================
  // 1B. STRUCTURED CONTRACT ANALYSIS ENDPOINT (/api/analyze)
  // Calls Gemini with structured output, verifies quoted_text against rawText
  // ===========================================================================
  app.post('/api/analyze', async (req, res) => {
    try {
      const rawForwarded = req.headers['x-forwarded-for'];
      const clientIp =
        typeof rawForwarded === 'string'
          ? rawForwarded.split(',')[0].trim()
          : req.socket.remoteAddress || '127.0.0.1';
      const rateStatus = checkRateLimit(clientIp);
      if (!rateStatus.allowed) {
        res.setHeader('Retry-After', String(rateStatus.retryAfterSeconds || 60));
        res.status(429).json({
          error: `Rate limit exceeded. Please wait ${rateStatus.retryAfterSeconds || 60} seconds before requesting analysis.`,
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      const geminiKey = process.env.GEMINI_API_KEY?.trim();
      if (!geminiKey) {
        res.status(503).json({
          error:
            'Gemini API is not configured on server. Set GEMINI_API_KEY in .env or .env.local to enable server AI analysis.',
          code: 'UNCONFIGURED_AI_SERVICE',
        });
        return;
      }

      const { rawText, clauses, role = 'Freelancer' } = req.body as {
        rawText: string;
        clauses: Array<{ id: string; text: string }>;
        role?: string;
      };

      if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
        res.status(400).json({ error: 'rawText string is required for analysis.' });
        return;
      }

      if (rawText.length > 200000) {
        res.status(400).json({ error: 'rawText exceeds maximum allowed length of 200,000 characters.' });
        return;
      }

      const safeClauses = Array.isArray(clauses)
        ? clauses.slice(0, 150).map((c) => ({
            id: String(c.id || ''),
            text: String(c.text || '').slice(0, 4000),
          }))
        : [];

      const prompt = `You are Froggo AI, an expert Indian legal contract analyzer for ${role}s in India.
Analyze the following contract clauses under applicable Indian law:
1. Section 27, Indian Contract Act, 1872 (post-termination non-competes in employment/freelance are void).
2. Sections 15 & 16, MSMED Act, 2006 (mandatory payment ceiling within 45 days; 3x RBI bank rate compound interest for delays).
3. Section 43B(h), Income Tax Act, 1961 (disallowance of tax deduction for delayed payments to registered MSMEs beyond 45 days).
4. Section 194J vs 194J(b), Income Tax Act, 1961 (2% TDS for technical services vs 10% for professional services).
5. Digital Personal Data Protection Act, 2023 (DPDP Act - purpose limitation, user consent withdrawal, mandatory data erasure).
6. State Leave & License / Tenancy rules (unannounced entry, arbitrary deposit deductions, repair shifting).

For each issue identified, return a structured JSON array of findings with:
- clause_id (string matching provided clause id, e.g. "c-001")
- quoted_text (string - MUST be an EXACT verbatim substring from the clause text)
- category (string, e.g. "Post-Termination Restriction", "Payment Timeline", "IP Transfer", "Tenancy Rights", "Liability")
- severity ("high" | "medium" | "safe" | "not_assessed")
- explanation (string - factual explanation citing the Indian statute)
- suggested_question_or_edit (string - practical negotiation suggestion or question)
- confidence (number between 0.0 and 1.0)

IMPORTANT:
- NEVER claim "Compliant" or "Safe" for terms that have not been assessed.
- If a clause does not contain a violation, do NOT invent one.
- Return ONLY the JSON array.`;

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.general,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${prompt}\n\nContract text to analyze (JSON):\n${JSON.stringify({
                  role,
                  clauses: safeClauses,
                })}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '[]';
      let parsedFindings: any[] = [];
      try {
        parsedFindings = JSON.parse(responseText);
      } catch (e) {
        const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          parsedFindings = JSON.parse(jsonMatch[0]);
        }
      }

      if (!Array.isArray(parsedFindings)) {
        parsedFindings = [];
      }

      // Verify that quoted_text actually exists in rawText to prevent AI hallucination
      const verifiedFindings = parsedFindings
        .map((finding) => {
          const quoted = typeof finding.quoted_text === 'string' ? finding.quoted_text.trim() : '';
          const existsInSource = quoted.length > 0 && rawText.includes(quoted);
          return {
            clauseId: String(finding.clause_id || ''),
            quotedText: quoted,
            quotedTextVerified: existsInSource,
            category: String(finding.category || 'General Terms'),
            severity: ['high', 'medium', 'safe', 'not_assessed'].includes(finding.severity)
              ? finding.severity
              : 'not_assessed',
            title: String(finding.category || 'Clause Review'),
            explanation: String(finding.explanation || ''),
            suggestedQuestionOrEdit: String(finding.suggested_question_or_edit || ''),
            confidence: typeof finding.confidence === 'number' ? finding.confidence : 0.8,
          };
        })
        .filter((finding) => {
          // Drop hallucinated quotes if a quote was provided but is not present in rawText
          if (finding.quotedText && !finding.quotedTextVerified) {
            console.warn(`[Froggo /api/analyze] Dropped hallucinated quoted text: "${finding.quotedText.slice(0, 50)}..."`);
            return false;
          }
          return true;
        });

      res.json({
        verifiedFindings,
        count: verifiedFindings.length,
        modelUsed: GEMINI_MODELS.general,
      });
    } catch (error: unknown) {
      console.error('Error in /api/analyze:', error);
      const errMsg =
        error instanceof Error ? error.message : 'Failed to analyze contract with AI.';
      res.status(500).json({ error: errMsg });
    }
  });

  // ===========================================================================
  // 2. GEMINI LIVE API REAL-TIME VOICE ASSISTANT WEBSOCKET (/api/live)
  // ===========================================================================
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const roleLens = url.searchParams.get('role') || 'Freelancer';
    const voiceName = url.searchParams.get('voice') || 'Zephyr';
    const contractTitle = url.searchParams.get('title') || 'Active Contract';
    const rawClausesParam = url.searchParams.get('clauses');

    let initialClauses: Array<{ id: string; text: string }> = [];
    if (rawClausesParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawClausesParam));
        if (Array.isArray(parsed)) {
          initialClauses = parsed.slice(0, 50).map((c, i) => ({
            id: typeof c === 'object' && c.id ? String(c.id) : `c-${String(i + 1).padStart(3, '0')}`,
            text: typeof c === 'object' && c.text ? String(c.text).slice(0, 1000) : String(c).slice(0, 1000),
          }));
        }
      } catch {
        // Fall back to empty clauses
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            error:
              'Gemini Live voice assistant requires GEMINI_API_KEY. Text chat is working with OpenRouter!',
          })
        );
        clientWs.close();
      }
      return;
    }

    const ai = getGenAIClient();
    let liveSession: Awaited<ReturnType<typeof ai.live.connect>> | null = null;

    const systemInstruction = `${buildSystemInstruction(
      roleLens,
      contractTitle,
      initialClauses
    )}
You are speaking live in real time over voice. Keep your spoken responses warm, conversational, concise, and focused (2 to 4 sentences). Note: For exact verbatim clause reading and clause citations, advise the user to check the AI Query Chatbot tab.`;

    const sessionPromise = ai.live.connect({
      model: GEMINI_MODELS.live,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction,
      },
      callbacks: {
        onopen: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'ready' }));
          }
        },
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'inputTranscript',
                text: content.inputTranscription.text,
              })
            );
          }

          if (content?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'outputTranscript',
                text: content.outputTranscription.text,
              })
            );
          }

          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(
                JSON.stringify({
                  type: 'audio',
                  audio: part.inlineData.data,
                })
              );
            }
          }

          if (content?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          if (content?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onerror: (err: unknown) => {
          console.error('Gemini Live session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                error:
                  err instanceof Error
                    ? err.message
                    : 'Live voice session encountered an error.',
              })
            );
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    sessionPromise
      .then((session) => {
        liveSession = session;
      })
      .catch((err: unknown) => {
        console.error('Failed to connect to Gemini Live:', err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: 'error',
              error:
                err instanceof Error
                  ? err.message
                  : 'Unable to start Gemini Live voice session.',
            })
          );
          clientWs.close();
        }
      });

    clientWs.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        sessionPromise
          .then((session) => {
            if (data.audio) {
              session.sendRealtimeInput({
                audio: {
                  data: data.audio,
                  mimeType: 'audio/pcm;rate=16000',
                },
              });
            } else if (data.text) {
              session.sendRealtimeInput({
                text: data.text,
              });
            }
          })
          .catch(() => {
            // Ignore send errors if session failed to initialize
          });
      } catch (e) {
        console.error('Failed to parse WebSocket message from client:', e);
      }
    });

    clientWs.on('close', () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore close errors
        }
        liveSession = null;
      }
    });
  });

  // ===========================================================================
  // 3. VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD)
  // ===========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Froggo server running on http://localhost:${PORT}`);
  });
}

startServer();
