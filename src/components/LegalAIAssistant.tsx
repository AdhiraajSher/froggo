import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  X,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { FroggoLogo } from './FroggoLogo';
import type { RoleType } from '../App';

export type ModelTier = 'fast' | 'general' | 'complex';

export interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  fallbackNotice?: string;
  timestamp: string;
}

interface VoiceTranscriptItem {
  id: string;
  speaker: 'user' | 'model';
  text: string;
}

interface LegalAIAssistantProps {
  isOpen: boolean;
  initialMode: 'chat' | 'voice';
  onClose: () => void;
  onOpenWithMode: (mode: 'chat' | 'voice') => void;
  role: RoleType;
  contractTitle: string;
  contractClauses: string[];
}

function float32ToPcm16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

export const LegalAIAssistant: React.FC<LegalAIAssistantProps> = ({
  isOpen,
  initialMode,
  onClose,
  onOpenWithMode,
  role,
  contractTitle,
  contractClauses,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>(initialMode);

  // ===========================================================================
  // 1. MULTI-TURN GEMINI CHATBOT STATE
  // ===========================================================================
  const [modelTier, setModelTier] = useState<ModelTier>('general');
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hi! I'm your Froggo Legal Assistant. I have "${contractTitle}" loaded with your ${role} perspective.\n\nAsk me anything about specific clauses, Section 27 non-competes, the MSME 45-day payment limit, Section 194J TDS rates, or how to negotiate fairer terms.`,
      modelUsed: 'gemini-3.8-flash',
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // 2. GEMINI LIVE VOICE ASSISTANT STATE (gemini-3.8-live)
  // ===========================================================================
  const [voiceStatus, setVoiceStatus] = useState<
    'idle' | 'connecting' | 'listening' | 'speaking' | 'error'
  >('idle');
  const [voiceError, setVoiceError] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [voiceTranscripts, setVoiceTranscripts] = useState<VoiceTranscriptItem[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef<boolean>(false);
  const voiceScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  useEffect(() => {
    if (voiceScrollRef.current) {
      voiceScrollRef.current.scrollTop = voiceScrollRef.current.scrollHeight;
    }
  }, [voiceTranscripts]);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  // ===========================================================================
  // MULTI-TURN CHAT HANDLER
  // ===========================================================================
  async function handleSendChatMessage(customPrompt?: string) {
    const textToSend = (customPrompt ?? inputPrompt).trim();
    if (!textToSend || isSending) return;

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyForApi = messages
      .filter((m) => m.id !== 'welcome-1')
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userTurn]);
    if (!customPrompt) setInputPrompt('');
    setChatError('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyForApi,
          modelTier,
          roleLens: role,
          contractTitle,
          contractClauses,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response from Froggo AI.');
      }

      const modelTurn: ChatTurn = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'No response generated.',
        modelUsed: data.modelUsed,
        fallbackNotice: data.fallbackNotice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelTurn]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reach AI chat service.';
      setChatError(msg);
    } finally {
      setIsSending(false);
    }
  }

  function handleResetChat() {
    setMessages([
      {
        id: 'welcome-1',
        role: 'model',
        text: `Conversation cleared. I have "${contractTitle}" ready for your ${role} questions.`,
        modelUsed:
          modelTier === 'fast'
            ? 'gemini-3.1-flash-lite'
            : modelTier === 'complex'
            ? 'gemini-4-argon'
            : 'gemini-3.8-flash',
        timestamp: 'Just now',
      },
    ]);
    setChatError('');
  }

  // ===========================================================================
  // GEMINI LIVE API VOICE HANDLERS (16kHz Input / 24kHz Output PCM)
  // ===========================================================================
  function clearScheduledPlayback() {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Ignore already stopped sources
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  }

  function schedulePcm24kAudio(base64Audio: string) {
    const outputCtx = outputAudioCtxRef.current;
    if (!outputCtx) return;

    const float32Data = pcm16Base64ToFloat32(base64Audio);
    if (float32Data.length === 0) return;

    const audioBuffer = outputCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = outputCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputCtx.destination);

    const currentTime = outputCtx.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;

    activeSourcesRef.current.push(source);
    setVoiceStatus('speaking');

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0 && wsRef.current?.readyState === WebSocket.OPEN) {
        setVoiceStatus('listening');
      }
    };
  }

  async function startVoiceSession() {
    if (voiceStatus === 'connecting' || voiceStatus === 'listening' || voiceStatus === 'speaking') {
      return;
    }

    setVoiceError('');
    setVoiceStatus('connecting');
    setVoiceTranscripts([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const params = new URLSearchParams({
        role,
        voice: selectedVoice,
        title: contractTitle,
      });
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live?${params.toString()}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            setVoiceStatus('listening');
            // Send active contract clauses as initial context to the live session
            if (contractClauses.length > 0) {
              ws.send(
                JSON.stringify({
                  text: `Context: The user is currently reviewing "${contractTitle}" as a ${role}. Key clauses: ${contractClauses
                    .slice(0, 4)
                    .join(' | ')}. Greet the user briefly in 1 sentence and ask how you can help decode this contract.`,
                })
              );
            }
          } else if (msg.type === 'audio' && msg.audio) {
            schedulePcm24kAudio(msg.audio);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            setVoiceTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'user') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: `${last.text}${msg.text}` },
                ];
              }
              return [...prev, { id: `vt-u-${Date.now()}`, speaker: 'user', text: msg.text }];
            });
          } else if (msg.type === 'outputTranscript' && msg.text) {
            setVoiceTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'model') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: `${last.text}${msg.text}` },
                ];
              }
              return [...prev, { id: `vt-m-${Date.now()}`, speaker: 'model', text: msg.text }];
            });
          } else if (msg.type === 'interrupted') {
            clearScheduledPlayback();
            setVoiceStatus('listening');
          } else if (msg.type === 'error') {
            setVoiceError(msg.error || 'Voice assistant error occurred.');
            stopVoiceSession();
          } else if (msg.type === 'closed') {
            stopVoiceSession();
          }
        } catch (e) {
          console.error('Error parsing Live WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        setVoiceError('WebSocket connection error while connecting to Gemini Live.');
        stopVoiceSession();
      };

      ws.onclose = () => {
        stopVoiceSession();
      };

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return;
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBase64 = float32ToPcm16Base64(inputData);
        wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Microphone access is required for real-time voice conversation.';
      setVoiceError(errMsg);
      setVoiceStatus('error');
      stopVoiceSession();
    }
  }

  function stopVoiceSession() {
    clearScheduledPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // Ignore
      }
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }

    setVoiceStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
  }

  function sendVoicePromptHint(hintText: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setVoiceTranscripts((prev) => [
        ...prev,
        { id: `vt-u-${Date.now()}`, speaker: 'user', text: hintText },
      ]);
      wsRef.current.send(JSON.stringify({ text: hintText }));
    }
  }

  const quickQuestions = [
    `Explain the biggest risks in "${contractTitle}" for a ${role}.`,
    'Is a post-termination non-compete valid under Section 27 in India?',
    'How does the MSME 45-day payment limit & 2% Sec 194J(b) TDS work?',
    'Write a polite negotiation message to push back on unfair clauses.',
  ];

  return (
    <>
      {/* =====================================================================
          FLOATING LAUNCHER BUTTONS (BOTTOM RIGHT)
         ===================================================================== */}
      {!isOpen && (<button className="mint-assistant" onClick={()=>onOpenWithMode('chat')} title="Open assistant"><MessageSquareText size={18}/><span>Ask Froggo</span></button>)}

      {/* =====================================================================
          SLIDE-OVER AI ASSISTANT PANEL (CHATBOT + LIVE VOICE)
         ===================================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0C1F17] border-l border-gray-200 dark:border-[#1D4234] h-full flex flex-col shadow-2xl">
            {/* Top Panel Header */}
            <div className="p-4 sm:p-5 bg-[#F9FAFB] dark:bg-[#071510] border-b border-gray-200 dark:border-[#1D4234] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FroggoLogo size={34} />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-base font-bold text-[#111827] dark:text-emerald-50">
                      Froggo AI Legal Assistant
                    </h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-emerald-950 text-[#0F766E] dark:text-emerald-300 border border-teal-200 dark:border-emerald-800">
                      {role} Lens
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-emerald-200/70 truncate max-w-[260px]">
                    Active: {contractTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close AI Assistant"
                className="p-2 rounded-lg text-gray-500 hover:text-[#111827] dark:text-emerald-300/70 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-[#132C22] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs: AI Legal Chatbot vs. Live Voice Assistant */}
            <div className="px-4 pt-3 pb-2 bg-white dark:bg-[#0C1F17] border-b border-gray-200 dark:border-[#1D4234] flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-[#F9FAFB] dark:bg-[#122B21] text-gray-700 dark:text-emerald-200 hover:bg-gray-100 dark:hover:bg-[#17362A]'
                }`}
              >
                <MessageSquareText size={16} />
                <span>AI Query Chatbot</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'voice'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-[#F9FAFB] dark:bg-[#122B21] text-gray-700 dark:text-emerald-200 hover:bg-gray-100 dark:hover:bg-[#17362A]'
                }`}
              >
                <Mic size={16} />
                <span>Live Voice Chat</span>
                {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                )}
              </button>
            </div>

            {/* ===============================================================
                TAB 1: MULTI-TURN GEMINI LEGAL QUERY CHATBOT
               =============================================================== */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Model Selector Bar (Fast / General / Complex) */}
                <div className="px-4 py-2.5 bg-[#F9FAFB] dark:bg-[#091A13] border-b border-gray-200 dark:border-[#1D4234] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModelTier('fast')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors ${
                        modelTier === 'fast'
                          ? 'bg-teal-50 dark:bg-emerald-950/80 text-[#0F766E] dark:text-emerald-300 border-[#0F766E] font-semibold'
                          : 'bg-white dark:bg-[#122B21] text-gray-600 dark:text-emerald-200/70 border-gray-200 dark:border-[#1D4234]'
                      }`}
                      title="gemini-3.1-flash-lite — Fastest responses"
                    >
                      <Zap size={12} />
                      <span>Fast (Flash-Lite)</span>
                    </button>

                    <button
                      onClick={() => setModelTier('general')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors ${
                        modelTier === 'general'
                          ? 'bg-teal-50 dark:bg-emerald-950/80 text-[#0F766E] dark:text-emerald-300 border-[#0F766E] font-semibold'
                          : 'bg-white dark:bg-[#122B21] text-gray-600 dark:text-emerald-200/70 border-gray-200 dark:border-[#1D4234]'
                      }`}
                      title="gemini-3.8-flash — Balanced contract Q&A"
                    >
                      <Sparkles size={12} />
                      <span>General (3.8 Flash)</span>
                    </button>

                    <button
                      onClick={() => setModelTier('complex')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors ${
                        modelTier === 'complex'
                          ? 'bg-teal-50 dark:bg-emerald-950/80 text-[#0F766E] dark:text-emerald-300 border-[#0F766E] font-semibold'
                          : 'bg-white dark:bg-[#122B21] text-gray-600 dark:text-emerald-200/70 border-gray-200 dark:border-[#1D4234]'
                      }`}
                      title="gemini-4-argon — Deep legal reasoning"
                    >
                      <BrainCircuit size={12} />
                      <span>Deep (4 Argon)</span>
                    </button>
                  </div>

                  <button
                    onClick={handleResetChat}
                    title="Reset conversation"
                    className="p-1.5 rounded-md text-xs text-gray-500 dark:text-emerald-300/70 hover:text-[#111827] dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-[#122B21] flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Scrollable Message Thread */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#0C1F17]"
                >
                  {messages.map((turn) => {
                    const isUser = turn.role === 'user';
                    return (
                      <div
                        key={turn.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[#0F766E] text-white rounded-br-xs shadow-xs'
                              : 'bg-[#F9FAFB] dark:bg-[#122B21] text-[#111827] dark:text-emerald-50 border border-gray-200 dark:border-[#1D4234] rounded-bl-xs'
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-gray-200/70 dark:border-[#1D4234]">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] dark:text-emerald-300">
                                <Bot size={14} />
                                <span>Froggo AI</span>
                              </span>
                              <div className="flex items-center gap-2">
                                {turn.modelUsed && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-50 dark:bg-[#071510] text-gray-600 dark:text-emerald-300/80 border border-gray-200 dark:border-[#1D4234]">
                                    {turn.modelUsed}
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(turn.text);
                                    setCopiedId(turn.id);
                                    setTimeout(() => setCopiedId(null), 1800);
                                  }}
                                  className="text-xs text-gray-500 dark:text-emerald-300/70 hover:text-[#111827] dark:hover:text-white"
                                  title="Copy response"
                                >
                                  {copiedId === turn.id ? (
                                    <Check size={13} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap">{turn.text}</div>

                          {turn.fallbackNotice && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-[#1D4234] text-[11px] text-amber-800 dark:text-amber-300">
                              {turn.fallbackNotice}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 dark:text-emerald-400/50 mt-1 px-1">
                          {turn.timestamp}
                        </span>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#F9FAFB] dark:bg-[#122B21] border border-gray-200 dark:border-[#1D4234] text-sm text-gray-600 dark:text-emerald-200 w-fit">
                      <Loader2 size={16} className="animate-spin text-[#0F766E] dark:text-emerald-400" />
                      <span>Analyzing contract &amp; Indian statutory rules...</span>
                    </div>
                  )}

                  {chatError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200">
                      {chatError}
                    </div>
                  )}
                </div>

                {/* Suggested Quick Queries */}
                <div className="px-4 py-2.5 bg-[#F9FAFB] dark:bg-[#091A13] border-t border-gray-200 dark:border-[#1D4234] overflow-x-auto">
                  <div className="flex items-center gap-2">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendChatMessage(q)}
                        disabled={isSending}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-[#122B21] hover:bg-teal-50 dark:hover:bg-[#18382B] text-xs font-medium text-gray-700 dark:text-emerald-200 border border-gray-200 dark:border-[#1D4234] shrink-0 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="p-4 bg-white dark:bg-[#0C1F17] border-t border-gray-200 dark:border-[#1D4234] flex items-end gap-2"
                >
                  <textarea
                    rows={2}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="Ask about any clause, Section 27 non-compete, MSME 45-day rule, or negotiation wording..."
                    className="flex-1 p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#071510] border border-gray-300 dark:border-[#1D4234] text-sm text-[#111827] dark:text-emerald-50 placeholder:text-gray-400 dark:placeholder:text-emerald-400/40 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputPrompt.trim()}
                    className="p-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* ===============================================================
                TAB 2: GEMINI LIVE REAL-TIME VOICE ASSISTANT (gemini-3.8-live)
               =============================================================== */}
            {activeTab === 'voice' && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-white dark:bg-[#0C1F17] overflow-y-auto space-y-5">
                {/* Top Voice Settings & Status Card */}
                <div className="p-5 rounded-2xl bg-[#F9FAFB] dark:bg-[#122B21] border border-gray-200 dark:border-[#1D4234] text-center space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F766E] dark:text-emerald-300 flex items-center gap-1.5">
                      <Volume2 size={15} />
                      <span>Gemini 3.8 Live Voice API</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor="voice-persona-select"
                        className="text-gray-500 dark:text-emerald-300/70"
                      >
                        Voice:
                      </label>
                      <select
                        id="voice-persona-select"
                        value={selectedVoice}
                        disabled={voiceStatus !== 'idle' && voiceStatus !== 'error'}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="px-2 py-1 rounded bg-white dark:bg-[#071510] border border-gray-300 dark:border-[#1D4234] text-xs font-medium text-[#111827] dark:text-emerald-100"
                      >
                        <option value="Zephyr">Zephyr (Calm &amp; Clear)</option>
                        <option value="Kore">Kore (Warm &amp; Professional)</option>
                        <option value="Puck">Puck (Conversational)</option>
                        <option value="Fenrir">Fenrir (Deep &amp; Direct)</option>
                        <option value="Charon">Charon (Measured)</option>
                      </select>
                    </div>
                  </div>

                  {/* Animated Voice Orb */}
                  <div className="py-4 flex flex-col items-center justify-center">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                        voiceStatus === 'speaking'
                          ? 'bg-emerald-600 text-white ring-8 ring-emerald-500/25 scale-105'
                          : voiceStatus === 'listening'
                          ? 'bg-[#0F766E] text-white ring-8 ring-teal-500/20'
                          : voiceStatus === 'connecting'
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-teal-50 dark:bg-[#071510] text-[#0F766E] dark:text-emerald-400 border-2 border-teal-200 dark:border-[#1D4234]'
                      }`}
                    >
                      {voiceStatus === 'connecting' ? (
                        <Loader2 size={36} className="animate-spin" />
                      ) : voiceStatus === 'speaking' ? (
                        <Volume2 size={36} className="animate-bounce" />
                      ) : (
                        <Mic size={36} />
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#111827] dark:text-emerald-50 mt-4">
                      {voiceStatus === 'idle' && 'Ready for Real-Time Voice Consultation'}
                      {voiceStatus === 'connecting' && 'Connecting to Gemini 3.8 Live...'}
                      {voiceStatus === 'listening' &&
                        (isMuted ? 'Microphone Muted' : 'Listening — Speak Naturally')}
                      {voiceStatus === 'speaking' && 'Froggo Voice Assistant is Speaking...'}
                      {voiceStatus === 'error' && 'Voice Connection Interrupted'}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-emerald-200/75 max-w-sm mt-1">
                      {voiceStatus === 'idle'
                        ? `Start a live two-way voice conversation about "${contractTitle}" and Indian contract laws.`
                        : 'You can interrupt at any time or tap a topic below.'}
                    </p>
                  </div>

                  {/* Primary Start / Stop / Mute Controls */}
                  <div className="flex items-center justify-center gap-3">
                    {voiceStatus === 'idle' || voiceStatus === 'error' ? (
                      <button
                        onClick={startVoiceSession}
                        className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <Mic size={18} />
                        <span>Start Live Voice Session</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsMuted((prev) => !prev)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${
                            isMuted
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                              : 'bg-white dark:bg-[#071510] text-[#111827] dark:text-emerald-100 border-gray-300 dark:border-[#1D4234]'
                          }`}
                        >
                          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                          <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                        </button>

                        <button
                          onClick={stopVoiceSession}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
                        >
                          <PhoneOff size={16} />
                          <span>End Call</span>
                        </button>
                      </>
                    )}
                  </div>

                  {voiceError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200">
                      {voiceError}
                    </div>
                  )}
                </div>

                {/* Live Voice Transcript Feed */}
                <div
                  ref={voiceScrollRef}
                  className="flex-1 min-h-[180px] max-h-[280px] overflow-y-auto p-4 rounded-xl bg-[#F9FAFB] dark:bg-[#071510] border border-gray-200 dark:border-[#1D4234] space-y-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-emerald-400/70">
                    Live Voice Transcript
                  </div>

                  {voiceTranscripts.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 leading-relaxed">
                      {voiceStatus === 'listening' || voiceStatus === 'speaking'
                        ? 'Speak into your microphone or tap one of the quick voice prompts below...'
                        : 'Click "Start Live Voice Session" above to talk through clauses, risks, and negotiation strategies out loud.'}
                    </p>
                  ) : (
                    voiceTranscripts.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          item.speaker === 'user'
                            ? 'bg-teal-50 dark:bg-emerald-950/60 text-[#111827] dark:text-emerald-100 border border-teal-200 dark:border-emerald-800/70 ml-6'
                            : 'bg-white dark:bg-[#122B21] text-[#111827] dark:text-emerald-50 border border-gray-200 dark:border-[#1D4234] mr-6'
                        }`}
                      >
                        <span className="font-bold block mb-0.5 text-[#0F766E] dark:text-emerald-300">
                          {item.speaker === 'user' ? 'You' : 'Froggo Voice AI'}
                        </span>
                        {item.text}
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Spoken Topic Prompts */}
                {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-emerald-300/70 block">
                      Tap to ask during live call:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Summarize the riskiest clause in 20 seconds',
                        'Explain Section 27 non-compete rules out loud',
                        'What should I say to negotiate payment terms?',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendVoicePromptHint(prompt)}
                          className="px-3 py-1.5 rounded-lg bg-[#F9FAFB] dark:bg-[#122B21] hover:bg-teal-50 dark:hover:bg-[#18382B] text-xs font-medium text-gray-700 dark:text-emerald-200 border border-gray-200 dark:border-[#1D4234] transition-colors"
                        >
                          “{prompt}”
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
