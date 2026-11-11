import http from 'http';
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

dotenv.config({ path: ['.env.local', '.env'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  contractClauses?: string[]
): string {
  const clauseContext =
    contractClauses && contractClauses.length > 0
      ? `\n\nACTIVE CONTRACT IN WORKSPACE ("${contractTitle || 'Current Agreement'}"):\n${contractClauses
          .map((c, i) => `Clause ${i + 1}: ${c}`)
          .join('\n')}`
      : '';

  return `You are Froggo AI Legal Assistant, a clear, friendly, and accurate contract analysis assistant designed for Indian freelancers, residential tenants, students, and startup founders.
Current User Perspective (Role Lens): ${roleLens || 'Freelancer'}.

CORE RESPONSIBILITIES:
1. Translate complex legal clauses into simple, everyday English with actionable bullet points.
2. Automatically check for Indian statutory protections where relevant:
   - Section 27 of the Indian Contract Act, 1872 (post-termination non-compete restraints are generally void in India).
   - Section 15 & Section 16 of the MSMED Act, 2006 & Section 43B(h) of the Income Tax Act (maximum 45-day payment cycle for MSMEs and 3x RBI bank rate compound interest on overdue invoices).
   - Section 194J of the Income Tax Act (2% TDS under Sec 194J(b) for software/technical services vs. 10% under Sec 194J(a) for professional services; ₹50,000 annual threshold).
   - Digital Personal Data Protection (DPDP) Act, 2023 (consent, purpose limitation, and data erasure rights).
   - Residential Leave & License protections (normal wear-and-tear exemptions, 24-hour entry notice, itemized deposit refunds).
3. Suggest polite, ready-to-copy negotiation questions or redline replacement clauses when a user asks how to push back on unfair terms.
4. Keep responses concise (typically 3 to 6 short paragraphs or bullet points) and remind users briefly when appropriate that you provide educational contract information, not formal legal representation.${clauseContext}`;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

const OPENROUTER_MODELS: Record<'fast' | 'general' | 'complex', string[]> = {
  fast: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'openrouter/auto',
  ],
  general: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'mistralai/mistral-small-24b-instruct-2501:free',
    'openrouter/auto',
  ],
  complex: [
    'deepseek/deepseek-chat',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen-2.5-72b-instruct:free',
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

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://froggo.local',
      'X-Title': 'Froggo AI Legal Assistant',
    },
    body: JSON.stringify({
      models,
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

  app.use(express.json({ limit: '2mb' }));

  // ===========================================================================
  // 1. MULTI-TURN AI CHATBOT ENDPOINT (/api/chat)
  // Supports OpenRouter (with multi-model fallbacks) & Google Gemini SDK
  // ===========================================================================
  app.post('/api/chat', async (req, res) => {
    try {
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
        contractClauses?: string[];
      };

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'A message string is required.' });
        return;
      }

      const systemInstruction = buildSystemInstruction(
        roleLens,
        contractTitle,
        contractClauses
      );

      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      // 1. Primary Option: OpenRouter (with multi-model fallback chain)
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

      // 2. Secondary Option / Direct: Google Gemini SDK
      if (geminiKey) {
        const ai = getGenAIClient();
        let selectedModel = 'gemini-3.8-flash';
        if (modelTier === 'fast') {
          selectedModel = 'gemini-3.1-flash-lite';
        } else if (modelTier === 'complex') {
          selectedModel = 'gemini-4-argon';
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
          if (selectedModel === 'gemini-4-argon') {
            console.warn(
              'gemini-4-argon unavailable on current key, falling back to gemini-3.8-flash:',
              errMessage
            );
            const fallbackResult = await runChatWithModel('gemini-3.8-flash');
            res.json({
              ...fallbackResult,
              fallbackNotice:
                'Answered using Gemini 3.8 Flash (select a billing-enabled key in Settings > Secrets for Gemini 4 Argon).',
            });
            return;
          }
          throw innerErr;
        }
      }

      // Neither key found
      res.status(500).json({
        error:
          'No AI API key found. Please add OPENROUTER_API_KEY or GEMINI_API_KEY to your .env file.',
      });
    } catch (error: unknown) {
      console.error('Error in /api/chat:', error);
      const errMsg =
        error instanceof Error ? error.message : 'Failed to generate AI response.';
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
      []
    )}
You are speaking live in real time over voice. Keep your spoken responses warm, natural, conversational, and concise (2 to 4 sentences at a time) so the user can easily have a back-and-forth voice conversation with you.`;

    const sessionPromise = ai.live.connect({
      model: 'gemini-3.8-live',
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
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Froggo server running on http://localhost:${PORT}`);
  });
}

startServer();
