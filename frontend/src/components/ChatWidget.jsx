import React, { useEffect, useRef, useState } from "react";
import { X, Send, Bot, Languages, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { streamChat } from "@/lib/api";

function newSessionId() {
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SUGGESTIONS = {
  en: ["What courses do you offer?", "Tell me about Tally Prime", "How do I apply?", "What are the fees?"],
  te: ["మీ దగ్గర ఏ కోర్సులు ఉన్నాయి?", "టాలీ ప్రైమ్ గురించి చెప్పండి", "అడ్మిషన్ ఎలా?", "ఫీజులు ఎంత?"],
};

export default function ChatWidget({ open, onClose }) {
  const { lang, setLang } = useApp();
  const [session] = useState(newSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: lang === "te"
          ? "నమస్తే! నేను NextGen AI అసిస్టెంట్. కోర్సులు, ఫీజులు, అడ్మిషన్‌ల గురించి ఏమైనా అడగండి. 🌟"
          : "Hi! I'm the NextGen AI Assistant. Ask me anything about courses, fees, admissions or timings.",
      }]);
    }
  }, [open, lang, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      await streamChat({
        sessionId: session,
        message: msg,
        lang,
        onChunk: (chunk) => {
          setMessages(m => {
            const copy = [...m];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + chunk };
            return copy;
          });
        }
      });
    } catch (e) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: lang === "te" ? "క్షమించండి, ప్రస్తుతం సమాధానం ఇవ్వలేకపోతున్నాను." : "Sorry, I couldn't reply right now." };
        return copy;
      });
    } finally { setBusy(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto absolute inset-0 bg-black/30 sm:bg-transparent" onClick={onClose} />
      <div
        data-testid="chat-widget"
        className="pointer-events-auto relative w-full sm:w-[420px] h-[70vh] sm:h-[600px] sm:max-h-[85vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-fade-up"
      >
        <div className="relative bg-navy text-white p-4 flex items-center gap-3 grain overflow-hidden">
          <div className="relative w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-black" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-base">NextGen AI Assistant</div>
            <div className="text-[11px] text-white/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" />
              {lang === "te" ? "బైలింగ్వుల్ · English & తెలుగు" : "Bilingual · English & Telugu"}
            </div>
          </div>
          <button
            data-testid="chat-lang-toggle"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Toggle language"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            data-testid="chat-close"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-cream/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                data-testid={`chat-msg-${m.role}-${i}`}
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-navy text-white rounded-br-sm"
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                } ${lang === "te" ? "font-te" : ""}`}
              >
                {m.content || (busy && i === messages.length - 1 ? "…" : "")}
              </div>
            </div>
          ))}
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS[lang].map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                data-testid={`chat-suggestion-${i}`}
                className={`text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-gold hover:bg-gold/10 text-slate-700 transition-colors ${lang === "te" ? "font-te" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            data-testid="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={lang === "te" ? "మీ ప్రశ్న రాయండి..." : "Type your question..."}
            className={`flex-1 px-4 py-2.5 rounded-full border border-slate-200 focus:border-gold outline-none text-sm ${lang === "te" ? "font-te" : ""}`}
          />
          <button
            data-testid="chat-send"
            onClick={() => send()}
            disabled={busy || !input.trim()}
            className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-black transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
