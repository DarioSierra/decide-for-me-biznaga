import React, { useState, useRef, useEffect } from 'react';
import { Info, Bot, Sparkles, Scale, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSubmitDilemma: (optionA: string, optionB: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSubmitDilemma,
}) => {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionA.trim() || !optionB.trim() || isLoading) return;

    onSubmitDilemma(optionA.trim(), optionB.trim());
    setOptionA('');
    setOptionB('');
  };

  return (
    <section className="flex-1 lg:w-[73%] flex flex-col h-full bg-white border-r border-slate-200 relative overflow-hidden">
      {/* Chat Messages Container */}
      <div
        ref={scrollRef}
        id="chatHistory"
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-6"
      >
        {/* System Welcome Message */}
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-1">
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 pl-1">
              System Intelligence
            </span>
            <div className="bg-slate-100/90 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[15px] leading-relaxed shadow-sm border border-slate-200/70">
              <p className="font-semibold text-slate-900">Tell me your dilemma</p>
              <p className="text-xs text-slate-500 mt-1.5 font-normal leading-relaxed">
                State both options below. I'll weigh trade-offs objectively against your calibrated priorities, risk posture, and second-order outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Messages */}
        {messages.map((msg) => {
          // User Dilemma Message Bubble (Right Side)
          if (msg.role === 'user' && msg.type === 'dilemma') {
            return (
              <div
                key={msg.id}
                className="flex justify-end gap-3 max-w-2xl ml-auto transition-all duration-300"
              >
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 pr-1">
                    Your Dilemma
                  </span>
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm shadow-sm space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded bg-indigo-500/80 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        A
                      </span>
                      <span className="leading-snug">{msg.optionA}</span>
                    </div>
                    <div className="flex items-start gap-2.5 pt-1 border-t border-indigo-500/50">
                      <span className="w-4 h-4 rounded bg-indigo-500/80 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        B
                      </span>
                      <span className="leading-snug">{msg.optionB}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // System Rational Decision Bubble (Left Side)
          if (msg.role === 'system' && msg.type === 'decision' && msg.decision) {
            return (
              <div
                key={msg.id}
                className="flex items-start gap-3.5 max-w-3xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              >
                {/* System Avatar */}
                <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-1 shadow-xs">
                  <Scale className="w-4 h-4 stroke-[2.5]" />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 pl-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rational Recommendation</span>
                  </span>

                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl rounded-tl-sm p-5 text-sm shadow-sm text-slate-800 space-y-4">
                    {/* Verdict */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{msg.decision.verdict}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Evaluated via decider-flow
                      </span>
                    </div>

                    {/* Justification */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Rational Justification
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                        {msg.decision.justification}
                      </p>
                    </div>

                    {/* First Step */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-[11px] block uppercase tracking-wider text-indigo-600 mb-0.5">
                            Immediate First Step
                          </span>
                          <p className="text-slate-700 text-xs leading-relaxed font-medium">
                            {msg.decision.firstStep}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // System Error Message Bubble (Left Side)
          if (msg.role === 'system' && msg.type === 'error') {
            return (
              <div
                key={msg.id}
                className="flex items-start gap-3.5 max-w-2xl transition-all duration-300"
              >
                <div className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-rose-600 pl-1">
                    Deliberation Notice
                  </span>
                  <div className="bg-rose-50/80 border border-rose-200 rounded-2xl rounded-tl-sm p-4 text-xs text-rose-800 shadow-xs leading-relaxed">
                    <p className="font-semibold mb-1">Deliberation could not complete:</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Sleek Loading State in Chat Panel */}
        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-1 shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-600" style={{ animationDuration: '3s' }} />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 pl-1 flex items-center gap-1.5">
                <span>Rational Deliberation</span>
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>

              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl rounded-tl-sm p-5 text-sm shadow-sm text-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    Executing Template Model: decider-flow
                  </span>
                  <span className="text-xs font-mono text-slate-400">weighing priorities</span>
                </div>

                {/* Sleek loading steps */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] flex items-center justify-center font-bold">1</div>
                    <span className="text-slate-700 font-medium">Deconstructing utility functions against core non-negotiables...</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 font-mono text-[10px] flex items-center justify-center font-bold">2</div>
                    <span className="text-slate-500">Stress-testing downside liquidity & risk posture...</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold">3</div>
                    <span className="text-slate-400">Formulating verdict, justification, and immediate first step...</span>
                  </div>
                </div>

                {/* Subtle animated bar */}
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area: Form with Option A & Option B */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shadow-[0_-8px_25px_-12px_rgba(0,0,0,0.05)] shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Input 1: Option A */}
              <div className="relative">
                <label
                  htmlFor="optionA"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                    A
                  </span>
                  Option A
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="optionA"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="e.g. Accept Series A startup Lead role ($160k + 1% equity)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Input 2: Option B */}
              <div className="relative">
                <label
                  htmlFor="optionB"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                    B
                  </span>
                  Option B
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="optionB"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="e.g. Stay at Big Tech Senior IC ($240k total comp, steady hours)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Context & Action Button Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Evaluated across your configured priorities & trade-off curves</span>
              </div>

              {/* "Decide For Me" Action Button */}
              <button
                type="submit"
                disabled={isLoading || !optionA.trim() || !optionB.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              >
                <span>{isLoading ? 'Deliberating...' : 'Decide For Me'}</span>
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Scale className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
