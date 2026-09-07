import React, { useState } from "react";
import api from "../api/client";
import { MessageSquare, Sparkles, X, Send, Bot, Info, ArrowUpRight } from "lucide-react";

export default function AIAdvisorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! I am your KisanNexus AI Market Advisor. Ask me anything about current mandi prices, where to sell, transit freight, or whether you should sell now or wait.",
      context: [],
      disclaimer: "Informational intelligence based on reported mandi transactions."
    }
  ]);

  const quickPrompts = [
    "Which market is better for my onion in Nashik?",
    "Should I sell my tomato now or wait 3 days?",
    "What factors are affecting today's vegetable prices?",
    "How does direct buyer matching help my net returns?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/advisor/ask", { question: textToSend });
      const botMsg = {
        sender: "bot",
        text: res.data.answer,
        context: res.data.context_used || [],
        disclaimer: res.data.disclaimer
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I encountered an issue retrieving current mandi intelligence. Please verify your internet connection or check the Live Mandi Prices tab directly.",
          context: [],
          disclaimer: ""
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm cursor-pointer"
        aria-label="Open AI Market Advisor"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
        <span>Ask Kisan AI</span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] sm:h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    KisanNexus AI Advisor
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 font-semibold border border-emerald-400/30">
                      Grounded
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100">Agricultural Market Intelligence Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto flex gap-2 scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Grounding Context Pills */}
                    {m.context && m.context.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-700 block">Reported Mandi Rates Used:</span>
                        <div className="flex flex-wrap gap-1">
                          {m.context.map((ctx, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]"
                            >
                              {ctx}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.disclaimer && (
                      <div className="mt-2 text-[10px] text-slate-600 italic">
                        {m.disclaimer}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-600 text-xs py-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing mandi arrivals, prices, and freight algorithms...
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about crops, prices, transport, or selling decision..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
